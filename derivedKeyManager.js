const oneledger = require("./oneledger");
const bitcoin = require("./bitcoin");
const bitcoinjs = require('bitcoinjs-lib');
const ethereum = require("./ethereum");
const masterKeySeed = require("./masterKeySeed");
const util = require("./util");
const typeConverter = require("./typeConverter");
const {bitcoinNetworkType} = require("./config");
const {signatureKeyType, derivedKeyType} = require("./config");
const {ErrorType, errorHandler, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("./config");

/**
 * @description Derive new key.
 * @param parameters {Object} The object of parameters.
 * @param parameters.keyType {string} The key type of the new key. keyType should be string of either "OLT", "BTCP2PK", "BTCP2PKH", "ETH".
 * @param parameters.keyIndex {Number} The key index, must be integer and start from 0
 * @param parameters.password {string} password of the encrypted master key.
 * @param parameters.encryptedMasterKeySeed {string} encrypted master key string. This param should be read from local encrypted master key file
 * @param parameters.network {string} BitCoin network. Only applicable when the KeyType is any BitCoin key type. network should be one of "BTCOIN", "TESTNET" or "REGTEST".
 * @return {Promise<response|error>} response has an object that contains new key keyIndex, new key address, new key public key. There will be no address for BTCP2PK. Error has an error object.
 */
async function deriveNewKeyPair({keyType, keyIndex, password, encryptedMasterKeySeed, network}) {
    if (!util.isNonNegativeInteger(keyIndex)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidKeyIndex));
    if (typeof encryptedMasterKeySeed !== "string") return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidEncryptedMasterKeySeed));
    let decryptedMasterKeySeed = await masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed).catch(error => {
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
            decryptedMasterKeySeed = null;
            return Promise.resolve(ErrorUtil.responseWrap(result));
        case derivedKeyType.BTCP2PK:
            try {
                result = await deriveNewKeyPairBTCP2PK(decryptedMasterKeySeed, keyIndex, network)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error))
            }
            decryptedMasterKeySeed = null;
            return Promise.resolve(ErrorUtil.responseWrap(result));
        case derivedKeyType.BTCP2PKH:
            try {
                result = await deriveNewKeyPairBTCP2PKH(decryptedMasterKeySeed, keyIndex, network)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error))
            }
            decryptedMasterKeySeed = null;
            return Promise.resolve(ErrorUtil.responseWrap(result));
        case derivedKeyType.ETH:
            try {
                result = deriveNewKeyPairETH(decryptedMasterKeySeed, keyIndex)
            } catch (error) {
                return errorHandler(deriveKeyErrFilter(error))
            }
            decryptedMasterKeySeed = null;
            return Promise.resolve(ErrorUtil.responseWrap(result));
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidDerivedKeyType))
    }
}

function deriveNewKeyPairOLT(masterKeySeed, keyIndex) {
    let oneledgerMasterKey = oneledger.deriveMasterKey(typeConverter.bufferToHexStr(masterKeySeed));
    let oneledgerPrivateKeySeed = oneledger.derivePrivateKeySeed(oneledgerMasterKey, oneledgerKeyPath + keyIndex + keyPathSuffix);
    const {publicKey} = oneledger.deriveKeyPair(oneledgerPrivateKeySeed);
    const oneledgerAddress = oneledger.deriveAddress(publicKey);
    oneledgerMasterKey = null;
    oneledgerPrivateKeySeed = null;
    return {keyIndex, address: oneledgerAddress, publicKey}
}

async function deriveNewKeyPairBTCP2PK(masterKeySeed, keyIndex, network) {
    const networkDetermined = await networkDeterminator(network).catch(err => {
        return Promise.reject(err)
    });
    let bitcoinDerivedKeyPairP2PK = await bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, networkDetermined).catch(error => {
        throw(error)
    });
    const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKey(bitcoinDerivedKeyPairP2PK);
    const bitcoinDerivedP2PKPubkey = bitcoin.deriveP2PKPubKey(bitcoinDerivedPubkeyP2PK);
    bitcoinDerivedKeyPairP2PK = null;
    return {keyIndex, publicKey: bitcoinDerivedP2PKPubkey}
}

async function deriveNewKeyPairBTCP2PKH(masterKeySeed, keyIndex, network) {
    const networkDetermined = await networkDeterminator(network).catch(err => {
        return Promise.reject(err)
    });
    let bitcoinDerivedKeyPairP2PKH = await bitcoin.derivePrivateKey(masterKeySeed, bitcoinKeyPath + keyIndex, networkDetermined).catch(error => {
        throw(error)
    });
    const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKey(bitcoinDerivedKeyPairP2PKH);
    const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH, networkDetermined);
    bitcoinDerivedKeyPairP2PKH = null;
    return {
        keyIndex,
        address: bitcoinDerivedP2PKHAddress,
        publicKey: bitcoinDerivedPubkeyP2PKH
    }
}

async function networkDeterminator(network = bitcoinNetworkType.BITCOIN) {
    switch (network) {
        case bitcoinNetworkType.BITCOIN :
            return Promise.resolve(bitcoinjs.networks.bitcoin);
        case bitcoinNetworkType.TESTNET:
            return Promise.resolve(bitcoinjs.networks.testnet);
        case bitcoinNetworkType.REGTEST:
            return Promise.resolve(bitcoinjs.networks.regtest);
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidBTCNetworkType))
    }
}

function deriveNewKeyPairETH(masterKeySeed, keyIndex) {
    // console.log(ethereumKeyPath + keyIndex);
    let ethereumDerivedPriKey = ethereum.derivePrivateKey(masterKeySeed, ethereumKeyPath + keyIndex);
    const ethereumDerivedPubkey = ethereum.derivePublicKey(ethereumDerivedPriKey);
    const ethereumDerivedAddress = ethereum.deriveAddress(ethereumDerivedPubkey);
    ethereumDerivedPriKey = null;
    return {keyIndex, address: ethereumDerivedAddress, publicKey: ethereumDerivedPubkey}
}

/**
 * @description Sign txs with derived key
 * @param {Object} parameters - Sign tx parameter object
 * @param {(object|string)} parameters.message - Message is different when choosing different keyType.
 * message is an Object if keyType is ETH; message is a string if keyType is OLT or BTC.
 * If KeyType is ETH, message must contain txParams field which is an object,
 * txConfig field is optional which is also an object, it is used to indicate Ethereum network and hardfork,
 * DO NOT pass txConfig object in message to use default txConfig (chain is mainnet, hardfork is petersburg).
 * In txConfig object, valid chain value should be one of "mainnet", "rinkeby", "ropsten", "kovan", "goerli",
 * valid hardfork value should be one of "petersburg", "constantinople", "byzantium".
 * Please see examples below.
 * @param {string} parameters.keyType - KeyType determines which chain is used to sign. Value should be string of either "OLT", "BTC " or "ETH".
 * @param {uint} parameters.keyIndex - KeyIndex is used to derive new key.
 * @param {string} parameters.password - Password of encrypted master key seed.
 * @param {string} parameters.encryptedMasterKeySeed - EncryptedMasterKeySeed string.
 * @param {string} parameters.network - Network determines which network to use. Value should be one of "BTCOIN", "TESTNET" or "REGTEST"(Network is only applicable for BitCoin for now).
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
    const networkDetermined = await networkDeterminator(network).catch(err => {
        return Promise.reject(err)
    });
    const btcTxData = {
        message,
        keyPath: bitcoinKeyPath + keyIndex,
        network: networkDetermined,
        password,
        encryptedMasterKeySeed
    };
    const {signature} = await bitcoin.signForSignature(btcTxData).catch(error => {
        return Promise.reject(error)
    });
    return Promise.resolve(ErrorUtil.responseWrap(signature))
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
    if (!util.isValidETHAddress(to)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidTxReceiverAddress));
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
    return ErrorUtil.errorWrap(requestErrors.FailedToDeriveNewKey)
}

module.exports = {
    deriveNewKeyPair,
    signTx
};
