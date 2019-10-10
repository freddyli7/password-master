const oneledger = require("./oneledger");
const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const masterKeySeed = require("./masterKeySeed");
const util = require("./util");
const typeConverter = require("./typeConverter");
const {signatureKeyType, derivedKeyType} = require("./config");
const requestErrors = require("./errorType").requestErrors;
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("./config");

// expose this function to UI
// derive new keys and store keyIndex with address (or publicKey) locally
// input : keyType should be string of either "OLT", "BTC-P2PK", "BTC-P2PKH", "ETH"
// input : keyIndex should be uint
// input : password is string
// input : encryptedMasterKeySeed is string
// input : network should be one of "BTCOIN", "TESTNET" or "REGTEST" only applicable for BitCoin
// return : promise
function deriveNewKeyPair({keyType, keyIndex, password, encryptedMasterKeySeed, network}) {
    if (!util.isNonNegativeInteger(keyIndex)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return Promise.reject(util.returnErrorStructure(requestErrors.InvalidEncryptedMasterKeySeed));
    let receiver;
    masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed, (error, masterKeySeed) => {
        if (error) {
            receiver = Promise.reject(util.returnErrorStructure(requestErrors.WrongPassword));
            return
        }
        switch (keyType) {
            case derivedKeyType.OLT:
                // console.log(oneledgerKeyPath + keyIndex + keyPathSuffix);
                const oneledgerMasterKey = oneledger.deriveMasterKey(typeConverter.bufferToHexStr(masterKeySeed));
                const oneledgerPrivateKeySeed = oneledger.derivePrivateKeySeed(oneledgerMasterKey, oneledgerKeyPath + keyIndex + keyPathSuffix);
                const {publicKey} = oneledger.deriveKeyPair(oneledgerPrivateKeySeed);
                const oneledgerAddress = oneledger.deriveAddress(publicKey);
                const objOlt = {keyIndex, address: oneledgerAddress, publicKey};
                receiver = Promise.resolve(util.returnResponseStructure(objOlt));
                return;
            case derivedKeyType.BTCP2PK:
                // console.log(bitcoinKeyPath + keyIndex);
                return bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PK) => {
                    if (error) return callback(error);
                    const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PK);
                    const bitcoinDerivedP2PKPubkey = bitcoin.deriveP2PKPubKey(bitcoinDerivedPubkeyP2PK);
                    const objBtcP2PK = {keyIndex, publicKey: bitcoinDerivedP2PKPubkey};
                    receiver = Promise.resolve(util.returnResponseStructure(objBtcP2PK))
                });
            case derivedKeyType.BTCP2PKH:
                // console.log(bitcoinKeyPath + keyIndex);
                return bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PKH) => {
                    const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PKH);
                    const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH);
                    const objBtcP2PKH = {
                        keyIndex,
                        address: bitcoinDerivedP2PKHAddress,
                        publicKey: bitcoinDerivedPubkeyP2PKH
                    };
                    receiver = Promise.resolve(util.returnResponseStructure(objBtcP2PKH))
                });
            case derivedKeyType.ETH:
                // console.log(ethereumKeyPath + keyIndex);
                const ethereumDerivedPriKey = ethereum.derivePrivateKey(masterKeySeed, ethereumKeyPath + keyIndex);
                const ethereumDerivedPubkey = ethereum.derivePublicKey(ethereumDerivedPriKey);
                const ethereumDerivedAddress = ethereum.deriveAddress(ethereumDerivedPubkey);
                const objEth = {keyIndex, address: ethereumDerivedAddress, publicKey: ethereumDerivedPubkey};
                receiver = Promise.resolve(util.returnResponseStructure(objEth));
                return;
            default:
                receiver = Promise.reject(util.returnErrorStructure(requestErrors.InvalidDerivedKeyType));
                return
        }
    });
    return receiver
}

// expose this function to UI
// sign txs with derived keyPair
// input : keyType should be string of either "OLT", "BTC ", "ETH"
// input : keyIndex should be uint
// input : password is string
// input : encryptedMasterKeySeed is string
// input : network should be one of "BTCOIN", "TESTNET" or "REGTEST" only applicable for BitCoin
// input : message is different when choosing BTC, OLT or ETH, see testcase for detail
// return : promise (recovery is only for BTC)
function signTx({message, keyType, keyIndex, password, encryptedMasterKeySeed, network}) {
    if (!util.isNonNegativeInteger(keyIndex)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return Promise.reject(util.returnErrorStructure(requestErrors.InvalidEncryptedMasterKeySeed));
    switch (keyType) {
        case signatureKeyType.OLT:
            if (!util.validateBase64(message)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidEncodedTxMessage));
            const oltTxData = {
                message,
                keyPath: oneledgerKeyPath + keyIndex + keyPathSuffix,
                encryptedMasterKeySeed,
                password
            };
            let receiverOlt;
            oneledger.signForSignature(oltTxData, (error, signature) => {
                if (error) {
                    receiverOlt = Promise.reject(error);
                    return
                }
                const obj = {signature};
                receiverOlt = Promise.resolve(util.returnResponseStructure(obj));
            });
            return receiverOlt;
        case signatureKeyType.BTC:
            if (!util.validBTCTxMessage(message)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidBTCtxMessage));
            const btcTxData = {
                message,
                keyPath: bitcoinKeyPath + keyIndex,
                network,
                password,
                encryptedMasterKeySeed
            };
            let receiverBtc;
            bitcoin.signForSignature(btcTxData, (error, signature, recovery) => {
                if (error) {
                    receiverBtc = Promise.reject(error);
                    return
                }
                const obj = {signature, recovery};
                receiverBtc = Promise.resolve(util.returnResponseStructure(obj));
            });
            return receiverBtc;
        case signatureKeyType.ETH:
            const {nonce, gasPrice, gasLimit, to, value} = message;
            // verify eth tx message data
            if (!util.isNonNegativeInteger(nonce)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidNonce));
            if (!util.isNonNegativeNumber(gasPrice)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidGasPrice));
            if (!util.isNonNegativeNumber(value)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidTxValue));
            if (!util.isPositiveInteger(gasLimit)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidGasLimit));
            if (!util.isValidAddress(to)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidTxReceiverAddress));
            const ethTxData = {
                txParams: message,
                password,
                encryptedMasterKeySeed,
                keyPath: ethereumKeyPath + keyIndex
            };
            let receiverEth;
            ethereum.signForSignature(ethTxData, (error, signature) => {
                if (error) {
                    receiverEth = Promise.reject(error);
                    return
                }
                const obj = {signature};
                receiverEth = Promise.resolve(util.returnResponseStructure(obj));
            });
            return receiverEth;
        default:
            return Promise.reject(util.returnErrorStructure(requestErrors.InvalidSignKeyType));
    }
}

module.exports = {
    deriveNewKeyPair,
    signTx
};