const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");

/* *****************************  Type converter for HD vault  ***************************** */

function uint8arrayToHexStr(input) {
    return Buffer.from(input).toString('hex')
}

function hexStrToUint8Array(input) {
    return Uint8Array.from(Buffer.from(input, 'hex'))
}

function hexStrToBuffer(input) {
    return Buffer.from(input, 'hex')
}

function bufferToHexStr(input) {
    return input.toString('hex')
}

function uint8ArrayToBase64str(input) {
    return nacl.util.encodeBase64(input)
}

function bufferToUint8Array(input) {
    return Uint8Array.from(input)
}

function stringToHex(input){
    return Buffer.from(input, 'utf8').toString('hex')
}

function hexToString(input){
    return Buffer.from(input, 'hex').toString('utf-8')
}

function stringToUint8Array(input) {
    const uintarray = new Uint8Array(input.length);
    for(let i = 0, j = input.length; i < j; ++i){
        uintarray[i] = input.charCodeAt(i);
    }
    return uintarray
}

module.exports = {
    uint8arrayToHexStr,
    hexStrToUint8Array,
    uint8ArrayToBase64str,
    bufferToHexStr,
    bufferToUint8Array,
    hexStrToBuffer,
    stringToHex,
    hexToString
};