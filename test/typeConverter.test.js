const typeConverter = require("../typeConverter");
const masterkey = require("../masterkey");
const should = require('should');

describe("test connect two hex strings", function () {
    for (let i = 0; i < 10000; i++) {
        it("test " + i, function () {
            const {key, chainCode} = masterkey.masterKeyGenerator(masterkey.mnemonicGenerator24());
            should.equal(typeConverter.hexStrConcatenation({key, chainCode}), typeConverter.hexStrConcatenation(typeConverter.uint8arrayToHexStr(key) + typeConverter.uint8arrayToHexStr(chainCode)));
        })
    }
});


