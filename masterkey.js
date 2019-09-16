const bip39 = require('bip39');
const {derivePath, getMasterKeyFromSeed, getPublicKey, isValidPath} = require('ed25519-hd-key');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const sjcl = require("sjcl");
const crypto = require("crypto");
const oneledger = require("./oneledger");
const typeConverter = require("./typeConverter");

/* *****************************   Master key  ***************************** */

// generate 24 words mnemonic string
function mnemonicGenerator24() {
    const entropy = crypto.randomBytes(32);
    return bip39.entropyToMnemonic(entropy);
}

// generate 12 words mnemonic string
function mnemonicGenerator12() {
    return bip39.generateMnemonic();
}

// seed is 12 or 24 mnemonic words string
// return key and chainCode which are both 32 bytes Uint8Array
function masterKeyGenerator(seed) {
    const hexSeed = typeConverter.stringToHex(seed);
    const {key, chainCode} = getMasterKeyFromSeed(hexSeed);
    return {key: typeConverter.bufferToUint8Array(key), chainCode: typeConverter.bufferToUint8Array(chainCode)};
}

// encrypt master key
// password 'plaintext', masterKey is a 32 bytes uint8array, masterChainCode is a 32 bytes uint8array
// return encrypted master key 'string'
function masterKeyEncryption(password, masterKey, masterChainCode) {
    const uint8ArrayMasterkey = typeConverter.hexStrToUint8Array(typeConverter.uint8arrayToHexStr(masterKey) + typeConverter.uint8arrayToHexStr(masterChainCode));
    let strMasterKey = nacl.util.encodeBase64(uint8ArrayMasterkey);
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
    });
}

// decrypt master Key
// password 'plaintext', encryptedMasterKey 'string'
// return decrypted master key is 32 bytes Uint8Array of key and 32 bytes Uint8Array of chainCode
function masterKeyDecryption(password, encryptedMasterKey, callback) {
    let decryptedMasterKey;
    try {
        decryptedMasterKey = sjcl.decrypt(password, encryptedMasterKey);
    } catch (err) {
        return callback(Error("Wrong password"));
    }
    callback(null, nacl.util.decodeBase64(decryptedMasterKey).slice(0, 32), nacl.util.decodeBase64(decryptedMasterKey).slice(32));
}

// derive masterkey's publickey
// masterkey is 64 bytes uint8array of key+chainCode
// return 32 bytes base64 string publickey
// same algorithm as Ed25519 key
// only use this function to derive master address
function getMasterPublicKey(masterKey) {
    return oneledger.derivePublicKeyOLT(masterKey)
}

// derive master key's address from master key's public key
// master public key should be a 32 bytes base64 string
// return 20 bytes hex string
// same algorithm as Ed25519 key
// store master address to verify mnemonic word when user wants to recovery
function getMasterAddress(masterPublicKey) {
    return oneledger.deriveAddressOLT(masterPublicKey)
}

module.exports = {
    mnemonicGenerator24,
    mnemonicGenerator12,
    masterKeyGenerator,
    masterKeyEncryption,
    masterKeyDecryption,
    getMasterPublicKey,
    getMasterAddress
};
