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
const passwordDefaultFormat = {length: passwordDefaultLength, number: true, upper: true, lower: true, special: true};

/**
 * @description new a local wallet
 * @example npm run wallet {your_master_password}
 */
async function newWallet(password) {
    if (fs.existsSync(walletPath) || fs.existsSync(walletFilePath)) {
        return Promise.reject({error: "wallet already exists"})
    }

    if (!password) {
        const [a1, a2, passwordCLI] = process.argv;
        password = passwordCLI
    }
    if (!password || password.length <= masterPasswordMinLength) {
        return Promise.reject({error: "master password should be 9 chars at least"})
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
        return Promise.reject({error: "failed to init a wallet: " + err})
    }

    const words = mnemonicArrayToStr(mnemonicWords);

    return Promise.resolve(words)
}

/**
 * @description generate new password
 * @example npm run password {your_master_password} {account_name}
 */
async function passwordGenerator(password, account) {
    if (!password) {
        const [a1, a2, passwordCLI, accountName] = process.argv;
        password = passwordCLI;
        account = accountName
    }
    if (!password || !account) {
        return Promise.reject({error: "invalid masterPassword or accountName"})
    }

    const wd = await readWalletData().catch(err => {
        return Promise.reject({error: err.toString()})
    })

    const {walletData, passwordData} = wd;

    let keyIndex = 0;
    if (passwordData.data.length !== 0) {
        keyIndex = passwordData.data.length
    }

    let isKeyExist = false;
    for (const keyItem of passwordData.data) {
        const {keyName} = keyItem;
        if (keyName === account) {
            isKeyExist = true;
            break
        }
    }
    if (isKeyExist) {
        return Promise.reject({error: "account already exists"})
    }

    const publicKey = await calculateKey(walletData, keyTypeInUse, keyIndex, password).catch(err => {
        return Promise.reject({error: err})
    })
    if (!publicKey) return;

    const data = {
        keyName: account,
        keyIndex,
        keyType: keyTypeInUse,
    }
    try {
        passwordData.data.push(data);
        fs.writeFileSync(passwordFilePath, JSON.stringify(passwordData))
    } catch (err) {
        return Promise.reject({error: "failed to persist new password into wallet: " + err})
    }

    const key = passwordFormatter(publicKey, passwordDefaultFormat);

    return Promise.resolve({response: key})
}

async function getPassword(password, account) {
    if (!password) {
        const [a1, a2, passwordCLI, accountName] = process.argv;
        password = passwordCLI;
        account = accountName
    }
    if (!password || !account) {
        return Promise.reject({error: "invalid masterPassword or accountName"})
    }

    const wd = await readWalletData().catch(err => {
        return Promise.reject({error: err})
    })

    const {walletData, passwordData} = wd;

    let key;
    for (const keyItem of passwordData.data) {
        const {keyName, keyIndex, keyType} = keyItem;
        if (keyName === account) {
            const generatedKey = await calculateKey(walletData, keyType, keyIndex, password).catch(err => {
                return Promise.reject({error: err})
            })
            if (!generatedKey) break;
            key = generatedKey
            break
        }
    }
    if (!key) {
        return Promise.reject({error: "account not found"})
    }

    const returnKey = passwordFormatter(key, passwordDefaultFormat);

    return Promise.resolve({response: returnKey})
}

// passwordFormatter is for modify password format according to different requirement
function passwordFormatter(key, {length, number, upper, lower, special}) {
    if (length < passwordDefaultLength) length = passwordDefaultLength;
    let a = key.substr(0, length);
    if (upper) a = a.substr(0, length / 2).toUpperCase() + a.substr(length / 2);
    if (lower) a = a.substr(0, length / 2) + a.substr(length / 2).toLowerCase();
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
        return Promise.reject("failed to decode wallet meta data: " + err.toString())
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
        return Promise.reject("failed to generate new password: " + err.toString())
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
