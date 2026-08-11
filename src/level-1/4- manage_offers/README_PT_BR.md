# Stellar Quest - Nível 1: Manage Offers (Gerenciando Ofertas DEX)

> 🇺🇸 [Read this in English](README.md)

Agora que sabemos como confiar e emitir ativos além do token nativo XLM, temos o necessário para começar a utilizar a corretora descentralizada nativa da Stellar (DEX). As operações de gerenciamento de oferta (*manage offers*) permitem que você ofereça comprar ou vender uma quantidade específica de um ativo a uma taxa de câmbio específica por outro ativo. Por exemplo, vender 14 unidades do Ativo A por 64 unidades do Ativo B.

A Stellar possui três operações que gerenciam essas ofertas de negociação:
1. `manageBuyOffer` (Gerenciar oferta de compra)
2. `manageSellOffer` (Gerenciar oferta de venda)
3. `createPassiveSellOffer` (Criar oferta de venda passiva)

Nesta quest, seu desafio é abrir uma oferta de compra ou venda na sua Quest Account usando uma das operações: `manageBuyOffer`, `manageSellOffer` ou `createPassiveSellOffer`.

Vamos analisar essas três operações enquanto construímos a transação.

## A Solução

Começaremos importando o SDK e os utilitários auxiliares:
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

Precisamos apenas da chave da Quest Account para esta quest, financiada na testnet. Também precisaremos do servidor Horizon para carregar a conta e enviar a transação:
```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
await friendbot(questKeypair.publicKey())

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Precisamos de um ativo para servir de par na negociação (*counter-asset*). Abaixo, definimos o ativo para USDC (emitido na testnet pela `centre.io`):
```javascript
const usdcAsset = new Asset(
  'USDC',
  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
)
```

Iniciamos a construção da transação. É necessário criar uma linha de confiança (*trustline*) para o ativo não nativo antes de podermos criar qualquer oferta de negociação com ele:
```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.changeTrust({
    asset: usdcAsset
  }))
```

### 1. Manage Buy Offer (Oferta de Compra)
Toda oferta é tecnicamente uma oferta de compra e venda simultaneamente. Vender 100 XLM por 10 USD é idêntico a comprar 10 USD por 100 XLM.
- `selling`: O ativo que você está oferecendo (ex: XLM nativo).
- `buying`: O ativo que você deseja receber (ex: USDC).
- `buyAmount`: A quantidade do ativo de compra que você quer receber.
- `price`: Quantidade de venda dividida pela quantidade de compra.
- `offerId`: (opcional) `0` para nova oferta, ou o ID da oferta existente para atualizar/cancelar.

```javascript
  .addOperation(Operation.manageBuyOffer({
    selling: Asset.native(),
    buying: usdcAsset,
    buyAmount: '100',
    price: '10',
    offerId: '0',
    source: questKeypair.publicKey()
  }))
```

### 2. Manage Sell Offer (Oferta de Venda)
Esta operação é quase idêntica à `manageBuyOffer`, apenas invertendo a perspectiva dos ativos principal e contraparte:
- `selling`: O ativo que você está oferecendo para vender (ex: XLM nativo).
- `buying`: O ativo que você deseja receber em troca (ex: USDC).
- `amount`: A quantidade do ativo de venda que você está entregando.
- `price`: Preço relativo do ativo de compra em relação ao de venda.

```javascript
  .addOperation(Operation.manageSellOffer({
    selling: Asset.native(),
    buying: usdcAsset,
    amount: '1000',
    price: '0.1',
    offerId: '0',
    source: questKeypair.publicKey()
  }))
```

### 3. Create Passive Sell Offer (Oferta de Venda Passiva)
Cria uma oferta para vender um ativo por outro sem executar imediatamente contra uma oferta inversa de preço igual já existente no livro de ofertas.
```javascript
  .addOperation(Operation.createPassiveSellOffer({
    selling: Asset.native(),
    buying: usdcAsset,
    amount: '1000',
    price: '0.1',
    source: questKeypair.publicKey()
  }))
```

### Código Completo e Envio
```javascript
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: usdcAsset,
    })
  )
  .addOperation(
    Operation.manageSellOffer({
      selling: Asset.native(),
      buying: usdcAsset,
      amount: "100",
      price: "0.25",
    })
  )
  .setTimeout(30)
  .build()

transaction.sign(questKeypair)

try {
  let res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

> **Nota:** As ofertas podem ou não ser executadas imediatamente após o envio. Se houver uma contra-oferta compatível no livro de ordens, a execução ocorre instantaneamente. Caso contrário, a oferta fica pendente no livro da DEX até ser aceita por outra pessoa ou ser cancelada por você.

## Como Executar

Use o script `manage_offers.js` para concluir esta quest:

```bash
node manage_offers.js
```
