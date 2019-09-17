const masterkey = require("./masterkey");
const typeConverter = require("./typeConverter");

class MasterKeyManager {
    // create a new master key
    // password is string, mnemonicArray is an array with {index:number, word:string} as each element
    constructor(mnemonicArray, password) {
        const {key, chainCode} = masterkey.masterKeyGenerator(mnemonicArray);
        this.encryptedMasterKey = masterkey.masterKeyEncryption(password, key, chainCode);
        const uint8ArrayPriKey = typeConverter.hexStrToUint8Array(typeConverter.uint8arrayToHexStr(key) + typeConverter.uint8arrayToHexStr(chainCode));
        this.masterKeyAddress = masterkey.getMasterAddress(masterkey.getMasterPublicKey(uint8ArrayPriKey))
    }

    // export masterkey info for storing at local file system
    // should be called only when create new master key OR when after user recovery with correct mnemonic words and encrypted with new password
    exportMasterkey(callback) {
        callback(this.encryptedMasterKey, this.masterKeyAddress)
    }

    // check master key password
    unlockMasterKey(password, callback) {
        return masterkey.unlockMasterkey(password, this.encryptedMasterKey, function (unlockResult) {
            callback(unlockResult)
        })
    }
}

module.exports = MasterKeyManager;

