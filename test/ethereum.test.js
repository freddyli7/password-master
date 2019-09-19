const masterkey = require("../masterkey");
const typeConverter = require("../typeConverter");
const ethereum = require("../ethereum");

const should = require('should');

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

describe("test derive private key for ETH", function () {
    it("test 1", function () {
        const uint8arrayMasterKey = typeConverter.hexStrToUint8Array(masterKey.key + masterKey.chainCode);
        const derivedPrivateKey = ethereum.derivePrivateKey(uint8arrayMasterKey, keyPath);
        console.log(derivedPrivateKey);
    })
});

describe("test verify private key for ETH", function () {
    it("test 1", function () {
        const uint8arrayPrivateKey = typeConverter.hexStrToUint8Array("64283bbf60f27d27134cd4da3ca58bca15458df99208ff20a08784025d3b9592");
        const derivedPrivateKey = ethereum.verifyPrivateKey(uint8arrayPrivateKey, keyPath);
        console.log(derivedPrivateKey);
    })
});

describe("test derive uncompressed public key for ETH", function () {
    it("test 1", function () {
        const uint8arrayPrivateKey = typeConverter.hexStrToUint8Array("64283bbf60f27d27134cd4da3ca58bca15458df99208ff20a08784025d3b9592");
        const derivedPublicKey = ethereum.derivePublicKey(uint8arrayPrivateKey);
        console.log(derivedPublicKey);
    })
});

describe("test derive address for ETH", function () {
    it("test 1", function () {
        const hexPublicKey = "907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb7180b73f0cecf37ae303d79d44e0487b56f553e06eb7e9ac1c3f1ed09e653ba7";
        const address = ethereum.deriveAddress(hexPublicKey);
        console.log(address);
    })
});

describe("test sign tx for ETH", function () {
    it("test 1", function () {
        const uint8ArrayKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8ArrayKeychaincode = typeConverter.hexStrToUint8Array( masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption("123456", uint8ArrayKeypart, uint8ArrayKeychaincode);
        const txParams = {
            nonce: 1,
            gasPrice: 1,
            gasLimit: 100,
            to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
            value: 1,
            data: '0x7f4e616d65526567000000000000000000000000000000000000000000000000003057307f4e616d6552656700000000000000000000000000000000000000000000000000573360455760415160566000396000f20036602259604556330e0f600f5933ff33560f601e5960003356576000335700604158600035560f602b590033560f60365960003356573360003557600035335700',
        };
        ethereum.signForSignature(txParams, "123456", encryptedMasterKey, keyPath, function (error, signedSeralizedTx) {
            console.log(error);
            console.log(signedSeralizedTx);
        });
    })
});
