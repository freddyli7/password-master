const bip39 = require('bip39');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const sjcl = require("sjcl");
const crypto = require("crypto");
const {ErrorType, Util} = require("middle_utility").Error;
const {requestErrors} = ErrorType;
const typeConverter = require("./typeConverter");
const masterSeedKeyAddrPrefix = require("./config").ed25519KeyAddrPrefix;
const util = require("./util");

/* *****************************   Master key  ***************************** */
// generate 24 mnemonic before creating a new master key
// return : 24 words mnemonic string
function mnemonicGenerator24() {
    const entropy = crypto.randomBytes(32);
    return mnemonicStrToArray(bip39.entropyToMnemonic(entropy))
}

// generate 12 mnemonic before creating a new master key
// return : 12 words mnemonic string
function mnemonicGenerator12() {
    return mnemonicStrToArray(bip39.generateMnemonic())
}

// convert string mnemonic to array with word object as element
// internal use only
// input : mnemonic string
// return : mnemonic array
function mnemonicStrToArray(mnemonicStr) {
    const mnemonicArray = mnemonicStr.split(" ");
    return mnemonicArray.map((word, idx) => ({index: idx + 1, word}))
}

// convert array mnemonic to string
// internal use only
// input : mnemonic array
// return : mnemonic string
function mnemonicArrayToStr(mnemonicArray) {
    return mnemonicArray.map(({word}) => {
        return word || ''
    }).join(' ')
}

// derive masterKeySeed from 12 or 24 mnemonic words mnemonicArray
// input : mnemonic array
// return : masterKeySeed which is a 64 bytes buffer
function masterKeySeedGenerator(mnemonicArray) {
    return bip39.mnemonicToSeedSync(mnemonicArrayToStr(mnemonicArray))
}

// encrypt masterKeySeed with password
// input : password is plaintext
// input : masterKeySeed is a 64 bytes buffer
// return : encrypted master key string
function masterKeySeedEncryption(password, masterKeySeed) {
    let strMasterKey = nacl.util.encodeBase64(typeConverter.bufferToUint8Array(masterKeySeed));
    let saltBits = sjcl.random.randomWords(4);
    let salt = sjcl.codec.base64.fromBits(saltBits);
    return sjcl.encrypt(password, strMasterKey, {
        mode: "ccm",
        iter: 1000,
        ks: 128,
        v: 1,
        cipher: "aes",
        adata: "",
        salt: salt
    })
}

// decrypt masterKeySeed with password
// input : password is plaintext
// input : encryptedMasterKey is string
// return : callback function containing error object and decrypted masterKeySeed which is a 64 bytes buffer
function masterKeySeedDecryption(password, encryptedMasterKeySeed, callback) {
    let decryptedMasterKeySeed;
    try {
        decryptedMasterKeySeed = sjcl.decrypt(password, encryptedMasterKeySeed)
    } catch (err) {
        return callback(Util.errorWrap(requestErrors.WrongPassword))
    }
    callback(null, typeConverter.uint8ArrayToBuffer(nacl.util.decodeBase64(decryptedMasterKeySeed)))
}

// derive masterKeySeed's public key
// only use this function to derive master address for recovery
// input : masterKeySeed is a 64 bytes buffer
// return : 32 bytes base64 string publicKey
function getMasterKeySeedPublicKey(masterKeySeed) {
    return typeConverter.uint8ArrayToBase64str(nacl.sign.keyPair.fromSecretKey(masterKeySeed).publicKey)
}

// derive masterKeySeed's address from its publicKey
// store master address locally to verify mnemonic word when user wants to recovery
// same algorithm as Ed25519 OneLedger key
// input : masterPublicKey should be a 32 bytes base64 string
// return : 0x prefix + 20 bytes hex string address
function getMasterKeySeedAddress(masterKeySeedPublicKey) {
    let base64PublicKey = sjcl.codec.base64.toBits(masterKeySeedPublicKey);
    let hash = new sjcl.hash.sha256();
    hash.update(base64PublicKey);
    let hashResult = hash.finalize();
    let hashedData = sjcl.codec.hex.fromBits(hashResult);
    hash.reset();
    return `${masterSeedKeyAddrPrefix}${hashedData.substring(0, 40)}`
}

// derive masterKey address based on provided mnemonic array
// input : mnemonic array
// return : masterKeySeed address
function getMasterKeySeedAddressForRecovery(mnemonicArray) {
    const masterKeySeed = masterKeySeedGenerator(mnemonicArray);
    return getMasterKeySeedAddress(getMasterKeySeedPublicKey(masterKeySeed))
}

// check password when import masterKeySeed file
// input : password is plaintext
// input : encryptedMasterKeySeed is string
// return : promise
function unlockMasterKeySeed(password, encryptedMasterKeySeed) {
    let receiver;
    masterKeySeedDecryption(password, encryptedMasterKeySeed, function (error, unlockResult) {
        if (error) {
            receiver = Promise.reject(error);
            return receiver
        } else if (typeof unlockResult !== "undefined") {
            receiver = Promise.resolve(util.responseWrap(true));
            return receiver
        }
    });
    return receiver
}

module.exports = {
    mnemonicGenerator24,
    mnemonicGenerator12,
    masterKeySeedGenerator,
    masterKeySeedEncryption,
    masterKeySeedDecryption,
    getMasterKeySeedPublicKey,
    getMasterKeySeedAddress,
    getMasterKeySeedAddressForRecovery,
    unlockMasterKeySeed,
    mnemonicStrToArray,
    mnemonicArrayToStr
};
