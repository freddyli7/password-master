const {mnemonicGenerator24, mnemonicGenerator12, unlockMasterKey, recoveryMasterKey} = require("./masterkey");
exports.masterKeyGenerator = require("./masterkeyManager");
exports.derivedKeyManager = require("./derivedkeyManager");
exports.masterKeyUtil = {
    unlockMasterKey,
    recoveryMasterKey
};
exports.mnemonicUtil = {
    mnemonicGenerator12,
    mnemonicGenerator24
};
