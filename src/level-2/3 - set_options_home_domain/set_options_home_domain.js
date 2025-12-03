const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios");

async function main() {
  try {
    const questKeypair = Keypair.fromSecret(
      "YOUR_SECRET_KEY_HERE"
    );

    console.log("Funding account with friendbot...");
    await axios.get(`https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`);
    console.log("Account already funded! Continuing... 🤖");

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.setOptions({
          homeDomain: "example.runkit.sh",
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(questKeypair);

    console.log("Submitting transaction...");
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