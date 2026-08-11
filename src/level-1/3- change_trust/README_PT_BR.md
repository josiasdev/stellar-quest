# Stellar Quest - Nível 1: Change Trust (Estabelecendo Confiança)

> 🇺🇸 [Read this in English](README.md)

Até agora em nossa jornada no Stellar Quest Learn, trabalhamos apenas com o token nativo da Stellar, o XLM. Nesta quest, aprenderemos o que precisa acontecer para começar a manipular ativos customizados (tokens customizados). Ativos personalizados não são simplesmente criados do nada; eles existem na forma de confiança em outras contas. Na Stellar, essa "confiança" é chamada de **trustline** (linha de confiança).

As trustlines são um consentimento explícito (opt-in) para que uma conta possa possuir um ativo específico. Para possuir um ativo customizado, uma conta deve estabelecer uma linha de confiança com a conta emissora (*issuer account*) usando a operação `changeTrust`.

Nesta quest, seu desafio é estabelecer uma linha de confiança entre a sua Quest Account e outra conta para um ativo específico usando a operação `changeTrust`.

Vamos começar!

## A Solução

Como sempre, começaremos importando o SDK e os utilitários auxiliares.
```javascript
const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE
} = require('@stellar/stellar-sdk')
```

Precisaremos de dois pares de chaves (*keypairs*) para esta transação: nossa quest keypair (que confiará no ativo) e uma emissora/issuer keypair (a que emitirá o ativo). Ambas as contas precisam ser financiadas na testnet.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const issuerKeypair = Keypair.random()

await friendbot([questKeypair.publicKey(), issuerKeypair.publicKey()])
```

Configuraremos o servidor e a conta para podermos construir e enviar a transação.
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Precisamos criar a representação do ativo para a nossa conta confiar. Algumas notas rápidas sobre ativos na Stellar:
- Ativos podem existir em três formas: alfanumérico de até 4 caracteres (alphanumeric 4), alfanumérico de até 12 caracteres (alphanumeric 12) e cotas de pool de liquidez (*liquidity pool shares*).
- Códigos de ativos alfanuméricos devem ter até 4 ou 12 caracteres, respectivamente.
- Códigos de ativos diferenciam maiúsculas de minúsculas (*case-sensitive*), portanto `Pizza`, `PIZZA` e `pizza` são ativos completamente diferentes.
- O emissor (*issuer*) é a chave pública da conta que está emitindo o ativo. A conta emissora não pode manter saldo do seu próprio ativo (já que ela é a fonte de suprimento do ativo).

```javascript
const santaAsset = new Asset('SANTA', issuerKeypair.publicKey())
```

Ao construir a transação, usaremos a operação `changeTrust` para criar a linha de confiança para o nosso ativo customizado. As opções disponíveis para esta operação são:
- `asset`: O ativo que criamos no passo anterior.
- `limit`: Quanto você confia no emissor do ativo? Se não especificado, o padrão é o limite máximo possível.
- `source`: A conta que está estabelecendo a confiança (se deixado em branco, assume o remetente da transação).

```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.changeTrust({
    asset: santaAsset,
    limit: "100"
  }))
  .setTimeout(30)
  .build()
```

Com todas as informações preenchidas, assine e envie a transação.
```javascript
transaction.sign(questKeypair)

try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

### Quest Bônus!
Combine a operação `payment` com a operação `changeTrust` para realizar um pagamento da conta emissora (*issuer*) para a conta que estabeleceu a confiança. Isso efetivamente "cunha" (*mint*) o ativo, trazendo-o para circulação no ledger!

```javascript
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: santaAsset,
      limit: "1000",
    })
  )
  .addOperation(
    Operation.payment({
      destination: questKeypair.publicKey(),
      asset: santaAsset,
      amount: "100",
      source: issuerKeypair.publicKey(),
    })
  )
  .setTimeout(30)
  .build();

transaction.sign(questKeypair, issuerKeypair);
```

## Como Executar

Use o script `change_trust.js` para concluir esta quest:

```bash
node change_trust.js
```
