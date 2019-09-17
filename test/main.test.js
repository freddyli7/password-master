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

describe("test derive private key for ETH", function () {
    it("test 1", function () {
        console.log(HDVault.masterKey.mnemonicGenerator24());
        const mm = new HDVault.masterKeyManager(mnemonicArray, "123456");
        console.log(mm);
    })
});
