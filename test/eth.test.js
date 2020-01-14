const deriveKeyManager = require("../derivedKeyManager");
const should = require("should");
const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");

// This file is only used for Ethereum lock and redeem tx integration test

const masterKeySeedHex = "292f9928f54d671f16dc89462297465ff4eb9bfa05b16e5595f599ed81336e291ad5ca9a3a7d50754e2c28f91ac3f46e92fbb3459267b24c781fd2896e0dfb45";
const masterKeyPassword = "123456";
const encryptedMasterKeySeed = masterKeySeed.masterKeySeedEncryption(masterKeyPassword, typeConverter.hexStrToBuffer(masterKeySeedHex));

async function deriveKey(keyType) {
    const deriveKey = {
        keyType,
        keyIndex: 0,
        password: masterKeyPassword,
        encryptedMasterKeySeed
    };
    const key = await deriveKeyManager.deriveNewKeyPair(deriveKey).catch(err => {
        console.log(err);
    });
    console.log(keyType, key);
}

describe("derive test keys", () => {
    it('test1', function () {
        deriveKey("OLT")
    });
});

const lockEthTxEthPartTestcases = [
    {
        name: "test1",
        input: {
            nonce: '0x1',
            from: '0x56eDF0eF66268D38e754e65e408347a6d85Daa3D',
            to: '0x66d0C996969e3aCDBbA0cE41Aff9cb262b7bcacc',
            value: '0x0',
            gasLimit: '0x6691b6',
            gasPrice: '0x4a817c800',
            data:
                '0xdb006a7500000000000000000000000000000000000000000000000006f05b59d3b20000'
        },
        input2: { chain: 'mainnet', hardfork: 'petersburg' },
        expext: ""
    }
];

describe("lock eth tx eth part sign", () => {
    lockEthTxEthPartTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const tx = {
                message: {txParams: testcase.input, txConfig: testcase.input2},
                keyType: "ETH",
                keyIndex: 0,
                password: masterKeyPassword,
                encryptedMasterKeySeed
            };

            const signature = await deriveKeyManager.signTx(tx).catch(err => {
                console.error("ERR : ", err.error);
            });
            console.log("result hex string:", signature.response.signature);
        });
    })
});

const lockEthTxOltPartTestcases = [
    {
        name: "test1",
        input: "eyJ0eF90eXBlIjoxNTAsInR4X2RhdGEiOiJleUpQZDI1bGNpSTZJakI0T1dFMU9XVm1ZV0UzTXpaaVpXSTRabVZoWVdKalltTTVZV0kzWXprNVpEUmlPR00zTVRKaFppSXNJbFJ2SWpvaU1IZzFObVZFUmpCbFJqWTJNalk0UkRNNFpUYzFOR1UyTldVME1EZ3pORGRoTm1RNE5VUmhZVE5FSWl3aVJWUklWSGh1SWpwYk1qUTRMREV6Tnl3eExERXpNeXcwTERFMk9Dd3lNeXd5TURBc01Dd3hNekVzTVRBeUxERTBOU3d4T0RJc01UUTRMREV3TWl3eU1EZ3NNakF4TERFMU1Dd3hOVEFzTVRVNExEVTRMREl3TlN3eE9EY3NNVFl3TERJd05pdzJOU3d4TnpVc01qUTVMREl3TXl3ek9DdzBNeXd4TWpNc01qQXlMREl3TkN3eE1qZ3NNVFkwTERJeE9Td3dMREV3Tml3eE1UY3NNQ3d3TERBc01Dd3dMREFzTUN3d0xEQXNNQ3d3TERBc01Dd3dMREFzTUN3d0xEQXNNQ3d3TERBc01Dd3dMREFzTml3eU5EQXNPVEVzT0Rrc01qRXhMREUzT0N3d0xEQXNNemdzTVRZd0xERTBNU3d4Tmpnc01qSXpMREUyTUN3eE5EQXNNVGcyTERjc01qRTVMREl5TWl3eE1qTXNNelFzTVRrekxERTFOQ3d4TkRNc01qSTNMREV3TVN3eE1EUXNNalF3TERVd0xEWTRMREl3TkN3NExEa3dMREV4T1N3eU1ERXNNakUxTERFMU9Dd3dMRFF4TERFeE5Td3hNRFFzTWpNM0xERTJNQ3c1TWl3eE1EZ3NOREFzTVRJMUxERXdPU3czTERFNU9Td3hNelFzT1N3Mk55d3hNVEVzTVRNNUxERTRNeXd4T1RZc09DdzROeXd4TURFc01qTXhMREV3TkN3eE5qUXNNVEEwTERFMU15d3hNVGNzTWpJekxESXdPU3d5TURBc01UTXNNVFE0TERNNUxESXhNQ3d6TkN3NU4xMTkiLCJmZWUiOnsicHJpY2UiOnsiY3VycmVuY3kiOiJPTFQiLCJ2YWx1ZSI6IjEwMDAwMDAwMDAifSwiZ2FzIjo0MDAwMDAwMH0sIm1lbW8iOiIifQ==",
        expext: ""
    }
];

describe("eth lock olt part test", () => {
    lockEthTxOltPartTestcases.forEach(testcase => {
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
