# Stellar Quest - Level 1: Change Trust

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

So far in our Stellar Quest Learn journey, we've just worked with Stellar's native token, XLM. In this quest, we'll learn about what needs to happen to start handling custom assets. Custom assets aren't created, they exist in the form of trust on other accounts. In Stellar, this belief is called a **trustline**.

Trustlines are an explicit opt-in for an account to hold a particular asset. To hold a specific asset, an account must establish a trustline with the issuing account using the `changeTrust` operation.

In this quest, your challenge is to establish a trustline between the Quest Account and another account for a specific asset using the `changeTrust` operation.

Let's get started!

## The Solution

Like always, we'll start with our SDK and helper utilities.
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

We'll need two keypairs for this transaction: our quest keypair (the one trusting the asset), and an issuer keypair (the one issuing the asset). Both accounts need to be funded on the testnet.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const issuerKeypair = Keypair.random()

await friendbot([questKeypair.publicKey(), issuerKeypair.publicKey()])
```

We'll get our server and account ready so we can build and submit the transaction.
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

We'll need to create an asset for our quest account to trust. A few quick notes about assets:
- Assets can exist in three forms: alphanumeric 4, alphanumeric 12, and liquidity pool shares.
- Alphanumeric asset codes must be less than or equal to 4 or 12 characters, respectively.
- Asset codes are case-sensitive, so `Pizza`, `PIZZA`, and `pizza` are all different assets.
- The issuer is the public key of the account that is issuing the asset. The issuing account can't hold a balance of its own asset.

```javascript
const santaAsset = new Asset('SANTA', issuerKeypair.publicKey())
```

As we build our transaction, we will use the `changeTrust` operation to create the trustline to our custom asset. The available options for this operation are:
- `asset`: This is the asset we created in the previous step.
- `limit`: How much do you trust the asset issuer? If not specified, it defaults to the maximum amount.
- `source`: The account establishing trust.

```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.changeTrust({
    asset: santaAsset,
    limit: "100"
  }))
  .setTimeout(30)
  .build()
```

With all the necessary information filled out, go ahead and sign and submit the transaction.
```javascript
transaction.sign(questKeypair)

try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

### Bonus Quest!
Combine the `payment` operation with the `changeTrust` operation to make a payment from the issuing account to the trusting account. This actually "mints" the asset, bringing it into existence!

```javascript
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: santaAsset,
      limit: "1000",
    })
  )
  .addOperation(
    Operation.payment({
      destination: questKeypair.publicKey(),
      asset: santaAsset,
      amount: "100",
      source: issuerKeypair.publicKey(),
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(questKeypair, issuerKeypair);
```

## How to Run

Use the `change_trust.js` script to complete this quest:

```bash
node change_trust.js
```
