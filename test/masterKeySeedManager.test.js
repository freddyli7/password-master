const masterKeySeedManager = require("../masterKeySeedManager");
const should = require('should');

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

const masterKeyPassword = "123456";
const wrongMasterKeyPassword = "safa41231asdrf";

describe("test new master key", function () {
    it("test mnemonic generate", function () {
        const masterKeySeedObj = new masterKeySeedManager(mnemonicArray, masterKeyPassword);
        // console.log(masterKeySeedObj);
        const masterkeySeed = JSON.parse(masterKeySeedObj.encryptedMasterKeySeed);
        should.equal(masterkeySeed.ct.length, 128, "encrypted masterkeySeed ct part should be 128 chars");
        should.equal(masterKeySeedObj.masterKeySeedAddress.length, 42, "masterkeyseed address should be 42 chars");
        should.equal(masterKeySeedObj.masterKeySeedAddress.substring(0, 2), "0x", "masterkeyseed address should start with 0x")
    })
});

describe("test export new masterKeySeed info", function () {
    it("test mnemonic generate", function () {
        const mm = new masterKeySeedManager(mnemonicArray, "123456");
        mm.getMasterKeySeedInfo(function (encryptedMasterKeySeed, masterKeySeedAddress) {
            // console.log(encryptedMasterKeySeed);
            // console.log(masterKeySeedAddress);
            const masterKeySeedObj = JSON.parse(encryptedMasterKeySeed);
            should.equal(masterKeySeedObj.ct.length, 128, "encrypted masterkeySeed ct part should be 128 chars");
            should.equal(masterKeySeedAddress.length, 42, "masterkeyseed address should be 42 chars")
            should.equal(masterKeySeedAddress.substring(0, 2), "0x", "masterkeyseed address should start with 0x")
        })
    })
});

describe("test unlock encrypted master key seed", function () {
    it("test 1, wrong password, should get false", async function () {
        const mm = new masterKeySeedManager(mnemonicArray, "123456");
        const unlockResult = await mm.unlockMasterKeySeed(wrongMasterKeyPassword).catch(err => {
            // console.log(err);
            should.equal(err.error.code, -11000)
        });
        // console.log(unlockResult);
        if (typeof unlockResult !== "undefined") {
            should.fail(unlockResult, undefined, "wrong password should not be able to unlock")
        }
    });
    it("test 2, correct password, should get true", async function () {
        const mm = new masterKeySeedManager(mnemonicArray, "123456");
        const unlockResult = await mm.unlockMasterKeySeed(masterKeyPassword).catch(err => {
            should.fail(err, undefined, "correct password should be able to unlock successfully")
        });
        should.ok(unlockResult)
    });
});