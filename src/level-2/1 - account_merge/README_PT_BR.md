# Stellar Quest - Nível 2: Account Merge (Exclusão de Conta)

> 🇺🇸 [Read this in English](README.md)

Antes de avançarmos mais em nossa jornada operacional na Stellar, precisamos entender como deletar contas no ledger.

Nesta quest, você excluirá uma conta transferindo todo o seu saldo nativo em XLM para uma conta de destino usando a operação `accountMerge`.

Cada conta Stellar precisa manter um saldo mínimo de XLM, que é calculado usando reservas base (cada reserva base é de 0,5 XLM). Uma conta Stellar deve manter pelo menos duas reservas base (1 XLM) apenas para existir no ledger — portanto, transferir todo esse saldo em XLM remove a conta permanentemente do ledger.

---

## Regras Importantes para o Account Merge

Não é apenas o saldo em XLM que precisa ser transferido para que a conta possa ser excluída. Você também precisa remover todas as suas sub-entradas (*subentries*):
- **Linhas de confiança (trustlines)** devem ser esvaziadas e removidas (definindo limite como 0).
- **Assinantes adicionais (signers)** devem ser removidos.
- **Ofertas abertas na DEX** devem ser canceladas.
- **Entradas de dados (data entries)** devem ser deletadas.

Se uma conta ainda possuir *subentries* ativas, a operação `accountMerge` falhará com erro no ledger.

---

## A Solução

Começaremos importando o `@stellar/stellar-sdk` e configurando o servidor Horizon e as contas:
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
const destinationKeypair = Keypair.random()

await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()])

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

Agora construímos a transação contendo apenas a operação `accountMerge`:
- `destination`: A conta de destino que receberá todos os XLM restantes (incluindo as reservas base) da conta excluída.
- `source`: (opcional) A conta a ser mesclada/excluída. Se omitido, assume a conta de origem da transação.

```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.accountMerge({
    destination: destinationKeypair.publicKey()
  }))
  .setTimeout(30)
  .build()
```

Assine e envie a transação para a rede:
```javascript
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

Use o script `account_merge.js` para executar esta quest localmente:

```bash
node account_merge.js
```
