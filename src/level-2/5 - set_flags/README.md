# Stellar Quest - Level 2: Set Flags (Authorization & Controlling Assets)

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

In Stellar, asset issuers can regulate who holds and transfers their custom tokens by configuring **Account Flags** and **Trustline Flags**.

In this quest, your challenge is to set up a controlled asset, establish a trustline, authorize it, make a payment, and then revoke authorization—all within a **single atomic transaction containing 5 operations**.

---

## Key Concepts & Account Flags

Issuers control their assets by calling `setOptions` with `setFlags`:
- **`AUTHORIZATION_REQUIRED` (`0x1`)**: Requires the issuer to explicitly authorize any trustline before an account can receive or hold the asset.
- **`AUTHORIZATION_REVOCABLE` (`0x2`)**: Allows the issuer to revoke authorization from an existing trustline at any time, locking the asset in the holder's account.
- **`setFlags: 3`**: Combined value `1 + 2 = 3` enabling both requirements on the issuing account.

---

## The 5 Operations in a Single Atomic Transaction

To complete Quest 5 correctly in a single transaction, the transaction MUST be constructed with `issuerAccount` as the transaction source account, and contain the following 5 operations in sequence:

1. **`setOptions` (Source: Issuer Account)**
   Sets `setFlags = 3` (`authRequired` + `authRevocable`) on the issuer account.
2. **`changeTrust` (Source: Quest Account)**
   Creates a trustline from Quest Account to the controlled asset (`source: questKeypair.publicKey()`).
3. **`setTrustLineFlags` (Source: Issuer Account)**
   Authorizes the Quest Account's trustline (`trustor: questKeypair.publicKey()`, `flags: { authorized: true }`).
4. **`payment` (Source: Issuer Account)**
   Sends 100 units of the controlled asset from Issuer to Quest Account (`destination: questKeypair.publicKey()`, `amount: '100'`).
5. **`setTrustLineFlags` (Source: Issuer Account)**
   Revokes authorization from Quest Account (`trustor: questKeypair.publicKey()`, `flags: { authorized: false }`).

---

## The Solution

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

const questKeypair = Keypair.fromSecret('YOUR_SECRET_KEY_HERE')
const issuerKeypair = Keypair.random()

// Fund both accounts with Friendbot
await friendbot([questKeypair.publicKey(), issuerKeypair.publicKey()])

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const issuerAccount = await server.loadAccount(issuerKeypair.publicKey())

const controlledAsset = new Asset('CONTROL', issuerKeypair.publicKey())

const transaction = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  // Operation 1: Issuer enables Auth Required + Auth Revocable
  .addOperation(
    Operation.setOptions({
      setFlags: 3,
    })
  )
  // Operation 2: Quest Account establishes trustline
  .addOperation(
    Operation.changeTrust({
      asset: controlledAsset,
      source: questKeypair.publicKey(),
    })
  )
  // Operation 3: Issuer authorizes Quest Account's trustline
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: questKeypair.publicKey(),
      asset: controlledAsset,
      flags: {
        authorized: true,
      },
    })
  )
  // Operation 4: Issuer sends 100 CONTROL to Quest Account
  .addOperation(
    Operation.payment({
      destination: questKeypair.publicKey(),
      asset: controlledAsset,
      amount: "100",
    })
  )
  // Operation 5: Issuer revokes Quest Account's authorization
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: questKeypair.publicKey(),
      asset: controlledAsset,
      flags: {
        authorized: false,
      },
    })
  )
  .setTimeout(30)
  .build()

// Must sign with BOTH keypairs:
// - issuerKeypair (Transaction source & Ops 1, 3, 4, 5)
// - questKeypair (Op 2 changeTrust source)
transaction.sign(issuerKeypair, questKeypair)

const res = await server.submitTransaction(transaction)
console.log(`Transaction Successful! Hash: ${res.hash}`)
```

---

## ⚠️ Important Warning: The Quest 4 Multisig Trap (`op_bad_auth`)

If you encounter an `op_bad_auth` error on Operation 2 (`changeTrust`):

> [!CAUTION]
> **Why `op_bad_auth` happens:**
> In Level 2 - Quest 4, you set the thresholds (`lowThreshold`, `medThreshold`, `highThreshold`) of your Quest Account to **5**, and added two random signers. If those random signers' private keys were lost when the process closed, your Quest Account on Testnet is permanently locked with threshold 5.
> Since Operation 2 (`changeTrust`) is a Medium threshold operation, the Stellar network will reject it if signed with only the master key (weight 1 < threshold 5).

### 🛠️ Solution:
If your Quest Account is locked from Quest 4, ask a moderator on the **Stellar Dev Discord** to reset your Quest Keypair, or request a keypair reset on the platform!

---

## How to Run

Use the `set_flags.js` script to run this quest locally:

```bash
node set_flags.js
```
