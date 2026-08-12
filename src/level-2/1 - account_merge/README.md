# Stellar Quest - Level 2: Account Merge

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

Before we progress too far into our Stellar operational journey, we should talk about how to delete accounts.

In this quest, you'll delete an account by transferring all of its native XLM balance to a destination account using the `accountMerge` operation.

Every Stellar account must maintain a minimum balance of XLM, which is calculated using base reserves (each base reserve is 0.5 XLM). A Stellar account must maintain two base reserves (1 XLM) just to exist on the ledger—so transferring this XLM balance removes the account from the ledger.

---

## Important Rules for Account Merge

It's not just the XLM balance that needs to be removed from an account to merge it. You also need to remove all subentries:
- **Trustlines** need to be emptied and removed (limit = 0).
- **Additional signers** need to be dropped.
- **Open offers** on the DEX must be closed.
- **Data entries** must be deleted.

If an account still has active subentries, the `accountMerge` operation will fail.

---

## The Solution

We'll start by importing from `@stellar/stellar-sdk` and set up our server and keypairs.
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
const destinationKeypair = Keypair.random()

await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()])

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Now we build our transaction containing only the `accountMerge` operation:
- `destination`: The destination account that will receive all remaining XLM and reserve funds from the merged account.
- `source`: (optional) The account to be merged into destination. Defaults to transaction source if omitted.

```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.accountMerge({
    destination: destinationKeypair.publicKey()
  }))
  .setTimeout(30)
  .build()
```

Sign and submit the transaction to the network:
```javascript
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

Use the `account_merge.js` script to complete this quest locally:

```bash
node account_merge.js
```
