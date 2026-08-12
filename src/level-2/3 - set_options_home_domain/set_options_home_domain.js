const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios");

// 1. Chave privada da Quest Account e o Home Domain configurado no Vercel
const SECRET_KEY = "YOUR_SECRET_KEY_HERE";
const HOME_DOMAIN = "stellar-quest-vert.vercel.app"; // Substitua pelo seu domínio Vercel/Surge (< 32 caracteres)

async function main() {
  try {
    const questKeypair = Keypair.fromSecret(SECRET_KEY);
    const publicKey = questKeypair.publicKey();

    console.log(`🔑 Quest Account Public Key: ${publicKey}`);
    console.log(`🌐 Setting Home Domain to: ${HOME_DOMAIN}`);

    if (HOME_DOMAIN.length > 32) {
      console.warn("⚠️  WARNING: Home domain must be 32 characters or fewer.");
    }

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");

    // 2. Garante financiamento via Friendbot se a conta for nova/deletada
    let questAccount;
    try {
      questAccount = await server.loadAccount(publicKey);
      console.log("✅ Account found on ledger!");
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log("⚠️ Account not found. Funding with Friendbot...");
        await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`);
        console.log("✅ Account funded! Waiting 5s for propagation...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        questAccount = await server.loadAccount(publicKey);
      } else {
        throw e;
      }
    }

    // 3. Constrói a transação com a operação setOptions (homeDomain)
    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.setOptions({
          homeDomain: HOME_DOMAIN,
        })
      )
      .setTimeout(30)
      .build();

    // 4. Assina a transação
    transaction.sign(questKeypair);

    // 5. Envia a transação para a Testnet
    console.log("🚀 Submitting setOptions transaction to Testnet...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transaction Successful! Hash: ${res.hash}`);
    console.log(`👉 Verify your badge on Stellar Quest!`);

  } catch (error) {
    console.error("❌ Transaction failed!");
    if (error.response && error.response.data) {
      const errorData = error.response.data.extras || error.response.data;
      console.log(`Details:\n${JSON.stringify(errorData, null, 2)}`);
    } else {
      console.log(error.message || error);
    }
  }
}

main();