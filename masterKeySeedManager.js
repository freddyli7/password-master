const masterKeySeed = require("./masterKeySeed");

class MasterKeySeedManager {
    // create a new masterKeySeed
    // input : password is string,
    // input : mnemonicArray is an array with {index:number, word:string} as each element
    constructor(mnemonicArray, password) {
        const derivedMasterKeySeed = masterKeySeed.masterKeySeedGenerator(mnemonicArray);
        this.encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(password, derivedMasterKeySeed);
        this.masterKeySeedAddress = masterKeySeed.getMasterKeySeedAddress(masterKeySeed.getMasterKeySeedPublicKey(derivedMasterKeySeed))
    }

    // export masterKeySeed info for persisting at local file system
    // should be called only when creating new masterKeySeed OR when after user recovery with correct mnemonic words and encrypted the masterKeySeed with new password
    // return : callback function containing encryptedMasterKeySeed and masterKeySeedAddress
    getMasterKeySeedInfo(callback) {
        callback(this.encryptedMasterKeySeed, this.masterKeySeedAddress)
    }

    // check masterKeySeed encryption password
    // input : password is string
    // return : callback function containing unlockResult (true || false)
    unlockMasterKeySeed(password, callback) {
        return masterKeySeed.unlockMasterKeySeed(password, this.encryptedMasterKeySeed, function (unlockResult) {
            callback(unlockResult)
        })
    }
}

module.exports = MasterKeySeedManager;

