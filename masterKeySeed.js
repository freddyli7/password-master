const bip39 = require('bip39');
const nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");
const sjcl = require("sjcl");
const crypto = require("crypto");
const {ErrorType, ErrorUtil} = require("middle_utility").TierError;
const {requestErrors} = ErrorType;
const typeConverter = require("./typeConverter");
const masterSeedKeyAddrPrefix = require("./config").oltAddrPrefix;

/* *****************************   Master key  ***************************** */

/**
 * @description Generate 24 mnemonic words
 * @return {Object[]} return a array with {index:number, word:string} as each element
 */
function mnemonicGenerator24() {
    const entropy = crypto.randomBytes(32);
    return mnemonicStrToArray(bip39.entropyToMnemonic(entropy))
}

/**
 * @description Generate 12 mnemonic words
 * @return {Object[]} return a array with {index:number, word:string} as each element
 */
function mnemonicGenerator12() {
    return mnemonicStrToArray(bip39.generateMnemonic())
}

// convert string mnemonic to array with word object as element
// internal use only
// input : mnemonic string
// return : mnemonic array
function mnemonicStrToArray(mnemonicStr) {
    const mnemonicArray = mnemonicStr.split(" ");
    return mnemonicArray.map((word, idx) => ({index: idx + 1, word}))
}

// convert array mnemonic to string
// internal use only
// input : mnemonic array
// return : mnemonic string
function mnemonicArrayToStr(mnemonicArray) {
    return mnemonicArray.map(({word}) => {
        return word || ''
    }).join(' ')
}

/**
 * @description Verify mnemonic words
 * We don't accept other language word list for now, the default word list is english.
 * Developer should call this function to verify mnemonic words that user input before calling getMasterKeySeedAddressForRecovery when the master seed file is stored on local storage(user forget password scenario);
 * When user is doing recovery from a new device(no master seed file is stored on local storage), only call this function to verify the mnemonic words, then generating the master seed based on what user input. Please note that if this is the case,
 * it is possible that user still input valid mnemonic words BUT NOT THE ONES for his original wallet, therefore it could be a totally different wallet.
 * @param mnemonicArray {Object[]} An mnemonic array with {index:number, word:string} as each element
 * @return {boolean} verify result
 */
function verifyMnemonic(mnemonicArray) {
    return bip39.validateMnemonic(mnemonicArrayToStr(mnemonicArray), bip39.wordlists.english)
}

// derive masterKeySeed from 12 or 24 mnemonic words mnemonicArray
// input : mnemonic array
// return : masterKeySeed which is a 64 bytes buffer
function masterKeySeedGenerator(mnemonicArray) {
    return bip39.mnemonicToSeedSync(mnemonicArrayToStr(mnemonicArray))
}

// encrypt masterKeySeed with password
// input : password is plaintext
// input : masterKeySeed is a 64 bytes buffer
// return : encrypted master key string
function masterKeySeedEncryption(password, masterKeySeed) {
    let strMasterKey = nacl.util.encodeBase64(typeConverter.bufferToUint8Array(masterKeySeed));
    let saltBits = sjcl.random.randomWords(4);
    let salt = sjcl.codec.base64.fromBits(saltBits);
    return sjcl.encrypt(password, strMasterKey, {
        mode: "ccm",
        iter: 1000,
        ks: 128,
        v: 1,
        cipher: "aes",
        adata: "",
        salt: salt
    })
}

// decrypt masterKeySeed with password
// input : password is plaintext
// input : encryptedMasterKey is string
// return : promise containing error object or decrypted masterKeySeed which is a 64 bytes buffer
function masterKeySeedDecryption(password, encryptedMasterKeySeed) {
    return new Promise((resolve, reject) => {
        let decryptedMasterKeySeed;
        try {
            decryptedMasterKeySeed = sjcl.decrypt(password, encryptedMasterKeySeed)
        } catch (err) {
            reject(ErrorUtil.errorWrap(requestErrors.WrongPassword))
        }
        resolve(typeConverter.uint8ArrayToBuffer(nacl.util.decodeBase64(decryptedMasterKeySeed)))
    })
}

// derive masterKeySeed's public key
// only use this function to derive master address for recovery
// input : masterKeySeed is a 64 bytes buffer
// return : 32 bytes base64 string publicKey
function getMasterKeySeedPublicKey(masterKeySeed) {
    return typeConverter.uint8ArrayToBase64str(nacl.sign.keyPair.fromSecretKey(masterKeySeed).publicKey)
}

// derive masterKeySeed's address from its publicKey
// store master address locally to verify mnemonic word when user wants to recovery
// same algorithm as Ed25519 OneLedger key
// input : masterPublicKey should be a 32 bytes base64 string
// return : 0lt prefix + 20 bytes hex string address
function getMasterKeySeedAddress(masterKeySeedPublicKey) {
    let base64PublicKey = sjcl.codec.base64.toBits(masterKeySeedPublicKey);
    let hash = new sjcl.hash.sha256();
    hash.update(base64PublicKey);
    let hashResult = hash.finalize();
    let hashedData = sjcl.codec.hex.fromBits(hashResult);
    hash.reset();
    return `${masterSeedKeyAddrPrefix}${hashedData.substring(0, 40)}`
}

/**
 * @description Derive master key address based on provided mnemonic array
 * @param mnemonicArray {Object[]} mnemonic words array with {index:number, word:string} as each element
 * @param mnemonicArray[].index {Number} word index, starting from 1
 * @param mnemonicArray[].word {string} mnemonic word
 * @return {string} master key address for comparing with the master key address stored in local master key file
 */
function getMasterKeySeedAddressForRecovery(mnemonicArray) {
    const masterKeySeed = masterKeySeedGenerator(mnemonicArray);
    return getMasterKeySeedAddress(getMasterKeySeedPublicKey(masterKeySeed))
}

/**
 * @description Check password when import masterKeySeed file
 * @param password {string} password
 * @param encryptedMasterKeySeed {string} encrypted master key. This param should be read from local encrypted master key file
 * @return {Promise<boolean|error>} Promise.reject returns error, Promise.solve returns unlock result
 */
async function unlockMasterKeySeed(password, encryptedMasterKeySeed) {
    const unlockResult = await masterKeySeedDecryption(password, encryptedMasterKeySeed).catch(error => {
        return Promise.reject(error)
    });
    if (typeof unlockResult == "undefined") return Promise.reject(ErrorUtil.errorWrap(requestErrors.UnableUnlockMasterSeed));
    else return Promise.resolve(ErrorUtil.responseWrap(true))
}

module.exports = {
    mnemonicGenerator24,
    mnemonicGenerator12,
    masterKeySeedGenerator,
    masterKeySeedEncryption,
    masterKeySeedDecryption,
    getMasterKeySeedPublicKey,
    getMasterKeySeedAddress,
    getMasterKeySeedAddressForRecovery,
    unlockMasterKeySeed,
    mnemonicStrToArray,
    mnemonicArrayToStr,
    verifyMnemonic
};
