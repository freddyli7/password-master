const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const secp256k1 = require('secp256k1');
const bitcoinjs = require('bitcoinjs-lib');
const typeConverter = require("./typeConverter");
const masterkey = require("./masterkey");
const requestErrors = require("./errorType").requestErrors;
const {bitcoinNetworkType} = require("./config");
const bip32 = require("bip32");

/* *****************************   Secp256k1 For BTC  ***************************** */

// derive private key from master key
// masterchaincode and masterkey both are Uint8Array, both should be a 32 bytes for BTC
// keyPath is a string
// network should be one of "BTCOIN", "TESTNET" or "REGTEST"
// return derived private key which is a 32 bytes buffer
function derivePrivateKey(masterKey, masterChainCode, keyPath, network, callback) {
    let networkDetermined;
    switch (network) {
        case bitcoinNetworkType.BITCOIN :
            networkDetermined = bitcoinjs.networks.bitcoin;
            break;
        case bitcoinNetworkType.TESTNET:
            networkDetermined = bitcoinjs.networks.testnet;
            break;
        case bitcoinNetworkType.REGTEST:
            networkDetermined = bitcoinjs.networks.regtest;
            break;
        default:
            return callback(requestErrors.InvalidBTCNetworkType);
    }
    const node = bip32.fromPrivateKey(typeConverter.uint8ArrayToBuffer(masterKey), typeConverter.uint8ArrayToBuffer(masterChainCode), networkDetermined);
    const keyPair = node.derivePath(keyPath);
    return callback(null, keyPair.privateKey)
}

// verify BTC private key
function verifyPrivateKey(privateKey) {
    const key = typeConverter.hexStrToBuffer(privateKey);
    return secp256k1.privateKeyVerify(key)
}

// privateKey should be 32 bytes Uint8Array (just key part) for BTC
// return derived privateKey's public Key which is a 33 bytes hex string with chain prefix 0x02 or 0x03
function derivePublicKey(privateKey) {
    return typeConverter.bufferToHexStr(secp256k1.publicKeyCreate(privateKey));
}

// publicKey should be 33 bytes hex string with chain prefix
// return 34 chars length base58 encoding P2PKH address
function deriveP2PKHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2pkh({pubkey}).address;
}

// publicKey should be 33 bytes hex string with chain prefix
// return 33 bytes hex string public key with chain prefix
function deriveP2PKPubKey(publicKey) {
    // const pubkey = typeConverter.hexStrToBuffer(publicKey);
    // bitcoinjs.payments.p2pk({pubkey}).pubkey;
    return publicKey
}

// TODO : no need for now
function deriveP2WPKHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2wpkh({pubkey}).address;
}

// TODO : no need for now
function deriveP2WSHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2wsh({pubkey}).address;
}

// TODO : no need for now
function deriveP2SHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2sh({pubkey}).address;
}

// TODO : no need for now
function deriveP2MSAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2ms({pubkey}).address;
}

// encryptedMasterKey is a string, keypath is a string
// message should be 32 bytes hex string, password is plaintext
// network should be one of "BTCOIN", "TESTNET" or "REGTEST"
// return signature which is a 64 bytes buffer, and recovery which is a number
function signForSignature({message, password, encryptedMasterKey, keyPath, network}, callback) {
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, (error, decryptedMasterKey, decryptedMasterChaincode) => {
        if (error) return callback(error);
        return derivePrivateKey(decryptedMasterKey, decryptedMasterChaincode, keyPath, network, (error, derivedPrivatedkey) => {
            if (error) return callback(error);
            const {signature, recovery} = secp256k1.sign(typeConverter.hexStrToBuffer(message), derivedPrivatedkey);
            callback(null, signature, recovery);
        });
    });
}

// verify BTC tx signature
// message 32 bytes, signature 64 bytes and publicKey 33 bytes are all hex string
function verifySignature(message, signature, publicKey) {
    return secp256k1.verify(typeConverter.hexStrToBuffer(message), typeConverter.hexStrToBuffer(signature), typeConverter.hexStrToBuffer(publicKey))
}

module.exports = {
    derivePrivateKey,
    derivePublicKey,

    deriveP2PKHAddress,
    deriveP2PKPubKey,

    verifyPrivateKey,
    signForSignature,
    verifySignature
};