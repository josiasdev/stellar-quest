const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios");

const SECRET_KEY = "YOUR_SECRET_KEY_HERE";

const HOME_DOMAIN = "example.runkit.sh"; 

async function main() {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const questKeypair = Keypair.fromSecret(SECRET_KEY);
  const publicKey = questKeypair.publicKey();

  console.log(`🔑 Usando Conta: ${publicKey}`);
  console.log(`🌐 Configurando Home Domain para: ${HOME_DOMAIN}`);

  if (HOME_DOMAIN.length > 32) {
    console.warn("⚠️  AVISO: O domínio parece ter mais de 32 caracteres. Isso pode causar erro na transação.");
  }

  let questAccount;

  try {
    questAccount = await server.loadAccount(publicKey);
    console.log("✅ Conta encontrada no ledger! Pulando Friendbot.");
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.log("⚠️ Conta não encontrada. Chamando Friendbot...");
      try {
        await axios.get(`https://friendbot.stellar.org?addr=${publicKey}`);
        console.log("✅ Friendbot financiou com sucesso. Aguardando ledger...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        questAccount = await server.loadAccount(publicKey);
      } catch (friendbotError) {
        console.error("❌ Falha no Friendbot (Erro 503 ou Rate Limit).");
        return; 
      }
    } else {
      console.error("❌ Erro ao carregar conta:", e.message);
      return;
    }
  }

  try {
    console.log("🏗️  Construindo transação setOptions...");
    
    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.setOptions({
          homeDomain: HOME_DOMAIN, 
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(questKeypair);

    console.log("🚀 Enviando transação para a Testnet...");
    const res = await server.submitTransaction(transaction);
    console.log(`✅ Transação Bem-sucedida!`);
    console.log(`🔗 Hash: ${res.hash}`);
    console.log(`👉 Agora clique em 'Verify' na Stellar Quest para pegar seu badge!`);
    
  } catch (error) {
    console.error("❌ Falha na Transação!");
    
    if (error.response) {
      if (error.response.status === 503) {
        console.error("🚨 Rede Stellar instável (Erro 503). Aguarde um momento.");
        return;
      }
      if (typeof error.response.data === 'string' && error.response.data.trim().startsWith('<')) {
             console.error("   Servidor retornou erro HTML (provavelmente 503).");
             return;
        }
      const errorData = error.response.data.extras || error.response.data;
      console.log(`Detalhes do erro:\n${JSON.stringify(errorData, null, 2)}`);
    } else {
      console.log(error.message);
    }
  }
}

main();