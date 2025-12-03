const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios"); // Certifique-se de ter instalado: npm install axios

async function main() {
  try {
    const questKeypair = Keypair.fromSecret("YOUR_SECRET_KEY_HERE");
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");

    // --- PASSO DE CORREÇÃO: Financiar a conta antes de usar ---
    console.log(`Checking/Funding account ${questKeypair.publicKey()}...`);
    try {
      // Tenta financiar via Friendbot
      await axios.get(`https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`);
      console.log("✅ Account funded by Friendbot!");
    } catch (e) {
      // Se der erro aqui, geralmente é porque já está financiada ou o friendbot está lento.
      // Vamos prosseguir e deixar o loadAccount validar.
      console.log("Note: Friendbot request finished (account might already exist).");
    }
    // ----------------------------------------------------------

    // O ativo que queremos negociar (USDC na testnet)
    const usdcAsset = new Asset(
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    );

    console.log("Loading account details...");
    // Agora o loadAccount deve funcionar
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Operação 1: Criar a trustline para poder negociar USDC
      .addOperation(
        Operation.changeTrust({
          asset: usdcAsset,
          // O limite é opcional. Se omitido, é o máximo possível.
        })
      )
      // Operação 2: Criar a oferta de venda
      .addOperation(
        Operation.manageSellOffer({
          selling: Asset.native(), // O que estamos vendendo: XLM
          buying: usdcAsset,       // O que queremos receber: USDC
          amount: "100",           // Quantos XLM vamos vender
          price: "0.25",           // Preço: 1 XLM = 0.25 USDC
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(questKeypair);

    console.log("Submitting transaction to create trustline and sell offer...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transaction Successful! Hash: ${res.hash}`);
    
    // Dica extra: Verifique a oferta criada
    console.log(`Check your offer at: https://stellar.expert/explorer/testnet/account/${questKeypair.publicKey()}`);

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