# Stellar Quest - Nível 1: Create Account

> 🇺🇸 [Read this in English](README.md)

Se a rede Stellar fosse um universo (e, de certa forma, é), as contas seriam os planetas, estrelas, luas e asteroides dentro desse espaço fértil.

De forma menos abstrata, as contas são a estrutura de dados central na Stellar — elas mantêm saldos, assinam transações e emitem ativos. As contas só podem existir com um par de chaves (keypair) válido e o saldo mínimo exigido em lumens (XLM).

Nesta quest, seu desafio é criar uma conta usando a operação `createAccount` com o Quest Keypair localizado na caixa do lado direito da sua tela.

Vamos começar!

Comece clicando no botão **Fund** ao lado do Quest Keypair na caixa à direita da tela da quest.
Cada quest no Stellar Quest Learn terá uma Quest Account (também chamada de Quest Keypair) diferente, que desempenha um papel importante no desafio. O botão Fund deposita 10.000 XLM de teste no par de chaves usando a *faucet* da testnet da Stellar chamada friendbot.

Note que na rede pública (mainnet), não temos o friendbot distribuindo XLM de graça para quem pede! Os usuários precisam obter XLM em uma exchange (corretora), transferência de carteira ou por outros meios.

## A Solução

Para começar, precisaremos de algumas coisas do `stellar-sdk`.
```javascript
const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('stellar-sdk')
```

Em seguida, prepararemos nossos dois pares de chaves. Um será para sua conta da quest, e o outro será um par de chaves novo e gerado aleatoriamente.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const newKeypair = Keypair.random()
```

Depois, deixaremos algumas coisas prontas para a transação que vamos construir. Aqui está o que precisaremos:
- Um servidor que possa ser usado para recuperar e enviar informações à rede.
- A conta associada ao seu quest keypair. Isso pode ser confuso no começo, mas quando pegamos essa informação do nosso servidor, ela nos dá tudo o que é necessário para construir uma transação válida.

A rede Stellar roda em duas instâncias distintas: a rede pública (também chamada de pubnet ou mainnet) e a rede de testes (também chamada de testnet). A pubnet é a rede principal usada por aplicativos em produção. A testnet é uma rede menor, de uso gratuito, mantida pela Stellar Development Foundation (SDF), que funciona como a pubnet, mas não contém ativos com valor no mundo real. Você pode pensar nela como um "parquinho seguro". Ela tem uma faucet embutida de XLM de teste (chamada friendbot), e é o melhor lugar para desenvolvedores testarem suas aplicações.

```javascript
// Você precisaria remover o '-testnet' aqui, se estivesse usando a rede pública da Stellar.
const server = new Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Agora estamos prontos para começar a construir a transação que será enviada para a rede. Legal! Para isso, usaremos o `TransactionBuilder` do SDK. Toda vez que usarmos o `TransactionBuilder`, começaremos com as seguintes informações:
- A `questAccount` que recuperamos do servidor em um passo anterior. Esta conta inclui a chave pública para a conta, junto com seu sequence number (número de sequência).
- A taxa máxima (fee) que estamos dispostos a pagar para que esta transação entre no ledger (livro-razão) com sucesso.
- A passphrase (senha) da rede que estamos usando.

```javascript
let transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
```

Ótimo começo! Agora usaremos o método `addOperation` na nossa transação, o qual irá, surpreendentemente, adicionar uma operação à transação. Podemos adicionar muitos tipos diferentes de operações (e faremos isso ao longo do tempo), mas por enquanto, usaremos a operação `createAccount`. As opções disponíveis para esta operação são:
- `destination`: A conta de destino para a qual você está enviando XLM (ou seja, a conta a ser criada).
- `startingBalance`: Quanto XLM você gostaria de enviar da conta de origem para esta nova conta de destino que estamos criando.
- `source`: Este campo da conta de origem da operação é opcional, porque assume a conta de origem da transação se for deixado em branco. Você pode especificar uma conta de origem diferente para cada operação, se necessário.

```javascript
let transaction = new TransactionBuilder(...)
  .addOperation(Operation.createAccount({
    destination: newKeypair.publicKey(),
    startingBalance: "1000" // Você pode colocar qualquer valor que quiser (desde que tenha os fundos!)
  })
```

Incrível! Estamos quase lá. Agora, mais algumas coisas para fazer antes que sua transação esteja completa:
1. Precisamos adicionar um timeout à transação. Embora não seja tecnicamente um requisito, é uma boa prática e evitará que uma transação seja válida após um determinado período de tempo.
2. Também precisaremos construir (`build()`) a transação.
3. Por último, nós assinamos a transação para que a rede possa ter certeza de que temos a autorização adequada para enviar transações para esta conta em particular. Então, estaremos prontos!

```javascript
let transaction = new TransactionBuilder(...)
  .setTimeout(30)
  .build()
transaction.sign(questKeypair)
```

Nota: Se você estiver interessado em ver uma representação mais visual da transação que acabou de construir e assinar, pode olhar para a transação no Stellar Laboratory. Copie a saída do snippet abaixo e cole na página “View XDR” no Laboratory.

```javascript
console.log(transaction.toXdr())
```

Finalmente, tudo o que resta é enviar a transação para a rede. Fazemos isso com nosso servidor que configuramos anteriormente.
```javascript
try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

Assumindo que tudo correu bem, você pode clicar no botão no site para ver se você passou e coletar sua primeira badge de NFT do Stellar Quest novinha em folha.

Se a quest falhar, verifique novamente sua transação para garantir que tudo está correto. Se você tiver dúvidas, vá ao Discord do Stellar Quest para pedir ajuda à comunidade!

## Verifique sua Conta

Quer ver mais informações sobre sua conta ou uma transação específica? Vamos verificar no Stellar Expert!

1. Navegue para stellar.expert
2. Certifique-se de estar olhando para a testnet, não para a rede pública
3. Insira a chave pública da Quest Account (também chamada de account ID) na barra de pesquisa no topo da página e pressione enter
4. Você deve ver sua conta, seus saldos e as transações realizadas

## Como Executar

Use o script `create_account.js` para concluir esta quest:

```bash
node create_account.js
```
