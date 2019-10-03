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
        should.equal(address.length, 42, "derived address should be 42 chars long including 0x prefix")
    })
});

describe("test sign tx using Ed25519", function () {
    it("test 1, sign tx and verify signature", function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterkeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const data = {
            message: rawTxmessage,
            password: masterkeyPassword,
            encryptedMasterKeySeed,
            keyPath
        };
        oneledger.signForSignature(data, function (error, signature) {
            // console.log(signature);
            if (error) should.fail(error, null, "sign for signature for OLT should be ok, but : " + error.message);
            const masterKey = oneledger.deriveMasterKey(masterKeySeedHex);
            const seed = oneledger.derivePrivateKeySeed(masterKey, keyPath);
            const {publicKey, privateKey} = oneledger.deriveKeyPair(seed);
            // console.log(publicKey);
            // console.log(privateKey);
            oneledger.verifySignature(rawTxmessage, signature, publicKey, function (error, result) {
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
            if (error) should.fail(error, null, "verify signature for OLT should be ok, but : " + error.message);
            should.ok(result, "signature verify should be true")
        });
    })
});
