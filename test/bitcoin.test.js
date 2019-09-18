const masterkey = require("../masterkey");
const typeConverter = require("../typeConverter");
const bitcoin = require("../bitcoin");

const should = require('should');

const keyPath = "m/44'/403'/0'/0'/1'";

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

/* *****************************   Secp256k1 For BTC  ***************************** */

describe("test derive private key from master key for BTC", function () {
    it("test 1", function () {
        const uint8arrayMasterKey = typeConverter.hexStrToUint8Array(masterKey.key);
        const derivedPrivatekey = bitcoin.derivePrivateKeyBTC(uint8arrayMasterKey, keyPath);
        console.log(derivedPrivatekey);
        console.log(typeConverter.uint8arrayToHexStr(derivedPrivatekey));
    })
});

describe("test verify private key for BTC", function () {
    it("test 1", function () {
        const derivedPrivatekey = typeConverter.hexStrToUint8Array("cd76dbfcbf5092c6b521dc8c00e9d1481efab3b4483d351a98066ad8d1257514");
        const ok = bitcoin.verifyPrivateKeyBTC(derivedPrivatekey);
        should.ok(ok, "verify private key of BTC should be true")
    })
});

describe("test derive public key from private key for BTC", function () {
    it("test 1", function () {
        const derivedPrivatekey = typeConverter.hexStrToUint8Array("cd76dbfcbf5092c6b521dc8c00e9d1481efab3b4483d351a98066ad8d1257514");
        const publicKey = bitcoin.derivePublicKeyBTC(derivedPrivatekey);
        console.log(publicKey);
    })
});

describe("test derive address from public key for BTC", function () {
    it("test p2pk", function () {
        const derivedPublicKeyWithPrefixHex = "03907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb";
        const p2PKPubkey = bitcoin.deriveP2PKPubKey(derivedPublicKeyWithPrefixHex);
        console.log("p2PKPubkey", p2PKPubkey);
    });
    it("test p2pkh", function () {
        const derivedPublicKeyWithPrefixHex = "03907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb";
        const p2PKHaddress = bitcoin.deriveP2PKHAddress(derivedPublicKeyWithPrefixHex);
        console.log("p2PKHaddress", p2PKHaddress);
    });

    // it("test p2ms", function () {
    //     const derivedPublicKeyWithPrefixHex = "03907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb";
    //     const p2MSaddress = bitcoin.deriveP2MSAddress(derivedPublicKeyWithPrefixHex);
    //     console.log("p2MSaddress", p2MSaddress);
    // });
    //
    // it("test p2wpkh", function () {
    //     const derivedPublicKeyWithPrefixHex = "03907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb";
    //     const p2WPKHaddress = bitcoin.deriveP2WPKHAddress(derivedPublicKeyWithPrefixHex);
    //     console.log("p2WPKHaddress", p2WPKHaddress);
    // });it("test p2wsh", function () {
    //     const derivedPublicKeyWithPrefixHex = "03907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb";
    //     const p2WSHaddress = bitcoin.deriveP2WSHAddress(derivedPublicKeyWithPrefixHex);
    //     console.log("p2WSHaddress", p2WSHaddress);
    // });
    // it("test p2sh", function () {
    //     const derivedPublicKeyWithPrefixHex = "03907c8e2e382ce85096c81d5fa0c86de0e76c38e54f2b60b999a9fd7ff610f5cb";
    //     const p2SHaddress = bitcoin.deriveP2SHAddress(derivedPublicKeyWithPrefixHex);
    //     console.log("p2SHaddress", p2SHaddress);
    // });
});

const rawTxmessageBTC = "072a8543e388c4155ccbcd325f129000214095725598721cea986fcd0fc38d6a";
describe("test sign tx for BTC", function () {
    it("test 1", function () {
        const uint8ArrayKeypart = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8ArrayKeychaincode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        const encryptedMasterKey = masterkey.masterKeyEncryption("123456", uint8ArrayKeypart, uint8ArrayKeychaincode);
        bitcoin.signForSignatureBTC(rawTxmessageBTC, "123456", encryptedMasterKey, keyPath, function (error, signature, recovery) {
            console.log(signature);
            console.log(typeConverter.bufferToHexStr(signature));
            console.log(recovery);
        });
    })
});

describe("test verify signature for BTC", function () {
    it("test 1", function () {
        const signatureBTChex = "ff6fbf5bbece2e46595fe484bcc9fcfe33d43b20e610cdbe2c98e32dca5bb3a2489f0f47fa4b2ec00f436ff1039bcf571aee2b7a150e6c045fde259558eb2468";
        const publicKeyhex = "024cbb9c068cdc3f69e14bfc0788f19500a1f19950af317e5b349e3aa1f71032e0";
        const ok = bitcoin.verifySignatureBTC(rawTxmessageBTC, signatureBTChex, publicKeyhex);
        should.ok(ok, "verify signature should be true")
    })
});
