const masterkeyManager = require("../masterkeyManager");


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