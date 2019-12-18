const deriveKeyManager = require("../derivedKeyManager");
const should = require("should");
const masterKeySeed = require("../masterKeySeed");
const typeConverter = require("../typeConverter");

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
    console.log(key);
}

const lockEthTxEthPartTestcases = [
    {
        name: "test1",
        input: {
            nonce: '0x6',
            to: '0x66d0C996969e3aCDBbA0cE41Aff9cb262b7bcacc',
            value: '0x1bc16d674ec80000',
            gasLimit: '0x6691b6',
            gasPrice: '0x4a817c800',
            data: '0xf83d08ba'
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
        input: "eyJ0eF90eXBlIjoxNDUsInR4X2RhdGEiOiJleUpNYjJOclpYSWlPaUl3ZURsaE5UbGxabUZoTnpNMlltVmlPR1psWVdGaVkySmpPV0ZpTjJNNU9XUTBZamhqTnpFeVlXWWlMQ0pGVkVoVWVHNGlPbHN5TkRnc01URXpMRFlzTVRNekxEUXNNVFk0TERJekxESXdNQ3d3TERFek1Td3hNRElzTVRRMUxERTRNaXd4TkRnc01UQXlMREl3T0N3eU1ERXNNVFV3TERFMU1Dd3hOVGdzTlRnc01qQTFMREU0Tnl3eE5qQXNNakEyTERZMUxERTNOU3d5TkRrc01qQXpMRE00TERRekxERXlNeXd5TURJc01qQTBMREV6Tml3eU55d3hPVE1zTVRBNUxERXdNeXczT0N3eU1EQXNNQ3d3TERFek1pd3lORGdzTmpFc09Dd3hPRFlzTXpnc01UWXdMREV3Tml3eE9USXNNamNzTVRjeExESXlOU3czTVN3eU1qZ3NNakl6TERFNUxEUTVMRFkwTERNeUxERTJNU3c0T1N3eE9UWXNNVGd5TERJek15dzBNU3d4TmpZc01qQTNMREl4TlN3NU5Td3lNRFFzTVRrMkxERXlPU3cwTERVekxESXNNVEExTERJMExERTBOU3d4TVRBc01UWXdMRGMzTERJM0xESXdPQ3c1TkN3Mk9Td3hORFlzTWpBeExEYzRMREV4TWl3ek55dzJNU3cwT1N3ME9Dd3lNelVzT1RRc01Td3lNelVzTWpVc01UYzBMREl4T0N3eExEa3lMREV5TERFM05DdzVNQ3d5TWpRc09UTXNNakFzTWpNMExETXdMREU0TWl3eU5USmRmUT09IiwiZmVlIjp7InByaWNlIjp7ImN1cnJlbmN5IjoiT0xUIiwidmFsdWUiOiIxMDAwMDAwMDAwIn0sImdhcyI6NDAwMDAwMDB9LCJtZW1vIjoiIn0=",
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
