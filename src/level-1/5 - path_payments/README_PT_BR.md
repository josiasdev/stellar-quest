# Stellar Quest - Nível 1: Path Payments (Pagamentos com Conversão)

> 🇺🇸 [Read this in English](README.md)

Com o conceito de linhas de confiança (*trustlines*) assimilado, vamos direcionar nossa atenção para um novo tipo de pagamento: o poderoso **Path Payment** (Pagamento por Caminho / Conversão).

Em um cenário clássico de pagamento, o ativo enviado é exatamente o mesmo ativo recebido. Em um *path payment*, o ativo recebido difere do ativo enviado. Por exemplo, você pode enviar XLM e o destinatário receber USDC.

Os *path payments* cruzam automaticamente os livros de ofertas da DEX e/ou pools de liquidez da Stellar para converter o ativo enviado no ativo de destino em uma única transação atômica.

Existem duas operações para *path payments*:
1. `pathPaymentStrictSend`: Você especifica a quantidade exata enviada (*Strict Send*).
2. `pathPaymentStrictReceive`: Você especifica a quantidade exata a ser recebida pelo destino (*Strict Receive*).

Nesta quest, seu desafio é enviar com sucesso um *path payment* da Quest Account para outra conta na rede de testes da Stellar.

---

## A Solução

Começaremos importando o SDK do `@stellar/stellar-sdk`.
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

Para esta configuração, usamos 4 contas (keypairs):
- `questKeypair`: Conta de origem que realiza o pagamento.
- `issuerKeypair`: Emite o ativo personalizado (`PATH`).
- `distributorKeypair`: Recebe o ativo emitido e cria ofertas na DEX.
- `destinationKeypair`: Conta destinatária do pagamento.

```javascript
const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
const issuerKeypair = Keypair.random()
const distributorKeypair = Keypair.random()
const destinationKeypair = Keypair.random()

await friendbot([
  questKeypair.publicKey(),
  issuerKeypair.publicKey(),
  distributorKeypair.publicKey(),
  destinationKeypair.publicKey()
])
```

Configuramos o servidor Horizon, carregamos a conta e definimos o ativo customizado:
```javascript
const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())

const pathAsset = new Asset('PATH', issuerKeypair.publicKey())
```

### 1. Path Payment Strict Send
Para definir uma quantidade exata enviada:
- `sendAsset`: Ativo que você está enviando (ex: `Asset.native()`).
- `sendAmount`: Quantidade exata do ativo de envio a ser convertido.
- `destination`: Chave pública da conta destinatária.
- `destAsset`: Ativo que o destinatário receberá (`pathAsset`).
- `destMin`: Quantidade mínima aceitável do ativo no destino.

```javascript
  .addOperation(Operation.pathPaymentStrictSend({
    sendAsset: Asset.native(),
    sendAmount: '1000',
    destination: destinationKeypair.publicKey(),
    destAsset: pathAsset,
    destMin: '1000'
  }))
```

### 2. Path Payment Strict Receive
Para definir uma quantidade exata a ser recebida:
- `sendAsset`: Ativo enviado.
- `sendMax`: Quantidade máxima do ativo de envio que a conta aceita gastar.
- `destination`: Chave pública do destino.
- `destAsset`: Ativo a ser recebido.
- `destAmount`: Quantidade estática/exata a ser recebida no destino.

```javascript
  .addOperation(Operation.pathPaymentStrictReceive({
    sendAsset: pathAsset,
    sendMax: '450',
    destination: questKeypair.publicKey(),
    destAsset: Asset.native(),
    destAmount: '450',
    source: destinationKeypair.publicKey()
  }))
```

---

## Exemplo Completo de Transação Atômica

Em uma única transação, realizamos:
1. O destino e o distribuidor criam *trustlines* para o ativo `PATH`.
2. O emissor envia tokens `PATH` para o distribuidor (*mint*).
3. O distribuidor cria uma oferta de venda na DEX (`PATH` -> `XLM`).
4. A Quest Account executa um `pathPaymentStrictSend` (envia `XLM`, e o destino recebe `PATH`).

```javascript
const transaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: pathAsset,
      source: destinationKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.changeTrust({
      asset: pathAsset,
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: pathAsset,
      amount: "1000000",
      source: issuerKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.createPassiveSellOffer({
      selling: pathAsset,
      buying: Asset.native(),
      amount: "2000",
      price: "1",
      source: distributorKeypair.publicKey(),
    })
  )
  .addOperation(
    Operation.pathPaymentStrictSend({
      sendAsset: Asset.native(),
      sendAmount: "1000",
      destination: destinationKeypair.publicKey(),
      destAsset: pathAsset,
      destMin: "1000",
    })
  )
  .setTimeout(180)
  .build();

transaction.sign(
  questKeypair,
  issuerKeypair,
  distributorKeypair,
  destinationKeypair
);

try {
  let res = await server.submitTransaction(transaction);
  console.log(`Transaction Successful! Hash: ${res.hash}`);
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`);
}
```

---

## Como Executar

Use o script `path_payments.js` para rodar esta quest localmente:

```bash
node path_payments.js
```
