const masterkeyManager = require("../masterkeyManager");
const should = require('should');

describe("test new master key", function () {
    it("test mnemonic generate", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mm = new masterkeyManager(mnemonic, "123456");
        console.log(mm);
    })
});

describe("test export new master key", function () {
    it("test mnemonic generate", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mm = new masterkeyManager(mnemonic, "123456");
        mm.exportMasterkey(function (encryptedMasterKey, masterKeyAddress) {
            console.log(encryptedMasterKey);
            console.log(masterKeyAddress);
        })
    })
});

describe("test unlock master key", function () {
    it("test 1, wrong password, should get false", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mm = new masterkeyManager(mnemonic, "123456");
        mm.unlockMasterKey("123456sdfsd",function (unlockResult) {
            should.ok(!unlockResult)
        });
    });
    it("test 2, correct password, should get true", function () {
        const mnemonic = "turtle issue gloom race blast final parent park toss atom aware surprise tribe genuine claim hobby aware alcohol wish index tiny hope have cage";
        const mm = new masterkeyManager(mnemonic, "123456");
        mm.unlockMasterKey("123456",function (unlockResult) {
            should.ok(unlockResult)
        });
    });
});