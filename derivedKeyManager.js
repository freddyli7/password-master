const oneledger = require("./oneledger");
const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const masterKeySeed = require("./masterKeySeed");
const util = require("./util");
const typeConverter = require("./typeConverter");
const {signatureKeyType, derivedKeyType} = require("./config");
const {ErrorType, Util} = require("./middle_utility").Error;
const {requestErrors} = ErrorType;
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("./config");

// expose this function to UI
// derive new keys and store keyIndex with address (or publicKey) locally
// input : keyType should be string of either "OLT", "BTC-P2PK", "BTC-P2PKH", "ETH"
// input : keyIndex should be uint
// input : password is string
// input : encryptedMasterKeySeed is string
// input : network should be one of "BTCOIN", "TESTNET" or "REGTEST" only applicable for BitCoin
// return : callback function containing error object and derived new keyPair's keyIndex and address
function deriveNewKeyPair({keyType, keyIndex, password, encryptedMasterKeySeed, network}, callback) {
    if (!util.isNonNegativeInteger(keyIndex)) return callback(Util.errorWrap(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return callback(Util.errorWrap(requestErrors.InvalidEncryptedMasterKeySeed));
    return masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed, (error, masterKeySeed) => {
        if (error) return callback(Util.errorWrap(requestErrors.WrongPassword));
        switch (keyType) {
            case derivedKeyType.OLT:
                // console.log(oneledgerKeyPath + keyIndex + keyPathSuffix);
                const oneledgerMasterKey = oneledger.deriveMasterKey(typeConverter.bufferToHexStr(masterKeySeed));
                const oneledgerPrivateKeySeed = oneledger.derivePrivateKeySeed(oneledgerMasterKey, oneledgerKeyPath + keyIndex + keyPathSuffix);
                const {publicKey} = oneledger.deriveKeyPair(oneledgerPrivateKeySeed);
                const oneledgerAddress = oneledger.deriveAddress(publicKey);
                return callback(null, keyIndex, oneledgerAddress, publicKey);
            case derivedKeyType.BTCP2PK:
                // console.log(bitcoinKeyPath + keyIndex);
                return bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PK) => {
                    if (error) return callback(error);
                    const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PK);
                    const bitcoinDerivedP2PKPubkey = bitcoin.deriveP2PKPubKey(bitcoinDerivedPubkeyP2PK);
                    callback(null, keyIndex, bitcoinDerivedP2PKPubkey)
                });
            case derivedKeyType.BTCP2PKH:
                // console.log(bitcoinKeyPath + keyIndex);
                return bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PKH) => {
                    const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PKH);
                    const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH);
                    callback(null, keyIndex, bitcoinDerivedP2PKHAddress, bitcoinDerivedPubkeyP2PKH)
                });
            case derivedKeyType.ETH:
                // console.log(ethereumKeyPath + keyIndex);
                const ethereumDerivedPriKey = ethereum.derivePrivateKey(masterKeySeed, ethereumKeyPath + keyIndex);
                const ethereumDerivedPubkey = ethereum.derivePublicKey(ethereumDerivedPriKey);
                const ethereumDerivedAddress = ethereum.deriveAddress(ethereumDerivedPubkey);
                return callback(null, keyIndex, ethereumDerivedAddress, ethereumDerivedPubkey);
            default:
                return callback(Util.errorWrap(requestErrors.InvalidDerivedKeyType))
        }
    });
}

// expose this function to UI
// sign txs with derived keyPair
// input : keyType should be string of either "OLT", "BTC ", "ETH"
// input : keyIndex should be uint
// input : password is string
// input : encryptedMasterKeySeed is string
// input : network should be one of "BTCOIN", "TESTNET" or "REGTEST" only applicable for BitCoin
// input : message is different when choosing BTC, OLT or ETH, see testcase for detail
// return : callback function containing error object and signature with recovery(recovery only for BTC)
function signTx({message, keyType, keyIndex, password, encryptedMasterKeySeed, network}, callback) {
    if (!util.isNonNegativeInteger(keyIndex)) return callback(Util.errorWrap(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return callback(Util.errorWrap(requestErrors.InvalidEncryptedMasterKeySeed));
    switch (keyType) {
        case signatureKeyType.OLT:
            if (!util.validateBase64(message)) return callback(Util.errorWrap(requestErrors.InvalidEncodedTxMessage));
            const oltTxData = {
                message,
                keyPath: oneledgerKeyPath + keyIndex + keyPathSuffix,
                encryptedMasterKeySeed,
                password
            };
            return oneledger.signForSignature(oltTxData, (error, signature) => {
                if (error) return callback(error);
                return callback(null, signature)
            });
        case signatureKeyType.BTC:
            if (!util.validBTCTxMessage(message)) return callback(Util.errorWrap(requestErrors.InvalidBTCtxMessage));
            const btcTxData = {
                message,
                keyPath: bitcoinKeyPath + keyIndex,
                network,
                password,
                encryptedMasterKeySeed
            };
            return bitcoin.signForSignature(btcTxData, (error, signature, recovery) => {
                if (error) return callback(error);
                return callback(null, signature, recovery)
            });
        case signatureKeyType.ETH:
            const {nonce, gasPrice, gasLimit, to, value} = message;
            // verify eth tx message data
            if (!util.isNonNegativeInteger(nonce)) return callback(Util.errorWrap(requestErrors.InvalidNonce));
            if (!util.isNonNegativeNumber(gasPrice)) return callback(Util.errorWrap(requestErrors.InvalidGasPrice));
            if (!util.isNonNegativeNumber(value)) return callback(Util.errorWrap(requestErrors.InvalidTxValue));
            if (!util.isPositiveInteger(gasLimit)) return callback(Util.errorWrap(requestErrors.InvalidGasLimit));
            if (!util.isValidAddress(to)) return callback(Util.errorWrap(requestErrors.InvalidTxReceiverAddress));
            const ethTxData = {
                txParams: message,
                password,
                encryptedMasterKeySeed,
                keyPath: ethereumKeyPath + keyIndex
            };
            return ethereum.signForSignature(ethTxData, (error, signature) => {
                if (error) return callback(error);
                return callback(null, signature)
            });
        default:
            return callback(Util.errorWrap(requestErrors.InvalidSignKeyType));
    }
}

module.exports = {
    deriveNewKeyPair,
    signTx
};