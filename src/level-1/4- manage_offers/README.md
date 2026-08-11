# Stellar Quest - Level 1: Manage Offers

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

Now that we know how to trust and issue assets other than the native XLM token, we have what we need to begin utilizing Stellar's native decentralized exchange or DEX. `manage` offer operations allow you to offer to buy or sell a specific amount of an asset at a specific exchange rate for a different asset. For example, sell 14 of asset A for 64 of asset B.

Stellar has three operations that manage these exchange offers:
1. `manageBuyOffer`
2. `manageSellOffer`
3. `createPassiveSellOffer`

In this quest, your challenge is to open a buy or sell offer on the Quest Account using a `manageBuyOffer`, `manageSellOffer`, or `createPassiveSellOffer` operation.

Let's walk through the three manage offer operations as we build our transaction.

## The Solution

We'll start, as always, with our SDK and helper utilities.
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

We only need the keypair for our quest account for this quest, and it will need to be funded on the testnet. We'll also need our server and account to build and submit the transaction.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
await friendbot(questKeypair.publicKey())

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

We'll need an asset to use as our counter-asset when we make our offers. Below, we set up the asset for USDC (issued on the testnet by `centre.io`):
```javascript
const usdcAsset = new Asset(
  'USDC',
  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
)
```

We begin setting up our transaction. We also need to create a trustline to our non-native asset before we can create any exchange offers:
```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.changeTrust({
    asset: usdcAsset
  }))
```

### 1. Manage Buy Offer
Every offer is technically both a buy and sell offer. Selling 100 XLM for 10 USD is identical to buying 10 USD for 100 XLM.
- `selling`: The asset you're offering to give (e.g. native XLM).
- `buying`: The asset you're seeking to receive (e.g. USDC).
- `buyAmount`: The amount of the buying asset you must receive for this offer to be taken.
- `price`: Selling amount divided by buying amount.
- `offerId`: (optional) `0` for new offer, or existing offer ID to update/delete.

```javascript
  .addOperation(Operation.manageBuyOffer({
    selling: Asset.native(),
    buying: usdcAsset,
    buyAmount: '100',
    price: '10',
    offerId: '0',
    source: questKeypair.publicKey()
  }))
```

### 2. Manage Sell Offer
This operation is similar to `manageBuyOffer`, with the primary and counter assets swapped.
- `selling`: The asset you're offering to give (e.g. native XLM).
- `buying`: The asset you're seeking to receive (e.g. USDC).
- `amount`: The amount of the selling asset you must give for this offer to be taken.
- `price`: Buying amount divided by selling amount.

```javascript
  .addOperation(Operation.manageSellOffer({
    selling: Asset.native(),
    buying: usdcAsset,
    amount: '1000',
    price: '0.1',
    offerId: '0',
    source: questKeypair.publicKey()
  }))
```

### 3. Create Passive Sell Offer
Creates an offer to sell one asset for another without taking an already-existing reverse offer of equal price.
```javascript
  .addOperation(Operation.createPassiveSellOffer({
    selling: Asset.native(),
    buying: usdcAsset,
    amount: '1000',
    price: '0.1',
    source: questKeypair.publicKey()
  }))
```

### Complete Code & Submission
```javascript
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: usdcAsset,
    })
  )
  .addOperation(
    Operation.manageSellOffer({
      selling: Asset.native(),
      buying: usdcAsset,
      amount: "100",
      price: "0.25",
    })
  )
  .setTimeout(30)
  .build()

transaction.sign(questKeypair)

try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

> **Note:** Offers may or may not be taken immediately upon submission. If a matching counteroffer is on the order book, it executes immediately. Otherwise, it sits idle on the DEX until taken or canceled.

## How to Run

Use the `manage_offers.js` script to complete this quest:

```bash
node manage_offers.js
```
