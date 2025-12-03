const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios");

async function main() {
  try {
    const questKeypair = Keypair.fromSecret("YOUR_SECRET_KEY_HERE");
    const issuerKeypair = Keypair.random();

    console.log("Quest Account:", questKeypair.publicKey());
    console.log("Issuer Account:", issuerKeypair.publicKey());

    console.log("\nFunding both accounts with friendbot...");
    await Promise.all([
      axios.get(
        `https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`
      ),
      axios.get(
        `https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`
      ),
    ]);
    console.log("Accounts funded! 🤖");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    const controlledAsset = new Asset("CONTROL", issuerKeypair.publicKey());

    console.log("\nBuilding the transaction with 5 operations...");
    const transaction = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Operação 1: Issuer define as flags em sua própria conta
      .addOperation(
        Operation.setOptions({
          setFlags: 3, // 1 (Auth Required) + 2 (Auth Revocable) = 3
        })
      )
      // Operação 2: Quest Account cria a trustline para o ativo
      .addOperation(
        Operation.changeTrust({
          asset: controlledAsset,
          source: questKeypair.publicKey(), // IMPORTANTE: A fonte desta operação é a Quest Account
        })
      )
      // Operação 3: Issuer autoriza a trustline da Quest Account
      .addOperation(
        Operation.setTrustLineFlags({
          trustor: questKeypair.publicKey(),
          asset: controlledAsset,
          flags: {
            authorized: true,
          },
        })
      )
      // Operação 4: Issuer envia 100 unidades do ativo para a Quest Account
      .addOperation(
        Operation.payment({
          destination: questKeypair.publicKey(),
          asset: controlledAsset,
          amount: "100",
        })
      )
      // Operação 5: Issuer revoga a autorização da trustline
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
      .build();

    transaction.sign(issuerKeypair, questKeypair);

    console.log("Submitting the transaction...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transaction Successful! Hash: ${res.hash}`);
  } catch (error) {
    console.error("❌ An error occurred!");
    if (error.response && error.response.data) {
      const errorData = error.response.data.extras
        ? error.response.data.extras
        : error.response.data;
      console.log(`More details:\n${JSON.stringify(errorData, null, 2)}`);
    } else {
      console.log(error);
    }
  }
}

main();