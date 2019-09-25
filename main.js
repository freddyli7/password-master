const {mnemonicGenerator12, mnemonicGenerator24, unlockMasterKeySeed, recoveryMasterKeySeed} = require("./masterKeySeed");
exports.MasterKeySeedManager = require("./masterKeySeedManager");
exports.derivedKeyManager = require("./derivedKeyManager");
exports.masterKeySeedUtil = {
    unlockMasterKeySeed,
    recoveryMasterKeySeed
};
exports.mnemonicUtil = {
    mnemonicGenerator12,
    mnemonicGenerator24
};
