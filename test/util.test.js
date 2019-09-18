const util = require("../util");
const should = require('should');

const nonNetagiveNumberTestcases = [
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
    }
];

describe("test is non negative number", function () {
    for (let i = 0; i < nonNetagiveNumberTestcases.length; i++) {
        it(nonNetagiveNumberTestcases[i].name, function () {
            should.equal(util.isNonNegativeNumber(nonNetagiveNumberTestcases[i].input), nonNetagiveNumberTestcases[i].expect);
        })
    }
});