const {derivePath, getMasterKeyFromSeed, getPublicKey, isValidPath} = require('ed25519-hd-key');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const secp256k1 = require('secp256k1');
const bitcoinjs = require('bitcoinjs-lib');
const typeConverter = require("./typeConverter");
const masterkey = require("./masterkey");

/* *****************************   Secp256k1 For BTC  ***************************** */

// derive private key from master key, master key is just key part which is a Uint8Array, total should be 32 bytes for BTC
// keyPath is a string includes chainId, sideChainId, keyIndex
// return key which is a 32 bytes Uint8Array
function derivePrivateKeyBTC(masterKey, keyPath) {
    const hexMasterKey = typeConverter.uint8arrayToHexStr(masterKey);
    const {key} = derivePath(keyPath, hexMasterKey);
    return typeConverter.bufferToUint8Array(key)
}

// verify BTC private key
function verifyPrivateKeyBTC(privateKey) {
    const key = typeConverter.hexStrToBuffer(privateKey);
    return secp256k1.privateKeyVerify(key)
}

// privateKey should be 32 bytes Uint8Array (just key part) for BTC
// return derived privateKey's public Key which is a 33 bytes hex string with chain prefix 0x02 or 0x03
function derivePublicKeyBTC(privateKey) {
    return typeConverter.bufferToHexStr(secp256k1.publicKeyCreate(privateKey));
}

// publicKey should be 33 bytes hex string with chain prefix
// return 34 chars length address
function deriveP2PKHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2pkh({pubkey}).address;
}

// TODO
function deriveP2PKAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2pk({pubkey}).address;
}

// publicKey should be 33 bytes hex string with chain prefix
// return 42 chars length address
function deriveP2WPKHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2wpkh({pubkey}).address;
}

// TODO : not need for now
function deriveP2WSHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2wsh({pubkey}).address;
}

// TODO : not need for now
function deriveP2SHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2sh({pubkey}).address;
}

// TODO : not need for now
function deriveP2MSAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2ms({pubkey}).address;
}

// encryptedMasterKey is a string, keypath is a string
// message should be 32 bytes hex string, password is plaintext
// return signature which is a 64 bytes buffer, and recovery which is a number
function signForSignatureBTC(message, password, encryptedMasterKey, keyPath, callback) {
    // decrypt master key
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
        if (error) return callback(error);
        // derive private key
        const derivedPrivatedkey = derivePrivateKeyBTC(decryptedMasterKey, keyPath);
        // sign with derived private key to get signature
        const {signature, recovery} = secp256k1.sign(typeConverter.hexStrToBuffer(message), derivedPrivatedkey);
        callback(null, signature, recovery);
    });
}

// verify BTC tx signature
// message 32 bytes, signature 64 bytes and publicKey 33 bytes  are all hex string
function verifySignatureBTC(message, signature, publicKey) {
    return secp256k1.verify(typeConverter.hexStrToBuffer(message), typeConverter.hexStrToBuffer(signature), typeConverter.hexStrToBuffer(publicKey))
}

module.exports = {
    derivePrivateKeyBTC,
    derivePublicKeyBTC,
    deriveP2WSHAddress,
    deriveP2WPKHAddress,
    deriveP2SHAddress,
    deriveP2MSAddress,
    deriveP2PKHAddress,
    deriveP2PKAddress,
    verifyPrivateKeyBTC,
    signForSignatureBTC,
    verifySignatureBTC
};