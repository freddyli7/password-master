const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");
const bitcoin = require("../bitcoin");
const secp256k1 = require('secp256k1');
const bip32 = require("bip32");
const bitcoinjs = require('bitcoinjs-lib');
const should = require('should');

const keyPath = "m/44'/0'/0'/0/1";

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const masterkeyPassword = "123456";
const rawTxmessageBTC = "072a8543e388c4155ccbcd325f129000214095725598721cea986fcd0fc38d6a";


/* *****************************   Secp256k1 For BTC  ***************************** */

describe("test derive privateKey from masterKeySeed for BTC", function () {
    it("test with wrong BitCoin network", function () {
        bitcoin.derivePrivateKey(typeConverter.hexStrToBuffer(masterKeySeedHex), keyPath, "BITCOIN111", (error, derivedPriKey) => {
            // console.log(error.message);
            should.equal(error.code, "-11011");
        });
    });
    it("test with valid BitCoin network", function () {
        bitcoin.derivePrivateKey(typeConverter.hexStrToBuffer(masterKeySeedHex), keyPath, "BITCOIN", (error, derivedPriKey) => {
            // console.log(derivedPriKey.length);
            // console.log(typeConverter.bufferToHexStr(derivedPriKey));
            should.ok(bitcoin.verifyPrivateKey(derivedPriKey));
        });
    });
});

describe("test derive publicKey from privateKey for BTC", function () {
    it("test 1", function () {
        // private key derived from btc masterKey
        const derivedPrivateKey = typeConverter.hexStrToUint8Array("d6891f4cbf44a185373db0e00d6c5da3e233eec12ecf42b47f6ec459a0c59118");
        const publicKey = bitcoin.derivePublicKey(derivedPrivateKey);
        // console.log(publicKey);
        // verify derived public key
        should.ok(secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(publicKey)));
        // derive public key from BIP32 lib
        const masterNode = bip32.fromSeed(typeConverter.hexStrToBuffer(masterKeySeedHex), bitcoinjs.networks.bitcoin);
        // compare public key derived from two different lib
        should.deepEqual(typeConverter.hexStrToBuffer(publicKey), masterNode.derivePath(keyPath).publicKey, "two derived publicKeys based on the same privateKey and keyPath should be the same");
    })
});

describe("test different tx types for BTC", function () {
    it("test p2pk", function () {
        const derivedPublicKeyWithPrefixHex = "020ffe45e403b257206c463e6a94c3872382536a0c1aa5dd3af80b13d148b1e1a3";
        const p2PKPubkey = bitcoin.deriveP2PKPubKey(derivedPublicKeyWithPrefixHex);
        // console.log("p2PKPubkey", p2PKPubkey);
        should.ok(secp256k1.publicKeyVerify(typeConverter.hexStrToBuffer(p2PKPubkey)), "verify derived P2PK public key should be true");

    });
    it("test p2pkh", function () {
        const derivedPublicKeyWithPrefixHex = "020ffe45e403b257206c463e6a94c3872382536a0c1aa5dd3af80b13d148b1e1a3";
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

describe("test sign tx for BTC", function () {
    it("test 1", function () {
        const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterkeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));
        const data = {
            message: rawTxmessageBTC,
            password: masterkeyPassword,
            encryptedMasterKeySeed,
            keyPath,
            network: "BITCOIN"
        };
        bitcoin.signForSignature(data, function (error, signature, recovery) {
            if (error) should.fail(error, null, "sign tx should be ok, but : " + error);
            // console.log(signature);
            // console.log(typeConverter.bufferToHexStr(signature));
            // console.log(recovery);
            // verify signature
            bitcoin.derivePrivateKey(typeConverter.hexStrToBuffer(masterKeySeedHex), keyPath, "BITCOIN", (error, prikey) => {
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
