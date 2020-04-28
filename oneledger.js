const {derivePath, isValidPath, getMasterKeyFromSeed} = require('ed25519-hd-key');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const sjcl = require("sjcl");
const typeConverter = require("./typeConverter");
const masterKeySeed = require("./masterKeySeed");
const {oltAddrPrefix} = require("./config");
const util = require("./util");
const {ErrorType, ErrorUtil} = require("./middle_utility").TierError;
const {requestErrors} = ErrorType;

/* *****************************   Ed25519 For Oneledger  ***************************** */
// derive 32 bytes masterKey from masterKeySeed
// input : masterKeySeed is a 64 bytes hex string
// return : masterKey which is a 32 bytes Uint8Array
function deriveMasterKey(masterKeySeed) {
    const {key, chainCode} = getMasterKeyFromSeed(masterKeySeed);
    return typeConverter.bufferToUint8Array(key)
}

// derive new privateKeySeed based on masterKey and keyPath
// input : masterKey should be a 32 bytes uint8array for Ed25519, masterKey should be the derived key part of masterKey
// input : keyPath is a string
// return : derived new privateKeySeed which is a 32 byte buffer
function derivePrivateKeySeed(masterKey, keyPath) {
    const hexMasterKey = typeConverter.uint8arrayToHexStr(masterKey);
    const {key, chainCode} = derivePath(keyPath, hexMasterKey);
    return key
}

// derive new keyPair from privateKeySeed
// input : privateKeySeed should be a 32 bytes buffer for Ed25519, privateKeySeed should be derived key part of privateKeySeed
// return : derived keyPair which the private key is a 64 byte based64 string and public Key is a 32 bytes base64 string
function deriveKeyPair(privateKeySeed) {
    const {publicKey, secretKey} = nacl.sign.keyPair.fromSeed(privateKeySeed);
    return {publicKey: nacl.util.encodeBase64(publicKey), privateKey: nacl.util.encodeBase64(secretKey)}
}

// derive the address of the new keyPair
// input : publicKey should be a 32 bytes base64 string
// return : address from public key based on SHA256, return 0lt prefix and first 40 chars length address
function deriveAddress(publicKey) {
    let base64PublicKey = sjcl.codec.base64.toBits(publicKey);
    let hash = new sjcl.hash.sha256();
    hash.update(base64PublicKey);
    let hashResult = hash.finalize();
    let hashedData = sjcl.codec.hex.fromBits(hashResult);
    hash.reset();
    return `${oltAddrPrefix}${hashedData.substring(0, 40)}`
}

// verify OLT address
function verifyAddress(address) {
    return util.isValidOLTAddress(address)
}

// sign OLT tx
// input : message should be a base64 string
// input : password is plaintext
// input : encryptedMasterKeySeed is a string
// input : keyPath is a string
// return : promise containing error object or base64 signature
async function signForSignature({message, password, encryptedMasterKeySeed, keyPath}) {
    const decryptedMasterKeySeed = await masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed).catch(error => {
        return Promise.reject(error)
    });
    let masterKey = deriveMasterKey(decryptedMasterKeySeed);
    let derivedPrivateKeySeed = derivePrivateKeySeed(masterKey, keyPath);
    const {privateKey, publicKey} = deriveKeyPair(derivedPrivateKeySeed);
    const signature = nacl.util.encodeBase64(nacl.sign.detached(Uint8Array.from(nacl.util.decodeBase64(message)), nacl.util.decodeBase64(privateKey)));
    masterKey = null;
    derivedPrivateKeySeed = null;
    return Promise.resolve(signature)
}

// verify OLT tx signature
// input : message, signature and publicKey are all base64 string
// return : promise containing error object or verifyResult (true || false)
function verifySignature(message, signature, publicKey) {
    return new Promise((resolve, reject) => {
        let verifyResult;
        try {
            verifyResult = nacl.sign.detached.verify(
                Uint8Array.from(nacl.util.decodeBase64(message)),
                nacl.util.decodeBase64(signature),
                nacl.util.decodeBase64(publicKey)
            )
        } catch (err) {
            reject(ErrorUtil.errorWrap(requestErrors.InvalidOLTSignature));
        }
        resolve(verifyResult);
    })
}

module.exports = {
    deriveMasterKey,
    derivePrivateKeySeed,
    deriveKeyPair,
    deriveAddress,
    verifyAddress,
    signForSignature,
    verifySignature
};
