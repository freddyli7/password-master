const {newWallet, passwordGenerator, getPassword, passwordDefaultFormat} = require("./localWallet");

exports.wallet = {
    newWallet
};

exports.password = {
    passwordGenerator,
    getPassword
};

exports.Config = {
    PasswordGenerationConfig: passwordDefaultFormat
};
