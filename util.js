const {ethChainList, ethHardforkList, ethDefaultTxConfig, oltAddrPrefix, ethAddrPrefix} = require("./config");
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;

function validateBase64(s) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s);
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

// check if OLT address is valid, if so, return true
function isValidOLTAddress(addr) {
    return !(!isValidString(addr) || !addr.startsWith(oltAddrPrefix) || addr.length !== 43);
}

// check if ETH address is valid, if so, return true
function isValidETHAddress(addr) {
    return !(!isValidString(addr) || !addr.startsWith(ethAddrPrefix) || addr.length !== 42);
}

// check if a string is either undefined, "", null or "<nil>", if so return false
function isValidString(str) {
    return !(typeof str === "undefined" || str === "" || str === "<nil>" || str === null)
}

/*
 * description Validate txConfig of ETH tx message type.
 * If txConfig type is not object, return error
 * If txConfig type is null, return error
 * return {Promise} if resolve, return txConfig object, if reject, return error.
 */
function validETHtxConfigType(txConfig) {
    const notObjButUndefined = typeof txConfig !== 'object' && typeof txConfig !== 'undefined';
    const isNull = txConfig === null;
    if (notObjButUndefined || isNull) {
        return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidETHtxConfig));
    }
    return Promise.resolve(txConfig);
}

/*
 * description Merge txConfig into default chain and hardfork config object.
 * If txConfig is undefined, replace with default param which is an empty object, then merge it to default txConfig object.
 * return {object} returned object contains chain and hardfork fields
 */
function mergeETHTxConfigToDefault(txConfig = {}) {
    return {...ethDefaultTxConfig, ...txConfig}
}

/*
 * description Check if txConfig object includes valid chain and hardfork value.
 * param {object} txConfig - Object of eth txConfig object, must include chain and hardfork fields.
 * param {string} txConfig.chain - Indicate which ETH network to use (should be one of mainnet, rinkeby, ropsten, kovan, goerli)
 * param {string} txConfig.hardfork - Indicate which ETH hardfork to use (should be one of petersburg, constantinople, byzantium)
 * returns {boolean} If valid chain and hardfork are provided inside txConfig object, return true, otherwise return false
 */
function validETHtxConfigValue(txConfig) {
    const {chain, hardfork} = txConfig;
    const isValidChain = Object.values(ethChainList).includes(chain);
    const isValidHardfork = Object.values(ethHardforkList).includes(hardfork);
    return isValidChain && isValidHardfork
}

module.exports = {
    validateBase64,
    isNonNegativeInteger,
    isPositiveInteger,
    isNonNegativeNumber,
    isValidETHAddress,
    isValidOLTAddress,
    isValidString,
    validETHtxConfigValue,
    validETHtxConfigType,
    mergeETHTxConfigToDefault
};
