const oneledger = require("../oneledger");
const masterkey = require("../masterkey");
const should = require('should');
const typeConverter = require("../typeConverter");

const keyPath = "m/44'/403'/0'/0'/1'";

const masterKey = {
    key: "8401fbb9a7f7118da334a2bef549c6a6bb652093e6f74b11b1974fcf65ca36b4",
    chainCode: "018e08ea8373d6423b6e7b4679e1bae0d071f8510691fbd54183fe654c2597ce"
};
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

describe("test derive private key from master key for Ed25519", function () {
    it("test 1", function () {
        const uint8arrayMasterKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8arrayMasterKeychaincode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        const derivedPrivatekey = oneledger.derivePrivateKeyOLT(uint8arrayMasterKeypart, uint8arrayMasterKeychaincode, keyPath);
        console.log("222--",derivedPrivatekey);
        console.log(typeConverter.uint8arrayToHexStr(derivedPrivatekey));
    })
});

describe("test derive public key from private key for Ed25519", function () {
    it("test 1", function () {
        const derivedPrivatekeyHexStr = "64283bbf60f27d27134cd4da3ca58bca15458df99208ff20a08784025d3b9592d3ace5aa8b61cece4ccebdda63d587c89fd12c19ae665b79cbd9c9097638b200";
        const derivedPrivatekeyUint8Array = typeConverter.hexStrToUint8Array(derivedPrivatekeyHexStr);
        console.log(derivedPrivatekeyUint8Array);
        const publicKey = oneledger.derivePublicKeyOLT(derivedPrivatekeyUint8Array);
        should.equal(publicKey, "06zlqothzs5Mzr3aY9WHyJ/RLBmuZlt5y9nJCXY4sgA=")
    })
});

describe("test derive address from public key for Ed25519", function () {
    it("test 1", function () {
        const derivedPublicKey = "06zlqothzs5Mzr3aY9WHyJ/RLBmuZlt5y9nJCXY4sgA=";
        const address = oneledger.deriveAddressOLT(derivedPublicKey);
        should.equal(address, "b357bdc2ae60dcaf5316924d760f09289d226243")
    })
});

const rawTxmessage = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';
describe("test sign tx using Ed25519", function () {
    it("test 1", function () {
        const uint8ArrayKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8ArrayKeychaincode = typeConverter.hexStrToUint8Array( masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption("123456", uint8ArrayKeypart, uint8ArrayKeychaincode);
        oneledger.signForSignatureOLT(rawTxmessage, "123456", encryptedMasterKey, keyPath, function (error, signature) {
            console.log(error);
            console.log("signature", signature);
        });
    })
});

describe("test verify signature Ed25519", function () {
    it("test 1", function () {
        const signature = "NiNW4XxOsuMIK6lPR7vqWTjw58BYTcXlHZA8x2lPeXtRZRc0gsPt8ZWAzyQ1TnzYMcK/y8SZfPTUlGDXya99Cw==";
        const uint8ArrayKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8ArrayKeychaincode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        // console.log(uint8ArrayKey);
        const derivedPrivateKey = oneledger.derivePrivateKeyOLT(uint8ArrayKeypart, uint8ArrayKeychaincode, keyPath);
        console.log("333---", derivedPrivateKey);

        const publicKey = oneledger.derivePublicKeyOLT(derivedPrivateKey);
        console.log(publicKey);
        oneledger.verifySignatureOLT(rawTxmessage, signature, "06zlqothzs5Mzr3aY9WHyJ/RLBmuZlt5y9nJCXY4sgA=", function (error, result) {
            console.log(error);
            console.log("result", result);
            should.ok(result, "signature verify should be true")
        });
    })
});
