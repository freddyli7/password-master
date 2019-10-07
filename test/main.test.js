const HDVault = require("../main");

const mnemonicArray = [{index: 1, word: 'turtle'},
    {index: 2, word: 'issue'},
    {index: 3, word: 'gloom'},
    {index: 4, word: 'race'},
    {index: 5, word: 'blast'},
    {index: 6, word: 'final'},
    {index: 7, word: 'parent'},
    {index: 8, word: 'park'},
    {index: 9, word: 'toss'},
    {index: 10, word: 'atom'},
    {index: 11, word: 'aware'},
    {index: 12, word: 'surprise'},
    {index: 13, word: 'tribe'},
    {index: 14, word: 'genuine'},
    {index: 15, word: 'claim'},
    {index: 16, word: 'hobby'},
    {index: 17, word: 'aware'},
    {index: 18, word: 'alcohol'},
    {index: 19, word: 'wish'},
    {index: 20, word: 'index'},
    {index: 21, word: 'tiny'},
    {index: 22, word: 'hope'},
    {index: 23, word: 'have'},
    {index: 24, word: 'cage'}];

const encryptedMasterKeySeed = '{"iv":"QlG4nschGJ05XE5eewWNoQ==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"0S3l9i0pRtQFaAZFTi0nHw==","ct":"oqwz5Fan11XtWeUCK2UCaVmlfJKHNuOjAmgLZsQOaedukydoZdUta6iK5ZV6KQUn4iuWuenIDvAYuTchadsh0z3FQC9NHwYTNqCISxKhe1TeBLwP4V7DVQwvdQJlKwBg"}\n';

describe("examples of how to use HD-vault", function () {
    it("test 1", async function () {
        // generate 24 mnemonic
        const words = HDVault.mnemonicUtil.mnemonicGenerator24();
        // generate masterKeySeed with mnemonic and password
        const mm = new HDVault.MasterKeySeedManager(words, "123456");
        // when import masterKeySeed file, unlock it with password
        const unlockResult = await HDVault.masterKeySeedUtil.unlockMasterKeySeed("123456", encryptedMasterKeySeed).catch(err => {
            console.log("unlock masterKeySeed error: ", err);
        });
        console.log("unlock masterKeySeed result: ", unlockResult);
        // get masterKeySeed info after new masterKeySeed is generated OR when user recovery with new password
        mm.getMasterKeySeedInfo((encryptedMasterKeySeed, masterKeySeedAddress) => {
            console.log("get masterKeySeed info: ", encryptedMasterKeySeed, masterKeySeedAddress);
        });
        // when user recovery masterKeySeed, get the masterAddress based on provided mnemonic for comparison
        console.log("recovery : " + HDVault.masterKeySeedUtil.recoveryMasterKeySeed(mnemonicArray));
        // derive new key with different keyType : OLT, BTC-P2PK, BTC-P2PKH, ETH
        // return new key's address and keyIndex to store locally
        const derivedData = {
            keyType: "OLT",
            keyIndex: 0,
            password: "123456",
            encryptedMasterKeySeed
        };
        HDVault.derivedKeyManager.deriveNewKeyPair(derivedData, (error, keyIndex, address) => {
            console.log("get derived key's keyIndex: ", keyIndex);
            console.log("get derived key's address: ", address);
        });
        // sign tx with derived new key
        const messageOLT = 'eyJ0eF90eXBlIjoyLCJ0eF9kYXRhIjoiZXlKUGQyNWxjaUk2SWpCNE1qZ3dabVkxT0dNMk5UYzNaRGhrWkRBeE5XVmlNelkzTUdRMU1UY3paVFl4WVRnNE1HWmxZU0lzSWtGalkyOTFiblFpT2lJd2VESTRNR1ptTlRoak5qVTNOMlE0WkdRd01UVmxZak0yTnpCa05URTNNMlUyTVdFNE9EQm1aV0VpTENKT1lXMWxJam9pZEdWemRHUnZiV0ZwYmpFeElpd2lVSEpwWTJVaU9uc2lZM1Z5Y21WdVkza2lPaUpQVEZRaUxDSjJZV3gxWlNJNklqRXdNREF3TURBd01EQXdNREF3TURBd01EQXdNREFpZlgwPSIsImZlZSI6eyJQcmljZSI6eyJjdXJyZW5jeSI6Ik9MVCIsInZhbHVlIjoiMTAwMDAwMDAwMDAwMDAwMDAwMCJ9LCJHYXMiOjF9LCJtZW1vIjoiNGM1MzQ4ZTctYWNjOS0xMWU5LTlhN2MtNDIwMTBhMGEwMDA5In0=';
        const signData = {
            message: messageOLT,
            keyType: "OLT",
            keyIndex: 0,
            password: "123456",
            encryptedMasterKeySeed
        };
        HDVault.derivedKeyManager.signTx(signData, (error, signature) => {
            // console.log(error);
            console.log("signature from derived key: ", signature);
        });
        // verify address
        const addreVerifyResult = HDVault.address.verify("1BRpDq7Px6X4k5hN4Q6jFkBypFMizf64Yg", "OLT");
        console.log(addreVerifyResult);
    })
});
