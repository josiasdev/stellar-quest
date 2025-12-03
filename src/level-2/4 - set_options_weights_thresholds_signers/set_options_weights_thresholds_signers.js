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
    const questKeypair = Keypair.fromSecret("YOUR_SECRET_KEY_HERE");
    const secondSigner = Keypair.random();
    const thirdSigner = Keypair.random();

    console.log("Master Key:", questKeypair.publicKey());
    console.log("Second Signer:", secondSigner.publicKey());
    console.log("Third Signer:", thirdSigner.publicKey());

    console.log("\nFunding account with friendbot...");
    try {
      await axios.get(
        `https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`
      );
      console.log("Account funded! 🤖");
    } catch (e) {
      console.log("Account may already be funded.");
    }

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    let questAccount = await server.loadAccount(questKeypair.publicKey());

    console.log("\nBuilding setup transaction...");
    const setupTransaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.setOptions({
          masterWeight: 1,
          lowThreshold: 5,
          medThreshold: 5,
          highThreshold: 5,
        })
      )
      .addOperation(
        Operation.setOptions({
          signer: {
            ed25519PublicKey: secondSigner.publicKey(),
            weight: 2,
          },
        })
      )
      .addOperation(
        Operation.setOptions({
          signer: {
            ed25519PublicKey: thirdSigner.publicKey(),
            weight: 2,
          },
        })
      )
      .setTimeout(30)
      .build();

    setupTransaction.sign(questKeypair);

    console.log("Submitting setup transaction...");
    await server.submitTransaction(setupTransaction);
    console.log("✅ Multisig setup successful!");

    questAccount = await server.loadAccount(questKeypair.publicKey());

    console.log("\nBuilding multisig test transaction...");
    const multisigTransaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: "Quest",
          value: "Complete!",
        })
      )
      .setTimeout(30)
      .build();

    multisigTransaction.sign(questKeypair);
    multisigTransaction.sign(secondSigner);
    multisigTransaction.sign(thirdSigner);

    console.log("Submitting multisig transaction...");
    const res = await server.submitTransaction(multisigTransaction);
    console.log(`✅ Multisig transaction successful! Hash: ${res.hash}`);
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