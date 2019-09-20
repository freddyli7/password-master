const oneledger = require("./oneledger");
const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const masterkey = require("./masterkey");
const util = require("./util");
const {signatureKeyType, derivedKeyType} = require("./config");
const requestErrors = require("./errorType").requestErrors;
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("./config");

// expose to UI
// keyType should be string of either "OLT", "BTC-P2PK", "BTC-P2PKH", "ETH"
// keyIndex should be uint
// password and encryptedMasterKey are string
// network should be one of "BTCOIN", "TESTNET" or "REGTEST"
// return derived new keypair's keyIndex and address
function deriveNewKeyPair({keyType, keyIndex, password, encryptedMasterKey, network}, callback) {
    if (!util.isNonNegativeInteger(keyIndex)) return callback(requestErrors.InvalidKeyIndex);
    if (typeof encryptedMasterKey !== "string") return callback(requestErrors.InvalidEncryptedMasterKey);
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, (error, masterKey, masterChainCode) => {
        if (error) return callback(requestErrors.WrongPassword);
        switch (keyType) {
            case derivedKeyType.OLT:
                // console.log(oneledgerKeyPath + keyIndex + keyPathSuffix);
                const oneledgerDerivedPriKeySeed = oneledger.deriveSeed(masterKey, oneledgerKeyPath + keyIndex + keyPathSuffix);
                const {publicKey} = oneledger.deriveKeyPair(oneledgerDerivedPriKeySeed);
                const oneledgerDerivedAddress = oneledger.deriveAddress(publicKey);
                return callback(null, keyIndex, oneledgerDerivedAddress);
            case derivedKeyType.BTCP2PK:
                // console.log(bitcoinKeyPath + keyIndex);
                return bitcoin.derivePrivateKey(masterKey, masterChainCode, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PK) => {
                    if (error) return callback(error);
                    const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PK);
                    const bitcoinDerivedP2PKPubkey = bitcoin.deriveP2PKPubKey(bitcoinDerivedPubkeyP2PK);
                    callback(null, keyIndex, bitcoinDerivedP2PKPubkey);
                });
            case derivedKeyType.BTCP2PKH:
                // console.log(bitcoinKeyPath + keyIndex);
                return bitcoin.derivePrivateKey(masterKey, masterChainCode, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PKH) => {
                    const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PKH);
                    const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH);
                    callback(null, keyIndex, bitcoinDerivedP2PKHAddress);
                });
            case derivedKeyType.ETH:
                // console.log(ethereumKeyPath + keyIndex);
                const ethereumDerivedPriKey = ethereum.derivePrivateKey(masterKey, ethereumKeyPath + keyIndex);
                const ethereumDerivedPubkey = ethereum.derivePublicKey(ethereumDerivedPriKey);
                const ethereumDerivedAddress = ethereum.deriveAddress(ethereumDerivedPubkey);
                return callback(null, keyIndex, ethereumDerivedAddress);
            default:
                return callback(requestErrors.InvalidDerivedKeyType);
        }
    });
}

// keyType should be string of either "OLT", "BTC ", "ETH"
// keyIndex should be uint
// password and encryptedMasterKey are string
// network should be one of "BTCOIN", "TESTNET" or "REGTEST"
// message is different when choosing BTC, OLT or ETH, see testcase for detail
// return signature with recovery(only for BTC)
function signTx({message, keyType, keyIndex, password, encryptedMasterKey, network}, callback) {
    if (!util.isNonNegativeInteger(keyIndex)) return callback(requestErrors.InvalidKeyIndex);
    if (typeof encryptedMasterKey !== "string") return callback(requestErrors.InvalidEncryptedMasterKey);
    switch (keyType) {
        case signatureKeyType.OLT:
            if (!util.validateBase64(message)) return callback(requestErrors.InvalidEncodedTxMessage);
            const oltkeypath = oneledgerKeyPath + keyIndex + keyPathSuffix;
            return oneledger.signForSignature(message, password, encryptedMasterKey, oltkeypath, (error, signature) => {
                if (error) return callback(error);
                return callback(null, signature)
            });
        case signatureKeyType.BTC:
            if (!util.validBTCTxMessage(message)) return callback(requestErrors.InvalidBTCtxMessage);
            const btckeypath = bitcoinKeyPath + keyIndex;
            const bitcoinTxData = {
                message,
                keyPath: btckeypath,
                network,
                password,
                encryptedMasterKey
            };
            return bitcoin.signForSignature(bitcoinTxData, (error, signature, recovery) => {
                if (error) return callback(error);
                return callback(null, signature, recovery)
            });
        case signatureKeyType.ETH:
            const {nonce, gasPrice, gasLimit, to, value, data} = message;
            // verify eth tx message data
            if (!util.isNonNegativeInteger(nonce)) return callback(requestErrors.InvalidNonce);
            if (!util.isNonNegativeNumber(gasPrice)) return callback(requestErrors.InvalidGasPrice);
            if (!util.isNonNegativeNumber(value)) return callback(requestErrors.InvalidTxValue);
            if (!util.isPositiveInteger(gasLimit)) return callback(requestErrors.InvalidGasLimit);
            if (!util.isValidAddress(to)) return callback(requestErrors.InvalidTxReceiverAddress);
            const txParams = {
                nonce,
                gasPrice,
                gasLimit,
                to,
                value,
                data
            };
            const ethkeypath = ethereumKeyPath + keyIndex;
            return ethereum.signForSignature(txParams, password, encryptedMasterKey, ethkeypath, (error, signature) => {
                if (error) return callback(error);
                return callback(null, signature)
            });
        default:
            return callback(requestErrors.InvalidSignKeyType);
    }
}

module.exports = {
    deriveNewKeyPair,
    signTx
};