const addressVerifier = require("../addressVerifier");
const should = require("should");

const addrVerfyTestcases =[
    {
        name:"test1, valid olt address with valid olt keytype",
        input1: "0xcf9b8639c14bfb313fac151186b4e3a8b4b51361",
        input2: "OLT",
        expect: true
    },
    {
        name:"test2, invalid olt address but valid olt keytype",
        input1: "cf9b8639c14bfb313fac151186b4e3a8b4b51361",
        input2: "OLT",
        expect: false
    },
    {
        name:"test3, valid olt address but invalid olt keytype",
        input1: "0xcf9b8639c14bfb313fac151186b4e3a8b4b51361",
        input2: "OLTT",
        expect: -11014
    },
    {
        name:"test4, valid olt address but valid other keytype",
        input1: "0xcf9b8639c14bfb313fac151186b4e3a8b4b51361",
        input2: "BTCP2PK",
        expect: false
    },
    {
        name:"test5, valid btc address but valid other BTCP2PK keytype",
        input1: "1JWAxL2trPVJLVXyDf4MdfphGtsrwLcsSQ",
        input2: "BTCP2PK",
        expect: false
    },
    {
        name:"test6, valid btc address with valid BTCP2PKH keytype",
        input1: "1JWAxL2trPVJLVXyDf4MdfphGtsrwLcsSQ",
        input2: "BTCP2PKH",
        expect: true
    },
    {
        name:"test7, valid eth address with valid eth keytype",
        input1: "0xcf9b8639c14bfb313fac151186b4e3a8b4b51361",
        input2: "ETH",
        expect: true
    },
    {
        name:"test8, invalid eth address with valid eth keytype",
        input1: undefined,
        input2: "ETH",
        expect: -11015
    },
    {
        name:"test9, valid eth address with invalid eth keytype",
        input1: "0xcf9b8639c14bfb313fac151186b4e3a8b4b51361",
        input2: "",
        expect: -11015
    }
];

describe("test address verification", function () {
    addrVerfyTestcases.forEach(testcase => {
        it(testcase.name, async function () {
            const result = await addressVerifier.verify(testcase.input1, testcase.input2).catch(err => {
                console.log("err  ", err);
                should.equal(err.error.code, testcase.expect)
            });
            if (typeof result !== "undefined") {
                console.log("result  ", result);
                should.equal(result, testcase.expect)
            }
        });
    });
});