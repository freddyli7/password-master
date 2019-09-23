const oneledger = require("../oneledger");
const masterkey = require("../masterkey");
const should = require('should');
const typeConverter = require("../typeConverter");
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");

const keyPath = "m/44'/403'/0'/0'/1'";

const masterKey = {
    key: "8401fbb9a7f7118da334a2bef549c6a6bb652093e6f74b11b1974fcf65ca36b4",
    chainCode: "018e08ea8373d6423b6e7b4679e1bae0d071f8510691fbd54183fe654c2597ce"
};
const masterkeyPassword = "123456";
// Uint8Array [
//         132,
//         1,
//         251,
//         185,
//         167,
//         247,
//         17,
//         141,
//         163,
//         52,
//         162,
//         190,
//         245,
//         73,
//         198,
//         166,
//         187,
//         101,
//         32,
//         147,
//         230,
//         247,
//         75,
//         17,
//         177,
//         151,
//         79,
//         207,
//         101,
//         202,
//         54,
//         180 ]
// Uint8Array [
//         1,
//         142,
//         8,
//         234,
//         131,
//         115,
//         214,
//         66,
//         59,
//         110,
//         123,
//         70,
//         121,
//         225,
//         186,
//         224,
//         208,
//         113,
//         248,
//         81,
//         6,
//         145,
//         251,
//         213,
//         65,
//         131,
//         254,
//         101,
//         76,
//         37,
//         151,
//         206 ]

describe("test derive private key seed from master key for Ed25519", function () {
    it("test 1", function () {
        const uint8arrayMasterKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const derivedPrivatekeySeed = oneledger.deriveSeed(uint8arrayMasterKeypart, keyPath);
        // console.log("seed--32 bytes", derivedPrivatekeySeed.length);
        should.equal(derivedPrivatekeySeed.length, 32, "private key seed derived from masterkey with keypath should be 32 bytes");
        // console.log(typeConverter.uint8arrayToHexStr(derivedPrivatekeySeed));
    })
});

describe("test derive private and public key from private key seed for Ed25519", function () {
    it("test 1", function () {
        const derivedPrivatekeySeedHexStr = "cd76dbfcbf5092c6b521dc8c00e9d1481efab3b4483d351a98066ad8d1257514";
        const derivedPrivatekeySeedUint8Array = typeConverter.hexStrToUint8Array(derivedPrivatekeySeedHexStr);
        const {publicKey, privateKey} = oneledger.deriveKeyPair(derivedPrivatekeySeedUint8Array);
        // console.log(nacl.util.decodeBase64(publicKey).length);
        // console.log(privateKey);
        should.equal(nacl.util.decodeBase64(publicKey).length, nacl.sign.publicKeyLength, "pubkey length in bytes should be 32");
        should.equal(nacl.util.decodeBase64(privateKey).length, nacl.sign.secretKeyLength, "prikey length in bytes should be 64");
    })
});

describe("test derive address from public key for Ed25519", function () {
    it("test 1", function () {
        const derivedPublicKey = "X1VcXi+DXSkPbmIkleAaNYVOfW19ZV3lztXSmdlCkR8=";
        const address = oneledger.deriveAddress(derivedPublicKey);
        should.equal(address.length, 40, "derived address should be 40 chars long without 0x prefix")
    })
});

const rawTxmessage = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';
describe("test sign tx using Ed25519", function () {
    it("test 1, sign tx and verify signature", function () {
        const masterKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const masterChainCode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption(masterkeyPassword, masterKeypart, masterChainCode);
        oneledger.signForSignature(rawTxmessage, masterkeyPassword, encryptedMasterKey, keyPath, function (error, signature) {
            // console.log(error);
            // console.log(signature);
            if (error) should.fail(error, null, "sign for signature for OLT should be ok, but : " + error.message);
            const seed = oneledger.deriveSeed(masterKeypart, keyPath);
            const {publicKey} = oneledger.deriveKeyPair(seed);
            oneledger.verifySignature(rawTxmessage, signature, publicKey, function (error, result) {
                // console.log(error);
                // console.log("result", result);
                if (error) should.fail(error, null, "verify signature for OLT should be ok, but : " + error.message);
                should.ok(result, "signature verify should be true")
            });
        });
    })
});

describe("test verify signature Ed25519", function () {
    it("test 1", function () {
        const signature = "BU5Ln408zXshIgyKRprOLU2R0oVY398+hMOpM6sumTq6ElGH+uiocKeCvQOPd345Y4VxB9lu0fJrM8Z8xWP7Cw==";
        oneledger.verifySignature(rawTxmessage, signature, "X1VcXi+DXSkPbmIkleAaNYVOfW19ZV3lztXSmdlCkR8=", function (error, result) {
            // console.log(error);
            // console.log("result", result);
            if (error) should.fail(error, null, "verify signature for OLT should be ok, but : " + error.message);
            should.ok(result, "signature verify should be true")
        });
    })
});
