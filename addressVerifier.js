const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const oneledger = require("./oneledger");
const {derivedKeyType} = require("./config");
const util = require("./util");
const {ErrorType, ErrorUtil} = require("./middleUtility/main").TierError;
const {requestErrors} = ErrorType;

/**
 * @description Verify address based on address type
 * @param address {string} address to be verified.
 * @param addressType {string} address type which is the same as key type, it should be string of either "OLT", "BTCP2PK", "BTCP2PKH", "ETH".
 * @return {Promise<boolean|error>} promise.reject returns error object, promise.resolve returns verification result.
 */
async function verify(address, addressType) {
    if (!util.isValidString(address) || !util.isValidString(addressType)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddressVerifyData));
    switch (addressType) {
        case derivedKeyType.OLT:
            return Promise.resolve(oneledger.verifyAddress(address));
        case derivedKeyType.ETH:
            return Promise.resolve(ethereum.verifyAddress(address));
        case derivedKeyType.BTCP2PK:
            return Promise.resolve(bitcoin.verifyP2PKPublicKey(address));
        case derivedKeyType.BTCP2PKH:
            return Promise.resolve(bitcoin.verifyAddress(address));
        default:
            return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidAddressType));
    }
}

module.exports = {
    verify
};
