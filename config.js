const masterkey = "m/";
const bip44purpose = "44'/";
const keyPathSuffix = "'";

const oltCoinType = "403'/0'/0'/";
const bitCoinType = "0'/0'/0/";
const ethCoinType = "60'/0'/0/";

const oneledgerKeyPath = masterkey + bip44purpose + oltCoinType;
const bitcoinKeyPath = masterkey + bip44purpose + bitCoinType;
const ethereumKeyPath = masterkey + bip44purpose + ethCoinType;

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
// const btcChangeExternal = "0/";
// const btcChangeInternal = "1/";
// const ethChange = "0/";
//
//
// const oneledgerKeyPath = masterkey + bip44purpose + oltCoinType + oltAccount + oltChange;
// const externalBitcoinKeyPath = masterkey + bip44purpose + bitCoinType + btcAccount + btcChangeExternal;
// const internalBitcoinKeyPath = masterkey + bip44purpose + bitCoinType + btcAccount + btcChangeInternal;
// const ethereumKeyPath = masterkey + bip44purpose + ethCoinType + ethAccount + ethChange;

const derivedKeyType = {
    OLT : "OLT",
    BTCP2PK : "BTC-P2PK",
    BTCP2PKH : "BTC-P2PKH",
    ETH : "ETH"
};

const signatureKeyType = {
    OLT : "OLT",
    BTC : "BTC",
    ETH : "ETH"
};

const bitcoinNetworkType = {
    BITCOIN : "BITCOIN",
    TESTNET : "TESTNET",
    REGTEST : "REGTEST"
};

module.exports = {
    oneledgerKeyPath,
    bitcoinKeyPath,
    ethereumKeyPath,
    keyPathSuffix,
    derivedKeyType,
    signatureKeyType,
    bitcoinNetworkType
};