# Stellar Quest - Level 2: Set Options - Weights, Thresholds, and Signers

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

In this quest, we explore **Multisignature (Multisig)** on the Stellar network.

Signatures are needed to authorize transactions. You sign transactions with the **master key**, which corresponds to the account's public key. Some transactions require additional or alternate signatures, configured using the `setOptions` operation.

In this quest, you will set signature weights, define operation thresholds, add additional signers to the Quest Account, and submit a successful multi-signed transaction.

---

## Key Concepts

### 1. Weights and Signers
- **`masterWeight`**: Signature weight of the account's master secret key (default is 1).
- **`signer`**: Add or remove signers (`ed25519PublicKey`) with custom weights.

### 2. Thresholds
Every operation falls into one of three threshold categories:
- **`lowThreshold`**: Low-security operations (e.g. `allowTrust`).
- **`medThreshold`**: Medium-security operations (e.g. `payment`, `changeTrust`, `manageOffer`).
- **`highThreshold`**: High-security operations (e.g. `setOptions`, `accountMerge`).

> ⚠️ **Warning:** Be careful when setting thresholds! If you set threshold values higher than the total weight of available signers, you will lock yourself out of the account permanently.

---

## Quest Threshold Formula

In this quest:
- Master Key Weight = 1
- Second Signer Weight = 2
- Third Signer Weight = 2
- Low / Medium / High Thresholds = 5

Total Weight = 1 (Master) + 2 (Signer 2) + 2 (Signer 3) = **5**.
All three signers must sign any transaction for it to satisfy the threshold of 5!

---

## The Solution

Import requirements from `@stellar/stellar-sdk`:
```javascript
const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('@stellar/stellar-sdk')

const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const secondSigner = Keypair.random()
const thirdSigner = Keypair.random()

await friendbot(questKeypair.publicKey())

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

### Step 1: Configure Weights, Thresholds & Signers
```javascript
const setupTransaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setOptions({
      masterWeight: 1,
      lowThreshold: 5,
      medThreshold: 5,
      highThreshold: 5,
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: secondSigner.publicKey(),
        weight: 2,
      },
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: thirdSigner.publicKey(),
        weight: 2,
      },
    })
  )
  .setTimeout(30)
  .build()

setupTransaction.sign(questKeypair)
await server.submitTransaction(setupTransaction)
```

### Step 2: Submit a Multisig Transaction Signed by All 3 Keys
```javascript
const updatedAccount = await server.loadAccount(questKeypair.publicKey())

const multisigTransaction = new TransactionBuilder(updatedAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.manageData({
      name: 'Quest',
      value: 'Complete!',
    })
  )
  .setTimeout(30)
  .build()

// Sign with all 3 keypairs to reach the required weight threshold of 5
multisigTransaction.sign(questKeypair)
multisigTransaction.sign(secondSigner)
multisigTransaction.sign(thirdSigner)

const res = await server.submitTransaction(multisigTransaction)
console.log(`Transaction Successful! Hash: ${res.hash}`)
```

---

## How to Run

Use the `set_options_weights_thresholds_signers.js` script to run this quest locally:

```bash
node set_options_weights_thresholds_signers.js
```
