# Stellar Quest - Nível 01: Create Account

Bem-vindo à resolução do primeiro desafio do **Stellar Quest**! Este guia foi preparado para ajudar você a entender como criar contas na rede Stellar programaticamente usando o SDK em JavaScript/Node.js.

## Sobre o Desafio

**Objetivo:** Criar uma nova conta na Testnet da Stellar.

Na Stellar, uma conta é a estrutura de dados central que armazena saldos e assina transações. Para uma conta existir, ela precisa de:
1. Um par de chaves válido (Chave Pública e Chave Secreta).
2. Um saldo mínimo de Lumens (XLM) para cobrir o requisito de reserva.

Neste código, usaremos uma conta existente (financiada pelo "Friendbot") para criar e financiar uma nova conta.

---

## Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina.

### 1. Preparando o Ambiente

Abra seu terminal e execute os comandos abaixo para criar a pasta do projeto e iniciar o Node.js:

```bash
mkdir sq01-create-account
cd sq01-create-account
npm init -y
```

2. Instalando o SDK da Stellar
Instale a biblioteca oficial da Stellar para interagir com a rede:

```bash
npm install stellar-sdk
```

O Código Solução
Crie um arquivo chamado index.js na raiz do projeto e cole o código abaixo.

IMPORTANTE: Substitua a string "YOUR_SECRET_KEY_HERE" pela chave secreta que aparece no painel do seu Stellar Quest (lado direito da tela). Não esqueça de clicar no botão "Fund" no site antes de rodar o código!

```bash
import StellarSdk from 'stellar-sdk';

const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE,
} = StellarSdk;

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

```

Como Executar
No seu terminal, dentro da pasta do projeto, execute:

```bash
node index.js
```

# Resultado Esperado
Se tudo der certo, você verá o hash da transação no terminal. Copie esse hash ou vá ao Stellar Expert para confirmar que a conta foi criada. Depois, volte ao site do Stellar Quest e clique em "Verify" para ganhar seu badge!

# Solução de Problemas Comuns
Erro op_underfunded: Significa que sua conta de origem (questKeypair) não tem XLM suficiente.
<br>
Solução: Volte ao site do Stellar Quest e clique no botão "Fund" ao lado da sua chave.
<br>
<br>
Erro tx_bad_seq: Ocorre geralmente se você tentar reenviar a mesma transação ou se houver um problema de sincronia.
<br>
Solução: Rode o script novamente; ele buscará o sequence number mais atualizado automaticamente.

