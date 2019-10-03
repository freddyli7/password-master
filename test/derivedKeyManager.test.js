const deriveKeyManager = require("../derivedKeyManager");
const should = require("should");
const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";

const masterKeyPassword = "123456";
const wrongMasterkeyPassword = "123456123123";

describe("test derive new key", function () {
    it("test derive new oneledger account", function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "OLT",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            deriveKeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(error, null, "derive new keyPair should be ok but : " + error.message);
                kamap.set(address, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new BTC-P2PK account", function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "BTC-P2PK",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed,
                network: "BITCOIN"
            };
            deriveKeyManager.deriveNewKeyPair(data, (error, keyIndex, pubKey) => {
                if (error) should.fail(error, null, "derive new keyPair should be ok but : " + error.message);
                kamap.set(pubKey, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different public key")
    }).timeout(20000);
    it("test derive new BTC-P2PKH account", function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "BTC-P2PKH",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed,
                network: "BITCOIN"
            };
            deriveKeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(error, null, "derive new keyPair should be ok but : " + error.message);
                kamap.set(address, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new ETH account", function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "ETH",
                keyIndex: i,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            deriveKeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(error, null, "derive new keyPair should be ok but : " + error.message);
                kamap.set(address, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
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

describe("test sign tx", function () {
    it("test sign tx with OLT derived key", function () {
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
            deriveKeyManager.signTx(data, (error, signature) => {
                if (error) should.fail(error, null, "sign OLT tx should be ok but : " + error.message);
                ismap.set(signature, i)
            });
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("test sign tx with BTC derived key", function () {
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
            deriveKeyManager.signTx(data, (error, signature) => {
                if (error) should.fail(error, null, "sign BTC tx should be ok but : " + error.message);
                ismap.set(signature, i)
            });
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("test sign tx with ETH derived key", function () {
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
            deriveKeyManager.signTx(data, (error, signature) => {
                if (error) should.fail(error, null, "sign ETH tx should be ok but : " + error.message);
                ismap.set(signature, i)
            });
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
});
