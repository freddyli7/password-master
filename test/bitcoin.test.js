const masterkey = require("../masterkey");
const typeConverter = require("../typeConverter");
const bitcoin = require("../bitcoin");
const secp256k1 = require('secp256k1');
const bip32 = require("bip32");
const bitcoinjs = require('bitcoinjs-lib');

const should = require('should');
const keyPath = "m/44'/0'/0'/0/1";

const masterKey = {
    key: "8401fbb9a7f7118da334a2bef549c6a6bb652093e6f74b11b1974fcf65ca36b4",
    chainCode: "018e08ea8373d6423b6e7b4679e1bae0d071f8510691fbd54183fe654c2597ce"
};
const masterkeyPassword = "123456";
// masterkey and chaincode in uint8array
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
    it("test with wrong bitcoin network", function () {
        const uint8arrayMasterKey = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8arrayMasterChainCode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        bitcoin.derivePrivateKey(uint8arrayMasterKey, uint8arrayMasterChainCode, keyPath, "BITCOIN111", (error, derivedprikey) => {
            // console.log(error.message);
            should.equal(error.code, "-11011");
        });
    });
    it("test with valid bitcoin network", function () {
        const uint8arrayMasterKey = typeConverter.hexStrToUint8Array(masterKey.key);
        const uint8arrayMasterChainCode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
        bitcoin.derivePrivateKey(uint8arrayMasterKey, uint8arrayMasterChainCode, keyPath, "BITCOIN", (error, derivedprikey) => {
            // console.log(derivedprikey.length);
            // console.log(typeConverter.bufferToHexStr(derivedprikey));
            should.ok(bitcoin.verifyPrivateKey(derivedprikey));
        });
    });
});

describe("test derive public key from private key for BTC", function () {
    it("test 1", function () {
        // private key derived from masterkey + keypath
        const derivedPrivatekey = typeConverter.hexStrToUint8Array("79aae56fd5b68194fe66955efe2d04bd8fd9c7efb881d3a700e644ce29297f90");
        const publicKey = bitcoin.derivePublicKey(derivedPrivatekey);
        // console.log(publicKey);
        // verify derived public key
        should.ok(secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(publicKey)));
        // derive public key from BIP32 lib
        const node = bip32.fromPrivateKey(typeConverter.hexStrToBuffer(masterKey.key), typeConverter.hexStrToBuffer(masterKey.chainCode), bitcoinjs.networks.bitcoin);
        // compare public key derived from two different lib
        should.deepEqual(typeConverter.hexStrToBuffer(publicKey), node.derivePath(keyPath).publicKey, "two derived pubkey based on the same private key and keypath should be the same");
    })
});

describe("test different tx types for BTC", function () {
    it("test p2pk", function () {
        const derivedPublicKeyWithPrefixHex = "0350c1446da5894951e31bd8a7fa738d2551b9ce3ac24b0d830c09a94e81c6ca3e";
        const p2PKPubkey = bitcoin.deriveP2PKPubKey(derivedPublicKeyWithPrefixHex);
        // console.log("p2PKPubkey", p2PKPubkey);
        should.ok(secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(p2PKPubkey)), "verify derived P2PK public key should be true");

    });
    it("test p2pkh", function () {
        const derivedPublicKeyWithPrefixHex = "0350c1446da5894951e31bd8a7fa738d2551b9ce3ac24b0d830c09a94e81c6ca3e";
        const p2PKHaddress = bitcoin.deriveP2PKHAddress(derivedPublicKeyWithPrefixHex);
        // console.log("p2PKHaddress", p2PKHaddress);
        should.equal(p2PKHaddress.length, 34, "derived P2PKH address should be 34 chars long");
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
        const encryptedMasterKey = masterkey.masterKeyEncryption(masterkeyPassword, uint8ArrayKeypart, uint8ArrayKeychaincode);
        const data = {
            message: rawTxmessageBTC,
            password: "123456",
            encryptedMasterKey,
            keyPath,
            network: "BITCOIN"
        };
        bitcoin.signForSignature(data, function (error, signature, recovery) {
            // console.log(signature);
            // console.log(typeConverter.bufferToHexStr(signature));
            // console.log(recovery);
            // verify signature
            const uint8arrayMasterKey = typeConverter.hexStrToUint8Array(masterKey.key);
            const uint8arrayMasterChainCode = typeConverter.hexStrToUint8Array(masterKey.chainCode);
            bitcoin.derivePrivateKey(uint8arrayMasterKey, uint8arrayMasterChainCode, keyPath, "BITCOIN", (error, prikey) => {
                if (error) should.fail(error, null, "derive private key error : " + error.message);
                const pubKey = bitcoin.derivePublicKey(prikey);
                const ok = bitcoin.verifySignature(rawTxmessageBTC, signature, pubKey);
                should.ok(ok, "verify signature should be true")
            })
        });
    })
});

describe("test verify signature for BTC", function () {
    it("test 1", function () {
        const signatureBTChex = "9ec9f4ef7e0e87b2a2ad994c288f1a479ac7018f9b10647fda0e6be654af67e44515689534a92cb0ea69f9326be65140ff2ad936824e4785e932d0db328a995f";
        const publicKeyhex = "0350c1446da5894951e31bd8a7fa738d2551b9ce3ac24b0d830c09a94e81c6ca3e";
        const ok = bitcoin.verifySignature(rawTxmessageBTC, signatureBTChex, publicKeyhex);
        should.ok(ok, "verify signature should be true")
    })
});
