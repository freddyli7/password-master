const {derivePath, getPublicKey, isValidPath} = require('ed25519-hd-key');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const sjcl = require("sjcl");
const typeConverter = require("./typeConverter");
const masterkey = require("./masterkey");

/* *****************************   Ed25519 For Oneledger  ***************************** */

// derive private keys from master key, master key and master chainCode are both 32 bytes Uint8Array for Ed25519
// keyPath is a string includes chainId, sideChainId, keyIndex
// return key + chainCode which is a 64 bytes Uint8Array
function derivePrivateKeyOLT(masterKey, masterChainCode, keyPath) {
    const {key, chainCode} = derivePath(keyPath, typeConverter.uint8arrayToHexStr(masterKey) + typeConverter.uint8arrayToHexStr(masterChainCode));
    return typeConverter.hexStrToUint8Array(typeConverter.uint8arrayToHexStr(key) + typeConverter.uint8arrayToHexStr(chainCode));
}

// privateKey should be 64 bytes Uint8Array of (key + chainCode) for Ed25519
// return derived privateKey's public Key which is a 32 bytes base64 string
function derivePublicKeyOLT(privateKey) {
    const {publicKey} = nacl.sign.keyPair.fromSecretKey(privateKey);
    return nacl.util.encodeBase64(publicKey)
}

// publicKey should be a 32 bytes base64 string
// hash address from public key based on SHA256, return 40 chars length address (without prefix)
function deriveAddressOLT(publicKey) {
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
// encryptedMasterKey is a string, keypath is a string
// return base64 signature
function signForSignatureOLT(message, password, encryptedMasterKey, keyPath, callback) {
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
        if (error) return callback(error);
        const derivedPrivatedkey = derivePrivateKeyOLT(decryptedMasterKey, decryptedMasterChaincode, keyPath);
        callback(null, nacl.util.encodeBase64(nacl.sign.detached(Uint8Array.from(nacl.util.decodeBase64(message)), derivedPrivatedkey)));
    });
}

// verify signature
// message, signature and publicKey are all base64 string
// TODO : testcase failed
function verifySignatureOLT(message, signature, publicKey, callback) {
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
    derivePrivateKeyOLT,
    derivePublicKeyOLT,
    deriveAddressOLT,
    signForSignatureOLT,
    verifySignatureOLT
};