import * as factory from "./keyFactory";

describe("key factorytest pattern test", function () {
    it("test 1", function () {
        let fa;
        fa = new factory.EthereumKeyFactory();
        console.log(fa.deriveNewKeyPair("keeee", 0));

        fa = new factory.BitCoinKeyFactory();
        console.log(fa.deriveNewKeyPair("bbbbb", 1));
    })
});
