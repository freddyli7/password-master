const masterkey = require("../masterkey");
const should = require('should');
const typeConverter = require("../typeConverter");

describe("test mnemonic generate", function () {
    it("test mnemonic generate", function () {
        const mnemonic = masterkey.mnemonicGenerator24();
        console.log(mnemonic);
    })
});

describe("test master key generation", function () {
    it("test master key generation with different mnemonic", function () {
        let k, c = "";
        for (let i = 0; i < 100000; i++) {
            const seed = masterkey.mnemonicGenerator24();
            const {key, chainCode} = masterkey.masterKeyGenerator(seed);
            if (key.length !== 32 || chainCode.length !== 32) should.fail(null, 32, 'key or chainCode length is wrong');
            if (i > 0 && (k === typeConverter.uint8arrayToHexStr(key) || c === typeConverter.uint8arrayToHexStr(chainCode))) should.fail(key, k, 'key or chainCode is different');
            k = typeConverter.uint8arrayToHexStr(key);
            c = typeConverter.uint8arrayToHexStr(chainCode);
            // console.log(k);
            // console.log(c);
        }
    }).timeout(10000);
    it("test master key generation with the same mnemonic", function () {
        let k, c = "";
        const seed = masterkey.mnemonicGenerator24();
        for (let i = 0; i < 100000; i++) {
            const {key, chainCode} = masterkey.masterKeyGenerator(seed);
            if (key.length !== 32 || chainCode.length !== 32) should.fail(null, 32, 'key or chainCode length is wrong');
            if (i > 0 && (k !== typeConverter.uint8arrayToHexStr(key) || c !== typeConverter.uint8arrayToHexStr(chainCode))) should.fail(key, k, 'key or chainCode is different');
            k = typeConverter.uint8arrayToHexStr(key);
            c = typeConverter.uint8arrayToHexStr(chainCode);
            // console.log(k);
            // console.log(c);
            // console.log(key);
            // console.log(chainCode);
        }
    }).timeout(10000);
});

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

const mnemonicArray = [ { index: 1, word: 'turtle' },
    { index: 2, word: 'issue' },
    { index: 3, word: 'gloom' },
    { index: 4, word: 'race' },
    { index: 5, word: 'blast' },
    { index: 6, word: 'final' },
    { index: 7, word: 'parent' },
    { index: 8, word: 'park' },
    { index: 9, word: 'toss' },
    { index: 10, word: 'atom' },
    { index: 11, word: 'aware' },
    { index: 12, word: 'surprise' },
    { index: 13, word: 'tribe' },
    { index: 14, word: 'genuine' },
    { index: 15, word: 'claim' },
    { index: 16, word: 'hobby' },
    { index: 17, word: 'aware' },
    { index: 18, word: 'alcohol' },
    { index: 19, word: 'wish' },
    { index: 20, word: 'index' },
    { index: 21, word: 'tiny' },
    { index: 22, word: 'hope' },
    { index: 23, word: 'have' },
    { index: 24, word: 'cage' } ];

describe("test encrypt master key", function () {
    it("test 1", function () {
        const masterKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const masterChainCode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption("123456", masterKeypart, masterChainCode);
        console.log(encryptedMasterKey);
    })
});

describe("test decrypt master key", function () {
    it("test with wrong password", function () {
        const encryptedMasterKey = '{"iv":"RiSLQyrzQyfQWDPJjIIhug==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"TQG4HWB0kxvXTbclS2i8mQ==","ct":"Dn2bUTNh6SasdlVvsIdMqBkyOIUk0Fn6737U3nq3h9DI1O46fFsP8UvilkxKu4iqrKAJ752QfwEjf4MbXG/10pCBD1LzAq00QKpesiHgw2dczL+ect7YfWiN7fpTz8q4"}';
        masterkey.masterKeyDecryption("12345", encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
            // console.log(error.toString());
            should.equal(decryptedMasterKey, null);
            should.equal(decryptedMasterChaincode, null);
            should.equal(error.message, "Wrong password");
        });
    });
    it("test with correct password", function () {
        const encryptedMasterKey = '{"iv":"RiSLQyrzQyfQWDPJjIIhug==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"TQG4HWB0kxvXTbclS2i8mQ==","ct":"Dn2bUTNh6SasdlVvsIdMqBkyOIUk0Fn6737U3nq3h9DI1O46fFsP8UvilkxKu4iqrKAJ752QfwEjf4MbXG/10pCBD1LzAq00QKpesiHgw2dczL+ect7YfWiN7fpTz8q4"}';
        masterkey.masterKeyDecryption("123456", encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
            console.log(decryptedMasterKey.length);
            console.log(decryptedMasterChaincode.length);
            should.deepEqual(decryptedMasterKey, typeConverter.hexStrToUint8Array(masterKey.key));
            should.deepEqual(decryptedMasterChaincode, typeConverter.hexStrToUint8Array(masterKey.chainCode));
        });
    })
});

describe("test derive master key's 32 bytes public key", function () {
    it("test 1", function () {
        const uint8Arraykey = typeConverter.hexStrToUint8Array(masterKey.key + masterKey.chainCode);
        const masterPublicKey = masterkey.getMasterPublicKey(uint8Arraykey);
        console.log(masterPublicKey);
    })
});

describe("test derive master key's address", function () {
    it("test 1", function () {
        const masterPublicKey = "AY4I6oNz1kI7bntGeeG64NBx+FEGkfvVQYP+ZUwll84=";
        const masterAddress = masterkey.getMasterAddress(masterPublicKey);
        console.log(masterAddress);
    })
});

describe("test recovery master key", function () {
    it("test 1", function () {
        const masterAddress = masterkey.recoveryMasterKey(mnemonicArray);
        console.log(masterAddress);
    })
});

describe("test unlock master key", function () {
    it("test 1, wrong password, should get false", function () {
        const encryptedMasterKey = '{"iv":"RiSLQyrzQyfQWDPJjIIhug==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"TQG4HWB0kxvXTbclS2i8mQ==","ct":"Dn2bUTNh6SasdlVvsIdMqBkyOIUk0Fn6737U3nq3h9DI1O46fFsP8UvilkxKu4iqrKAJ752QfwEjf4MbXG/10pCBD1LzAq00QKpesiHgw2dczL+ect7YfWiN7fpTz8q4"}';
        masterkey.unlockMasterKey("123456sdfsd", encryptedMasterKey,function (unlockResult) {
            should.ok(!unlockResult)
        });
    });
    it("test 2, correct password, should get true", function () {
        const encryptedMasterKey = '{"iv":"RiSLQyrzQyfQWDPJjIIhug==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"TQG4HWB0kxvXTbclS2i8mQ==","ct":"Dn2bUTNh6SasdlVvsIdMqBkyOIUk0Fn6737U3nq3h9DI1O46fFsP8UvilkxKu4iqrKAJ752QfwEjf4MbXG/10pCBD1LzAq00QKpesiHgw2dczL+ect7YfWiN7fpTz8q4"}';
        masterkey.unlockMasterKey("123456", encryptedMasterKey,function (unlockResult) {
            should.ok(unlockResult)
        });
    });
});

describe("test mnemonic to array", function () {
    it("test 1", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const list = masterkey.mnemonicStrToArray(mnemonic);
        console.log(list);
    })
});

describe("test mnemonic array to string", function () {
    it("test 1", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mnemonicStr = masterkey.mnemonicArrayToStr(mnemonicArray);
        console.log(mnemonicStr);
        should.equal(mnemonicStr, mnemonic)
    })
});