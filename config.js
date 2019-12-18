// BIP 44 Path levels for BTC and ETH, OLT uses all hardened path on every level
// m / purpose' / coin_type' / account' / change / address_index
const masterkey = "m/";
const bip44purpose = "44'/";
const keyPathSuffix = "'";

const oltCoinType = "403'/0'/0'/";
const bitCoinType = "0'/0'/0/";
const ethCoinType = "60'/0'/0/";

const oneledgerKeyPath = masterkey + bip44purpose + oltCoinType;
const bitcoinKeyPath = masterkey + bip44purpose + bitCoinType;
const ethereumKeyPath = masterkey + bip44purpose + ethCoinType;

// TODO : when needs the support of BitCoin External and Internal change for the keyPath, uncomment below part
// with btc external and internal change
// const oltCoinType = "403'/";
// const bitCoinType = "0'/";
// const ethCoinType = "60'/";
//
// const oltAccount = "0'/";
// const btcAccount = "0'/";
// const ethAccount = "0'/";
//
// const oltChange = "0'/";
// External chain is used for addresses that are meant to be visible outside of the wallet (e.g. for receiving payments)
// const btcChangeExternal = "0/"; // only expose external ones
// Internal chain is used for addresses which are not meant to be visible outside of the wallet and is used for return transaction change.
// const btcChangeInternal = "1/";
// const ethChange = "0/";
//
//
// const oneledgerKeyPath = masterkey + bip44purpose + oltCoinType + oltAccount + oltChange;
// const externalBitcoinKeyPath = masterkey + bip44purpose + bitCoinType + btcAccount + btcChangeExternal;
// const internalBitcoinKeyPath = masterkey + bip44purpose + bitCoinType + btcAccount + btcChangeInternal;
// const ethereumKeyPath = masterkey + bip44purpose + ethCoinType + ethAccount + ethChange;

const derivedKeyType = {
    OLT: "OLT",
    BTCP2PK: "BTCP2PK",
    BTCP2PKH: "BTCP2PKH",
    ETH: "ETH"
};

const signatureKeyType = {
    OLT: "OLT",
    BTC: "BTC",
    ETH: "ETH"
};

const bitcoinNetworkType = {
    BITCOIN: "BITCOIN",
    TESTNET: "TESTNET",
    REGTEST: "REGTEST"
};

const ed25519KeyAddrPrefix = "0x";
const ethSignaturePrefix = "0x";

const ethChainList = {
    mainnet: "mainnet",
    rinkeby: "rinkeby",
    ropsten: "ropsten",
    kovan: "kovan",
    goerli: "goerli"
};
const ethHardforkList = {
    petersburg: "petersburg",
    constantinople: "constantinople",
    byzantium: "byzantium"
};
const ethDefaultTxConfig = {
    chain: ethChainList.mainnet,
    hardfork: ethHardforkList.petersburg
};

module.exports = {
    oneledgerKeyPath,
    bitcoinKeyPath,
    ethereumKeyPath,
    keyPathSuffix,
    derivedKeyType,
    signatureKeyType,
    bitcoinNetworkType,
    ed25519KeyAddrPrefix,
    ethSignaturePrefix,
    ethChainList,
    ethHardforkList,
    ethDefaultTxConfig
};
