const oneledger = require("../oneledger");
const masterKeySeed = require("../masterKeySeed");
const should = require('should');
const typeConverter = require("../typeConverter");
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");

const keyPath = "m/44'/403'/0'/0'/1'";

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const masterkeyPassword = "123456";
const rawTxmessage = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';

describe("test derive the masterKey from masterKeySeed for Ed25519", function () {
    it("test 1", function () {
        const masterKey = oneledger.deriveMasterKey(masterKeySeedHex);
        // console.log(derivedMasterkey);
        // console.log(typeConverter.uint8arrayToHexStr(masterkey));
        should.equal(masterKey.length, 32, "masterKey should be 32 bytes");
    })
});

describe("test derive privateKeySeed from masterKey for Ed25519", function () {
    it("test 1", function () {
        const derivedMasterKeyHexStr = "980416e533851db44582452e7a1fbd735b91a5ca0c2a9b4e9da54a030b8a3f53";
        const privateKeySeed = oneledger.derivePrivateKeySeed(typeConverter.hexStrToUint8Array(derivedMasterKeyHexStr), keyPath);
        // console.log(privateKeySeed);
        // console.log(typeConverter.bufferToHexStr(privateKeySeed));
        should.equal(privateKeySeed.length, 32, "privateKeySeed should be 32 bytes");
    })
});

describe("test derive keyPair from privateKeySeed for Ed25519", function () {
    it("test 1", function () {
        const privateKeySeed = "8f46f2b700e845ed77d711efa08f28afcbe20f6e04f9e6851c4a22a9ebf2c69f";
        const keyPair = oneledger.deriveKeyPair(typeConverter.hexStrToBuffer(privateKeySeed));
        // console.log(keyPair);
        should.equal(nacl.util.decodeBase64(keyPair.publicKey).length, nacl.sign.publicKeyLength, "pubkey length in bytes should be 32");
        should.equal(nacl.util.decodeBase64(keyPair.privateKey).length, nacl.sign.secretKeyLength, "prikey length in bytes should be 64");
    })
});

describe("test derive address from keyPair's publicKey for Ed25519", function () {
    it("test 1", function () {
        const publicKey = "XCmcmAM+wznX76gUTM6uaG5ka+92oTZb4GaKYMaxUzs=";
        const address = oneledger.deriveAddress(publicKey);
        should.equal(address.length, 42, "derived address should be 42 chars long including 0x prefix");
        should.equal(address.substring(0,2), "0x", "master seed address should start with 0x")
    })
});

const addressVerifyTestcases = [
    {
        name :"test 1, valid OLT address",
        input : "0x9a59efaa736beb8feaabcbc9ab7c99d4b8c712af",
        expect : true
    },
    {
        name :"test 2, valid OLT address",
        input : "0xf1b2027fe0f9e0de269a483a4be40d3b917fb204",
        expect : true
    },
    {
        name :"test 3, valid OLT address",
        input : "0x4d4e3fca3fb547bab80c7fd600533f6a1d4e080b",
        expect : true
    },
    {
        name :"test 4, valid OLT address",
        input : "0xb45861ffaa41a5582bc3a98bd837e1cafefbd140",
        expect : true
    },
    {
        name :"test 5, valid OLT address",
        input : "0xd70050d1669f2146dd3095a61345a276dc8c599f",
        expect : true
    },
    {
        name :"test 6, valid OLT address",
        input : "0x0ba158d7d2ea60a091def2c85ad2f7281533218f",
        expect : true
    },
    {
        name :"test 7, invalid OLT address, 0x + 39 chars",
        input : "0x0ba158d7d2ea60a091def2c85ad2f7281533218",
        expect : false
    },
    {
        name :"test 8, invalid OLT address, without 0x",
        input : "0ba158d7d2ea60a091def2c85ad2f7281533218f",
        expect : false
    },
    {
        name :"test 9, invalid OLT address, only 0x",
        input : "0x",
        expect : false
    },
    {
        name :"test 9, invalid OLT address, empty",
        input : "",
        expect : false
    },
    {
        name :"test 10, invalid OLT address, null",
        input : null,
        expect : false
    }
];

describe("test verify derived address for Ed25519", function () {
    addressVerifyTestcases.forEach(testcase => {
        it(testcase.name, function () {
            should.equal(oneledger.verifyAddress(testcase.input), testcase.expect, "derived address validation should be " + testcase.expect)
        })
    })
});

describe("test sign tx using Ed25519", function () {
    it("test 1, sign tx and verify signature", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterkeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const data = {
            message: rawTxmessage,
            password: masterkeyPassword,
            encryptedMasterKeySeed,
            keyPath
        };
        const signature = await oneledger.signForSignature(data).catch(error => {
            should.fail(error, null, "sign for signature for OLT should be ok, but : " + error.message)
        });
        console.log("signature : ", signature);
        should.exist(signature);
        const masterKey = oneledger.deriveMasterKey(masterKeySeedHex);
        const seed = oneledger.derivePrivateKeySeed(masterKey, keyPath);
        const {publicKey, privateKey} = oneledger.deriveKeyPair(seed);
        // console.log(publicKey);
        // console.log(privateKey);
        const result = await oneledger.verifySignature(rawTxmessage, signature, publicKey).catch(error => {
            should.fail(error, undefined, "verify signature for OLT should be ok, but : " + error.message);
        });
        should.ok(result, "signature verify should be true")
    })
});

const validEd25519SignatureVerifyTestcases = [
    {
        name: "test 1, valid signature",
        input1_rawTxmessage: rawTxmessage,
        input2_signature: "BU5Ln408zXshIgyKRprOLU2R0oVY398+hMOpM6sumTq6ElGH+uiocKeCvQOPd345Y4VxB9lu0fJrM8Z8xWP7Cw==",
        input3_pubkey: "X1VcXi+DXSkPbmIkleAaNYVOfW19ZV3lztXSmdlCkR8=",
        expect: true
    }
];

const invalidEd25519SignatureVerifyTestcases = [
    {
        name: "test 1, invalid signature",
        input1_rawTxmessage: rawTxmessage,
        input2_signature: "BU5Ln408zXshIgyKRprOLU2R0oVY398+hMOpM6sumTq6ElGH+uiocKeCvQOPd345Y4VxB9lu0fJrM8Z8xWP7Cw==",
        input3_pubkey: "X1VcXi+DXSkPbmIkleAaNYVOfW19ZV3lztXSmdlCkR0=",
        expect: false
    }
];

describe("test verify signature Ed25519", function () {
    validEd25519SignatureVerifyTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const result = await oneledger.verifySignature(testcase.input1_rawTxmessage, testcase.input2_signature, testcase.input3_pubkey).catch(error => {
                console.log("error: ", error);
                should.equal(error, undefined, "verify signature for OLT should be ok, but : " + error.message);
            });
            should.ok(result, "signature verify should be true")
        })
    });
    invalidEd25519SignatureVerifyTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const result = await oneledger.verifySignature(testcase.input1_rawTxmessage, testcase.input2_signature, testcase.input3_pubkey).catch(error => {
                console.log("error: ", error);
                should.equal(error, undefined, "verify invalid signature for OLT should be error")
            });
            console.log("result: ", result);
            should.ok(!result, " invalid signature verify should be false")
        })
    })
});
