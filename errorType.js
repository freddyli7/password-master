const requestErrors = {
    WrongPassword: {code: -11000, message: "Wrong password"},
    InvalidKeyIndex: {code: -11001, message: "invalid keyIndex, keyIndex should should be a non-negative integer"},
    InvalidEncryptedMasterKeySeed: {code: -11002, message: "invalid encrypted master key seed"},
    InvalidEncodedTxMessage: {code: -11003, message: "invalid encoded tx message"},
    InvalidBTCtxMessage: {code: -11004, message: "invalid BitCoin tx message"},
    InvalidNonce: {code: -11005, message: "invalid nonce, nonce should be a non-negative integer"},
    InvalidGasPrice: {code: -11006, message: "invalid gasPrice, gasPrice should be a positive number"},
    InvalidTxValue: {code: -11007, message: "invalid tx value, value should be a positive number"},
    InvalidGasLimit: {code: -11008, message: "invalid gasLimit, gasLimit should be a positive integer"},
    InvalidTxReceiverAddress: {
        code: -11009,
        message: "invalid tx receiver address, address should have 40 characters, please include 0x as the prefix"
    },
    InvalidDerivedKeyType: {
        code: -11010,
        message: "Wrong key type for deriving new key, valid key type should be either OLT, BTC-P2PK, BTC-P2PKH or ETH"
    },
    InvalidSignKeyType: {
        code: -11010,
        message: "Wrong key type for signing tx, valid key type should be either OLT, BTC or ETH"
    },
    InvalidBTCNetworkType: {
        code: -11011,
        message: "Wrong BitCoin network type, valid network type should be either BITCOIN, TESTNET or REGTEST"
    },
    InvalidETHSignature: {
        code: -11012,
        message: "Invalid ETH tx signature"
    }
};

module.exports = {
    requestErrors
};