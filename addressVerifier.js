const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const oneledger = require("./oneledger");
const {derivedKeyType} = require("./config");
const util = require("./util");
const {ErrorType, ErrorUtil} = require("./middle_utility").TierError;
const {requestErrors} = ErrorType;

async function verify(address, addressType) {
    if (!util.isValidString(address) || !util.isValidString(addressType)) return Promise.reject(ErrorUtil.errorWrap(requestErrors.InvalidInputData));
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
