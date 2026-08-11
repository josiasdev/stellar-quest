# Stellar Quest - Nível 1: Payments (Pagamentos)

> 🇺🇸 [Read this in English](README.md)

O principal caso de uso atual da tecnologia blockchain é garantir a transferência segura de coisas valiosas. E a Stellar não é exceção.

Nesta quest, seu desafio é realizar uma operação de pagamento, onde você enviará uma transação contendo essa operação na rede de testes da Stellar (testnet), da sua Quest Account para outra conta.

Então, mãos à obra.

## A Solução

Assim como na primeira vez, começaremos pegando algumas coisas do `stellar-sdk`.
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

Também criamos uma função auxiliar útil que pode conversar com o friendbot por nós! (Esse método de usar o friendbot não é estritamente necessário. Criamos esta função auxiliar apenas por conveniência. Você é livre para escolher qualquer outra forma de financiar essas contas.)
```javascript
const friendbot = async (keys) => {
  const accounts = Array.isArray(keys) ? keys : [keys]
  await Promise.all(accounts.map(pk =>
    fetch(`https://friendbot.stellar.org?addr=${pk}`)
  ))
}
```
*(Nota: No script local deste repositório, estamos usando o `axios` para chamar o endpoint do friendbot diretamente.)*

Precisamos de dois pares de chaves (keypairs) para esta transação: uma conta de origem (source) e uma conta de destino. Neste caso, precisamos que ambas sejam financiadas na testnet.
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const destinationKeypair = Keypair.random()

await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()])
```

Configuramos o servidor e a conta que serão usados para construir e enviar a transação.
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Em seguida, construímos nossa transação que conterá a única operação de pagamento da nossa conta de origem para nossa conta de destino. A maior parte desta transação deve parecer bem semelhante à da quest anterior. Estamos usando a operação de pagamento aqui (`payment`). As opções disponíveis para esta operação são:

- `destination`: Quem é o sortudo destinatário da operação de pagamento?
- `asset`: O ativo que você gostaria de enviar. Os ativos na Stellar podem representar muitas coisas: moedas digitais (como bitcoin), moedas fiduciárias (USDC) ou outros tokens de valor (como NFTs). Para esta quest, usaremos o token nativo XLM e cobriremos ativos customizados mais tarde.
- `amount`: Quanto do ativo você vai enviar. Lembrese, você só pode enviar o que você tem.
- `source`: De qual conta a rede vai subtrair os fundos? Lembre-se, você pode deixar isso em branco e ele assumirá a origem (source) da transação.

```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.payment({
    destination: destinationKeypair.publicKey(),
    asset: Asset.native(),
    amount: '100'
  }))
  .setTimeout(30)
  .build()
```

Então, é claro, precisamos assiná-la com o keypair da nossa quest account.
```javascript
transaction.sign(questKeypair)
```

Por último, estamos prontos para enviar nossa transação para a testnet!
```javascript
try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

Se a transação foi bem-sucedida, fantástico! Vá em frente, clique em Verify no site e resgate sua nova badge.

## Como Executar

Use o script `payments.js` para concluir esta quest localmente:

```bash
node payments.js
```
