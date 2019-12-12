import {
    verifyMnemonic,
    mnemonicGenerator12,
    mnemonicGenerator24,
    unlockMasterKeySeed,
    getMasterKeySeedAddressForRecovery
} from "./masterKeySeed";
import {verify} from "./addressVerifier";
import {derivedKeyType} from "./config";
import MasterKeySeedManager = require("./masterKeySeedManager");
import derivedKeyManager = require("./derivedKeyManager");

export declare namespace masterKeySeedUtil {
    function unlockMasterKeySeed(password: string, encryptedMasterKeySeed: string)
    function getMasterKeySeedAddressForRecovery(mnemonicArray: array<{index: number, word: string}>)
}

export declare namespace mnemonicUtil {
    function verifyMnemonic()

    function mnemonicGenerator12()

    function mnemonicGenerator24()
}

export declare namespace address {
    function verify()
}

declare namespace CONSTANT {
    export {
        derivedKeyType as KeyType
    }
}

export function MasterKeySeedManager();

export module derivedKeyManager {
    function deriveNewKeyPair()

    function signTx()
}

