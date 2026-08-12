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
    // Substitua pela Secret Key da sua Quest Account no Stellar Quest
    const SECRET_KEY = "YOUR_SECRET_KEY_HERE";
    const questKeypair = Keypair.fromSecret(SECRET_KEY);
    const issuerKeypair = Keypair.random();

    console.log("Quest Account Public Key:", questKeypair.publicKey());
    console.log("Issuer Account Public Key:", issuerKeypair.publicKey());

    console.log("\nFunding accounts with friendbot if needed...");
    try {
      await axios.get(`https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`);
    } catch (e) {
      console.log("Quest account might already be funded.");
    }
    try {
      await axios.get(`https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`);
    } catch (e) {
      console.log("Issuer account might already be funded.");
    }
    console.log("Accounts ready! 🤖");
    await new Promise((resolve) => setTimeout(resolve, 4000));

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    const controlledAsset = new Asset("CONTROL", issuerKeypair.publicKey());

    console.log("\nBuilding transaction with 5 operations...");
    const transaction = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Operação 1: Issuer define as flags em sua própria conta (Auth Required 1 + Auth Revocable 2 = 3)
      .addOperation(
        Operation.setOptions({
          setFlags: 3,
        })
      )
      // Operação 2: Quest Account cria a trustline para o ativo controlado
      .addOperation(
        Operation.changeTrust({
          asset: controlledAsset,
          source: questKeypair.publicKey(),
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

    // Assina com o emissor e com a Quest Account
    transaction.sign(issuerKeypair, questKeypair);

    console.log("Submitting transaction to Stellar Testnet...");
    const res = await server.submitTransaction(transaction);
    console.log(`\n✅ Transaction Successful! Hash: ${res.hash}`);
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