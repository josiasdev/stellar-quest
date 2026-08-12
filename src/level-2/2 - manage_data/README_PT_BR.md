# Stellar Quest - Nível 2: Manage Data (Gerenciamento de Dados)

> 🇺🇸 [Read this in English](README.md)

As contas são a espinha dorsal das aplicações na Stellar e fazem parte de qualquer ação na rede. Uma classe de ações muito importante envolve definir, modificar ou excluir entradas de dados (*data entries*) nos metadados de uma conta. As entradas de dados são pares de chave/valor e podem ser usadas para anexar dados arbitrários e específicos da aplicação a uma conta na rede Stellar.

Cada entrada de dados criada aumenta o saldo mínimo necessário da conta em uma reserva base (0,5 XLM).

Nesta quest, você adicionará uma entrada de dados à sua Quest Account usando a operação `manageData`.

---

## Conceitos Chave & Parâmetros

As opções disponíveis para a operação `manageData` são:
- `name`: Nome da chave (string) do par chave/valor (máximo de 64 caracteres).
- `value`: O valor atribuído à chave `data[name]`. Pode ser enviado como `string` ou como `Buffer`. Para excluir uma entrada existente, passe `null`.
- `source`: (opcional) A conta onde os dados serão gerenciados. Por padrão, é a conta de origem da transação.

### Codificação Base64 no Horizon
Ao consultar metadados de entradas de dados via endpoint da API do Horizon, o campo `value` é retornado como uma **string codificada em base64**. Para converter de volta para texto ASCII/UTF-8:

```javascript
const valueFromHorizon = 'U3RlbGxhciBRdWVzdCE='
const valueAsBuffer = Buffer.from(valueFromHorizon, 'base64')
const asciiText = valueAsBuffer.toString('ascii')
console.log(asciiText) // Exibe 'Stellar Quest!'
```

---

## A Solução

Importe os módulos do `@stellar/stellar-sdk` e inicialize a chave e o servidor Horizon:

```javascript
const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('@stellar/stellar-sdk')

const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
await friendbot(questKeypair.publicKey())

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Construa a transação com operações `manageData`:
```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.manageData({
    name: 'Hello',
    value: 'World'
  }))
  .addOperation(Operation.manageData({
    name: 'Hello',
    value: Buffer.from('Stellar Quest!')
  }))
  .setTimeout(30)
  .build()

transaction.sign(questKeypair)

try {
  const res = await server.submitTransaction(transaction)
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
}
```

---

## Como Executar

Use o script `manage_data.js` para executar esta quest localmente:

```bash
node manage_data.js
```
