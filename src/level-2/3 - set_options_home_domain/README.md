# Stellar Quest - Level 2: Set Options - Home Domain

> 🇧🇷 [Leia isto em Português (Brasil)](README_PT_BR.md)

It's time to dive into the powerful `setOptions` operation. The `setOptions` operation allows you to configure account-level parameters on the Stellar network. In this quest, we focus specifically on setting the **Home Domain** field.

The **Home Domain** field links your Stellar account to an internet web domain that hosts a `stellar.toml` file (SEP-001 specification). This file establishes domain ownership, lists issued assets, validator nodes, and public contact/service endpoints associated with that account.

To be valid, the `stellar.toml` file must be hosted over HTTPS at:
`https://<YOUR_DOMAIN>/.well-known/stellar.toml`

---

## 🛠️ Deploying your `stellar.toml` File with Vercel (Recommended)

When attempting to host the `stellar.toml` file on static hosting tools (like Surge.sh), you may run into a `400 Bad Request` verification error because of missing CORS headers or strict `Content-Type` checks (`text/plain`).

Deploying via **Vercel** with GitHub integration guarantees proper CORS and header handling!

### Step-by-Step Vercel Setup

1. **Create the public directory structure:**
   ```bash
   mkdir -p public/.well-known
   ```

2. **Add `stellar.toml` inside `public/.well-known/`:**
   Create `public/.well-known/stellar.toml` and paste the following content (replace `YOUR_QUEST_ACCOUNT_PUBLIC_KEY` with your Quest Account Public Key):
   ```toml
   VERSION = "0.1.0"
   NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"
   ACCOUNTS = [
     "YOUR_QUEST_ACCOUNT_PUBLIC_KEY"
   ]
   ```

3. **Configure `vercel.json` for proper headers:**
   Create `vercel.json` in the root of your project:
   ```json
   {
     "headers": [
       {
         "source": "/.well-known/stellar.toml",
         "headers": [
           { "key": "Access-Control-Allow-Origin", "value": "*" },
           { "key": "Content-Type", "value": "text/plain; charset=utf-8" }
         ]
       }
     ]
   }
   ```

4. **Push to GitHub:**
   ```bash
   git add -f public/.well-known/stellar.toml vercel.json
   git commit -m "feat: add stellar.toml and vercel headers configuration"
   git push
   ```

5. **Deploy & Verify:**
   - Connect your GitHub repository to Vercel.
   - Access `https://your-app.vercel.app/.well-known/stellar.toml` in your browser.
   - Update `HOME_DOMAIN` in `set_options_home_domain.js` with `your-app.vercel.app` (without `https://`).

---

## Operation Parameters

The options for `setOptions` with `homeDomain` are:
- `homeDomain`: The domain string (must be **<= 32 characters**).
- `source`: (optional) Account setting the options. Defaults to transaction source account.

---

## The Solution

Import requirements from `@stellar/stellar-sdk` and load the account:

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

Build, sign, and submit the transaction:
```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.setOptions({
    homeDomain: 'stellar-quest-vert.vercel.app'
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

## SEP-001 & Additional Resources

- **SEP-001 Standard Spec:** [Stellar Ecosystem Proposal 001](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md)
- **Home Domain Length limit:** Maximum 32 characters.

---

## How to Run

Use the `set_options_home_domain.js` script to complete this quest locally:

```bash
node set_options_home_domain.js
```
