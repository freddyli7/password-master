const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");
const ethereum = require("../ethereum");
const should = require('should');
const secp256k1 = require('secp256k1');

const keyPath = "m/44'/60'/0'/0/0";

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const masterKeyPassword = "123456";

describe("test derive privateKey for ETH", function () {
    it("test 1", function () {
        const derivedPrivateKey = ethereum.derivePrivateKey(masterKeySeedHex, keyPath);
        // console.log(derivedPrivateKey);
        // console.log(typeConverter.bufferToHexStr(derivedPrivateKey));
        should.equal(derivedPrivateKey.length, 32, "derived privateKey should be 64 bytes long");
        should.ok(ethereum.verifyPrivateKey(derivedPrivateKey))
    })
});

describe("test verify privateKey for ETH", function () {
    it("test 1", function () {
        const bufferPrivateKey = typeConverter.hexStrToBuffer("4951d19a433421fcbda931abe0642faf4831280d862ba4108351afc8b5dfa6a3");
        const result = ethereum.verifyPrivateKey(bufferPrivateKey);
        // console.log(result);
        should.ok(result)
    })
});

describe("test derive compressed publicKey for ETH", function () {
    it("test 1", function () {
        const bufferPrivateKey = typeConverter.hexStrToBuffer("4951d19a433421fcbda931abe0642faf4831280d862ba4108351afc8b5dfa6a3");
        const derivedPublicKey = ethereum.derivePublicKey(bufferPrivateKey);
        // console.log(derivedPublicKey);
        should.equal(derivedPublicKey.length, 66, "derived publicKey should be 66 chars including 2 chars chain prefix");
        should.ok(secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(derivedPublicKey)))
    })
});

describe("test derive address for ETH", function () {
    it("test 1", function () {
        const compressedHexPublicKey = "02ae1e3eb43b11ad4f49869a75e5dc1aaf197857b3792f03756838b7237adb287d";
        const uncompressedHexPublicKey = "04ae1e3eb43b11ad4f49869a75e5dc1aaf197857b3792f03756838b7237adb287d8102ef69499ca466e824461a7fdf132627a5d2238fc8dda9abc3af145a6026e0";
        const uncompressedAddress = ethereum.deriveAddress(uncompressedHexPublicKey);
        const compressedAddress = ethereum.deriveAddress(compressedHexPublicKey);
        // console.log(uncompressedAddress);
        // console.log(compressedAddress);
        should.equal(uncompressedAddress, compressedAddress, "address derived from uncompressed pubkey should be identical with address derived from compressed pubkey");
        should.equal(uncompressedAddress.length, 42, "address should be 42 chars");
        should.equal(uncompressedAddress.substring(0, 2), "0x", "address should start with 0x");
    })
});

const addressVerifyTestcases = [
    {
        name: "test 1, valid ETH address",
        input: "0x39DbD379159cCEe4C3A35ECf5923aeEcBB2b003D",
        expect: true
    },
    {
        name: "test 2, valid ETH address",
        input: "0xcbADb227Bd71d54dB80Ec016c655b49C08ee551f",
        expect: true
    },
    {
        name: "test 3, valid ETH address",
        input: "0x45d958dF7a74F045480b6316D8776D08aA2f279C",
        expect: true
    },
    {
        name: "test 4, valid ETH address",
        input: "0x00310547719ec79d52A735339bFf9F9CBfE9F7a7",
        expect: true
    },
    {
        name: "test 5, valid ETH address",
        input: "0x246757Fa2336d8F0570767A8014789A59B069684",
        expect: true
    },
    {
        name: "test 6, invalid ETH address",
        input: "0x0ba158d7d2ea60a091def2c85ad2f7281533218f",
        expect: true
    },
    {
        name: "test 7, invalid ETH address, 0x + 39 chars",
        input: "0x0ba158d7d2ea60a091def2c85ad2f7281533218",
        expect: false
    },
    {
        name: "test 8, invalid ETH address, without 0x",
        input: "0ba158d7d2ea60a091def2c85ad2f7281533218f",
        expect: false
    },
    {
        name: "test 9, invalid ETH address, only 0x",
        input: "0x",
        expect: false
    },
    {
        name: "test 9, invalid ETH address, empty",
        input: "",
        expect: false
    },
    {
        name: "test 10, invalid ETH address, null",
        input: null,
        expect: false
    },
    {
        name: "test 11, invalid ETH address, undefined",
        input: undefined,
        expect: false
    }
];

describe("test verify derived address for ETH", function () {
    addressVerifyTestcases.forEach(testcase => {
        it(testcase.name, function () {
            should.equal(ethereum.verifyAddress(testcase.input), testcase.expect, "derived address validation should be " + testcase.expect)
        })
    })
});

describe("test sign tx for ETH", function () {
    it("test 1", async function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const txParams = {
            nonce: 1,
            gasPrice: 1,
            gasLimit: 100,
            to: '0x034ca1740f01ae3e7fa6a2fc6b2afde39324f282',
            value: 1,
            data: '0x7f4e616d65526567000000000000000000000000000000000000000000000000003057307f4e616d6552656700000000000000000000000000000000000000000000000000573360455760415160566000396000f20036602259604556330e0f600f5933ff33560f601e5960003356576000335700604158600035560f602b590033560f60365960003356573360003557600035335700',
        };
        const data = {
            txParams,
            password: masterKeyPassword,
            encryptedMasterKeySeed,
            keyPath
        };
        const signedSeralizedTx = await ethereum.signForSignature(data).catch(error => {
            should.ok(error === null, "sign eth tx to get signature should be no error")
        });
        console.log("signedSeralizedTx :", signedSeralizedTx);
        should.exist(signedSeralizedTx);
    })
});
