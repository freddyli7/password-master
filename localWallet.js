const {mnemonicGenerator24, unlockMasterKeySeed, getMasterKeySeedAddressForRecovery, mnemonicArrayToStr} = require("./masterKeySeed");
const MasterKeySeedManager = require("./masterKeySeedManager");
const derivedKeyManager = require("./derivedKeyManager");

const fs = require('fs');
const path = require("path");

const walletPath = path.join(process.env.HOME, "password-master-appdata");
const walletFilePath = path.join(walletPath, "wallet.json");
const passwordFilePath = path.join(walletPath, "data.json");

const keyTypeInUse = "BTCP2PKH";
const initPasswordData = {
    data : []
}

async function newWallet() {
    if (fs.existsSync(walletPath) || fs.existsSync(walletFilePath)) {
        console.log("wallet already exists");
        return
    }

    const [a1, a2, masterPassword] = process.argv;
    if (masterPassword === undefined || masterPassword.length <= 3) {
        console.error("master password should be 3 chars at least");
        return
    }

    let mnemonicWords = mnemonicGenerator24();
    let masterKey = new MasterKeySeedManager(mnemonicWords, masterPassword);

    const {encryptedMasterKeySeed} = masterKey.getMasterKeySeedInfo();

    const data = {
        encryptedMasterKeySeed,
        mnemonicWords: mnemonicArrayToStr(mnemonicWords)
    }

    try {
        fs.mkdirSync(walletPath);
        fs.writeFileSync(walletFilePath, JSON.stringify(data))
        fs.writeFileSync(passwordFilePath, JSON.stringify(initPasswordData))
    } catch (err) {
        console.error("failed to init a wallet: ", err);
        return
    }

    console.log("new wallet created and encrypted, please keep your mnemonic and master password in a safe place");
    console.log("your wallet mnemonic: ");
    console.log(mnemonicArrayToStr(mnemonicWords));

    mnemonicWords = undefined;
    masterKey = undefined;
}

async function passwordGenerator() {
    const [a1, a2, masterPassword, keyName] = process.argv;
    if (masterPassword === undefined || keyName === undefined) {
        console.error("invalid masterPassword or keyName");
        return
    }

    let walletData, passwordData;
    try {
        const walletContent = fs.readFileSync(walletFilePath);
        walletData = JSON.parse(walletContent);
        const passwordContent = fs.readFileSync(passwordFilePath);
        passwordData = JSON.parse(passwordContent)
    } catch (err) {
        console.error("failed to decode wallet meta data: ", err);
        return
    }

    let keyIndex = 0;
    if (passwordData.data.length !== 0) {
        keyIndex = passwordData.data.length
    }

    const {encryptedMasterKeySeed} = walletData;
    const derivedKeyData = {
        keyType: keyTypeInUse,
        keyIndex,
        password: masterPassword,
        encryptedMasterKeySeed: encryptedMasterKeySeed
    };
    const re = await derivedKeyManager.deriveNewKeyPair(derivedKeyData).catch(err => {
        console.error("failed to generate new password: ", err);
    });
    if (!re) return;
    const {publicKey} = re.response;

    const data = {
        keyName,
        keyIndex,
        keyType: keyTypeInUse,
    }

    try {
        passwordData.data.push(data);
        fs.writeFileSync(passwordFilePath, JSON.stringify(passwordData))
    } catch (err) {
        console.error("failed to persist new password into wallet: ", err);
        return
    }
    console.log(publicKey)
}

module.exports = {
    newWallet,
    passwordGenerator
}
