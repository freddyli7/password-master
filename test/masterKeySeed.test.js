const masterKeySeed = require("../masterKeySeed");
const should = require('should');
const typeConverter = require("../typeConverter");

describe("test mnemonic generate", function () {
    it("test mnemonic generate, return mnemonic word array should be 24 long", function () {
        const mnemonicArray = masterKeySeed.mnemonicGenerator24();
        // console.log(mnemonicArray);
        should.equal(mnemonicArray.length, 24, "return mnemonic word array should be 24 long")
    })
});

describe("test master key seed generation", function () {
    it("test master key generation with different mnemonic", function () {
        let k = "";
        const kcmap = new Map();
        for (let i = 0; i < 10000; i++) {
            const seed = masterKeySeed.mnemonicGenerator24();
            const keyseed = masterKeySeed.masterKeySeedGenerator(seed);
            if (keyseed.length !== 64) should.fail(keyseed.length, 64, 'masterKeySeed length is wrong, should be 64');
            if (i > 0 && k === typeConverter.bufferToHexStr(keyseed)) should.fail(typeConverter.bufferToHexStr(keyseed), k, 'keyseed is the repeated');
            k = typeConverter.bufferToHexStr(keyseed);
            kcmap.set(k, i);
            // console.log(keyseed);
            // console.log(i);
        }
        should.equal(kcmap.size, 10000, "10000 master key should be different")
    }).timeout(200000);
    it("test master key generation with the same mnemonic", function () {
        let k, c = "";
        const kcmap = new Map();
        const seed = masterKeySeed.mnemonicGenerator24();
        for (let i = 0; i < 10000; i++) {
            const keyseed = masterKeySeed.masterKeySeedGenerator(seed);
            if (keyseed.length !== 64) should.fail(keyseed.length, 64, 'keyseed length is wrong, should be 64');
            if (i > 0 && k !== typeConverter.bufferToHexStr(keyseed)) should.fail(typeConverter.bufferToHexStr(keyseed), k, 'keyseed is different');
            k = typeConverter.bufferToHexStr(keyseed);
            // console.log(k);
            // console.log(i);
            kcmap.set(k, i);
        }
        should.equal(kcmap.size, 1, "10000 master key should be the same")
    }).timeout(200000);
});

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const encryptedMasterKeySeed =
'{"iv":"PH4z9XbXfakflPVcFj+ncQ==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"x9YNnUBWkX7dl07qCVfUHQ==","ct":"Ft4mtrE7BVhcuYtHNXR2q/bPvQ3bwgd8jSQrSRJBi9/20zM8x0VbKbGWP6Qqn7+Ro6JMuTziw38sHXUF3RhS2cJ8O/riMCauU6OKzacyQHLahUgGuV639vHMHGgP+MSCeCBEO2zv/QilmuCVZKA/mFf9rUUM/6Cj4zIb7Aq29MM9xlAQNSvGV40GTlEf6pV4cTL+wK04uAwbI0yTXYNH3yITEpFn+c1erAZoE/hqgpn+aYF/"}';
const masterkeyPassword = "123456";
const wrongPassword = "123sdxf123123";

describe("test encrypt and decrypt master key seed", function () {
    it("encrypted master key seed and decrypt it", function () {
        for (let i = 0; i < 1000; i++) {
            // console.log(typeConverter.hexStrToBuffer(masterKeySeedHex));
            const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterkeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
            // console.log(encryptedMasterKeySeed);
            masterKeySeed.masterKeySeedDecryption(wrongPassword, encryptedMasterKeySeed, function (error, decryptedMasterKeySeed) {
                // console.log(error.message());
                should.equal(decryptedMasterKeySeed, null);
                should.equal(error.message, "Wrong password");
            });
            masterKeySeed.masterKeySeedDecryption(masterkeyPassword, encryptedMasterKeySeed, function (error, decryptedMasterKeySeed) {
                // console.log(decryptedMasterKeySeed);
                // console.log(typeConverter.hexStrToBuffer(masterKeySeedHex));
                should.equal(error, null);
                should.deepEqual(decryptedMasterKeySeed, typeConverter.hexStrToBuffer(masterKeySeedHex));
            });
        }
    }).timeout(20000);
});

describe("test derive masterKeySeed public key", function () {
    it("public key should be 44 chars long", function () {
        const masterPublicKey = masterKeySeed.getMasterKeySeedPublicKey(typeConverter.hexStrToBuffer(masterKeySeedHex));
        console.log(masterPublicKey);
        should.equal(masterPublicKey.length, 44, "public key should be 44 chars long")
    })
});

describe("test masterKeySeed address", function () {
    it("master address should be 40 chars long", function () {
        const masterPublicKey = "GtXKmjp9UHVOLCj5GsP0bpL7s0WSZ7JMeB/SiW4N+0U=";
        const masterAddress = masterKeySeed.getMasterKeySeedAddress(masterPublicKey);
        console.log(masterAddress);
        should.equal(masterAddress.length, 42, "master seed address should be 42 chars long");
        should.equal(masterAddress.substring(0,2), "0x", "master seed address should start with 0x")
    })
});

describe("test recovery master key", function () {
    it("test 1", function () {
        // recovery address from mnemonic words array
        const masterAddress = masterKeySeed.recoveryMasterKeySeed(mnemonicArray);
        // address from masterKeySeed generator
        const keyseed = masterKeySeed.masterKeySeedGenerator(mnemonicArray);
        should.equal(masterAddress, masterKeySeed.getMasterKeySeedAddress(masterKeySeed.getMasterKeySeedPublicKey(keyseed)), "the address derived from user recovery mnemonic words should be identical with the address stored in master key local file")
    })
});

describe("test unlock master key seed", function () {
    it("test 1, wrong password, should get false", function () {
        masterKeySeed.unlockMasterKeySeed(wrongPassword, encryptedMasterKeySeed, function (unlockResult) {
            should.ok(!unlockResult)
        });
    });
    it("test 2, correct password, should get true", function () {
        masterKeySeed.unlockMasterKeySeed(masterkeyPassword, encryptedMasterKeySeed, function (unlockResult) {
            should.ok(unlockResult)
        });
    });
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


describe("test mnemonic to array", function () {
    it("test 1", function () {
        let mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const list = masterKeySeed.mnemonicStrToArray(mnemonic);
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

describe("test mnemonic array to string", function () {
    it("test 1", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mnemonicStr = masterKeySeed.mnemonicArrayToStr(mnemonicArray);
        // console.log(mnemonicStr);
        should.equal(mnemonicStr, mnemonic)
    })
});