const masterkeyManager = require("../masterkeyManager");
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

const masterkeyPassword = "123456";
const wrongMasterkeyPassword = "safa41231asdrf";

describe("test new master key", function () {
    it("test mnemonic generate", function () {
        const mobj = new masterkeyManager(mnemonicArray, masterkeyPassword);
        // console.log(mobj);
        const masterkey = JSON.parse(mobj.encryptedMasterKey);
        should.equal(masterkey.ct.length, 128, "encrypted masterkey ct part should be 128 chars");
        should.equal(mobj.masterKeyAddress.length, 40, "masterkey address should be 40 chars")
    })
});

describe("test export new master key", function () {
    it("test mnemonic generate", function () {
        const mm = new masterkeyManager(mnemonicArray, "123456");
        mm.getMasterKeyInfo(function (encryptedMasterKey, masterKeyAddress) {
            // console.log(encryptedMasterKey);
            // console.log(masterKeyAddress);
            const masterkey = JSON.parse(encryptedMasterKey);
            should.equal(masterkey.ct.length, 128, "encrypted masterkey ct part should be 128 chars");
            should.equal(masterKeyAddress.length, 40, "masterkey address should be 40 chars")
        })
    })
});

describe("test unlock master key", function () {
    it("test 1, wrong password, should get false", function () {
        const mm = new masterkeyManager(mnemonicArray, "123456");
        mm.unlockMasterKey(wrongMasterkeyPassword, function (unlockResult) {
            should.ok(!unlockResult)
        });
    });
    it("test 2, correct password, should get true", function () {
        const mm = new masterkeyManager(mnemonicArray, "123456");
        mm.unlockMasterKey(masterkeyPassword, function (unlockResult) {
            should.ok(unlockResult)
        });
    });
});