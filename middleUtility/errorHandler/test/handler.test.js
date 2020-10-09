const expect = require('chai').expect;
const should = require('should');
const util = require('../util');
const handler = require('../handler');

const handlerErrTestcases = [
    {
        name: "test 1, no error code",
        input: util.errorWrap({message: "no code error"}),
        expect: -20000
    },
    {
        name: "test 2, RPC error code without backend error code",
        input: util.errorWrap({code : -32000, message: "RPC code error"}),
        expect: -32000
    },
    {
        name: "test 3, RPC error code with backend error code",
        input: util.errorWrap({code : -32000, message: "100502: domain not found"}),
        expect: -100502
    },
    {
        name: "test 4, request error code",
        input: util.errorWrap({code : -10001, message: "domain query result is not array", detail : ""}),
        expect: -10001
    },
    {
        name: "test 5, broadcast error code with backend error code",
        input: util.errorWrap({code : -20001, message: "105002: domain not found"}),
        expect: -105002
    },
    {
        name: "test 6, broadcast error code without backend error code",
        input: util.errorWrap({code : -20001, message: "domain not found"}),
        expect: -20001
    },
    {
        name: "test 7, other error code",
        input: util.errorWrap({code : "ETIMEDOUT", message: "timeout error"}),
        expect: -20003
    },
    {
        name: "test 8, any other error that has an code but not get caught",
        input: util.errorWrap({code : "SOMEOTHERERROR", message: "some other error"}),
        expect: -20002
    },
    {
        name: "test 9, no error code, no error message",
        input: util.errorWrap({result: "no code error and no message"}),
        expect: -20000
    },
    {
        name: "test 10, any other error that has an code",
        input: util.errorWrap({code : "ENOTFOUND", message: "some other error"}),
        expect: -20004
    },
    {
        name: "test 11, any other error that has an code",
        input: util.errorWrap({code : "ECONNREFUSED", message: "some other error"}),
        expect: -20005
    },
    {
        name: "test 12, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32700, message: ""}),
        expect: -32700
    },
    {
        name: "test 13, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32600, message: ""}),
        expect: -32600
    },
    {
        name: "test 14, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32601, message: ""}),
        expect: -32601
    },
    {
        name: "test 15, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32602, message: ""}),
        expect: -32602
    },
    {
        name: "test 16, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32603, message: ""}),
        expect: -32603
    },
    {
        name: "test 17, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32001, message: ""}),
        expect: -32001
    },
    {
        name: "test 18, RPC error code without backend error code and no message",
        input: util.errorWrap({code : -32000, message: ""}),
        expect: -32000
    },
    {
        name: "test 19, other error code",
        input: util.errorWrap({code : "ESOCKETTIMEDOUT", message: ""}),
        expect: -20003
    }
];

describe("error handler test", function () {
    while (handlerErrTestcases.length > 0) {
        const testcase = handlerErrTestcases.shift();
        it(testcase.name, async function () {
            const re = await handler.handler(testcase.input).catch(err => {
                // console.log(err);
                expect(err.error.code).to.deep.equals(testcase.expect)
            });
            if (typeof re !== "undefined") should.fail(re, undefined, "should not reach promise resolve");
        })
    }
});