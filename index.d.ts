import {newWallet, passwordGenerator, getPassword, passwordDefaultFormat} from "./localWallet";

export namespace Wallet {
    function newWallet(password: string): string;
}

export namespace Password {
    function passwordGenerator(password: string, account: string): string;

    function getPassword(password: string, account: string): string;
}

export const Config = {
    PasswordGenerationConfig: passwordDefaultFormat
}
