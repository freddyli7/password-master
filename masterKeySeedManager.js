const masterKeySeed = require("./masterKeySeed");

class MasterKeySeedManager {
    /**
     * @class
     * @description Create a new master key seed.
     * @param mnemonicArray {Object[]} mnemonic words array with {index:number, word:string} as each element
     * @param mnemonicArray[].index {Number} word index, starting from 1
     * @param mnemonicArray[].word {string} mnemonic word
     * @param password {string} password to encrypt the master key seed
     */
    constructor(mnemonicArray, password) {
        const derivedMasterKeySeed = masterKeySeed.masterKeySeedGenerator(mnemonicArray);
        this.encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(password, derivedMasterKeySeed);
        this.masterKeySeedAddress = masterKeySeed.getMasterKeySeedAddress(masterKeySeed.getMasterKeySeedPublicKey(derivedMasterKeySeed))
    }

    /**
     * @description Export master key seed info for persisting into local file system.
     * This function should be called only after creating new masterKeySeed OR  after user recovery with correct mnemonic words and encrypted the masterKeySeed with new password
     * @return {Object} Object contains encryptedMasterKeySeed and masterKeySeedAddress
     */
    getMasterKeySeedInfo() {
        return {encryptedMasterKeySeed: this.encryptedMasterKeySeed, masterKeySeedAddress: this.masterKeySeedAddress}
    }

    /**
     * @description Check if master key seed encryption password is correct
     * @param password {string} password
     * @return {Promise<boolean|error>} Promise.reject returns error, Promise.solve returns unlock result
     */
    unlockMasterKeySeed(password) {
        return masterKeySeed.unlockMasterKeySeed(password, this.encryptedMasterKeySeed)
    }
}

module.exports = MasterKeySeedManager;

