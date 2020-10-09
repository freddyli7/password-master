const contractOneledgerSupport = "contact support@oneledger.io";
const tryAgainMessageWithoutColon = "Please try again later, otherwise " + contractOneledgerSupport;
const tryAgainMessage = ": " + tryAgainMessageWithoutColon

const requestErrors = {
    InvalidAddress: {
        code: -10000,
        message: "Invalid address (10000): OLT address should have 43 characters including 0lt as the prefix",
        detail: "-10000 : OLT address should have total 43 characters, please include 0lt as the prefix"
    },
    IllegalQueryReply: {
        code: -10001,
        message: "Network Error (10001): Please " + contractOneledgerSupport,
        detail: "-10001 : query result is not array"
    },
    IllegalPrice: {
        code: -10002,
        message: "Invalid Price (10002): Please enter a valid price, currency and value in price both should be string type",
        detail: "-10002 : invalid price, currency and value in price both should be string type"
    },
    IllegalFee: {
        code: -10003,
        message: "Invalid Fee Amount(10003): " + tryAgainMessage,
        detail: "-10003 : invalid fee"
    },
    IllegalAmount: {
        code: -10004,
        message: "Invalid Purchase Amount(10004): Please enter a valid amount",
        detail: "-10004 : invalid amount"
    },
    IllegalOfferAmount: {
        code: -10005,
        message: "Invalid Offer Amount(10005): Please enter a valid amount",
        detail: "-10005 : invalid offer amount"
    },
    IllegalBroadCaseType: {
        code: -10006,
        message: "Illegal Broadcast Type (10006): Please " + contractOneledgerSupport,
        detail: "-10006 : invalid broadcasting type"
    },
    IllegalQueryDomainType: {
        code: -10007,
        message: "Illegal Query Domain Type (10007): Please " + contractOneledgerSupport,
        detail: "-10007 : invalid domain query type"
    },
    IllegalDomainName: {
        code: -10008,
        message: "Illegal Domain Name (10008): Please enter a valid domain name, only use alphanumeric characters and maximum length is 256 characters",
        detail: "-10008 : invalid domain name"
    },
    InvalidBlockHeight: {
        code: -10009,
        message: "Invalid blockHeight number (10009): Please " + contractOneledgerSupport,
        detail: "-10009 : invalid block height number"
    },
    InvalidArgument: {
        code: -10010,
        message: "Invalid arguments to send request (10010): Please " + contractOneledgerSupport,
        detail: "-10010 : invalid arguments"
    },
    InvalidResultLimit: {
        code: -10011,
        message: "Invalid result limit number (10011): Please " + contractOneledgerSupport,
        detail: "-10011 : invalid result limit number"
    },
    InvalidPageNumber: {
        code: -10012,
        message: "Invalid page number(10012): Please " + contractOneledgerSupport,
        detail: "-10012 : invalid page number"
    },
    InvalidPageSize: {
        code: -10013,
        message: "Invalid page size(10013): Please " + contractOneledgerSupport,
        detail: "-10013 : invalid page size"
    },
    WrongPassword: {
        code: -11000,
        message: "Wrong password",
        detail: "-11000 : Wrong password"
    },
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
        message: "Invalid key type for deriving new key, valid key type should be either OLT, BTCP2PK, BTCP2PKH or ETH",
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
        message: "Wrong address type to validate, valid address type should be either OLT, BTCP2PK, BTCP2PKH or ETH",
        detail: "-11014 : wrong address type to validate, valid address type should be either OLT, BTCP2PK, BTCP2PKH or ETH"
    },
    InvalidAddressVerifyData: {
        code: -11015,
        message: "Address and address type have to be valid string",
        detail: "-11015 : address and address type have to be valid string"
    },
    EmptyAddress: {
        code: -12000,
        message: "Empty address to request OLT",
        detail: "-12000 : empty address"
    },
    IllegalAddress: {
        code: -12001,
        message: "Invalid address provided, please provide a valid address according to the key type",
        detail: "-12001 : invalid address"
    },
    RequestFailed: {
        code: -12002,
        message: "Failed to request OLT, please using same version of fullnode and faucet",
        detail: "-12002 : failed to request OLT"
    },
    RPCFailed: {
        code: -12003,
        message: "Failed to send request to faucet server, please check request url",
        detail: "-12003 : failed to send request"
    },
    IllegalArgvsNumber: {
        code: -12004,
        message: "Invalid argv number to request OLT",
        detail: "-12004 : invalid arguments number"
    },
    IllegalURL: {
        code: -12005,
        message: "Invalid requesting URL",
        detail: "-12005 : invalid requesting URL"
    },
    InvalidTxHash: {
        code: -12006,
        message: "Invalid tx hash",
        detail: "-12006 : invalid tx hash"
    },
    InvalidETHtxConfig: {
        code: -12007,
        message: "Invalid ETH txConfig Object, please provide valid chain and hardfork string in txConfig object inside message object, or use default chain as mainnet, default hardfork as petersburg if txConfig is not provided",
        detail: "-12007 : ETH tx config Object, please provide valid chain and hardfork string in txConfig object inside message object, or use default chain as mainnet, default hardfork as petersburg if txConfig is not provided"
    },
    DeriveP2PKKeyPairError: {
        code: -12008,
        message: "Fail to derive new P2PK key pair for BitCoin",
        detail: "-12008 : Fail to derive new P2PK key pair for BitCoin"
    },
    DeriveP2PKHKeyPairError: {
        code: -12009,
        message: "Fail to derive new P2PKH key pair for BitCoin",
        detail: "-12009 : Fail to derive new P2PKH key pair for BitCoin"
    },
    DeriveOLTKeyPairError: {
        code: -12010,
        message: "Fail to derive new key pair for OLT",
        detail: "-12010 : Fail to derive new key pair for OLT"
    },
    DeriveETHKeyPairError: {
        code: -12011,
        message: "Fail to derive new key pair for ETH",
        detail: "-12011 : Fail to derive new key pair for ETH"
    },
    InvalidOLTSignature: {
        code: -12012,
        message: "Invalid OLT tx signature",
        detail: "-12012 : invalid OLT tx signature"
    },
    UnableUnlockMasterSeed: {
        code: -12013,
        message: "Unable to unlock master key seed at this moment, please try again later",
        detail: "-12013 : unable to unlock master key seed"
    },
    InvalidETHAddress: {
        code: -12014,
        message: "Invalid ETH address, ETH address should have 42 characters including 0x as the prefix",
        detail: "-12014 : ETH address should have total 42 characters, please include 0x as the prefix"
    },
    InvalidBTCP2PKHAddress: {
        code: -12015,
        message: "Invalid BTC P2PKH address",
        detail: "-12015 : invalid BTC P2PKH address"
    },
    InvalidBTCP2PKAddress: {
        code: -12016,
        message: "Invalid BTC P2PK public key",
        detail: "-12016 : invalid BTC P2PK public key"
    },
    InvalidActiveFlag: {
        code: -12017,
        message: "Invalid domain active flag, active flag should be either true or false",
        detail: "-12017 : invalid domain active flag, active flag should be either true or false"
    },
    InvalidCancelSaleFlag: {
        code: -12018,
        message: "Invalid domain cancelSale flag, cancelSale flag should be either true or false",
        detail: "-12018 : invalid domain cancelSale flag, cancelSale flag should be either true or false"
    },
    InvalidOnSaleFlag: {
        code: -12019,
        message: "Invalid domain onSale flag, onSale flag should be either true or false",
        detail: "-12019 : invalid domain onSale flag, onSale flag should be either true or false"
    },
    FailedToDeriveNewKey: {
        code: -12020,
        message: "Failed to derive new key",
        detail: "-12020 : failed to derive new key"
    },
    ParseRecipientsArray: {
        code: -12021,
        message: "Error (12021)" + tryAgainMessage,
        detail: "-12021 : error when parsing transaction recipients"
    },
    InvalidTrackerQueryChainType: {
        code: -12022,
        message: "Error (12022): invalid chainType to query tracker",
        detail: "-12022 : invalid chainType to query tracker"
    },
    ParseBalanceError: {
        code: -12023,
        message: "Error (12023): failed to parse account balance object, please upgrade wallet and try again",
        detail: "-12023 : failed to parse account balance object"
    },
    GetDomainPriceRateError: {
        code: -12024,
        message: "Error (12024): get domain price per block error",
        detail: "get domain price per block error"
    },
    FetchAbsoluteMinimumDomainCreationPriceError: {
        code: -12025,
        message: "Error (12025): failed to fetch absolute minimum domain creation price",
        detail: "failed to fetch absolute minimum domain creation price"
    },
    GetBaseDomainPriceError: {
        code: -12026,
        message: "Error (12026): get base domain price error",
        detail: "get base domain price error"
    },
    InvalidURI: {
        code: -12027,
        message: "Error (12027): invalid uri provided",
        detail: "invalid uri provided"
    },
    InvalidGasAdjustment: {
        code: -12028,
        message: "Error (12028): invalid gasAdjustment provided",
        detail: "invalid gasAdjustment provided"
    },
    CurrencyNotRegistered: {
        code: -12029,
        message: "Error (12029): invalid currency name",
        detail: "invalid currency name"
    },
    FeeCalculationError: {
        code: -12030,
        message: "Error (12030): fail to calculate tx fee, fee currency is not registered, SDK probably needs to be updated",
        detail: "fail to calculate tx fee, fee currency is registered, SDK probably needs to be updated"
    },
    FailToGetBitcoinAddrLedgerHQ: {
        code: -12031,
        message: "Error (12031): fail to btc address",
        detail: "failed to get btc address: "
    },
    InvalidBTCRawTxLedgerHQ: {
        code: -12032,
        message: "Error (12032): invalid btc raw tx, valid btc raw tx starting with 0x and is a hexed string",
        detail: "invalid btc raw tx, valid btc raw tx starting with 0x and is a hexed string"
    },
    FailedToSignBTCTxLedgerHQ: {
        code: -12033,
        message: "Error (12033): failed to sign btc tx",
        detail: "failed to sign btc tx: "
    },
    FailToGetEthereumAddrLedgerHQ: {
        code: -12034,
        message: "Error (12034): fail to get eth address",
        detail: "failed to get eth address: "
    },
    InvalidETHRawTxLedgerHQ: {
        code: -12035,
        message: "Error (12035): invalid eth raw tx, valid eth raw tx starting with 0x and is a hexed string",
        detail: "invalid eth raw tx, valid eth raw tx starting with 0x and is a hexed string"
    },
    FailedToSignETHTxLedgerHQ: {
        code: -12036,
        message: "Error (12036): failed to sign eth tx",
        detail: "failed to sign eth tx: "
    },
    InvalidBitcoinAddressFormatLedgerHQ: {
        code: -12037,
        message: "Error (12037): Invalid bitcoin address format, valid format should be either legacy or p2sh or bech32",
        detail: "Invalid bitcoin address format, valid format should be either legacy or p2sh or bech32"
    },
    GetAddrPubkeyErrorLedgerHQ: {
        code: -12038,
        message: "Error (12038): failed to parse data for getting address and public key",
        detail: "failed to parse data for getting address and public key: "
    },
    FailToGetOneledgerAddrLedgerHQ: {
        code: -12039,
        message: "Error (12039): fail to olt address",
        detail: "failed to get olt address: "
    },
    InvalidOLTRawTxLedgerHQ: {
        code: -12040,
        message: "Error (12040): invalid olt raw tx, valid olt raw tx is a base64 string",
        detail: "invalid olt raw tx, valid olt raw tx is a base64 string"
    },
    FailedToParseDataAndSignOLTTxLedgerHQ: {
        code: -12041,
        message: "Error (12041): failed to parse data for signing olt tx",
        detail: "failed to parse data for signing olt tx: "
    },
    FailedToSignOLTTxLedgerHQ: {
        code: -12042,
        message: "Error (12042): failed to sign olt tx",
        detail: "failed to sign olt tx: "
    },
    ParseTxGasAndGasPriceError: {
        code: -12043,
        message: "Error (12043): failed to parse tx gas and gas price",
        detail: "failed to parse tx gas and gas price: "
    },
    ListDeviceErrorLedgerHQ: {
        code: -12044,
        message: "Error (12044): failed to list all devices",
        detail: "failed to list all devices: "
    },
    CreateBluetoothTransportErrorLedgerHQ: {
        code: -12045,
        message: "Error (12045): failed to create bluetooth transport",
        detail: "failed to create bluetooth transport: "
    },
    DisconnectDeviceErrorLedgerHQ: {
        code: -12046,
        message: "Error (12046): failed to disconnect the device",
        detail: "failed to disconnect the device: "
    },
    CreateHIDTransportErrorLedgerHQ: {
        code: -12047,
        message: "Error (12047): failed to create HID transport",
        detail: "failed to create HID transport: "
    },
    CreateWebUSBTransportErrorLedgerHQ: {
        code: -12048,
        message: "Error (12048): failed to create Web USB transport",
        detail: "failed to create Web USB transport: "
    },
    InvalidEthOwnerAddress: {
        code: -13000,
        message: "Error (13000): invalid ethOwnerAddress provided",
        detail: "invalid ethOwnerAddress provided"
    },
    InvalidEthLockAmount: {
        code: -13001,
        message: "Error (13001): invalid eth lockAmount provided",
        detail: "invalid eth lockAmount provided"
    },
    InvalidABI: {
        code: -13002,
        message: "Error (13002): invalid contract abi",
        detail: "invalid contract abi"
    },
    GetNonceError: {
        code: -13003,
        message: "Error (13003): get nonce error",
        detail: "get nonce error"
    },
    FetchGasPriceError: {
        code: -13004,
        message: "Error (13004): fetch gas price error",
        detail: "fetch gas price error"
    },
    FetchEthereumChainIDError: {
        code: -13005,
        message: "Error (13005): fetch Ethereum chain ID error",
        detail: "fetch Ethereum chain ID error"
    },
    InvalidEthSignedRawTx: {
        code: -13006,
        message: "Error (13006): invalid eth signedRawTx provided",
        detail: "invalid eth signedRawTx provided"
    },
    InvalidEthRedeemAmount: {
        code: -13007,
        message: "Error (13007): invalid eth redeemAmount provided",
        detail: "invalid eth redeemAmount provided"
    },
    InvalidEthRedeemTxSignature: {
        code: -13008,
        message: "Error (13008): invalid eth redeemAssetTxSignature provided",
        detail: "invalid eth redeemAssetTxSignature provided"
    },
    BroadcastToEthereumFailed: {
        code: -13009,
        message: "Error (13009): broadcast to Ethereum network error",
        detail: "broadcast to Ethereum network error: "
    },
    CallEthContractError: {
        code: -13010,
        message: "Error (13010): call Ethereum contract error",
        detail: "failed to call contract: "
    },
    InvalidEthereumProvider: {
        code: -13011,
        message: "Error (13011): invalid provider",
        detail: "invalid provider"
    },
    InvalidContractAddress: {
        code: -13012,
        message: "Error (13012): invalid contract address",
        detail: "invalid contract address"
    },
    InvalidProposalID: {
        code: -14001,
        message: "Error (14001): invalid proposal ID",
        detail: "invalid proposal ID"
    },
    InvalidProposalDescription: {
        code: -14002,
        message: "Error (14002): invalid proposal description",
        detail: "invalid proposal description"
    },
    InvalidProposalType: {
        code: -14003,
        message: "Error (14003): invalid proposal type",
        detail: "invalid proposal type"
    },
    IllegalQueryProposalType: {
        code: -14004,
        message: "Error (14004): illegal query proposal type",
        detail: "illegal query proposal type"
    },
    UnsupportedCurrency: {
        code: -14005,
        message: "Error (14005): unsupported currency",
        detail: "unsupported currency"
    },
    InvalidCancelReason: {
        code: -14006,
        message: "Error (14006): invalid cancel reason",
        detail: "invalid cancel reason"
    },
    InvalidVoteOpinion: {
        code: -14007,
        message: "Error (14007): invalid vote opinion",
        detail: "invalid vote opinion"
    },
    InvalidProposalState: {
        code: -14008,
        message: "Error (14008): invalid proposal state",
        detail: "invalid proposal state"
    },
    InvalidProposalHeadline: {
        code: -14009,
        message: "Error (14009): invalid proposal headline",
        detail: "invalid proposal headline"
    },
    IllegalSignatureArray: {
        code: -14010,
        message: "Error (14010): invalid signature array to broadcast",
        detail: "invalid signature array to broadcast"
    },
    GetProposalOptionError: {
        code: -14011,
        message: "Error (14011): failed to get valid proposal option",
        detail: "failed to get valid proposal option"
    },
    InvalidMethod: {
        code: -14012,
        message: "Error (14012): invalid rpc method",
        detail: "invalid rpc method"
    }
};

const responseErrors = {
    NoCodeServerError: {
        code: -20000,
        message: "Error (20000)" + tryAgainMessage,
        detail: ""
    },
    FailToBroadcastError: {
        code: -20001,
        message: "Error (20001)" + tryAgainMessage,
        detail: ""
    },
    AnyOtherError: {
        code: -20002,
        message: "Error (20002)" + tryAgainMessage,
        detail: ""
    },
    ResponseTimeOutError: {
        code: -20003,
        message: "Network Error (20003)" + tryAgainMessage,
        detail: "-20003 : request time out"
    },
    BadConnectionError: {
        code: -20004,
        message: "Bad Internet Connection (20004): Please try again later",
        detail: "-20004 : lost connection to the full node"
    },
    ConnectionRefusedError: {
        code: -20005,
        message: "Connection Refused (20005)" + tryAgainMessage,
        detail: "-20005 : invalid full node URL"
    }
};

const BackendDefaultCode = 999;

// message is the general error message showing to UI
// detail is the code + real message came from protocol
const RPCErrors = {
    CodeParseError: {code: -32700, message: "Error (32700)" + tryAgainMessage, detail: ""},
    CodeInvalidRequest: {code: -32600, message: "Error (32600)" + tryAgainMessage, detail: ""},
    CodeMethodNotFound: {code: -32601, message: "Error (32601)" + tryAgainMessage, detail: ""},
    CodeInvalidParams: {code: -32602, message: "Error (32602)" + tryAgainMessage, detail: ""},
    CodeInternalError: {code: -32603, message: "Error (32603)" + tryAgainMessage, detail: ""},
    CodeNotAllowed: {code: -32001, message: "Error (32001)" + tryAgainMessage, detail: ""},
    CodeNotFound: {code: -32000, message: "Error (32000)" + tryAgainMessage, detail: ""},
};

const otherErrors = {
    ETIMEDOUT: {code: "ETIMEDOUT", message: "", detail: ""},
    ESOCKETTIMEDOUT: {code: "ESOCKETTIMEDOUT", message: "", detail: ""},
    ENOTFOUND: {code: "ENOTFOUND", message: "", detail: ""},
    ECONNREFUSED: {code: "ECONNREFUSED", message: "", detail: ""}
};

module.exports = {
    requestErrors,
    responseErrors,
    RPCErrors,
    otherErrors,
    tryAgainMessageWithoutColon,
    BackendDefaultCode
};
