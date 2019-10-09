const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const oneledger = require("./oneledger");
const {derivedKeyType} = require("./config");
const util = require("./util");
const {ErrorType, Util} = require("./middle_utility").Error;
const {requestErrors} = ErrorType;

function verify(address, addressType) {
    if (!util.isValidString(address) || !util.isValidString(addressType)) return Util.errorWrap(requestErrors.InvalidInputData);
    switch (addressType) {
        case derivedKeyType.OLT:
            return oneledger.verifyAddress(address);
        case derivedKeyType.ETH:
            return ethereum.verifyAddress(address);
        case derivedKeyType.BTCP2PK:
            return bitcoin.verifyP2PKPublicKey(address);
        case derivedKeyType.BTCP2PKH:
            return bitcoin.verifyAddress(address);
        default:
            return Util.errorWrap(requestErrors.InvalidAddressType);
    }
}

module.exports = {
    verify
};
