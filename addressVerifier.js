const bitcoin = require("./bitcoin");
const ethereum = require("./ethereum");
const oneledger = require("./oneledger");
const {derivedKeyType} = require("./config");
const {requestErrors} = require("./errorType");
const util = require("./util");

function verify(address, addressType) {
    if (!util.isValidString(address) || !util.isValidString(addressType)) return util.returnErrorStructure(requestErrors.InvalidInputData);
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
            return util.returnErrorStructure(requestErrors.InvalidAddressType);
    }
}

module.exports = {
    verify
};
