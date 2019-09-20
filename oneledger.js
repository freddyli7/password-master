const {derivePath, getPublicKey, isValidPath} = require('ed25519-hd-key');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const sjcl = require("sjcl");
const typeConverter = require("./typeConverter");
const masterkey = require("./masterkey");

/* *****************************   Ed25519 For Oneledger  ***************************** */

// derive private key 32 bytes seed from master key, master key is key part which is a 32 bytes Uint8Array for Ed25519
// keyPath is a string includes chainId, sideChainId, keyIndex
// return seed which is a 32 bytes Uint8Array
function deriveSeed(masterKey, keyPath) {
    const hexMasterKey = typeConverter.uint8arrayToHexStr(masterKey);
    const {key} = derivePath(keyPath, hexMasterKey);
    return typeConverter.bufferToUint8Array(key)
}

// seed should be a 32 bytes Uint8Array for Ed25519
// seed should be derived key part from masterKey
// return derived private Key which is a 64 byte based64 string and public Key which is a 32 bytes base64 string
function deriveKeyPair(seed) {
    const {publicKey, secretKey} = nacl.sign.keyPair.fromSeed(seed);
    return {publicKey: nacl.util.encodeBase64(publicKey), privateKey: nacl.util.encodeBase64(secretKey)}
}

// publicKey should be a 32 bytes base64 string
// hash address from public key based on SHA256, return 40 chars length address (without prefix)
function deriveAddress(publicKey) {
    let base64PublicKey = sjcl.codec.base64.toBits(publicKey);
    let hash = new sjcl.hash.sha256();
    hash.update(base64PublicKey);
    let hashResult = hash.finalize();
    let hashedData = sjcl.codec.hex.fromBits(hashResult);
    hash.reset();
    return hashedData.substring(0, 40);
}

// sign tx
// message should be a base64 string, password is plaintext
// encryptedMasterKey is a string, keyPath is a string
// return base64 signature
function signForSignature(message, password, encryptedMasterKey, keyPath, callback) {
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
        if (error) return callback(error);
        const priKeySeed = deriveSeed(decryptedMasterKey, keyPath);
        const {privateKey} = deriveKeyPair(priKeySeed);
        callback(null, nacl.util.encodeBase64(nacl.sign.detached(Uint8Array.from(nacl.util.decodeBase64(message)), nacl.util.decodeBase64(privateKey))));
    });
}

// verify signature
// message, signature and publicKey are all base64 string
function verifySignature(message, signature, publicKey, callback) {
    let verifyResult;
    try {
        verifyResult = nacl.sign.detached.verify(
            Uint8Array.from(nacl.util.decodeBase64(message)),
            nacl.util.decodeBase64(signature),
            nacl.util.decodeBase64(publicKey)
        );
    } catch (err) {
        return callback(err);
    }
    callback(null, verifyResult);
}

module.exports = {
    deriveSeed,
    deriveKeyPair,
    deriveAddress,
    signForSignature,
    verifySignature
};