const config = require("../config");
const {tryAgainMessageWithoutColon, RPCErrors, BackendDefaultCode} = require("./errorType");
const invalidJsonAlert = "invalid json string from protocol";
const msgSectionMissing = "msg section in json string is missing from protocol";

// automatically load all error code defined in errorType file
autoLoadErrArray = (errObj) => {
    const resultErrArray = [];
    Object.keys(errObj).forEach((errName) => {
        resultErrArray.push(errObj[errName].code)
    });
    return resultErrArray
};

// parse backend error code
// if there is RPC code and backend error code:
// return code as backend error code, detail as RPC code + backend error code + backend error message, message as backend error message
// if there is only RPC code:
// return code as RPC code, detail as RPC code + backend error message, message as ""
// if backend error has {...} structure, we will extract the longest {...} using greedy match
// and try to parse json structure from that, if parsing fails return "invalid json string from protocol"
backendErrCodeRefactor = (code, originalMessage) => {
    let backendErrCode, backendMessage;
    const generalMsg = `${invalidJsonAlert}: ${originalMessage}`;
    const matched = originalMessage.match("\\{.*\\}");

    if (autoLoadErrArray(RPCErrors).includes(code)) {
        backendErrCode = originalMessage.slice(0, originalMessage.indexOf(":"));
        backendMessage = originalMessage.slice(originalMessage.indexOf(":") + 1).trim();
    } else { // the rest will be backend errors
        let errorObj = {};
        if (matched != null) {
            originalMessage = matched[0]
            try {
                errorObj = JSON.parse(originalMessage);
            }
            catch(err) {
                errorObj['msg'] = generalMsg;
            }
            backendMessage = errorObj.msg  || msgSectionMissing
        } else {
            backendMessage = generalMsg;
        }
        backendErrCode = errorObj.code || BackendDefaultCode
    }
    if (backendErrCode.toString().match(config.backendErrCodePattern)) {
        const detail = `${code}_${backendErrCode}: ${backendMessage}`;
        const message = tryAgainMessageWithoutColon;
        return {code: -parseInt(backendErrCode), message, detail}
    }
    return {code, message: "", detail: `${code}: ${originalMessage}`}
};

// return error structure to UI
errorWrap = (err) => {
    return {error: err}
};

// return response structure to UI
responseWrap = (response) => {
    return {response: response}
};

module.exports = {
    autoLoadErrArray,
    backendErrCodeRefactor,
    errorWrap,
    responseWrap
};
