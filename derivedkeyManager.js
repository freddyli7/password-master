const oneledger = require("oneledger");
const bitcoin = require("bitcoin");
const ethereum = require("ethereum");
const masterkey = require("masterkey");
const {oneledgerKeyPath, bitcoinKeyPath, ethereumKeyPath, keyPathSuffix} = require("config");

// expose to UI
// keyType should be string of either "OLT", "BTC-P2PK", "BTC-P2PKH", "ETH"
// keyIndex should be uint
// password  and encryptedMasterKey are string
// return derived new keypair's keyIndex and address
function deriveNewKeyPair(keyType, keyIndex, password, encryptedMasterKey, callback) {
    if (!isPositiveInteger(keyIndex)) return callback(Error("invalid key index"));
    if (typeof encryptedMasterKey !== "string") return callback(Error("invalid encrypted master key"));
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, (error, masterKey, masterChainCode) => {
        if (error) return callback(Error("Wrong password"));
        switch (keyType) {
            case "OLT":
                const oneledgerDerivedPriKey = oneledger.derivePrivateKeyOLT(masterKey, masterChainCode, oneledgerKeyPath + keyIndex + keyPathSuffix);
                const oneledgerDerivedPubkey = oneledger.derivePublicKeyOLT(oneledgerDerivedPriKey);
                const oneledgerDerivedAddress = oneledger.deriveAddressOLT(oneledgerDerivedPubkey);
                return callback(null, keyIndex, oneledgerDerivedAddress);
            case "BTC-P2PK":
                const bitcoinDerivedPriKeyP2PK = bitcoin.derivePrivateKeyBTC(masterKey, bitcoinKeyPath + keyIndex + keyPathSuffix);
                const bitcoinDerivedPubkeyP2PK = bitcoin.derivePublicKeyBTC(bitcoinDerivedPriKeyP2PK);
                const bitcoinDerivedP2PKAddress = bitcoin.deriveP2SHAddress(bitcoinDerivedPubkeyP2PK);
                return callback(null, keyIndex, bitcoinDerivedP2PKAddress);
            case "BTC-P2PKH":
                const bitcoinDerivedPriKeyP2PKH = bitcoin.derivePrivateKeyBTC(masterKey, bitcoinKeyPath + keyIndex + keyPathSuffix);
                const bitcoinDerivedPubkeyP2PKH = bitcoin.derivePublicKeyBTC(bitcoinDerivedPriKeyP2PKH);
                const bitcoinDerivedP2PKHAddress = bitcoin.deriveP2PKHAddress(bitcoinDerivedPubkeyP2PKH);
                return callback(null, keyIndex, bitcoinDerivedP2PKHAddress);
            case "ETH":
                const ethereumDerivedPriKey = ethereum.derivePrivateKeyETH(masterKey, ethereumKeyPath + keyIndex + keyPathSuffix);
                const ethereumDerivedPubkey = ethereum.derivePublicKeyETH(ethereumDerivedPriKey);
                const ethereumDerivedAddress = ethereum.deriveAddressETH(ethereumDerivedPubkey);
                return callback(null, keyIndex, ethereumDerivedAddress);
            default:
                return callback(Error("Wrong key type"));
        }
    });
}

// keyType should be string of either "OLT", "BTC-P2PK", "BTC-P2PKH", "ETH"
// keyIndex should be uint
// password  and encryptedMasterKey are string
// return signature
function signTx(message, keyType, keyIndex, password, encryptedMasterKey, callback) {
    if (!isPositiveInteger(keyIndex)) return callback(Error("invalid key index"));
    if (typeof encryptedMasterKey !== "string") return callback(Error("invalid encrypted master key"));
    switch (keyType) {
        case "OLT":
            if (!validateBase64(message)) return callback(Error("invalid encoded tx message"));
            const oltkeypath = oneledgerKeyPath + keyIndex + keyPathSuffix;
            return oneledger.signForSignatureOLT(message, password, encryptedMasterKey, oltkeypath, (error, signature) => {
                if (error) return callback(error);
                return callback(null, signature)
            });
        case "BTC-P2PK" || "BTC-P2PKH":
            if (!validBTCTxMessage(message)) return callback(Error("invalid Bitcoin tx message"));
            const btckeypath = bitcoinKeyPath + keyIndex + keyPathSuffix;
            return bitcoin.signForSignatureBTC(message, password, encryptedMasterKey, btckeypath, (error, signature, recovery) => {
                if (error) return callback(error);
                return callback(null, signature, recovery)
            });
        case "ETH":
            const {nonce, gasPrice, gasLimit, to, value, data} = message;
            // TODO : check eth message data

            const txParams = {
                nonce: nonce,
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: to,
                value: value,
                data: data
            };
            const ethkeypath = bitcoinKeyPath + keyIndex + keyPathSuffix;
            return ethereum.signForSignatureETH(txParams, password, encryptedMasterKey, ethkeypath, (error, signature) => {
                if (error) return callback(error);
                return callback(null, signature)
            });
        default:
            return callback(Error("Wrong key type"));
    }
}

function validateBase64(s) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s);
}

function validBTCTxMessage(s) {
    return Buffer.from(s).length === 64;
}

// check if input is a positive Integer
function isPositiveInteger(num) {
    if (!Number(num) || num <= 0) return false;
    const strNum = num.toString();
    return strNum.indexOf(".") === -1
}

module.exports = {
    deriveNewKeyPair,
    signTx
};