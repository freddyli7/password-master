const masterkey = require("../masterkey");
const should = require('should');
const typeConverter = require("../typeConverter");

describe("test mnemonic generate", function () {
    it("test mnemonic generate, return mnemonic word array should be 24 long", function () {
        const mnemonicArray = masterkey.mnemonicGenerator24();
        // console.log(mnemonicArray);
        should.equal(mnemonicArray.length, 24, "return mnemonic word array should be 24 long")
    })
});

describe("test master key generation", function () {
    it("test master key generation with different mnemonic", function () {
        let k, c = "";
        const kcmap = new Map();
        for (let i = 0; i < 100000; i++) {
            const seed = masterkey.mnemonicGenerator24();
            const {key, chainCode} = masterkey.masterKeyGenerator(seed);
            if (key.length !== 32) should.fail(key.length, 32, 'key length is wrong, should be 32');
            if (chainCode.length !== 32) should.fail(chainCode.length, 32, 'chainCode length is wrong, should be 32');
            if (i > 0) {
                if (k === typeConverter.uint8arrayToHexStr(key)) should.fail(typeConverter.uint8arrayToHexStr(key), k, 'key is different');
                if (c === typeConverter.uint8arrayToHexStr(chainCode)) should.fail(typeConverter.uint8arrayToHexStr(chainCode), c, 'chainCode is different');
            }
            k = typeConverter.uint8arrayToHexStr(key);
            c = typeConverter.uint8arrayToHexStr(chainCode);
            kcmap.set(k, c);
            // console.log(k);
            // console.log(c);
        }
        should.equal(kcmap.size, 100000, "100000 master key should be different")
    }).timeout(10000);
    it("test master key generation with the same mnemonic", function () {
        let k, c = "";
        const kcmap = new Map();
        const seed = masterkey.mnemonicGenerator24();
        for (let i = 0; i < 100000; i++) {
            const {key, chainCode} = masterkey.masterKeyGenerator(seed);
            if (key.length !== 32) should.fail(key.length, 32, 'key or chainCode length is wrong, should be 32');
            if (chainCode.length !== 32) should.fail(chainCode.length, 32, 'chainCode length is wrong, should be 32');
            if (i > 0) {
                if (k !== typeConverter.uint8arrayToHexStr(key)) should.fail(typeConverter.uint8arrayToHexStr(key), k, 'key is different');
                if (c !== typeConverter.uint8arrayToHexStr(chainCode)) should.fail(typeConverter.uint8arrayToHexStr(chainCode), c, 'chainCode is different');
            }
            k = typeConverter.uint8arrayToHexStr(key);
            c = typeConverter.uint8arrayToHexStr(chainCode);
            // console.log(k);
            // console.log(c);
            kcmap.set(k, c);
        }
        should.equal(kcmap.size, 1, "100000 master key should be the same")
    }).timeout(10000);
});

const masterKey = {
    key: "8401fbb9a7f7118da334a2bef549c6a6bb652093e6f74b11b1974fcf65ca36b4",
    chainCode: "018e08ea8373d6423b6e7b4679e1bae0d071f8510691fbd54183fe654c2597ce"
};
// masterkey in uint8array
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
const encryptedMasterKey = '{"iv":"SBjpiMl2sE37QHonGoltLA==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"+/y5tyeECgoakr8fkYXX6w==","ct":"zwUJHt8pdHiNrApgPlP+Mds01M/77I5E/Ms+8lxZQEHE084/N0ttT77Wpow4i7MtvihF6wkfnKfICkrUQ1jSRTYQHIyt26YQhmyRIkXhmUlnrOoyvd1eoNDYkhlNa7a4"}';
const masterkeyPassword = "123456";
const wrongPassword = "123sdxf123123";

describe("test encrypt master key", function () {
    it("encrypted master key and check if ct is 128 chars", function () {
        const masterKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const masterChainCode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption(masterkeyPassword, masterKeypart, masterChainCode);
        // console.log(encryptedMasterKey);
        const masterKeyObj = JSON.parse(encryptedMasterKey);
        should.equal(masterKeyObj.ct.length, 128, "encrypted master key's ct part should be 128 chars")
    })
});

describe("test decrypt master key", function () {
    it("test with wrong password, should return wrong pasword", function () {
        masterkey.masterKeyDecryption(wrongPassword, encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
            // console.log(error.message());
            should.equal(decryptedMasterKey, null);
            should.equal(decryptedMasterChaincode, null);
            should.equal(error.message, "Wrong password");
        });
    });
    it("test with correct password, should return decrypted master key and chaincode", function () {
        masterkey.masterKeyDecryption(masterkeyPassword, encryptedMasterKey, function (error, decryptedMasterKey, decryptedMasterChaincode) {
            // console.log(decryptedMasterKey.length);
            // console.log(decryptedMasterChaincode.length);
            should.deepEqual(decryptedMasterKey, typeConverter.hexStrToUint8Array(masterKey.key));
            should.deepEqual(decryptedMasterChaincode, typeConverter.hexStrToUint8Array(masterKey.chainCode));
        });
    })
});

describe("test derive master key's 32 bytes public key", function () {
    it("public key should be 44 chars long", function () {
        const uint8Arraykey = typeConverter.hexStrToUint8Array(masterKey.key + masterKey.chainCode);
        const masterPublicKey = masterkey.getMasterPublicKey(uint8Arraykey);
        // console.log(masterPublicKey);
        should.equal(masterPublicKey.length, 44, "public key should be 44 chars long")
    })
});

describe("test derive master key's address", function () {
    it("master address should be 40 chars long", function () {
        const masterPublicKey = "AY4I6oNz1kI7bntGeeG64NBx+FEGkfvVQYP+ZUwll84=";
        const masterAddress = masterkey.getMasterAddress(masterPublicKey);
        // console.log(masterAddress);
        should.equal(masterAddress.length, 40, "master address should be 40 chars long")
    })
});

describe("test recovery master key", function () {
    it("test 1", function () {
        // recovery address from mnemonic words array
        const masterAddress = masterkey.recoveryMasterKey(mnemonicArray);
        // address from masterkey generator
        const {key, chainCode} = masterkey.masterKeyGenerator(mnemonicArray);
        const hexData = {
            str1: typeConverter.uint8arrayToHexStr(key),
            str2: typeConverter.uint8arrayToHexStr(chainCode)
        };
        const uint8ArrayPriKey = typeConverter.hexStrToUint8Array(typeConverter.hexStrConcatenation(hexData));
        should.equal(masterAddress, masterkey.getMasterAddress(masterkey.getMasterPublicKey(uint8ArrayPriKey)), "the address derived from user recovery mnemonic words should be identical with the address stored in master key local file")
    })
});

describe("test unlock master key", function () {
    it("test 1, wrong password, should get false", function () {
        masterkey.unlockMasterKey(wrongPassword, encryptedMasterKey, function (unlockResult) {
            should.ok(!unlockResult)
        });
    });
    it("test 2, correct password, should get true", function () {
        masterkey.unlockMasterKey(masterkeyPassword, encryptedMasterKey, function (unlockResult) {
            should.ok(unlockResult)
        });
    });
});

describe("test mnemonic to array", function () {
    it("test 1", function () {
        let mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const list = masterkey.mnemonicStrToArray(mnemonic);
        // console.log(list);
        should.equal(list.length, 24, "mnemonic word list should be 24 long");
        let i = 1;
        let spaceIndex = 0;
        list.forEach(wordObj => {
            const {index, word} = wordObj;
            should.equal(index, i, "index of each word should match");
            spaceIndex = mnemonic.indexOf(" ");
            if (spaceIndex !== -1) should.equal(word, mnemonic.substring(0, spaceIndex));
            else should.equal(word, mnemonic, "each word should match");
            i++;
            mnemonic = mnemonic.substring(spaceIndex + 1, mnemonic.length)
        })
    })
});

const mnemonicArray = [{index: 1, word: 'turtle'},
    {index: 2, word: 'issue'},
    {index: 3, word: 'gloom'},
    {index: 4, word: 'race'},
    {index: 5, word: 'blast'},
    {index: 6, word: 'final'},
    {index: 7, word: 'parent'},
    {index: 8, word: 'park'},
    {index: 9, word: 'toss'},
    {index: 10, word: 'atom'},
    {index: 11, word: 'aware'},
    {index: 12, word: 'surprise'},
    {index: 13, word: 'tribe'},
    {index: 14, word: 'genuine'},
    {index: 15, word: 'claim'},
    {index: 16, word: 'hobby'},
    {index: 17, word: 'aware'},
    {index: 18, word: 'alcohol'},
    {index: 19, word: 'wish'},
    {index: 20, word: 'index'},
    {index: 21, word: 'tiny'},
    {index: 22, word: 'hope'},
    {index: 23, word: 'have'},
    {index: 24, word: 'cage'}];

describe("test mnemonic array to string", function () {
    it("test 1", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mnemonicStr = masterkey.mnemonicArrayToStr(mnemonicArray);
        // console.log(mnemonicStr);
        should.equal(mnemonicStr, mnemonic)
    })
});