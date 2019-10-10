const oneledger = require("./oneledger");
const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const masterKeySeed = require("./masterKeySeed");
const util = require("./util");
const typeConverter = require("./typeConverter");
const {signatureKeyType, derivedKeyType} = require("./config");
const requestErrors = require("./errorType").requestErrors;
const sysUtil = require("util");
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("./config");

// TODO : need to remove this function after integrated with middle_utility
function temporaryErrHandler(err) {
    const {code} = err.error;
    if (code === -11012) {
        return err
    }
    return util.returnErrorStructure(requestErrors.FailedToDeriveNewKeyError)
}

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
    return new Promise((resolve, reject) => {
        masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed, (error, masterKeySeed) => {
            if (error) reject(util.returnErrorStructure(requestErrors.WrongPassword));
            let result;
            switch (keyType) {
                case derivedKeyType.OLT:
                    try {
                        result = deriveNewKeyPairOLT(masterKeySeed, keyIndex)
                    } catch (error) {
                        reject(temporaryErrHandler(error))
                    }
                    resolve(util.returnResponseStructure(result));
                    break;
                case derivedKeyType.BTCP2PK:
                    try {
                        result = deriveNewKeyPairBTCP2PK(masterKeySeed, keyIndex, network)
                    } catch (error) {
                        reject(temporaryErrHandler(error))
                    }
                    resolve(util.returnResponseStructure(result));
                    break;
                case derivedKeyType.BTCP2PKH:
                    try {
                        result = deriveNewKeyPairBTCP2PKH(masterKeySeed, keyIndex, network)
                    } catch (error) {
                        reject(temporaryErrHandler(error))
                    }
                    resolve(util.returnResponseStructure(result));
                    break;
                case derivedKeyType.ETH:
                    try {
                        result = deriveNewKeyPairETH(masterKeySeed, keyIndex)
                    } catch (error) {
                        reject(temporaryErrHandler(error))
                    }
                    resolve(util.returnResponseStructure(result));
                    break;
                default:
                    reject(util.returnErrorStructure(requestErrors.InvalidDerivedKeyType))
            }
        })
    })
}

function deriveNewKeyPairOLT(masterKeySeed, keyIndex) {
    // console.log(oneledgerKeyPath + keyIndex + keyPathSuffix);
    const oneledgerMasterKey = oneledger.deriveMasterKey(typeConverter.bufferToHexStr(masterKeySeed));
    const oneledgerPrivateKeySeed = oneledger.derivePrivateKeySeed(oneledgerMasterKey, oneledgerKeyPath + keyIndex + keyPathSuffix);
    const {publicKey} = oneledger.deriveKeyPair(oneledgerPrivateKeySeed);
    const oneledgerAddress = oneledger.deriveAddress(publicKey);
    return {keyIndex, address: oneledgerAddress, publicKey}
}

function deriveNewKeyPairBTCP2PK(masterKeySeed, keyIndex, network) {
    // console.log(bitcoinKeyPath + keyIndex);
    return bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PK) => {
        if (error) throw(error);
        const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PK);
        const bitcoinDerivedP2PKPubkey = bitcoin.deriveP2PKPubKey(bitcoinDerivedPubkeyP2PK);
        return {keyIndex, publicKey: bitcoinDerivedP2PKPubkey}
    })
}

function deriveNewKeyPairBTCP2PKH(masterKeySeed, keyIndex, network) {
    // console.log(bitcoinKeyPath + keyIndex);
    return bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network, (error, bitcoinDerivedPriKeyP2PKH) => {
        if (error) throw(error);
        const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PKH);
        const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH);
        return {
            keyIndex,
            address: bitcoinDerivedP2PKHAddress,
            publicKey: bitcoinDerivedPubkeyP2PKH
        }
    })
}

function deriveNewKeyPairETH(masterKeySeed, keyIndex) {
    // console.log(ethereumKeyPath + keyIndex);
    const ethereumDerivedPriKey = ethereum.derivePrivateKey(masterKeySeed, ethereumKeyPath + keyIndex);
    const ethereumDerivedPubkey = ethereum.derivePublicKey(ethereumDerivedPriKey);
    const ethereumDerivedAddress = ethereum.deriveAddress(ethereumDerivedPubkey);
    return {keyIndex, address: ethereumDerivedAddress, publicKey: ethereumDerivedPubkey}
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
            return signTxOLT(message, keyIndex, encryptedMasterKeySeed, password);
        case signatureKeyType.BTC:
            return signTxBTC(message, keyIndex, encryptedMasterKeySeed, password, network);
        case signatureKeyType.ETH:
            return signTxETH(message, keyIndex, encryptedMasterKeySeed, password);
        default:
            return Promise.reject(util.returnErrorStructure(requestErrors.InvalidSignKeyType));
    }
}

function signTxOLT(message, keyIndex, encryptedMasterKeySeed, password) {
    if (!util.validateBase64(message)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidEncodedTxMessage));
    const oltTxData = {
        message,
        keyPath: oneledgerKeyPath + keyIndex + keyPathSuffix,
        encryptedMasterKeySeed,
        password
    };
    const signTxOLTPromise = sysUtil.promisify(oneledger.signForSignature);
    return signTxOLTPromise(oltTxData).then(signature => {
        return Promise.resolve(util.returnResponseStructure({signature}))
    }).catch(error => {
        return Promise.reject(error)
    })
}

function signTxBTC(message, keyIndex, encryptedMasterKeySeed, password, network) {
    if (!util.validBTCTxMessage(message)) return Promise.reject(util.returnErrorStructure(requestErrors.InvalidBTCtxMessage));
    const btcTxData = {
        message,
        keyPath: bitcoinKeyPath + keyIndex,
        network,
        password,
        encryptedMasterKeySeed
    };
    const signTxBTCPromise = sysUtil.promisify(bitcoin.signForSignature);
    return signTxBTCPromise(btcTxData).then(result => {
        return Promise.resolve(util.returnResponseStructure({signature: result.signature, recovery: result.recovery}))
    }).catch(error => {
        return Promise.reject(error)
    })
}

function signTxETH(message, keyIndex, encryptedMasterKeySeed, password) {
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
    const signTxETHPromise = sysUtil.promisify(ethereum.signForSignature);
    return signTxETHPromise(ethTxData).then(signature => {
        return Promise.resolve(util.returnResponseStructure({signature}))
    }).catch(error => {
        return Promise.reject(error)
    })
}

module.exports = {
    deriveNewKeyPair,
    signTx
};