function validateBase64(s) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s);
}

function validBTCTxMessage(s) {
    return Buffer.from(s).length === 64;
}

// check if input is a non negative Integer
function isNonNegativeInteger(num) {
    return !!(Number(num) === 0 || isPositiveInteger(num));
}

// check if input is a positive Integer
function isPositiveInteger(num) {
    if (!Number(num) || num <= 0) return false;
    const strNum = num.toString();
    return strNum.indexOf(".") === -1
}

// check if a string can be convert to a number and it's non negative, if so return true
function isNonNegativeNumber(str) {
    return !!(!isNaN(Number(str)) && Number(str) >= 0);
}

// check if address is valid, if so, return true
function isValidAddress(addr) {
    return !(!isValidString(addr) || !addr.startsWith("0x") || addr.length !== 42);
}

// check if a string is either undefined, "", null or "<nil>", if so return false
function isValidString(str) {
    return !(typeof str === "undefined" || str === "" || str === "<nil>" || str === null)
}

// return response structure to UI
function responseWrap(response) {
    return {response: response}
}

module.exports = {
    validateBase64,
    validBTCTxMessage,
    isNonNegativeInteger,
    isPositiveInteger,
    isNonNegativeNumber,
    isValidAddress,
    isValidString,
    responseWrap
};