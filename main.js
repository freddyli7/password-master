const {mnemonicGenerator12, mnemonicGenerator24, unlockMasterKey, recoveryMasterKey} = require("./masterkey");
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
