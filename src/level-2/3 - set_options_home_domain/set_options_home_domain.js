const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = require("stellar-sdk");
const axios = require("axios");

// SEU PULO DO GATO (SECRET KEY):
const SECRET_KEY = "SDESHLFVHLFFV5GOU6Z52WOMLQTXBQTN65JIVSYRBM4PIDTBWKQRFR35";

// ============================================================
// INSTRUÇÕES DA QUEST (PASSO CRÍTICO):
// "O campo Home Domain aponta para o domínio web onde você hospeda um arquivo stellar.toml."
// "Ele prova que você é o proprietário do domínio HTTPS vinculado a uma conta Stellar."
//
// 1. Crie seu endpoint no RunKit conforme instruído na Quest.
// 2. Copie a URL do endpoint (canto inferior direito do script RunKit).
// 3. Cole a URL abaixo (ex: "something-123.runkit.sh").
//
// NOTA: "Nomes de domínio usados aqui devem ter menos de 32 caracteres."
// ============================================================
const HOME_DOMAIN = "example.runkit.sh"; 

async function main() {
  const server = new Horizon.Server("https://horizon-testnet.stellar.org");
  const questKeypair = Keypair.fromSecret(SECRET_KEY);
  const publicKey = questKeypair.publicKey();

  console.log(`🔑 Usando Conta: ${publicKey}`);
  console.log(`🌐 Configurando Home Domain para: ${HOME_DOMAIN}`);

  // Verifica comprimento do domínio (Regra da Quest: < 32 chars)
  if (HOME_DOMAIN.length > 32) {
    console.warn("⚠️  AVISO: O domínio parece ter mais de 32 caracteres. Isso pode causar erro na transação.");
  }

  let questAccount;

  // 1. Verificar e Financiar a conta (Step boilerplate da Quest)
  try {
    questAccount = await server.loadAccount(publicKey);
    console.log("✅ Conta encontrada no ledger! Pulando Friendbot.");
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.log("⚠️ Conta não encontrada. Chamando Friendbot...");
      try {
        // Usamos axios direto em vez da lib do RunKit para maior compatibilidade
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

  // 2. Construir a Transação com setOptions (O foco da Quest)
  try {
    console.log("🏗️  Construindo transação setOptions...");
    
    const transaction = new TransactionBuilder(questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      // "Nesta quest, focaremos apenas no campo Home Domain."
      .addOperation(
        Operation.setOptions({
          homeDomain: HOME_DOMAIN, // O link para seu arquivo stellar.toml
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