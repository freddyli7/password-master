const util = require("../util");
const should = require('should');

const nonNegativeNumberTestcases = [
    {
        name: "test1",
        input: 1,
        expect: true
    },
    {
        name: "test2",
        input: 0,
        expect: true
    },
    {
        name: "test3",
        input: "2e45422470cab34a236e3c4d13fa41bcc14d72c1",
        expect: false
    },
    {
        name: "test4",
        input: "aaaaa",
        expect: false
    },
    {
        name: "test5",
        input: "1.111",
        expect: true
    },
    {
        name: "test6",
        input: "-1.111",
        expect: false
    },
    {
        name: "test7",
        input: "0",
        expect: true
    },
    {
        name: "test8",
        input: "1",
        expect: true
    },
    {
        name: "test9, check hex number",
        input: "0x65535",
        expect: true
    }
];

describe("test is non negative number", function () {
    for (let i = 0; i < nonNegativeNumberTestcases.length; i++) {
        it(nonNegativeNumberTestcases[i].name, function () {
            should.equal(util.isNonNegativeNumber(nonNegativeNumberTestcases[i].input), nonNegativeNumberTestcases[i].expect);
        })
    }
});

const validETHtxConfigTestcases = [
    {
        name: "test1, empty txConfig obj, should return true",
        input: {},
        expect: false
    },
    {
        name: "test2, only provide valid chain, should return false",
        input: {chain: "mainet"},
        expect: false
    },
    {
        name: "test3, only provide valid hardfork, should return false",
        input: {hardfork: "petersburg"},
        expect: false
    },
    {
        name: "test4, only provide invalid chain, should return false",
        input: {chain: "nonsense"},
        expect: false
    },
    {
        name: "test5, only provide invalid hardfork, should return false",
        input: {hardfork: "nonsense"},
        expect: false
    },
    {
        name: "test6, provide both chain and hardfork but both are invalid, should return false",
        input: {chain: "nonsense", hardfork: "nonsense"},
        expect: false
    },
    {
        name: "test7, provide both chain and hardfork but only chain is valid, should return false",
        input: {chain: "rinkeby", hardfork: "nonsense"},
        expect: false
    },
    {
        name: "test8, provide both chain and hardfork but only hardfork is valid, should return false",
        input: {chain: "nonsense", hardfork: "petersburg"},
        expect: false
    },
    {
        name: "test9, provide both chain and hardfork and both are valid, should return input object",
        input: {chain: "kovan", hardfork: "byzantium"},
        expect: true
    },
    {
        name: "test10, provide not an object, should return false",
        input: "123456",
        expect: false
    },
    {
        name: "test11, provide an object but without chain and hardfork fields, should return default config (chain is mainnet, hardfork is petersburg)",
        input: {a: "a", b: "b"},
        expect: false
    },
    {
        name: "test12, provide an object but only contains chain field which is valid, should return false",
        input: {a: "a", chain: "mainnet"},
        expect: false
    },
    {
        name: "test13, provide an object but only contains chain field whcih is invalid, should return false",
        input: {a: "a", chain: "nonsense"},
        expect: false
    },
    {
        name: "test14, provide an object but only contains hardfork field which is valid, should return false",
        input: {a: "a", hardfork: "petersburg"},
        expect: false
    },
    {
        name: "test15, provide an object but only contains hardfork field whcih is invalid, should return false",
        input: {a: "a", hardfork: "nonsense"},
        expect: false
    },
    {
        name: "test16, provide an object contains valid chain and hardfork with other fields, should only return chain and hardfork",
        input: {a: "a", b: "b", chain: "kovan", hardfork: "constantinople"},
        expect: true
    },
];

describe("test if eth txConfig obj is valid", function () {
    validETHtxConfigTestcases.forEach(testcase => {
        it(testcase.name, function () {
            should.deepEqual(util.validETHtxConfigValue(testcase.input), testcase.expect);
        })
    });
});