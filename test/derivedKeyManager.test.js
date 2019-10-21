const deriveKeyManager = require("../derivedKeyManager");
const should = require("should");
const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");

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
        name: "test derive new oneledger account with invalid data 5, invalid keyIndex",
        input: {
            keyType: "BTCP2PK",
            keyIndex: -11,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11001
    },
    {
        name: "test derive new oneledger account with invalid data 6, wrong password",
        input: {
            keyType: "BTCP2PK",
            keyIndex: 2,
            password: "masterKeyPassword",
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test derive new oneledger account with invalid data 7, invalid encryptedMasterKeySeed",
        input: {
            keyType: "BTCP2PK",
            keyIndex: 2,
            password: masterKeyPassword,
            encryptedMasterKeySeed: null
        },
        expect: -11002
    },
    {
        name: "test derive new oneledger account with invalid data 8, invalid keyIndex",
        input: {
            keyType: "BTCP2PKH",
            keyIndex: -11,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11001
    },
    {
        name: "test derive new oneledger account with invalid data 9, wrong password",
        input: {
            keyType: "BTCP2PKH",
            keyIndex: 2,
            password: "masterKeyPassword",
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test derive new oneledger account with invalid data 10, invalid encryptedMasterKeySeed",
        input: {
            keyType: "BTCP2PKH",
            keyIndex: 2,
            password: masterKeyPassword,
            encryptedMasterKeySeed: null
        },
        expect: -11002
    },
    {
        name: "test derive new oneledger account with invalid data 11, invalid keyIndex",
        input: {
            keyType: "ETH",
            keyIndex: -11,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11001
    },
    {
        name: "test derive new oneledger account with invalid data 12, wrong password",
        input: {
            keyType: "ETH",
            keyIndex: 2,
            password: "masterKeyPassword",
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test derive new oneledger account with invalid data 13, invalid encryptedMasterKeySeed",
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
                console.log("ERR :", error);
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
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
                // console.log(error);
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
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
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
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
                should.fail(error, null, "derive new keyPair should be ok but : " + error.error.message);
            });
            const {keyIndex, address, publicKey} = response;
            kamap.set(address, keyIndex);
            // console.log(`${keyIndex} ${address}`);
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    deriveNewKeyTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const response = await deriveKeyManager.deriveNewKeyPair(testcase.input).catch(error => {
                // console.log("ERR :", error);
                should.equal(error.error.code, testcase.expect, error.error.message);
            });
            if (typeof response !== "undefined") should.fail(response, undefined, "derive new keyPair with invalid data should be error");
        })
    })
});

const messageOLT = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';
const rawTxmessageBTC = "072a8543e388c4155ccbcd325f129000214095725598721cea986fcd0fc38d6a";
const txParamsETH = {
    nonce: 0,
    gasPrice: 1.1,
    gasLimit: 1,
    to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
    value: "1",
    data: "",
};

const signTxTestcases = [
    {
        name: "test sign tx with invalid data 1, invalid keyType",
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
        name: "test sign tx with invalid data 2, invalid keyIndex",
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
        name: "test sign tx with invalid data 3, wrong password",
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
        name: "test sign tx with invalid data 4, invalid encryptedMasterKeySeed",
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
        name: "test sign tx with invalid data 5, invalid keyIndex",
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
        name: "test sign tx with invalid data 6, wrong password",
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
        name: "test sign tx with invalid data 7, invalid encryptedMasterKeySeed",
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
        name: "test sign tx with invalid data 8, invalid keyIndex",
        input: {
            message: txParamsETH,
            keyType: "ETH",
            keyIndex: -1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11001
    },
    {
        name: "test sign tx with invalid data 9, wrong password",
        input: {
            message: txParamsETH,
            keyType: "ETH",
            keyIndex: 1,
            password: wrongMasterkeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11000
    },
    {
        name: "test sign tx with invalid data 10, invalid encryptedMasterKeySeed",
        input: {
            message: txParamsETH,
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed: undefined
        },
        expect: -11002
    },
    {
        name: "test sign tx with invalid data 11, invalid OLT message",
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
        name: "test sign tx with invalid data 12, invalid BTC message",
        input: {
            message: "rawTxmessageBTC",
            keyType: "BTC",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11004
    },
    {
        name: "test sign tx with invalid data 13, invalid ETH message, invalid nonce",
        input: {
            message: {
                nonce: -11,
                gasPrice: 1.1,
                gasLimit: 1,
                to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                value: "1",
                data: "",
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11005
    },
    {
        name: "test sign tx with invalid data 14, invalid ETH message, invalid gasPrice",
        input: {
            message: {
                nonce: 11,
                gasPrice: -100,
                gasLimit: 1,
                to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                value: "1",
                data: "",
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11006
    },
    {
        name: "test sign tx with invalid data 15, invalid ETH message, invalid gasLimit",
        input: {
            message: {
                nonce: 11,
                gasPrice: 100,
                gasLimit: -1,
                to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                value: "1",
                data: "",
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11008
    },
    {
        name: "test sign tx with invalid data 16, invalid ETH message, invalid to address",
        input: {
            message: {
                nonce: 11,
                gasPrice: 100,
                gasLimit: 1,
                to: '034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                value: "1",
                data: "",
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11009
    },
    {
        name: "test sign tx with invalid data 17, invalid ETH message, invalid value",
        input: {
            message: {
                nonce: 11,
                gasPrice: 100,
                gasLimit: 1,
                to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
                value: -1,
                data: "",
            },
            keyType: "ETH",
            keyIndex: 1,
            password: masterKeyPassword,
            encryptedMasterKeySeed
        },
        expect: -11007
    }
];

describe("test sign tx", function () {
    it("test sign tx with OLT derived key", async function () {
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
    it("test sign tx with BTC derived key", async function () {
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
                should.fail(error, null, "sign BTC tx should be ok but : " + error.error.message);
            });
            const {signature, recovery} = response;
            ismap.set(signature, i)
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("test sign tx with ETH derived key", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: txParamsETH,
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
            // console.log(`${i} ${signature}`);
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    signTxTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const data = testcase.input;
            const response = await deriveKeyManager.signTx(data).catch(error => {
                should.equal(error.error.code, testcase.expect, error.error.message)
            });
            if (typeof response !== "undefined") should.fail(response, undefined, "sign OLT tx with invalid data should be error");
        })
    })
});

