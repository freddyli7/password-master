const {newWallet, passwordGenerator, getPassword, passwordDefaultFormat} = require("./localWallet");

exports.Wallet = {
    newWallet
};

exports.Password = {
    passwordGenerator,
    getPassword
};

exports.Config = {
    PasswordGenerationConfig: passwordDefaultFormat
};
