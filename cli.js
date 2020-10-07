const local = require("./localWallet");

if (process.env.Func == 'Wallet') {
    local.newWallet()
}

if (process.env.Func == 'Password') {
    local.passwordGenerator()
}

if (process.env.Func == 'Retrieve') {
    local.getPassword()
}
