import {verifyMnemonic, mnemonicGenerator12, mnemonicGenerator24, unlockMasterKeySeed, getMasterKeySeedAddressForRecovery} from "./masterKeySeed";
exports.MasterKeySeedManager = require("./masterKeySeedManager");
exports.derivedKeyManager = require("./derivedKeyManager");
exports.masterKeySeedUtil = {
    unlockMasterKeySeed,
    getMasterKeySeedAddressForRecovery
};
exports.mnemonicUtil = {
    verifyMnemonic,
    mnemonicGenerator12,
    mnemonicGenerator24
};
const {verify} = require("./addressVerifier");
exports.address = {
    verify
};
const {derivedKeyType} = require("./config");
exports.CONSTANT = {
    KeyType: derivedKeyType
};
