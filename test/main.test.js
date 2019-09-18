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

const encryptedMasterKey = '{"iv":"RiSLQyrzQyfQWDPJjIIhug==","v":1,"iter":1000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"TQG4HWB0kxvXTbclS2i8mQ==","ct":"Dn2bUTNh6SasdlVvsIdMqBkyOIUk0Fn6737U3nq3h9DI1O46fFsP8UvilkxKu4iqrKAJ752QfwEjf4MbXG/10pCBD1LzAq00QKpesiHgw2dczL+ect7YfWiN7fpTz8q4"}';


describe("test derive private key for ETH", function () {
    it("test 1", function () {
        const words = HDVault.mnemonicUtil.mnemonicGenerator24();
        const mm = new HDVault.masterKeyGenerator(words, "123456");
        mm.unlockMasterKey("123456", r => {
            console.log(r);
        });
        mm.getMasterKeyInfo((e, a) => {
            console.log(e, a);
        });
        console.log(HDVault.masterKeyUtil.recoveryMasterKey(mnemonicArray));
        HDVault.derivedKeyManager.deriveNewKeyPair("OLT", 0, "123456", encryptedMasterKey, (error, keyIndex, address) => {
            console.log(keyIndex);
            console.log(address);
        })
    })
});
