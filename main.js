const {mnemonicGenerator24, mnemonicGenerator12, unlockMasterKey, recoveryMasterKey} = require("./masterkey");
exports.masterKeyGenerator = require("./masterkeyManager");
exports.derivedKeyManager = require("./derivedkeyManager");

module.exports.masterKeyUtil = {
    unlockMasterKey,
    recoveryMasterKey
};

module.exports.mnemonicUtil = {
    mnemonicGenerator12,
    mnemonicGenerator24
};
