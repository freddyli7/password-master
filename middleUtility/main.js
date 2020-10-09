const {errorWrap, responseWrap} = require("./errorHandler/util");
const {handler} = require("./errorHandler/handler");
const {requestErrors, responseErrors, RPCErrors, otherErrors} = require("./errorHandler/errorType");

exports.TierError = {
    errorHandler: handler,
    ErrorType : {
        requestErrors,
        responseErrors,
        RPCErrors,
        otherErrors
    },
    ErrorUtil : {
        errorWrap,
        responseWrap
    }
};