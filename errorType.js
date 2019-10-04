const requestErrors = {
    WrongPassword: {code: -11000, message: "Wrong password", detail: "-11000 : Wrong password"},
    InvalidKeyIndex: {
        code: -11001,
        message: "Invalid keyIndex, keyIndex should should be a non-negative integer",
        detail: "-11001 : invalid keyIndex"
    },
    InvalidEncryptedMasterKeySeed: {
        code: -11002,
        message: "Invalid encrypted master key seed",
        detail: "-11002 : invalid encrypted master key seed"
    },
    InvalidEncodedTxMessage: {
        code: -11003,
        message: "Invalid encoded tx message",
        detail: "-11003 : invalid encoded tx message"
    },
    InvalidBTCtxMessage: {
        code: -11004,
        message: "Invalid BitCoin tx message",
        detail: "-11004 : invalid BitCoin tx message"
    },
    InvalidNonce: {
        code: -11005,
        message: "Invalid nonce, nonce should be a non-negative integer",
        detail: "-11005 : invalid nonce"
    },
    InvalidGasPrice: {
        code: -11006,
        message: "Invalid gasPrice, gasPrice should be a positive number",
        detail: "-11006 : invalid gasPrice"
    },
    InvalidTxValue: {
        code: -11007,
        message: "Invalid tx value, value should be a positive number",
        detail: "-11007 : invalid tx value"
    },
    InvalidGasLimit: {
        code: -11008,
        message: "Invalid gasLimit, gasLimit should be a positive integer",
        detail: "-11008 : invalid gasLimit"
    },
    InvalidTxReceiverAddress: {
        code: -11009,
        message: "Invalid tx receiver address, please enter valid ETH address and include 0x as the prefix",
        detail: "-11009 : invalid tx receiver address"
    },
    InvalidDerivedKeyType: {
        code: -11010,
        message: "Invalid key type for deriving new key, valid key type should be either OLT, BTC-P2PK, BTC-P2PKH or ETH",
        detail: "-11010 : invalid key type for deriving new key"
    },
    InvalidSignKeyType: {
        code: -11011,
        message: "Invalid key type to sign tx, valid key type should be either OLT, BTC or ETH",
        detail: "-11011 : invalid key type to sign tx"
    },
    InvalidBTCNetworkType: {
        code: -11012,
        message: "Invalid BitCoin network type, valid network type should be either BITCOIN, TESTNET or REGTEST",
        detail: "-11012 : invalid BitCoin network type"
    },
    InvalidETHSignature: {
        code: -11013,
        message: "Invalid ETH tx signature",
        detail: "-11013 : invalid ETH tx signature"
    },
    InvalidAddressType: {
        code: -11014,
        message: "Wrong address type to validate, valid address type should be either OLT, BTC-P2PK, BTC-P2PKH or ETH",
        detail: "-11014 : wrong address type to validate, valid address type should be either OLT, BTC-P2PK, BTC-P2PKH or ETH"
    },
    InvalidInputData: {
        code: -11015,
        message: "Address and address type have to be valid string",
        detail: "-11015 : address and address type have to be valid string"
    }
};

module.exports = {
    requestErrors
};