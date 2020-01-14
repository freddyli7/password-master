const deriveKeyManager = require("../derivedKeyManager");
const should = require("should");
const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");
const bitcoinjs = require('bitcoinjs-lib');

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const masterKeyPassword = "123456";
const wrongMasterkeyPassword = "123456123123";
const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
const deriveNewKeyTestcases = [
    {
        name: "test derive new oneledger account with invalid data 1, invalid keyType",
        input: {
            keyType: "OLTABC",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11010
    },
    {
        name: "test derive new oneledger account with invalid data 2, invalid keyIndex",
        input: {
            keyType: "OLT",
            keyIndex: -1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11001
    },
    {
        name: "test derive new oneledger account with invalid data 3, wrong password",
        input: {
            keyType: "OLT",
            keyIndex: 1,
            password: wrongMasterkeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test derive new oneledger account with invalid data 4, invalid encryptedMasterKeySeed",
        input: {
            keyType: "OLT",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11002
    },
    {
        name: "test derive new BTCP2PK account with invalid data 5, invalid keyIndex",
        input: {
            keyType: "BTCP2PK",
            keyIndex: -11,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11001
    },
    {
        name: "test derive new BTCP2PK account with invalid data 6, wrong password",
        input: {
            keyType: "BTCP2PK",
            keyIndex: 2,
            password: "masterKeyPassword",
            encryptedMasterKeySeed,
        },
        expect: -11000
    },
    {
        name: "test derive new BTCP2PK account with invalid data 7, invalid encryptedMasterKeySeed",
        input: {
            keyType: "BTCP2PK",
            keyIndex: 2,
            password: masterKeyPassword,
            encryptedMasterKeySeed: null
        },
        expect: -11002
    },
    {
        name: "test derive new BTCP2PKH account with invalid data 8, invalid keyIndex",
        input: {
            keyType: "BTCP2PKH",
            keyIndex: -11,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11001
    },
    {
        name: "test derive new BTCP2PKH account with invalid data 9, wrong password",
        input: {
            keyType: "BTCP2PKH",
            keyIndex: 2,
            password: "masterKeyPassword",
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test derive new BTCP2PKH account with invalid data 10, invalid encryptedMasterKeySeed",
        input: {
            keyType: "BTCP2PKH",
            keyIndex: 2,
            password: masterKeyPassword,
            encryptedMasterKeySeed: null
        },
        expect: -11002
    },
    {
        name: "test derive new ETH account with invalid data 11, invalid keyIndex",
        input: {
            keyType: "ETH",
            keyIndex: -11,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11001
    },
    {
        name: "test derive new ETH account with invalid data 12, wrong password",
        input: {
            keyType: "ETH",
            keyIndex: 2,
            password: "masterKeyPassword",
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test derive new ETH account with invalid data 13, invalid encryptedMasterKeySeed",
        input: {
            keyType: "ETH",
            keyIndex: 2,
            password: masterKeyPassword,
            encryptedMasterKeySeed: null
        },
        expect: -11002
    }
];

describe("test derive new key", function () {
    it("test derive new oneledger account with valid data", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "OLT",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            const {response} = await deriveKeyManager.deriveNewKeyPair(data).catch(error => {
                console.log("error :", error);
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
            console.log("response:", response);
            const {keyIndex, address, publicKey} = response;
            kamap.set(address, keyIndex);
            // console.log(`${keyIndex} ${address}`);
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new BTCP2PK account", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "BTCP2PK",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed,
                network: "BITCOIN"
            };
            const {response} = await deriveKeyManager.deriveNewKeyPair(data).catch(error => {
                console.log("error: ", error);
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
            console.log("response:", response);
            const {keyIndex, address, publicKey} = response;
            kamap.set(publicKey, keyIndex);
            // console.log(`${keyIndex} ${publicKey}`);
        }
        should.equal(kamap.size, 1000, "should generate 1000 different public key")
    }).timeout(20000);
    it("test derive new BTCP2PKH account", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "BTCP2PKH",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed,
                network: "BITCOIN"
            };
            const {response} = await deriveKeyManager.deriveNewKeyPair(data).catch(error => {
                console.log("error: ", error);
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
            console.log("response:", response);
            const {keyIndex, address, publicKey} = response;
            kamap.set(address, keyIndex);
            // console.log(`${keyIndex} ${address}`);
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new ETH account", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "ETH",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            const {response} = await deriveKeyManager.deriveNewKeyPair(data).catch(error => {
                console.log("error: ", error);
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
            console.log("response:", response);
            const {keyIndex, address, publicKey} = response;
            kamap.set(address, keyIndex);
            // console.log(`${keyIndex} ${address}`);
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    deriveNewKeyTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const response = await deriveKeyManager.deriveNewKeyPair(testcase.input).catch(error => {
                console.log("error :", error);
                should.equal(error.error.code, testcase.expect, error.error.message);
            });
            console.log("response: ", response);
            if (typeof response !== "undefined") should.fail(response, undefined, "derive new keyPair with invalid data should be error");
        })
    })
});

const messageOLT = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';
const rawTxmessageBTC = "0100000001d377a30edf12890d15b8d5f028883755fcaf716025aa7bac7158f19febe3059b0000000000ffffffff0100a60e000000000017a914a14b3f8033269125671306c7b6a5b0dbb3d88a318700000000";
const txParamsETH = {
    nonce: 0,
    gasPrice: 1.1,
    gasLimit: 1,
    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
    value: "1",
    data: "",
};

const signTxInvalidDataTestcases = [
    {
        name: "1 test sign tx with invalid data, invalid keyType",
        input: {
            message: messageOLT,
            keyType: "OLTABC",
            keyIndex: 2,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11011
    },
    {
        name: "2 test sign tx with invalid data, invalid keyIndex",
        input: {
            message: messageOLT,
            keyType: "OLT",
            keyIndex: -1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11001
    },
    {
        name: "3 test sign tx with invalid data, wrong password",
        input: {
            message: messageOLT,
            keyType: "OLT",
            keyIndex: 1,
            password: wrongMasterkeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "4 test sign tx with invalid data, invalid encryptedMasterKeySeed",
        input: {
            message: messageOLT,
            keyType: "OLT",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11002
    },
    {
        name: "5 test sign tx with invalid data, invalid keyIndex",
        input: {
            message: rawTxmessageBTC,
            keyType: "BTC",
            keyIndex: -1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11001
    },
    {
        name: "6 test sign tx with invalid data, wrong password",
        input: {
            message: rawTxmessageBTC,
            keyType: "BTC",
            keyIndex: 1,
            password: wrongMasterkeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "7 test sign tx with invalid data, invalid encryptedMasterKeySeed",
        input: {
            message: rawTxmessageBTC,
            keyType: "BTC",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11002
    },
    {
        name: "8 test sign tx with invalid data, invalid keyIndex",
        input: {
            message: {txParams: txParamsETH},
            keyType: "ETH",
            keyIndex: -1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11001
    },
    {
        name: "9 test sign tx with invalid data, wrong password",
        input: {
            message: {txParams: txParamsETH},
            keyType: "ETH",
            keyIndex: 1,
            password: wrongMasterkeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "10 test sign tx with invalid data, invalid encryptedMasterKeySeed",
        input: {
            message: {txParams: txParamsETH},
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11002
    },
    {
        name: "11 test sign tx with invalid data, invalid OLT message",
        input: {
            message: "messageOLT",
            keyType: "OLT",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11003
    },
    {
        name: "13 test sign tx with invalid data, invalid ETH message, invalid nonce",
        input: {
            message: {
                txParams: {
                    nonce: -11,
                    gasPrice: 1.1,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: "1",
                    data: "",
                }
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11005
    },
    {
        name: "14 test sign tx with invalid data, invalid ETH message, invalid gasPrice",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: -100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: "1",
                    data: "",
                }
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11006
    },
    {
        name: "15 test sign tx with invalid data, invalid ETH message, invalid gasLimit",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: -1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: "1",
                    data: "",
                }
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11008
    },
    {
        name: "16 test sign tx with invalid data, invalid ETH message, invalid to address",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: "1",
                    data: "",
                }
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11009
    },
    {
        name: "17 test sign tx with invalid data, invalid ETH message, invalid value",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: -1,
                    data: "",
                }
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11007
    },
    {
        name: "21 test sign tx with only chain config, invalid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {chain: "nonsense"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "22 test sign tx with only hardfork, invalid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {hardfork: "nonsense"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "23 test sign tx with invalid chain and invalid hardfork, invalid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {chain: "nonsense", hardfork: "nonsense"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "24 test sign tx with valid chain and invalid hardfork txConfig, invalid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {chain: "ropsten", hardfork: "nonsense"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "25 test sign tx with invalid chain and valid hardfork txConfig, invalid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {chain: "nonsense", hardfork: "byzantium"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "29 test sign tx with null as txConfig, invalid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: null
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "30 test sign tx with string as txConfig, invalid ETH txConfig type",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: "123123123"
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -12007
    },
    {
        name: "31 test sign tx without txParams, invalid ETH txParams",
        input: {
            message: {
                txConfig: undefined
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11005
    },
    {
        name: "32 test sign tx with empty message object, invalid ETH message",
        input: {
            message: {},
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11005
    },
    {
        name: "33 test sign tx with invalid data, invalid BTC network",
        input: {
            message: rawTxmessageBTC,
            keyType: "BTC",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed,
            network: "ABC"
        },
        expect: -11012
    },
];

const signTxValidDataTestcases = [
    {
        name: "26 test sign tx with valid chain and valid hardfork txConfig with other fields, valid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {foo: "foo", chain: "goerli", hardfork: "byzantium", abc: "123"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: true
    },
    {
        name: "27 test sign tx without txConfig, not given ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                }
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: true
    },
    {
        name: "28 test sign tx with invalid chain and valid hardfork, valid ETH txConfig",
        input: {
            message: {
                txParams: {
                    nonce: 11,
                    gasPrice: 100,
                    gasLimit: 1,
                    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                    value: 1,
                    data: "",
                },
                txConfig: {chain: "goerli", hardfork: "byzantium"}
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: true
    },
    {
        name: "34 test sign tx with valid data, valid BTC network",
        input: {
            message: rawTxmessageBTC,
            keyType: "BTC",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed,
            network: "TESTNET"
        },
        expect: true
    },
];

describe("test sign tx", function () {
    it("18 test sign tx with OLT derived key", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: messageOLT,
                keyType: "OLT",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            const {response} = await deriveKeyManager.signTx(data).catch(error => {
                should.fail(error, null, "sign OLT tx should be ok but : " + error.error.message);
            });
            const {signature} = response;
            ismap.set(signature, i);
            // console.log(`${i} ${signature}`);
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("19 test sign tx with BTC derived key", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: rawTxmessageBTC,
                keyType: "BTC",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed,
                network: "BITCOIN"
            };
            const {response} = await deriveKeyManager.signTx(data).catch(error => {
                console.log("error: ", error);
                should.fail(error, null, "sign BTC tx should be ok but : " + error.error.message);
            });
            console.log("signature : ", response);
            ismap.set(response, i)
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("20 test sign tx with ETH derived key", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: {txParams: txParamsETH, txConfig: {}},
                keyType: "ETH",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            const {response} = await deriveKeyManager.signTx(data).catch(error => {
                should.fail(error, null, "sign ETH tx should be ok but : " + error.error.message);
            });
            const {signature} = response;
            ismap.set(signature, i);
            console.log(`${i} ${signature}`);
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    signTxInvalidDataTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const data = testcase.input;
            const response = await deriveKeyManager.signTx(data).catch(error => {
                console.log("error:", error);
                console.log("error:", data);
                should.equal(error.error.code, testcase.expect, error.error.message)
            });
            console.log("response:", response);
            if (typeof response !== "undefined") should.fail(response, undefined, "sign tx with invalid data should be error");
        })
    });
    signTxValidDataTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const data = testcase.input;
            const response = await deriveKeyManager.signTx(data).catch(error => {
                console.log("error: ", error);
                should.fail(error, undefined, "sign tx with valid data should be ok but : ", error);
            });
            console.log("resp:", response);
            should.exist(response.response);
        })
    })
});
