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
    function unlockMasterKeySeed(password: string, encryptedMasterKeySeed: string): Promise<boolean | Object>

    function getMasterKeySeedAddressForRecovery(mnemonicArray: array<{ index: number, word: string }>): string
}

export declare namespace mnemonicUtil {
    function verifyMnemonic(mnemonicArray: array<{ index: number, word: string }>): boolean

    function mnemonicGenerator12(): array<{ index: number, word: string }>

    function mnemonicGenerator24(): array<{ index: number, word: string }>
}

export declare enum derivedKeyType {
    OLT = "OLT",
    BTCP2PK = "BTCP2PK",
    BTCP2PKH = "BTCP2PKH",
    ETH = "ETH"
}

export declare namespace address {
    function verify(address: string, addressType: derivedKeyType): Promise<boolean | error>
}

declare namespace CONSTANT {
    export {
        derivedKeyType as KeyType
    }
}

export class MasterKeySeedManager {
    encryptedMasterKeySeed: string;
    masterKeySeedAddress: string;

    constructor(mnemonicArray: Array<{ index: number, word: string }>, password: string) {
    }
}

export declare enum BitCoinNetwork {
    BTCOIN = "BTCOIN",
    TESTNET = "TESTNET",
    REGTEST = "REGTEST"
}

export declare enum txSignKeyType {
    OLT = "OLT",
    BTC = "BTC ",
    ETH = "ETH"
}

export declare namespace derivedKeyManager {
    export interface deriveKeyParamsInterface {
        keyType: derivedKeyType,
        keyIndex: number,
        password: string,
        encryptedMasterKeySeed: string,
        network?: BitCoinNetwork
    }

    export interface signTxInterface {
        message: Object | string,
        keyType: txSignKeyType,
        keyIndex: number,
        password: string,
        encryptedMasterKeySeed: string,
        network?: BitCoinNetwork
    }

    function deriveNewKeyPair({keyType, keyIndex, password, encryptedMasterKeySeed, network}: deriveKeyParamsInterface): Promise<response | error>;

    function signTx({message, keyType, keyIndex, password, encryptedMasterKeySeed, network}: signTxInterface): Promise<response | error>;
}

