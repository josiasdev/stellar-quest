# Stellar Quest - Level 2: Manage Data

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

Accounts are the backbone of Stellar applications and are part of any action you take on the network. One important class of actions involves setting, modifying, or deleting data entries within an account's metadata. Data entries are key/value pairs and can be used to attach arbitrary, application-specific data to an account on the Stellar network.

Each data entry increases the account's minimum balance by one base reserve (0.5 XLM).

In this quest, you will add a data entry to the Quest Account using the `manageData` operation.

---

## Key Concepts & Parameters

The options available for the `manageData` operation are:
- `name`: String key name for your key/value pair (maximum 64 characters).
- `value`: The value assigned to `data[name]`. Can be a `string` or a `Buffer`. Pass `null` to delete a data entry.
- `source`: (optional) Account to modify data entries for. Defaults to transaction source account.

### Base64 Encoding in Horizon
When reading data entries from a Horizon API endpoint, the `value` is returned as a **base64 encoded string**. To convert it back to ASCII/UTF-8:

```javascript
const valueFromHorizon = 'U3RlbGxhciBRdWVzdCE='
const valueAsBuffer = Buffer.from(valueFromHorizon, 'base64')
const asciiText = valueAsBuffer.toString('ascii')
console.log(asciiText) // outputs 'Stellar Quest!'
```

---

## The Solution

Import requirements from `@stellar/stellar-sdk` and initialize keypair & Horizon server:

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
await friendbot(questKeypair.publicKey())

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Build the transaction with `manageData` operations:
```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.manageData({
    name: 'Hello',
    value: 'World'
  }))
  .addOperation(Operation.manageData({
    name: 'Hello',
    value: Buffer.from('Stellar Quest!')
  }))
  .setTimeout(30)
  .build()

transaction.sign(questKeypair)

try {
  const res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

---

## How to Run

Use the `manage_data.js` script to complete this quest locally:

```bash
node manage_data.js
```
