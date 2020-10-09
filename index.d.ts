import {newWallet, passwordGenerator, getPassword, passwordDefaultFormat} from "./localWallet";

export namespace Wallet {
    function newWallet(): string;
}

export namespace Password {
    function passwordGenerator(): string;

    function getPassword(): string;
}

export const Config = {
    PasswordGenerationConfig: passwordDefaultFormat
}
