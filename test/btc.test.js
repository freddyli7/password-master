const deriveKeyManager = require("../derivedKeyManager");
const should = require("should");
const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");

// This file is only used for bitcoin lock and redeem tx integration test

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const masterKeyPassword = "123456";
const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));

async function deriveKey(keyType, network) {
    const deriveKey = {
        keyType,
        keyIndex: 0,
        password: masterKeyPassword,
        encryptedMasterKeySeed,
        network
    };
    const key = await deriveKeyManager.deriveNewKeyPair(deriveKey).catch(err => {
        console.log("err... ", err);
    });
    console.log(keyType, key);
}

describe("derive test keys", () => {
    it('test1', function () {
        deriveKey("BTCP2PKH", "TESTNET")
    });
});

const lockBtcTxBtcPartTestcases = [
    {
        name: "test1",
        input: "0100000001d377a30edf12890d15b8d5f028883755fcaf716025aa7bac7158f19febe3059b0000000000ffffffff01a0320f000000000017a914abb43ea3590b431494a8f8ac83ec39b190235fcd8700000000",
        expext: ""
    }
];

describe("lock btc tx btc part sign", () => {
    lockBtcTxBtcPartTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const tx = {
                message: testcase.input,
                keyType: "BTC",
                keyIndex: 0,
                password: masterKeyPassword,
                encryptedMasterKeySeed,
                network: "TESTNET"
            };

            const signature = await deriveKeyManager.signTx(tx).catch(err => {
                console.error("ERR : ", err);
            });
            console.log("result hex string:", signature);
        });
    })
});

const lockBtcTxOltPartTestcases = [
    {
        name: "test1",
        input: "eyJ0eF90eXBlIjoxMjksInR4X2RhdGEiOiJleUpNYjJOclpYSWlPaUl3ZURsaE5UbGxabUZoTnpNMlltVmlPR1psWVdGaVkySmpPV0ZpTjJNNU9XUTBZamhqTnpFeVlXWWlMQ0pVY21GamEyVnlUbUZ0WlNJNkluUnlZV05yWlhKZk1DSXNJa0pVUTFSNGJpSTZJa0ZSUVVGQlFVaFVaRFpOVHpONFMwcEVVbGMwTVdaQmIybEVaRll2U3psNFdVTlhjV1UyZUhoWFVFZG1OaXROUm0xM1FVRkJRVUp5VTBSQ1JrRnBSVUZxSzA1bWNUbDFVVlU1VEdzMldqaDFRVEprVjNJNVZWcENRVVpFUTFobmNHNVBXVkpYWTNFclRrMDBRMGxEYm1VNFkyUjZOMU4xTW5GcGNFMDNaemhIY0cxalJtMXdlVGt3T0RsME4wbGlUVEJFVkVOVlNETjBRVk5GUkRoSVpIZFdMMUIwYnpjelZ6SnNOblZKVlZaYVRFaFZURUpSVUVobmVVcEdUV1pZTTNsTldraEJZbTR2THk4dkwwRmhRWGxFZDBGQlFVRkJRVVkyYTFWeE4xRXJiekZyVEZGNFUxVnhVR2x6Wnl0M05YTmFRV3BZT0RKSVFVRkJRVUZCUFQwaUxDSk1iMk5yUVcxdmRXNTBJam81T1RZd01EQjkiLCJmZWUiOnsicHJpY2UiOnsiY3VycmVuY3kiOiJPTFQiLCJ2YWx1ZSI6IjEwMDAwMDAwMDAifSwiZ2FzIjo0MDAwMDAwMH0sIm1lbW8iOiIxYjk5MDAzNC0zNjRhLTExZWEtOGI2My1mMjE4OTg1ZWQ1NWQifQ==",
        expext: ""
    }
];

describe("btc lock olt part test", () => {
    lockBtcTxOltPartTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const tx = {
                message: testcase.input,
                keyType: "OLT",
                keyIndex: 0,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };
            const signature = await deriveKeyManager.signTx(tx).catch(err => {
                console.error("ERR : ", err.error);
            });
            console.log("result :", signature);
        });
    })
});
