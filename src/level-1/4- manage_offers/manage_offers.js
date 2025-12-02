const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} = require("stellar-sdk");

async function main() {
  try {
    const questKeypair = Keypair.fromSecret("SDRY32RDYRVAXXHFB3PKXC2TLOFBXDPSG3F2VJI4VCRYOPZP3SQOPPY6");

    const server = new Horizon.Server("https://horizon-testnet.stellar.org");

    // O ativo que queremos negociar (USDC na testnet)
    const usdcAsset = new Asset(
      "USDC",
      "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
    );

    const questAccount = await server.loadAccount(questKeypair.publicKey());

    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // Operação 1: Criar a trustline para poder negociar USDC
      .addOperation(
        Operation.changeTrust({
          asset: usdcAsset,
          // O limite é opcional, se omitido, é o máximo possível
        })
      )
      // Operação 2: Criar a oferta de venda
      .addOperation(
        Operation.manageSellOffer({
          selling: Asset.native(), // O que estamos vendendo: XLM
          buying: usdcAsset, // O que queremos comprar: USDC
          amount: "100", // A quantidade de XLM que estamos vendendo
          price: "0.25", // O preço: 0.25 USDC por cada 1 XLM
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(questKeypair);

    console.log("Submitting transaction to create trustline and sell offer...");
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