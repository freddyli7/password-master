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
    export {
        unlockMasterKeySeed,
        getMasterKeySeedAddressForRecovery
    }
}

export declare namespace mnemonicUtil {
    export {
        verifyMnemonic,
        mnemonicGenerator12,
        mnemonicGenerator24
    }
}

export declare namespace address {
    export {
        verify
    }
}

export declare namespace CONSTANT {
    export {
        derivedKeyType as KeyType
    }
}

export function MasterKeySeedManager();

export module derivedKeyManager {
    export function deriveNewKeyPair()
    export function signTx()
}

