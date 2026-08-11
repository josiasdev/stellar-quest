# Stellar Quest - Level 1: Payments

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

The current primary use case of blockchain technology is to secure the transfer of valuable things. And Stellar is no exception.

In this quest, your challenge is to perform a payment operation where you'll submit a transaction containing that payment operation on the Stellar test network from the Quest Account to another account.

So let's get to it.

## The Solution

Just like the first time, we'll begin by grabbing a few things from the `stellar-sdk`.
```javascript
const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE
} = require('@stellar/stellar-sdk')
```

We have also created a handy helper function that can talk to friendbot for us! (This method of using friendbot is not strictly necessary. We've put together this helper function simply as a convenience. You are free to choose any number of ways to fund these accounts.)
```javascript
const friendbot = async (keys) => {
  const accounts = Array.isArray(keys) ? keys : [keys]
  await Promise.all(accounts.map(pk =>
    fetch(`https://friendbot.stellar.org?addr=${pk}`)
  ))
}
```
*(Note: In the local repository script, we use `axios` to call the friendbot endpoint directly.)*

We need two keypairs for this transaction: a source account, and a destination account. In this case, we need both to be funded on the testnet.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const destinationKeypair = Keypair.random()

await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()])
```

We set up the server and account that will be used to build and submit the transaction.
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Next, we build our transaction that will contain the single payment operation from our source account to our destination account. Most of this transaction should look pretty similar to the previous quest. We are using the payment operation here. The available options for this operation are:

- `destination`: Who's the lucky recipient of the payment operation?
- `asset`: The asset you'd like to send. Assets on Stellar can represent many things: digital currencies (such as bitcoin), fiat currencies (USDC), or other tokens of value (such as NFTs). For this quest, we'll use the native XLM token and cover custom assets later.
- `amount`: How much of the asset you're going to send. Remember, you can only send what you have.
- `source`: What account will the network be subtracting funds from? Remember, you can leave this blank and it will assume the transaction source.

```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.payment({
    destination: destinationKeypair.publicKey(),
    asset: Asset.native(),
    amount: '100'
  }))
  .setTimeout(30)
  .build()
```

Then, of course, we need to sign it with our quest account's keypair.
```javascript
transaction.sign(questKeypair)
```

Lastly, we are ready to submit our transaction to the testnet!
```javascript
try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

If the transaction was successful, fantastic! Go ahead and Verify it and claim your new badge.

## How to Run

Use the `payments.js` script to complete this quest locally:

```bash
node payments.js
```
