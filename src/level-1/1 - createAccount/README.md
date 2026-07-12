# Stellar Quest - Level 1: Create Account

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

If Stellar were a universe, and it is, accounts would be the planets, stars, moons, and asteroids within that fertile space.

Less abstractly, accounts are the central data structure in Stellar — they hold balances, sign transactions, and issue assets. Accounts can only exist with a valid keypair and the required minimum balance of lumens (XLM).

In this quest, your challenge is to create an account by using the `createAccount` operation with the Quest Keypair located in the box on the right-hand side of this screen.

Let's get started!

Start by clicking the Fund button next to the Quest Keypair in the box on the right-hand side of the quest screen.
Every quest in Stellar Quest Learn will have a different Quest Account (also called the Quest Keypair) that plays an important role in the quest. The Fund button funds the keypair with 10,000 fake XLM from Stellar's testnet faucet named friendbot.

Note that on the public network, we don't have friendbot handing out free XLM to anyone that asks! Users have to get XLM from an exchange, wallet transfer, or by other means.

## The Solution

To begin, we're going to need a few things from the `stellar-sdk`.
```javascript
const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('stellar-sdk')
```

Then, we'll get our two keypairs sorted out. One will be for your quest account, and the other will be a new, randomly generated keypair.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const newKeypair = Keypair.random()
```

Next, we'll get a couple things ready for the transaction we'll be building. Here's what we're going to need:
- A server that can be used to retrieve and submit information to the network.
- The account associated with your quest keypair. This may be confusing at first, but when we get this information from our server, it gives us all the necessary information to build a valid transaction.

The Stellar network runs in two distinct instances: the public network (also called pubnet or mainnet) and the test network (also called testnet). The pubnet is the main network used by applications in production. The testnet is a smaller, free-to-use network maintained by the Stellar Development Foundation (SDF) that functions like the pubnet, but doesn't contain any assets with any real-world value. You can think of it as a "safe playground." It has a built-in testnet XLM faucet (called friendbot), and it's the best place for developers to test their applications.

```javascript
// You would need to remove the '-testnet' here, if you were using the Stellar Public network.
const server = new Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Now we're ready to begin building the transaction that will be submitted to the network. Sweet! For this, we'll use the `TransactionBuilder` from the SDK. Every time we use the `TransactionBuilder`, we will begin with the following information:
- The `questAccount` we retrieved from the server in an earlier step. This account includes the public key for the account, along with its sequence number.
- The maximum fee we are willing to pay to make this transaction successfully hit the ledger.
- The network passphrase that goes along with the network we are using.

```javascript
let transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
```

Great start! Now we'll use the `addOperation` method on our transaction which will, shocker, add an operation to the transaction. We can add many different kinds of operations (and we will, as time goes on), but for now, we'll use the `createAccount` operation. The available options for this operation are:
- `destination`: The destination account you're sending XLM to (i.e. the account to be created).
- `startingBalance`: How much XLM you'd like to send from the source account to this new destination account we're creating.
- `source`: This operational source account field is optional because it assumes the source account for the transaction if left blank. You can specify a different source account for each operation if needed.

```javascript
let transaction = new TransactionBuilder(...)
  .addOperation(Operation.createAccount({
    destination: newKeypair.publicKey(),
    startingBalance: "1000" // You can make this any amount you want (as long as you have the funds!)
  })
```

Awesome! We're so close. Now, a couple more things to do before your transaction is complete:
1. We need to add a timeout to the transaction. While not technically a requirement, it is best practice and will prevent a transaction from being valid after a given amount of time.
2. We'll also need to `build()` the transaction.
3. Lastly, we sign the transaction so the network can make sure we have the proper authorization to submit transactions for this particular account. Then, we'll be ready to go!

```javascript
let transaction = new TransactionBuilder(...)
  .setTimeout(30)
  .build()
transaction.sign(questKeypair)
```

Note: If you're interested in seeing a more visual representation of the transaction you've just built and signed, you can look at the transaction in the Stellar Laboratory. Copy the output from the snippet below, and paste it into the “View XDR” page in the Laboratory.

```javascript
console.log(transaction.toXdr())
```

Finally, all that's left is to submit the transaction to the network. We do this with our server that we set up earlier.
```javascript
try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

Assuming everything went well, you can click the button below to see if you passed, and collect your first fresh Stellar Quest NFT badge.

If the quest failed, double-check your transaction to ensure everything is correct. If you have questions, head over to our Stellar Quest Discord to ask the community for help!

## Verify your Account

Want to see more information on your account or a particular transaction? Let's check Stellar Expert!

1. Navigate to stellar.expert
2. Ensure you're looking at the testnet, not the public network
3. Input the Quest Account's public key (also called account ID) into the search bar at the top of the page and hit enter
4. You should see your account, its balances, and transactions performed

## How to Run

Use the `create_account.js` script to complete this quest:

```bash
node create_account.js
```
