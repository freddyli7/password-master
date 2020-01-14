const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const secp256k1 = require('secp256k1');
const bitcoinjs = require('bitcoinjs-lib');
const typeConverter = require("./typeConverter");
const masterKeySeed = require("./masterKeySeed");
const bip32 = require("bip32");
const walletValidator = require('wallet-address-validator');
const util = require('./util');
const {ErrorType, ErrorUtil} = require("./middle_utility").TierError;
const {requestErrors} = ErrorType;

/* *****************************   Secp256k1 For BTC  ***************************** */
// derive private key from masterKeySeed
// input : masterKeySeed is a 64 bytes buffer
// input : keyPath is a string
// input : network should be the network object of one of "BTCOIN", "TESTNET" or "REGTEST"
// return : promise containing error object or derivedPrivateKey which is a 32 bytes buffer
function derivePrivateKey(masterKeySeed, keyPath, network) {
    return new Promise((resolve, reject) => {
        // derive BitCoin master key node from masterKeySeed
        try {
            const masterNode = bip32.fromSeed(masterKeySeed, network);
            const keyPair = masterNode.derivePath(keyPath);
            resolve(keyPair)
        } catch (err) {
            reject(ErrorUtil.errorWrap(requestErrors.FailedToDeriveNewKey))
        }
    })
}

// verify BTC private key
// input : BitCoin privateKey which is a 32 bytes buffer
// return : privateKey verifyResult (true || false)
function verifyPrivateKey(privateKey) {
    return secp256k1.privateKeyVerify(privateKey)
}

// derive publicKey from privateKey
// input : privateKey should be 32 bytes buffer
// return : derived privateKey's publicKey which is a 33 bytes hex string with chain prefix 0x02 or 0x03
function derivePublicKey(keyPair) {
    return typeConverter.bufferToHexStr(keyPair.publicKey)
}

// derive P2PKH address
// input : publicKey should be a 33 bytes hex string with chain prefix
// return : 34 chars length base58 encoding P2PKH address
function deriveP2PKHAddress(publicKey, network) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2pkh({pubkey, network}).address
}

// verify P2PKH or P2SH address
function verifyAddress(address) {
    if (!util.isValidString(address)) return false;
    return walletValidator.validate(address, 'BTC')
}

// derive P2PK publicKey
// input : publicKey should be a 33 bytes hex string with chain prefix
// return : 33 bytes hex string public key with chain prefix
function deriveP2PKPubKey(publicKey) {
    // const pubkey = typeConverter.hexStrToBuffer(publicKey);
    // bitcoinjs.payments.p2pk({pubkey}).pubkey;
    return publicKey
}

// verify P2PK public key
function verifyP2PKPublicKey(publicKey) {
    if (!util.isValidString(publicKey)) return false;
    return secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(publicKey))
}

// TODO : no need for now
function deriveP2WPKHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2wpkh({pubkey}).address
}

// TODO : no need for now
function deriveP2WSHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2wsh({pubkey}).address
}

// TODO : no need for now
function deriveP2SHAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2sh({pubkey}).address
}

// TODO : no need for now
function deriveP2MSAddress(publicKey) {
    const pubkey = typeConverter.hexStrToBuffer(publicKey);
    return bitcoinjs.payments.p2ms({pubkey}).address
}

// sign BitCoin tx
// input : encryptedMasterKeySeed is a string
// input : keyPath is a string
// input : message should be a hex string
// input : password is plaintext
// input : network should be the network object of one of "BTCOIN", "TESTNET" or "REGTEST"
// return : promise containing error object or signature which is a hex string
async function signForSignature({message, password, encryptedMasterKeySeed, keyPath, network}) {
    const decryptedMasterKeySeed = await masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed).catch(error => {
        return Promise.reject(error)
    });
    const derivedKeyPair = await derivePrivateKey(decryptedMasterKeySeed, keyPath, network).catch(error => {
        return Promise.reject(error)
    });
    // use WIF to sign, not private key itself
    const signer = bitcoinjs.ECPair.fromWIF(derivedKeyPair.toWIF(), network);
    let tx;
    try {
        tx = bitcoinjs.Transaction.fromHex(message);
    } catch (err) {
        return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCtxMessage))
    }
    const txBuilder = bitcoinjs.TransactionBuilder.fromTransaction(tx, network);
    txBuilder.sign(0, signer);
    const signedTx = txBuilder.build();
    const sigScript = signedTx.ins[0].script;
    return Promise.resolve({signature: typeConverter.bufferToHexStr(sigScript)})
}

// verify BTC tx signature
// input : message 32 bytes hex string
// input : signature 64 bytes hex string
// input : publicKey 33 bytes hex string
// return : verifyResult (true || false)
/**
 * @deprecated need to update with proper signature verify function
 * // TODO : this function needs to be updated with a proper with to verify the signature, once it's done, update testcases as well
 */
function verifySignature(message, signature, publicKey) {
    return secp256k1.verify(typeConverter.hexStrToBuffer(message), typeConverter.hexStrToBuffer(signature), typeConverter.hexStrToBuffer(publicKey))
}

module.exports = {
    derivePrivateKey,
    derivePublicKey,

    deriveP2PKHAddress,
    deriveP2PKPubKey,
    verifyAddress,
    verifyP2PKPublicKey,

    verifyPrivateKey,
    signForSignature,
    verifySignature
};
