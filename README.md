# Password Master

Password Master is a pure local(offline) personal password manager app writing in Nodejs, it is leveraged by Hierarchical Deterministic(HD) Wallet.

Password Master supports two way of usage:
1. integrate as a npm dependency
2. CLI tool

## Usage for Integrate as npm dependency

import
```javascript
    const HDVault = require('password-master');
```

#### Master Key Derivation
```javascript
    const yourMasterKeyPassword = "xxxxxx"; // This is the password to encrypt your master key
    const mnemonicWords = HDVault.mnemonicUtil.mnemonicGenerator24();
    const masterKey = new HDVault.MasterKeySeedManager(mnemonicWords, yourMasterKeyPassword);
    const {encryptedMasterKeySeed} = masterKey.getMasterKeySeedInfo(); // You need to store this encryptedMasterKeySeed for later usage
```

#### Oneledger Key Derivation
```javascript
    const derivedKeyData = {
        keyType: "OLT",
        keyIndex: 0, // key index
        password: yourMasterKeyPassword,
        encryptedMasterKeySeed: encryptedMasterKeySeed
    };
    const {response} = await HDVault.derivedKeyManager.deriveNewKeyPair(derivedKeyData).catch(error => {
        // handler error here
    });
    const {keyIndex, address, publicKey} = response; // Address is the Oneledger address derived based on key index, publicKey is the public key associated to this address
```

#### Sign tx with Oneledger Key
```javascript
    const signData = {
        message: rawTx, // Base64 encoded Oneledger rawTx
        keyType: "OLT",
        keyIndex: 0, // To sign with Oneledger address derived before, please using the same key index here
        password: yourMasterKeyPassword,
        encryptedMasterKeySeed: encryptedMasterKeySeed
    };
    const {response} = await HDVault.derivedKeyManager.signTx(signData).catch(error => {
        // handler error here
    });
    const {signature} = response; // Get Oneledger tx signature
```

Use the `signature` with `publicKey` to broadcast Oneledger tx.   
Please note, for broadcast, the `publicKey` and `signature` have to be generated by the same key index.
