const {mnemonicGenerator24, unlockMasterKey, recoveryMasterKey} = require("./masterkey");
exports.masterKeyManager = require("./masterkeyManager");
exports.derivedKeyManager = require("./derivedkeyManager");

module.exports.masterKey = {
    mnemonicGenerator24,
    unlockMasterKey,
    recoveryMasterKey,
};
