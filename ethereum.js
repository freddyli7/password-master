const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const secp256k1 = require('secp256k1');
const ethWallet = require('ethereumjs-wallet');
const EthereumTx = require('ethereumjs-tx').Transaction;
const typeConverter = require("./typeConverter");
const masterKeySeed = require("./masterKeySeed");
const HDWallet = require('ethereum-hdwallet');
const {ErrorType, ErrorUtil} = require("./middle_utility").TierError;
const {requestErrors} = ErrorType;
const walletValidator = require('wallet-address-validator');
const {ethSignaturePrefix} = require("./config");

/* *****************************   Secp256k1 For ETH  ***************************** */
// derive privateKey from masterKeySeed
// input : masterKeySeed is a 64 bytes hex string
// input : keyPath is string
// return : privateKey which is a 32 bytes buffer
function derivePrivateKey(masterKeySeed, keyPath) {
    const ethHDWallet = HDWallet.fromSeed(masterKeySeed);
    return ethHDWallet.derive(keyPath).getPrivateKey()
}

// verify ETH private key
// input : privateKey is a 32 bytes buffer
// return : verifyResult (true || false)
function verifyPrivateKey(privateKey) {
    return secp256k1.privateKeyVerify(privateKey)
}

// derive publicKey from privateKey
// input : privateKey should be a 32 bytes buffer
// return : uncompressed 32 bytes publicKey + 1 byte of chain prefix hex string
function derivePublicKey(privateKey) {
    // slice(1) is to drop type byte which is hardcoded as 04 Ethereum, but not dropped here
    const compressedPublicKey = secp256k1.publicKeyCreate(privateKey, true).slice(0);
    return typeConverter.bufferToHexStr(compressedPublicKey)
}

// derive address
// input : publicKey should be a 64 bytes hex string
// return : 20 bytes hex address with 0x prefix
function deriveAddress(publicKey) {
    const bufferPublicKey = typeConverter.hexStrToBuffer(publicKey);
    const wallet = ethWallet.fromPublicKey(bufferPublicKey, true);
    return wallet.getChecksumAddressString()
}

// verify ETH address
function verifyAddress(address) {
    return walletValidator.validate(address, 'ETH')
}

// sign ETH tx
// input : txParams is an object including nonce, gasPrice, gasLimit, to, value and data
// input : txConfig is a config object for creation a new tx - i.e. - { chain: 'rinkeby', hardfork: 'petersburg' } which is optional, default config is{ chain: 'mainnet', hardfork: 'petersburg' }
// input : nonce is an uint, gasPrice is an uint, gasLimit is an uint, to is recipient address, value is an uint (wei), data is a hex string
// input : encryptedMasterKeySeed is a string
// input : keyPath is a string
// input : password is plaintext
// return : callback function containing error object and serialized tx as hex string
function signForSignature({txParams, txConfig, password, encryptedMasterKeySeed, keyPath}, callback) {
    return masterKeySeed.masterKeySeedDecryption(password, encryptedMasterKeySeed, function (error, decryptedMasterKeySeed) {
        if (error) return callback(error);
        const derivedPrivateKey = derivePrivateKey(decryptedMasterKeySeed, keyPath);
        const tx = new EthereumTx(txParams, txConfig);
        tx.sign(derivedPrivateKey);
        if (!tx.verifySignature()) return callback(ErrorUtil.errorWrap(requestErrors.InvalidETHSignature));
        callback(null, `${ethSignaturePrefix}${tx.serialize().toString('hex')}`);
    });
}

module.exports = {
    derivePrivateKey,
    verifyPrivateKey,
    derivePublicKey,
    deriveAddress,
    verifyAddress,
    signForSignature
};