const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = require("stellar-sdk");

async function main() {
  try {
    const questKeypair = Keypair.fromSecret("YOUR_SECRET_KEY_HERE");

    const newKeypair = Keypair.random();

    console.log("Quest Account (Source):", questKeypair.publicKey());
    console.log("New Account (Destination):", newKeypair.publicKey());

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");

    console.log("\nLoading source account...");
    const questAccount = await server.loadAccount(questKeypair.publicKey());
    console.log("Source account loaded successfully.");

    console.log("Building transaction...");
    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createAccount({
          destination: newKeypair.publicKey(),
          startingBalance: "1000",
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(questKeypair);
    console.log("Transaction signed.");

    console.log("Submitting transaction...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transaction Successful! Hash: ${res.hash}`);

    console.log(`\nVerify the new account on Stellar Expert:`);
    console.log(
      `https://stellar.expert/explorer/testnet/account/${newKeypair.publicKey()}`
    );
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