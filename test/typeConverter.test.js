const typeConverter = require("../typeConverter");
const masterKeySeed = require("../masterKeySeed");
const {getMasterKeyFromSeed} = require('ed25519-hd-key');

const should = require('should');

describe("test connect two hex strings", function () {
    for (let i = 0; i < 1000; i++) {
        it("test " + i, function () {
            const seed = masterKeySeed.masterKeySeedGenerator(masterKeySeed.mnemonicGenerator24());
            const {key, chainCode} = getMasterKeyFromSeed(typeConverter.bufferToHexStr(seed));
            should.equal(typeConverter.hexStrConcatenation({
                key,
                chainCode
            }), typeConverter.hexStrConcatenation(typeConverter.uint8arrayToHexStr(key) + typeConverter.uint8arrayToHexStr(chainCode)));
        })
    }
});


