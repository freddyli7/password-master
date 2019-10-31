const oneledger = require("./oneledger");
const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const masterKeySeed = require("./masterKeySeed");
const util = require("./util");
const typeConverter = require("./typeConverter");
const {signatureKeyType, derivedKeyType} = require("./config");
const {ErrorType, errorHandler, ErrorUtil} = require("./middle_utility").TierError;
const {requestErrors} = ErrorType;
const sysUtil = require('util');
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("./config");

// expose this function to UI
// derive new keys and store keyIndex with address (or publicKey) locally
// input : keyType should be string of either "OLT", "BTCP2PK", "BTCP2PKH", "ETH"
// input : keyIndex should be uint
// input : password is string
// input : encryptedMasterKeySeed is string
// input : network should be one of "BTCOIN", "TESTNET" or "REGTEST" only applicable for BitCoin
// return : promise
async function deriveNewKeyPair({keyType, keyIndex, password, encryptedMasterKeySeed, network}) {
    if (!util.isNonNegativeInteger(keyIndex)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidEncryptedMasterKeySeed));
    const masterSeedDecryption = sysUtil.promisify(masterKeySeed.masterKeySeedDecryption);
    const decryptedMasterKeySeed = await masterSeedDecryption(password, encryptedMasterKeySeed).catch(error => {
        return Promise.reject(ErrorUtil.errorWrap(requestErrors.WrongPassword))
    });
    let result;
    switch (keyType) {
        case derivedKeyType.OLT:
            try {
                result = deriveNewKeyPairOLT(decryptedMasterKeySeed, keyIndex)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error));
            }
            return Promise.resolve(ErrorUtil.responseWrap(result));
        case derivedKeyType.BTCP2PK:
            try {
                result = await deriveNewKeyPairBTCP2PK(decryptedMasterKeySeed, keyIndex, network)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error))
            }
            return Promise.resolve(ErrorUtil.responseWrap(result));
        case derivedKeyType.BTCP2PKH:
            try {
                result = await deriveNewKeyPairBTCP2PKH(decryptedMasterKeySeed, keyIndex, network)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error))
            }
            return Promise.resolve(ErrorUtil.responseWrap(result));
        case derivedKeyType.ETH:
            try {
                result = deriveNewKeyPairETH(decryptedMasterKeySeed, keyIndex)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error))
            }
            return Promise.resolve(ErrorUtil.responseWrap(result));
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidDerivedKeyType))
    }
}

function deriveNewKeyPairOLT(masterKeySeed, keyIndex) {
    // console.log(oneledgerKeyPath + keyIndex + keyPathSuffix);
    const oneledgerMasterKey = oneledger.deriveMasterKey(typeConverter.bufferToHexStr(masterKeySeed));
    const oneledgerPrivateKeySeed = oneledger.derivePrivateKeySeed(oneledgerMasterKey, oneledgerKeyPath + keyIndex + keyPathSuffix);
    const {publicKey} = oneledger.deriveKeyPair(oneledgerPrivateKeySeed);
    const oneledgerAddress = oneledger.deriveAddress(publicKey);
    return {keyIndex, address: oneledgerAddress, publicKey}
}

async function deriveNewKeyPairBTCP2PK(masterKeySeed, keyIndex, network) {
    // console.log(bitcoinKeyPath + keyIndex);
    const bitcoinDerivedPriKeyP2PK = await bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network).catch(error => {
        throw(error);
    });
    const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PK);
    const bitcoinDerivedP2PKPubkey = bitcoin.deriveP2PKPubKey(bitcoinDerivedPubkeyP2PK);
    return {keyIndex, publicKey: bitcoinDerivedP2PKPubkey}
}

async function deriveNewKeyPairBTCP2PKH(masterKeySeed, keyIndex, network) {
    // console.log(bitcoinKeyPath + keyIndex);
    const bitcoinDerivedPriKeyP2PKH = await bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, network).catch(error => {
        throw(error);
    });
    const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKey(bitcoinDerivedPriKeyP2PKH);
    const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH);
    return {
        keyIndex,
        address: bitcoinDerivedP2PKHAddress,
        publicKey: bitcoinDerivedPubkeyP2PKH
    }
}

function deriveNewKeyPairETH(masterKeySeed, keyIndex) {
    // console.log(ethereumKeyPath + keyIndex);
    const ethereumDerivedPriKey = ethereum.derivePrivateKey(masterKeySeed, ethereumKeyPath + keyIndex);
    const ethereumDerivedPubkey = ethereum.derivePublicKey(ethereumDerivedPriKey);
    const ethereumDerivedAddress = ethereum.deriveAddress(ethereumDerivedPubkey);
    return {keyIndex, address: ethereumDerivedAddress, publicKey: ethereumDerivedPubkey}
}

/**
 * @description Sign txs with derived keyPair
 * @param {Object} signTxParamObj - Sign tx parameter object
 * @param {(object|string)} signTxParamObj.message - Message is different when choosing different keyType.
 * message is an Object if keyType is ETH; message is a string if keyType is OLT or BTC.
 * If KeyType is ETH, message must contain txParams field which is an object,
 * txConfig field is optional which is also an object, it is used to indicate Ethereum network and hardfork,
 * DO NOT pass txConfig object in message to use default txConfig (chain is mainnet, hardfork is petersburg).
 * In txConfig object, valid chain value should be one of "mainnet", "rinkeby", "ropsten", "kovan", "goerli",
 * valid hardfork value should be one of "petersburg", "constantinople", "byzantium".
 * Please see examples below.
 * @param {string} signTxParamObj.keyType - KeyType determines which chain is used to sign. Value should be string of either "OLT", "BTC " or "ETH".
 * @param {uint} signTxParamObj.keyIndex - KeyIndex is used to derive new key.
 * @param {string} signTxParamObj.password - Password of encrypted master key seed.
 * @param {string} signTxParamObj.encryptedMasterKeySeed - EncryptedMasterKeySeed string.
 * @param {string} signTxParamObj.network - Network determines which network to use. Value should be one of "BTCOIN", "TESTNET" or "REGTEST"(Network is only applicable for BitCoin for now).
 * @returns {Promise} If success, Promise.resolve with {response : {signature : signatureValue[,recovery : recoveryValue]}}; If fail, Promise.reject with {error : errorObject} (recovery is only for BTC).
 * @example // 1.sign ETH tx with network as goerli and hardfork as byzantium:
 * const txParams = {
 *           nonce: 0,
 *           gasPrice: 1.1,
 *           gasLimit: 1,
 *           to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
 *           value: "1",
 *           data: "",
 *       };
 * const txConfig = {chain : "goerli", hardfork :"byzantium"};
 * const signData = {
 *           message: {txParams, txConfig},
 *           keyType: "ETH",
 *           keyIndex: 0,
 *           password: "123456",
 *           encryptedMasterKeySeed
 *       };
 * const signTxResult = await HDVault.derivedKeyManager.signTx(signData).catch(err => {
 *           console.error("ERR : ", err.error);
 *       });
 * const {response} = signTxResult;
 * const {signature} = response;
 * console.log("get signature: ", signature);
 *
 * @example // 2.sign ETH tx with default network(mainnet) and default hardfork(petersburg):
 * const txParams = {
 *           nonce: 0,
 *           gasPrice: 1.1,
 *           gasLimit: 1,
 *           to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
 *           value: "1",
 *           data: "",
 *       };
 * const signData = {
 *           message: {txParams},
 *           keyType: "ETH",
 *           keyIndex: 0,
 *           password: "123456",
 *           encryptedMasterKeySeed
 *       };
 * const signTxResult = await HDVault.derivedKeyManager.signTx(signData).catch(err => {
 *           console.error("ERR : ", err.error);
 *       });
 * const {response} = signTxResult;
 * const {signature} = response;
 * console.log("get signature: ", signature);
 *
 * @example // 3.sign BTC tx:
 * // BTC message should be a 64 char long string
 * const rawTxmessageBTC = "072a8543e388c4155ccbcd325f129000214095725598721cea986fcd0fc38d6a";
 * const signData = {
 *          message: rawTxmessageBTC,
 *          keyType: "BTC",
 *          keyIndex: 0,
 *          password: "123456",
 *          encryptedMasterKeySeed
 *      };
 * const signTxResult = await HDVault.derivedKeyManager.signTx(signData).catch(err => {
 *          console.error("ERR : ", err.error);
 *  });
 * const {response} = signTxResult;
 * const {signature} = response;
 * console.log("get signature: ", signature);
 *
 * @example // 4.sign OLT tx:
 * // OLT message should be a base64 encoded string
 * const messageOLT = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';
 * const signData = {
 *          message: messageOLT,
 *          keyType: "OLT",
 *          keyIndex: 0,
 *          password: "123456",
 *          encryptedMasterKeySeed
 *      };
 * const signTxResult = await HDVault.derivedKeyManager.signTx(signData).catch(err => {
 *          console.error("ERR : ", err.error);
 *      });
 * const {signature} = signTxResult.response;
 * console.log("get signature: ", signature);
 */
function signTx({message, keyType, keyIndex, password, encryptedMasterKeySeed, network}) {
    if (!util.isNonNegativeInteger(keyIndex)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidEncryptedMasterKeySeed));
    switch (keyType) {
        case signatureKeyType.OLT:
            return signTxOLT(message, keyIndex, encryptedMasterKeySeed, password);
        case signatureKeyType.BTC:
            return signTxBTC(message, keyIndex, encryptedMasterKeySeed, password, network);
        case signatureKeyType.ETH:
            return signTxETH(message, keyIndex, encryptedMasterKeySeed, password);
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidSignKeyType));
    }
}

async function signTxOLT(message, keyIndex, encryptedMasterKeySeed, password) {
    if (!util.validateBase64(message)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidEncodedTxMessage));
    const oltTxData = {
        message,
        keyPath: oneledgerKeyPath + keyIndex + keyPathSuffix,
        encryptedMasterKeySeed,
        password
    };
    const signature = await oneledger.signForSignature(oltTxData).catch(error => {
        return Promise.reject(error)
    });
    return Promise.resolve(ErrorUtil.responseWrap({signature}))
}

async function signTxBTC(message, keyIndex, encryptedMasterKeySeed, password, network) {
    if (!util.validBTCTxMessage(message)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCtxMessage));
    const btcTxData = {
        message,
        keyPath: bitcoinKeyPath + keyIndex,
        network,
        password,
        encryptedMasterKeySeed
    };
    const {signature, recovery} = await bitcoin.signForSignature(btcTxData).catch(error => {
        return Promise.reject(error)
    });
    return Promise.resolve(ErrorUtil.responseWrap({signature, recovery}))
}

async function signTxETH(message, keyIndex, encryptedMasterKeySeed, password) {
    const {txParams, txConfig} = message || {};
    // verify txConfig type
    const txConfigObj = await util.validETHtxConfigType(txConfig).catch(error => {
        return Promise.reject(error)
    });
    // merge txConfig into default txConfig object
    const mergedTxConfigObj = util.mergeETHTxConfigToDefault(txConfigObj);
    // verify chain and hardfork value in mergedTxConfig object
    if (!util.validETHtxConfigValue(mergedTxConfigObj)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidETHtxConfig));
    // only destructure chain and hardfork value
    const {chain, hardfork} = mergedTxConfigObj;
    const {nonce, gasPrice, gasLimit, to, value} = txParams || {};
    // verify eth tx message data
    if (!util.isNonNegativeInteger(nonce)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidNonce));
    if (!util.isNonNegativeNumber(gasPrice)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasPrice));
    if (!util.isNonNegativeNumber(value)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidTxValue));
    if (!util.isPositiveInteger(gasLimit)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidGasLimit));
    if (!util.isValidAddress(to)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidTxReceiverAddress));
    const ethTxData = {
        txParams,
        txConfig: {chain, hardfork},
        password,
        encryptedMasterKeySeed,
        keyPath: ethereumKeyPath + keyIndex
    };
    const signature = await ethereum.signForSignature(ethTxData).catch(error => {
        return Promise.reject(error)
    });
    return Promise.resolve(ErrorUtil.responseWrap({signature}))
}

function deriveKeyErrFilter(err) {
    const {code} = err.error;
    if (code === requestErrors.InvalidBTCNetworkType.code) {
        return err
    }
    return ErrorUtil.errorWrap(requestErrors.FailedToDeriveNewKeyError)
}

module.exports = {
    deriveNewKeyPair,
    signTx
};