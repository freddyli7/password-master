const derivekeyManager = require("../derivedkeyManager");
const should = require("should");
const encryptedMasterKey = '{"iv":"RiSLQyrzQyfQWDPJjIIhug==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"TQG4HWB0kxvXTbclS2i8mQ==","ct":"Dn2bUTNh6SasdlVvsIdMqBkyOIUk0Fn6737U3nq3h9DI1O46fFsP8UvilkxKu4iqrKAJ752QfwEjf4MbXG/10pCBD1LzAq00QKpesiHgw2dczL+ect7YfWiN7fpTz8q4"}';

describe("test derive new key", function () {
    it("test derive new oneledger key", function () {
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "OLT",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey
            };
            derivekeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(null, null, error.message());
                kamap.set(address, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new BTC-P2PK pubkey", function () {
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "BTC-P2PK",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey,
                network : "BITCOIN"
            };
            derivekeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(null, null, error.message());
                kamap.set(address, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new BTC-P2PKH address", function () {
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "BTC-P2PKH",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey,
                network : "BITCOIN"
            };
            derivekeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(null, null, error.message());
                kamap.set(address, keyIndex)
            });
        }
        should.equal(kamap.size, 1000, "should generate 1000 different addresses")
    }).timeout(20000);
    it("test derive new ETH pubkey", function () {
        const kamap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                keyType: "ETH",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey
            };
            derivekeyManager.deriveNewKeyPair(data, (error, keyIndex, address) => {
                if (error) should.fail(null, null, error.message());
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
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: messageOLT,
                keyType: "OLT",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey
            };
            derivekeyManager.signTx(data, (error, signature) => {
                if (error) should.fail(null, null, error.message());
                ismap.set(signature, i)
            });
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("test sign tx with BTC derived key", function () {
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: rawTxmessageBTC,
                keyType: "BTC",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey,
                network : "BITCOIN"
            };
            derivekeyManager.signTx(data, (error, signature) => {
                if (error) should.fail(error, undefined, error.message);
                ismap.set(signature, i)
            });
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
    it("test sign tx with ETH derived key", function () {
        const ismap = new Map();
        for (let i = 0; i < 1000; i++) {
            const data = {
                message: txParamsETH,
                keyType: "ETH",
                keyIndex: i,
                password: "123456",
                encryptedMasterKey
            };
            derivekeyManager.signTx(data, (error, signature) => {
                if (error) should.fail(null, null, error.message);
                ismap.set(signature, i)
            });
        }
        should.equal(ismap.size, 1000, "should generate 1000 different signatures")
    }).timeout(20000);
});

