const masterkey = require("../masterkey");
const typeConverter = require("../typeConverter");
const ethereum = require("../ethereum");
const should = require('should');
const secp256k1 = require('secp256k1');

const keyPath = "m/44'/60'/0'/0/0";

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

describe("test derive private key for ETH", function () {
    it("test 1", function () {
        const uint8arrayMasterKey = typeConverter.hexStrToUint8Array(masterKey.key);
        const derivedPrivateKey = ethereum.derivePrivateKey(uint8arrayMasterKey, keyPath);
        // console.log(derivedPrivateKey);
        // console.log(typeConverter.bufferToHexStr(derivedPrivateKey));
        should.equal(derivedPrivateKey.length, 32, "derived private key should be 64 bytes long")
        should.ok(ethereum.verifyPrivateKey(derivedPrivateKey))
    })
});

describe("test verify private key for ETH", function () {
    it("test 1", function () {
        const uint8arrayPrivateKey = typeConverter.hexStrToUint8Array("ea136de6b7570a214fac5275cc89e484a2d87da28c530f867a282c2c530bcde2");
        const result = ethereum.verifyPrivateKey(uint8arrayPrivateKey);
        // console.log(result);
        should.ok(result)
    })
});

describe("test derive compressed public key for ETH", function () {
    it("test 1", function () {
        const uint8arrayPrivateKey = typeConverter.hexStrToUint8Array("ea136de6b7570a214fac5275cc89e484a2d87da28c530f867a282c2c530bcde2");
        const derivedPublicKey = ethereum.derivePublicKey(uint8arrayPrivateKey);
        // console.log(derivedPublicKey);
        should.equal(derivedPublicKey.length, 66, "derived pubkey should be 66 chars with type byte");
        should.ok(secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(derivedPublicKey)))
    })
});

describe("test derive address for ETH", function () {
    it("test 1", function () {
        const compressedHexPublicKey = "02ae1e3eb43b11ad4f49869a75e5dc1aaf197857b3792f03756838b7237adb287d";
        const uncompressedHexPublicKey = "04ae1e3eb43b11ad4f49869a75e5dc1aaf197857b3792f03756838b7237adb287d8102ef69499ca466e824461a7fdf132627a5d2238fc8dda9abc3af145a6026e0";
        const unaddress = ethereum.deriveAddress(uncompressedHexPublicKey);
        const address = ethereum.deriveAddress(compressedHexPublicKey);
        // console.log(address);
        should.equal(unaddress, address, "address derived from uncompressed pubkey should be identical with address derived from compressed pubkey");
        should.equal(address.length, 42, "address should be 42 chars")
    })
});

describe("test sign tx for ETH", function () {
    it("test 1", function () {
        const uint8ArrayKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8ArrayKeychaincode = typeConverter.hexStrToUint8Array( masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption(masterkeyPassword, uint8ArrayKeypart, uint8ArrayKeychaincode);
        const txParams = {
            nonce: 1,
            gasPrice: 1,
            gasLimit: 100,
            to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
            value: 1,
            data: '0x7f4e616d65526567000000000000000000000000000000000000000000000000003057307f4e616d6552656700000000000000000000000000000000000000000000000000573360455760415160566000396000f20036602259604556330e0f600f5933ff33560f601e5960003356576000335700604158600035560f602b590033560f60365960003356573360003557600035335700',
        };
        ethereum.signForSignature(txParams, masterkeyPassword, encryptedMasterKey, keyPath, function (error, signedSeralizedTx) {
            should.ok(error === null, "sign eth tx to get signature should be no error")
            // console.log(signedSeralizedTx);
        });
    })
});
