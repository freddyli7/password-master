import {bitcoin} from "bitcoinjs-lib/types/networks";

interface KeyPairFactory {
    deriveNewKeyPair(masterSeed: string, keyIndex: number)
}

interface KeyPair {
    keyIndex: number;
    privateKey: string;
    publicKey: string;
    address?: string;

    getKeyIndex(): number;

    getPrivateKey(): string;

    getPublicKey(): string;

    getAddress(): string;
}

class EthereumKey implements KeyPair {
    keyIndex: number;
    address: string;
    privateKey: string;
    publicKey: string;

    constructor(masterSeed: string, keyIndex: number) {
        this.keyIndex = keyIndex;
        this.privateKey = `eth pri key ${masterSeed}`;
        this.publicKey = `eth pub key ${masterSeed}`;
        this.address = `eth address ${masterSeed}`;
    }

    getKeyIndex(): number {
        return this.keyIndex
    }

    getPrivateKey(): string {
        return this.privateKey
    }

    getPublicKey(): string {
        return this.publicKey
    }

    getAddress(): string {
        return this.address
    }
}

class BitCoinKey implements KeyPair {
    keyIndex: number;
    address: string;
    privateKey: string;
    publicKey: string;

    constructor(masterSeed: string, keyIndex: number) {
        this.keyIndex = keyIndex;
        this.privateKey = `btc pri key ${masterSeed}`;
        this.publicKey = `btc pub key ${masterSeed}`;
        this.address = `btc address ${masterSeed}`;
    }

    getKeyIndex(): number {
        return this.keyIndex
    }

    getPrivateKey(): string {
        return this.privateKey
    }

    getPublicKey(): string {
        return this.publicKey
    }

    getAddress(): string {
        return this.address
    }
}

class EthereumKeyFactory implements KeyPairFactory {

    constructor() {

    }

    deriveNewKeyPair(masterSeed: string, keyIndex: number) {
        const ethKey = new EthereumKey(masterSeed, keyIndex);
        return {keyIndex: ethKey.getKeyIndex(), publicKey: ethKey.getPublicKey(), address: ethKey.getAddress()}
    }
}

class BitCoinKeyFactory implements KeyPairFactory {

    constructor() {

    }

    deriveNewKeyPair(masterSeed: string, keyIndex: number) {
        const btcKey = new BitCoinKey(masterSeed, keyIndex);
        return {keyIndex: btcKey.getKeyIndex(), publicKey: btcKey.getPublicKey(), address: btcKey.getAddress()}
    }
}

export {
    EthereumKeyFactory,
    BitCoinKeyFactory
}
