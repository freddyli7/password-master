const {derivePath, isValidPath} = require('ed25519-hd-key');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const secp256k1 = require('secp256k1');
const ethwallet = require('ethereumjs-wallet');
const EthereumTx = require('ethereumjs-tx').Transaction;
const typeConverter = require("./typeConverter");
const masterkey = require("./masterkey");

/* *****************************   Secp256k1 For ETH  ***************************** */

// derive private key from master key, master key is just key part which is a Uint8Array, total should be 32 bytes for ETH
// keyPath is a string includes chainId, sideChainId, keyIndex
// return key which is a 32 bytes Uint8Array
function derivePrivateKey(masterKey, keyPath) {
    const hexMasterKey = typeConverter.uint8arrayToHexStr(masterKey);
    const {key} = derivePath(keyPath, hexMasterKey);
    return typeConverter.bufferToUint8Array(key)
}

// verify ETH private key
function verifyPrivateKey(privateKey) {
    const key = typeConverter.hexStrToBuffer(privateKey);
    return secp256k1.privateKeyVerify(key)
}

// private key should be a 32 bytes Uint8Array
// return uncompressed 64 bytes hex string public key
function derivePublicKey(privateKey) {
    // slice(1) is to drop type byte which is hardcoded as 04 Ethereum
    const uncompressedPubKey = secp256k1.publicKeyCreate(privateKey, false).slice(1);
    return typeConverter.bufferToHexStr(uncompressedPubKey)
}

// publickey should be a 64 bytes hex string
// return 20 bytes hex address with 0x prefix
function deriveAddress(publicKey) {
    const bufferPublicKey = typeConverter.hexStrToBuffer(publicKey);
    const wallet = ethwallet.fromPublicKey(bufferPublicKey, true);
    return wallet.getChecksumAddressString()
}

// encryptedMasterKey is a string, keypath is a string
// password is plaintext, nonce is an uint, gasPrice is an uint, gasLimit is an uint, to is recipient address, value is an uint (wei), data is a hex string
// return serialized tx as hex string
function signForSignature(txParams, password, encryptedMasterKey, keyPath, callback) {
    return masterkey.masterKeyDecryption(password, encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
        if (error) return callback(error);
        const derivedPrivatedkey = derivePrivateKey(decryptedMasterKey, keyPath);
        const tx = new EthereumTx(txParams, {chain: 'mainnet', hardfork: 'petersburg'});
        tx.sign(derivedPrivatedkey);
        callback(null, tx.serialize().toString('hex'));
    });
}

// TODO no need for now
function verifySignature() {

}

module.exports = {
    derivePrivateKey,
    verifyPrivateKey,
    derivePublicKey,
    deriveAddress,
    signForSignature
};