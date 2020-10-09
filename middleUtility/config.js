// ********************** Common constant ***********************
const undefinedType = "undefined";
const objectType = "object";

// ************************** Error *****************************
// backend error code (not RPC error code) pattern
const backendErrCodePattern = '^-?[1-9]\\d*$';

module.exports = {
    backendErrCodePattern,
    undefinedType,
    objectType
};