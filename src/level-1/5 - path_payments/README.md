# Stellar Quest - Level 1: Path Payments

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

With the concept of trustlines under our belt, let's turn our attention to a new type of payment: the powerful **path payment**.

In a classic payment scenario, the asset sent is the same as the asset received. In a path payment, the asset received differs from the asset sent. For example, you can send XLM and have the recipient receive USDC.

Path payments automatically cross through the DEX order books and/or liquidity pools to convert the sent asset into the destination asset in a single atomic transaction.

There are two operations for path payments:
1. `pathPaymentStrictSend`: You specify the exact amount to send.
2. `pathPaymentStrictReceive`: You specify the exact amount to receive.

In this quest, your challenge is to successfully send a path payment from the Quest Account to another account on the Stellar test network.

---

## The Solution

We'll start by importing from the `@stellar/stellar-sdk`.
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

For this setup, we use 4 keypairs:
- `questKeypair`: Source account making the payment.
- `issuerKeypair`: Issues our custom asset (`PATH`).
- `distributorKeypair`: Holds the issued asset and places offers on the DEX.
- `destinationKeypair`: The recipient account.

```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const issuerKeypair = Keypair.random()
const distributorKeypair = Keypair.random()
const destinationKeypair = Keypair.random()

await friendbot([
  questKeypair.publicKey(),
  issuerKeypair.publicKey(),
  distributorKeypair.publicKey(),
  destinationKeypair.publicKey()
])
```

Set up the server, load the account, and define the custom asset:
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())

const pathAsset = new Asset('PATH', issuerKeypair.publicKey())
```

### 1. Path Payment Strict Send
For denoting a precise amount to send:
- `sendAsset`: Asset you're sending (e.g. `Asset.native()`).
- `sendAmount`: Exact amount of sending asset to convert.
- `destination`: Destination public key.
- `destAsset`: Asset the destination account will receive (`pathAsset`).
- `destMin`: Minimum acceptable destination asset amount.

```javascript
  .addOperation(Operation.pathPaymentStrictSend({
    sendAsset: Asset.native(),
    sendAmount: '1000',
    destination: destinationKeypair.publicKey(),
    destAsset: pathAsset,
    destMin: '1000'
  }))
```

### 2. Path Payment Strict Receive
For denoting a precise amount to receive:
- `sendAsset`: Asset being sent.
- `sendMax`: Maximum amount of sending asset willing to spend.
- `destination`: Destination public key.
- `destAsset`: Asset to receive.
- `destAmount`: Exact amount of destination asset to receive.

```javascript
  .addOperation(Operation.pathPaymentStrictReceive({
    sendAsset: pathAsset,
    sendMax: '450',
    destination: questKeypair.publicKey(),
    destAsset: Asset.native(),
    destAmount: '450',
    source: destinationKeypair.publicKey()
  }))
```

---

## Complete Atomic Transaction Example

In a single transaction, we perform:
1. Destination & Distributor establish trustlines to `PATH`.
2. Issuer mints `PATH` to Distributor.
3. Distributor creates a DEX sell offer (`PATH` -> `XLM`).
4. Quest Account executes a `pathPaymentStrictSend` (sends `XLM`, destination receives `PATH`).

```javascript
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: pathAsset,
      source: destinationKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.changeTrust({
      asset: pathAsset,
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: pathAsset,
      amount: "1000000",
      source: issuerKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.createPassiveSellOffer({
      selling: pathAsset,
      buying: Asset.native(),
      amount: "2000",
      price: "1",
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.pathPaymentStrictSend({
      sendAsset: Asset.native(),
      sendAmount: "1000",
      destination: destinationKeypair.publicKey(),
      destAsset: pathAsset,
      destMin: "1000",
    })
  )
  .setTimeout(180)
  .build();

transaction.sign(
  questKeypair,
  issuerKeypair,
  distributorKeypair,
  destinationKeypair
);

try {
  let res = await server.submitTransaction(transaction);
  console.log(`Transaction Successful! Hash: ${res.hash}`);
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`);
}
```

---

## How to Run

Use the `path_payments.js` script to run this quest locally:

```bash
node path_payments.js
```
