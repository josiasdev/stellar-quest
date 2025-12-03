const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios");

// Função auxiliar para financiar contas sem quebrar o script se elas já existirem
async function fundAccount(publicKey, name) {
  console.log(`Funding ${name} (${publicKey})...`);
  try {
    await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`);
    console.log(`✅ ${name} funded successfully!`);
  } catch (e) {
    if (e.response && e.response.status === 400) {
      console.log(`ℹ️  ${name} is already funded. Continuing...`);
    } else {
      // Se for outro erro (ex: rede fora do ar), lança o erro para parar o script
      throw new Error(`Failed to fund ${name}: ${e.message}`);
    }
  }
}

async function main() {
  try {
    // 1. Definição das chaves
    // NOTA: Se esta conta foi "mergida" anteriormente, ela foi deletada. 
    // O Friendbot irá recriá-la agora.
    const questKeypair = Keypair.fromSecret("SBDGRVRA7FJXIBEB7SDFHYRBBE7SIZN67JPIDFI6TAIEKCCC3NNFNTRN");
    
    // Gera um destino aleatório a cada execução para garantir limpeza
    const destinationKeypair = Keypair.random();

    console.log(`Source (Quest) Account: ${questKeypair.publicKey()}`);
    console.log(`Destination Account:    ${destinationKeypair.publicKey()}`);

    // 2. Financiar ambas as contas (Tratando o erro "Already Funded")
    await fundAccount(questKeypair.publicKey(), "Source Account");
    await fundAccount(destinationKeypair.publicKey(), "Destination Account");

    // Pequena pausa para garantir que o Ledger processou o financiamento
    console.log("Waiting 5 seconds for ledger propagation...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. Setup do Servidor
    const server = new Horizon.Server("https://horizon-testnet.stellar.org");
    
    // Carrega a conta de origem (necessária para o sequence number)
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    // 4. Construção da Transação
    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.accountMerge({
          destination: destinationKeypair.publicKey(),
          // A conta 'questKeypair' será deletada e seus fundos irão para 'destinationKeypair'
        })
      )
      .setTimeout(30)
      .build();

    // 5. Assinatura
    transaction.sign(questKeypair);

    // 6. Envio
    console.log("Submitting account merge transaction...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transaction Successful! Hash: ${res.hash}`);
    console.log(`The Source Account has been merged into the Destination and removed from the ledger.`);
    
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