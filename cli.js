const local = require("./localWallet");

if (process.env.Func == 'Wallet') {
    local.newWallet().then(r => console.log(r)).catch(e => console.error(e))
}

if (process.env.Func == 'Password') {
    local.passwordGenerator().then(r => console.log(r)).catch(e => console.error(e))
}

if (process.env.Func == 'Retrieve') {
    local.getPassword().then(r => console.log(r)).catch(e => console.error(e))
}
