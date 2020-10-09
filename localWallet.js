const fs = require('fs');
const path = require("path");
const env = require("dotenv").config();
const NodeEnv = process.env.NodeEnv || "production";
const {mnemonicGenerator24, getMasterKeySeedAddressForRecovery, mnemonicArrayToStr} = require("./masterKeySeed");
const MasterKeySeedManager = require("./masterKeySeedManager");
const derivedKeyManager = require("./derivedKeyManager");

const walletPath = path.join(process.env.HOME, "password-master-appdata");
const walletFilePath = path.join(walletPath, "wallet.json");
const passwordFilePath = path.join(walletPath, "data.json");
const readmeFilePath = path.join(walletPath, "README.txt");

const readmeFile = "This is the data folder for password master app, DO NOT modify or remove any of them";
const keyTypeInUse = "BTCP2PKH";
const initPasswordData = {
    data: []
};
const passwordDefaultLength = 20
const masterPasswordMinLength = 8;
const passwordDefaultFormat = {length: passwordDefaultLength, number: true, upper: true, lower:true, special:true};
/**
 * @description new a local wallet
 * @example npm run wallet {your_master_password}
 */
async function newWallet() {
    if (fs.existsSync(walletPath) || fs.existsSync(walletFilePath)) {
        console.log("wallet already exists");
        return
    }

    const [a1, a2, masterPassword] = process.argv;
    if (!masterPassword || masterPassword.length <= masterPasswordMinLength) {
        console.error("master password should be 9 chars at least");
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
        fs.writeFileSync(readmeFilePath, readmeFile)
    } catch (err) {
        console.error("failed to init a wallet: ", err);
        return
    }

    const words = mnemonicArrayToStr(mnemonicWords);
    console.log(words);

    return words
}

/**
 * @description generate new password
 * @example npm run password {your_master_password} {account_name}
 */
async function passwordGenerator() {
    const [a1, a2, masterPassword, accountName] = process.argv;
    if (!masterPassword || !accountName) {
        console.error("invalid masterPassword or accountName");
        return
    }

    const wd = await readWalletData().catch(err => {
        console.error(err)
    })
    if (!wd) return;

    const {walletData, passwordData} = wd;

    let keyIndex = 0;
    if (passwordData.data.length !== 0) {
        keyIndex = passwordData.data.length
    }

    let isKeyExist = false;
    for (const keyItem of passwordData.data) {
        const {keyName} = keyItem;
        if (keyName === accountName) {
            isKeyExist = true;
            break
        }
    }
    if (isKeyExist) {
        console.error("account already exists");
        return
    }

    const publicKey = await calculateKey(walletData, keyTypeInUse, keyIndex, masterPassword).catch(err => {
        console.error(err)
    })
    if (!publicKey) return;

    const data = {
        keyName: accountName,
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

    const key = passwordFormatter(publicKey, passwordDefaultFormat);
    console.log(key);

    return key
}

async function getPassword() {
    const [a1, a2, masterPassword, accountName] = process.argv;
    if (!masterPassword || !accountName) {
        console.error("invalid masterPassword or accountName");
        return
    }

    const wd = await readWalletData().catch(err => {
        console.error(err)
    })
    if (!wd) return;

    const {walletData, passwordData} = wd;

    let key;
    for (const keyItem of passwordData.data) {
        const {keyName, keyIndex, keyType} = keyItem;
        if (keyName === accountName) {
            const generatedKey = await calculateKey(walletData, keyType, keyIndex, masterPassword).catch(err => {
                console.error(err)
            })
            if (!generatedKey) break;
            key = generatedKey
            break
        }
    }
    if (!key) {
        console.error("account not found");
        return
    }

    const returnKey = passwordFormatter(key, passwordDefaultFormat);
    console.log(returnKey);

    return returnKey
}

// passwordFormatter is for modify password format according to different requirement
function passwordFormatter(key, {length, number, upper, lower, special}) {
    if (length < passwordDefaultLength) length = passwordDefaultLength;
    let a = key.substr(0, length);
    if (upper) a = a.substr(0,length/2).toUpperCase() + a.substr(length/2);
    if (lower) a = a.substr(0,length/2) + a.substr(length/2).toLowerCase();
    if (special) a = `#${a}`;
    return a
}

// readWalletData load wallet and passwords data from file system
async function readWalletData() {
    let walletData, passwordData;
    try {
        const walletContent = fs.readFileSync(walletFilePath);
        walletData = JSON.parse(walletContent);
        const passwordContent = fs.readFileSync(passwordFilePath);
        passwordData = JSON.parse(passwordContent)
    } catch (err) {
        console.debug(err);
        return Promise.reject("failed to decode wallet meta data")
    }
    return Promise.resolve({walletData, passwordData})
}

async function calculateKey(walletData, keyTypeInUse, keyIndex, masterPassword) {
    const {encryptedMasterKeySeed} = walletData;
    const derivedKeyData = {
        keyType: keyTypeInUse,
        keyIndex,
        password: masterPassword,
        encryptedMasterKeySeed: encryptedMasterKeySeed
    };
    const re = await derivedKeyManager.deriveNewKeyPair(derivedKeyData).catch(err => {
        console.debug(err);
        return Promise.reject("failed to generate new password")
    });
    const {address} = re.response;

    return Promise.resolve(address)
}

module.exports = {
    newWallet,
    passwordGenerator,
    getPassword,
    passwordDefaultFormat
}
