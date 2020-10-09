import {newWallet, passwordGenerator, getPassword, passwordDefaultFormat} from "./localWallet";

export declare module Wallet {
    function newWallet(): string;
}

export declare module Password {
    function passwordGenerator(): string;

    function getPassword(): string;
}

export const Config = {
    passwordDefaultFormat
}
