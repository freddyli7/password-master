const masterkey = "m/";
const bip44 = "44'/";
const oneledgerCoinType = "403'/0'/0'/";
const bitcoinCoinType = "0'/0'/0/";
const ethereumCoinType = "60'/0'/0/";

const oneledgerKeyPath = masterkey + bip44 + oneledgerCoinType;
const bitcoinKeyPath = masterkey + bip44 + bitcoinCoinType;
const ethereumKeyPath = masterkey + bip44 + ethereumCoinType;
const keyPathSuffix = "'";

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