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
    const questKeypair = Keypair.fromSecret("SDW36DEG7UIBSOKA7VR7L47OIWIISW72FMPCU3KM2VGIJXQK3THM4ZI5");
    const issuerKeypair = Keypair.random();
    const distributorKeypair = Keypair.random();
    const destinationKeypair = Keypair.random();

    console.log("Funding the 3 new accounts...");
    await Promise.all([
      axios.get(
        `https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`
      ),
      axios.get(
        `https://friendbot.stellar.org?addr=${distributorKeypair.publicKey()}`
      ),
      axios.get(
        `https://friendbot.stellar.org?addr=${destinationKeypair.publicKey()}`
      ),
    ]);
    console.log("All new accounts funded!");

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");

    const questAccount = await server.loadAccount(questKeypair.publicKey());

    const pathAsset = new Asset("PATH", issuerKeypair.publicKey());

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
          destMin: "1000", // Com preço 1:1, o mínimo a receber é 1000
        })
      )
      .setTimeout(180) // Aumentamos o timeout para transações complexas
      .build();

    transaction.sign(
      questKeypair,
      issuerKeypair,
      distributorKeypair,
      destinationKeypair
    );

    console.log("Submitting complex path payment transaction...");
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