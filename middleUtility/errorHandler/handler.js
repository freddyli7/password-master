const {requestErrors, responseErrors, RPCErrors, otherErrors} = require("./errorType");
const util = require("./util");
const config = require("../config");

/**
 * @description Handle all caught errors
 * @param err {Object} error object that has code and message
 * @return {Promise<reject>} proper error object with code, message and detail
 */
function handler(err) {
    const {code, message} = err.error || {};
    if (typeof code === config.undefinedType) {
        const noCodeError = errorWithoutCodeHandler(err);
        return Promise.reject(util.errorWrap(noCodeError))
    } else {
        if (util.autoLoadErrArray(RPCErrors).includes(code)) {
            const rpcError = rpcErrorHandler(code, message);
            return Promise.reject(util.errorWrap(rpcError))
        } else if (util.autoLoadErrArray(requestErrors).includes(code) || util.autoLoadErrArray(responseErrors).includes(code)) {
            return reqRespErrorHandler(err, code, message);
        } else {
            return Promise.reject(otherErrorHandler(code))
        }
    }
}

// no error code session handler
function errorWithoutCodeHandler(err) {
    const {message} = err.error || {};
    // comment out the below part if don't want to show error message detail to UI
    if (typeof message === config.undefinedType) {
        if (typeof err.error === config.objectType) responseErrors.NoCodeServerError.detail = JSON.stringify(err.error);
        else responseErrors.NoCodeServerError.detail = err.error.toString();
    } else {
        responseErrors.NoCodeServerError.detail = message
    }
    return responseErrors.NoCodeServerError
}

// rpc error session handler
function rpcErrorHandler(code, message) {
    const returnErrorObj = {
        code: util.backendErrCodeRefactor(code, message).code,
        detail: util.backendErrCodeRefactor(code, message).detail,
        message: util.backendErrCodeRefactor(code, message).message
    };
    if (returnErrorObj.message === "") {
        switch (code) {
            case RPCErrors.CodeParseError.code :
                returnErrorObj.message = RPCErrors.CodeParseError.message;
                break;
            case RPCErrors.CodeInvalidRequest.code :
                returnErrorObj.message = RPCErrors.CodeInvalidRequest.message;
                break;
            case RPCErrors.CodeMethodNotFound.code :
                returnErrorObj.message = RPCErrors.CodeMethodNotFound.message;
                break;
            case RPCErrors.CodeInvalidParams.code :
                returnErrorObj.message = RPCErrors.CodeInvalidParams.message;
                break;
            case RPCErrors.CodeInternalError.code :
                returnErrorObj.message = RPCErrors.CodeInternalError.message;
                break;
            case RPCErrors.CodeNotAllowed.code :
                returnErrorObj.message = RPCErrors.CodeNotAllowed.message;
                break;
            case RPCErrors.CodeNotFound.code :
                returnErrorObj.message = RPCErrors.CodeNotFound.message;
        }
    }
    return returnErrorObj
}

// request and response error session handler
function reqRespErrorHandler(err, code, message) {
    // for broadcast error -20001
    if (code === responseErrors.FailToBroadcastError.code) {
        const returnError20001 = {
            code: util.backendErrCodeRefactor(code, message).code,
            message: util.backendErrCodeRefactor(code, message).message,
            detail: util.backendErrCodeRefactor(code, message).detail
        };
        if (returnError20001.message === "") returnError20001.message = responseErrors.FailToBroadcastError.message;
        return Promise.reject(util.errorWrap(returnError20001))
    }
    return Promise.reject(err)
}

// other error session handler
function otherErrorHandler(code, message) {
    switch (code) {
        case otherErrors.ETIMEDOUT.code:// invalid request url
            return util.errorWrap(responseErrors.ResponseTimeOutError);
        case otherErrors.ESOCKETTIMEDOUT.code:// request time out
            return util.errorWrap(responseErrors.ResponseTimeOutError);
        case otherErrors.ENOTFOUND.code: // bad internet connection
            return util.errorWrap(responseErrors.BadConnectionError);
        case otherErrors.ECONNREFUSED.code: // connection refused (probably wrong url)
            return util.errorWrap(responseErrors.ConnectionRefusedError);
        default : // any other error with code but not caught
            return util.errorWrap(responseAnyOtherErrorHandler(message));
    }
}

// any other error in response error session handler
function responseAnyOtherErrorHandler(message) {
    return {
        code: responseErrors.AnyOtherError.code,
        message: responseErrors.AnyOtherError.message,
        detail: message
    }
}

module.exports = {
    handler
};
