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
    // 1. Definição das chaves
    const questKeypair = Keypair.fromSecret("YOUR_SECRET_KEY_HERE");
    const issuerKeypair = Keypair.random();

    // 2. Financiar a conta da QUEST (Correção aqui)
    console.log("Funding the QUEST account...");
    try {
        await axios.get(
          `https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`
        );
        console.log("Quest account funded!");
    } catch (e) {
        console.log("Quest account might be already funded.");
    }

    // 3. Financiar a conta do ISSUER
    console.log("Funding the new issuer account...");
    await axios.get(
      `https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`
    );
    console.log("Issuer account funded!");

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");

    // Agora isso vai funcionar porque a conta foi criada pelo Friendbot acima
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    const customAsset = new Asset("SANTA", issuerKeypair.publicKey());

    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Operação 1: Trustline
      .addOperation(
        Operation.changeTrust({
          asset: customAsset,
          limit: "1000",
        })
      )
      // Operação 2: Pagamento do Emissor para a Quest
      .addOperation(
        Operation.payment({
          destination: questKeypair.publicKey(),
          asset: customAsset,
          amount: "100",
          source: issuerKeypair.publicKey(),
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(questKeypair, issuerKeypair);

    console.log("Submitting transaction...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transaction Successful! Hash: ${res.hash}`);
  } catch (error) {
    console.error("❌ An error occurred!");
    if (error.response && error.response.data) {
        // Log detalhado para erros do Horizon
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