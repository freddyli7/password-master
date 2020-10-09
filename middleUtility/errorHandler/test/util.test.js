const expect = require('chai').expect;
const util = require('../util');
const errors = require('../errorType');

const errCodeStrParseTestcases = [
    {
        name: "test1",
        input1: -32000,
        input2: "100502: domain not found",
        expect: {code: -100502, detail: "-32000_100502: domain not found", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test2",
        input1: -32000,
        input2: "100502:100503 domain not found",
        expect: {code: -100502, detail: "-32000_100502: 100503 domain not found", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test3",
        input1: -32000,
        input2: "domain not found",
        expect: {code: -32000, detail: "-32000: domain not found", message: ""}
    },
    {
        name: "test4",
        input1: -32000,
        input2: "domain:domain not found",
        expect: {code: -32000, detail: "-32000: domain:domain not found", message: ""}
    },
    {
        name: "test5",
        input1: -32000,
        input2: "Log.domain not found",
        expect: {code: -32000, detail: "-32000: Log.domain not found", message: ""}
    },
    {
        name: "test6",
        input1: -32000,
        input2: ":domain not found",
        expect: {code: -32000, detail: "-32000: :domain not found", message: ""}
    },
    {
        name: "test7",
        input1: -32000,
        input2: "::domain not found",
        expect: {code: -32000, detail: "-32000: ::domain not found", message: ""}
    },
    {
        name: "test8",
        input1: -32000,
        input2: ".::domain not found",
        expect: {code: -32000, detail: "-32000: .::domain not found", message: ""}
    },
    {
        name: "test9",
        input1: -32000,
        input2: "domain not :found",
        expect: {code: -32000, detail: "-32000: domain not :found", message: ""}
    },
    {
        name: "test10",
        input1: -20001,
        input2: '{"code":100705,"msg":"cannot debit from address"}',
        expect: {code: -100705, detail: "-20001_100705: cannot debit from address", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test11",
        input1: -20001,
        input2: '"code":100705,"msg":"cannot debit from address"',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: \"code\":100705,\"msg\":\"cannot debit from address\"", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test12",
        input1: -20001,
        input2: '{"code":100705,"msg":"cannot debit from address"',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: {\"code\":100705,\"msg\":\"cannot debit from address\"", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test13",
        input1: -20001,
        input2: '"code":100705,"msg":"cannot debit from address"}',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: \"code\":100705,\"msg\":\"cannot debit from address\"}", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test14",
        input1: -20001,
        input2: '{balabala}',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: {balabala}", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test15",
        input1: -20001,
        input2: '{"code":100705,"msg":"cannot debit from address"}balabala',
        expect: {code: -100705, detail: "-20001_100705: cannot debit from address", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test16",
        input1: -20001,
        input2: '{"code":100705,"msg":"cannot debit from address"}{sss}{aaa}',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: {\"code\":100705,\"msg\":\"cannot debit from address\"}{sss}{aaa}", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test17",
        input1: -20001,
        input2: '{{{"code":100705,"msg":"cannot debit from address"}{sss}{aaa}',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: {{{\"code\":100705,\"msg\":\"cannot debit from address\"}{sss}{aaa}", message: "Please try again later, otherwise contact support@oneledger.io"}
    },
    {
        name: "test18",
        input1: -20001,
        input2: '{sss}{aaa}{"code":100705,"msg":"cannot debit from address"}',
        expect: {code: -999, detail: "-20001_999: invalid json string from protocol: {sss}{aaa}{\"code\":100705,\"msg\":\"cannot debit from address\"}", message: "Please try again later, otherwise contact support@oneledger.io"}
    }
];

describe("backend error code string parse test", function () {
    while (errCodeStrParseTestcases.length > 0) {
        const testcase = errCodeStrParseTestcases.shift();
        it(testcase.name, function () {
            const re = util.backendErrCodeRefactor(testcase.input1, testcase.input2);
            console.log(re);
            expect(re).to.deep.equals(testcase.expect)
        });
    }
});

const autoLoadErrTestcases = [
    {
        name: "test 1, RPC errors test",
        input: errors.RPCErrors,
        expect: [-32700, -32600, -32601, -32602, -32603, -32001, -32000]
    },
    {
        name: "test 2, request errors test",
        input: errors.requestErrors,
        expect: [-10000, -10001, -10002, -10003, -10004,
            -10005, -10006, -10007, -10008, -10009, -10010,
            -10011, -10012, -10013, -11000, -11001, -11002, -11003,
            -11004, -11005, -11006, -11007, -11008, -11009,
            -11010, -11011, -11012, -11013, -11014, -11015,
            -12000, -12001, -12002, -12003, -12004, -12005,
            -12006, -12007, -12008, -12009, -12010, -12011,
            -12012, -12013, -12014, -12015, -12016, -12017,
            -12018, -12019, -12020, -12021, -12022, -12023,
            -12024, -12025, -12026, -12027, -12028, -12029,
            -12030, -12031, -12032, -12033, -12034, -12035,
            -12036, -12037, -12038, -12039, -12040, -12041,
            -12042, -12043, -12044, -12045, -12046, -12047,
            -12048, -13000, -13001, -13002, -13003, -13004,
            -13005, -13006, -13007, -13008, -13009, -13010,
            -13011, -13012, -14001, -14002, -14003, -14004,
            -14005, -14006, -14007, -14008, -14009]
    },
    {
        name: "test 3, response errors test",
        input: errors.responseErrors,
        expect: [-20000, -20001, -20002, -20003, -20004, -20005]
    }
];

describe("auto load errors test", function () {
    while (autoLoadErrTestcases.length > 0) {
        const testcase = autoLoadErrTestcases.shift();
        it(testcase.name, function () {
            console.log(util.autoLoadErrArray(testcase.input));
            expect(util.autoLoadErrArray(testcase.input)).to.deep.equals(testcase.expect)
        })
    }
});
