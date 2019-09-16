const masterkey = require("./masterkey");
const typeConverter = require("./typeConverter");

class MasterKeyManager {
    // create a new master key
    constructor(seed, password) {
        const {key, chainCode} = masterkey.masterKeyGenerator(seed);
        this.encryptedMasterKey = masterkey.masterKeyEncryption(password, key, chainCode);
        const uint8ArrayPriKey = typeConverter.hexStrToUint8Array(typeConverter.uint8arrayToHexStr(key) + typeConverter.uint8arrayToHexStr(chainCode));
        this.masterKeyAddress = masterkey.getMasterAddress(masterkey.getMasterPublicKey(uint8ArrayPriKey))
    }

    // export masterkey info for storing at local file system
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

