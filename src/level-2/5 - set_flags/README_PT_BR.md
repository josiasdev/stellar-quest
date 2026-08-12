# Stellar Quest - Nível 2: Set Flags (Autorização & Controle de Ativos)

> 🇺🇸 [Read this in English](README.md)

Na rede Stellar, emissores de ativos (*issuers*) podem controlar e regular quem possui e transfere seus tokens personalizados configurando as **Flags da Conta** (*Account Flags*) e as **Flags de Linha de Confiança** (*Trustline Flags*).

Nesta quest, seu desafio é configurar um ativo controlado, estabelecer a linha de confiança, autorizá-la, realizar um pagamento e, em seguida, revogar a autorização — tudo dentro de uma **única transação atômica contendo 5 operações**.

---

## Conceitos Chave & Flags de Conta

Os emissores controlam seus ativos chamando `setOptions` com o parâmetro `setFlags`:
- **`AUTHORIZATION_REQUIRED` (`0x1`)**: Exige que o emissor autorize explicitamente a *trustline* antes que qualquer conta possa receber ou manter o ativo.
- **`AUTHORIZATION_REVOCABLE` (`0x2`)**: Permite que o emissor revogue a autorização de uma *trustline* existente a qualquer momento, bloqueando o ativo na conta do portador.
- **`setFlags: 3`**: Valor combinado `1 + 2 = 3` ativando ambos os requisitos de controle na conta emissora.

---

## As 5 Operações em uma Transação Atômica

Para concluir a Quest 5 corretamente em uma única transação, ela DEVE ser construída com a `issuerAccount` como a conta de origem da transação, e conter as seguintes 5 operações em sequência:

1. **`setOptions` (Origem: Conta Emissora/Issuer)**
   Define `setFlags = 3` (`authRequired` + `authRevocable`) na conta do emissor.
2. **`changeTrust` (Origem: Quest Account)**
   Cria a linha de confiança da Quest Account para o ativo controlado (`source: questKeypair.publicKey()`).
3. **`setTrustLineFlags` (Origem: Conta Emissora/Issuer)**
   Autoriza a *trustline* da Quest Account (`trustor: questKeypair.publicKey()`, `flags: { authorized: true }`).
4. **`payment` (Origem: Conta Emissora/Issuer)**
   Envia 100 unidades do ativo controlado do Emissor para a Quest Account (`destination: questKeypair.publicKey()`, `amount: '100'`).
5. **`setTrustLineFlags` (Origem: Conta Emissora/Issuer)**
   Revoga a autorização da *trustline* da Quest Account (`trustor: questKeypair.publicKey()`, `flags: { authorized: false }`).

---

## A Solução

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

const questKeypair = Keypair.fromSecret('SUA_SECRET_KEY_AQUI')
const issuerKeypair = Keypair.random()

// Financiar ambas as contas via Friendbot
await friendbot([questKeypair.publicKey(), issuerKeypair.publicKey()])

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const issuerAccount = await server.loadAccount(issuerKeypair.publicKey())

const controlledAsset = new Asset('CONTROL', issuerKeypair.publicKey())

const transaction = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  // Operação 1: Issuer ativa Auth Required + Auth Revocable
  .addOperation(
    Operation.setOptions({
      setFlags: 3,
    })
  )
  // Operação 2: Quest Account estabelece a linha de confiança
  .addOperation(
    Operation.changeTrust({
      asset: controlledAsset,
      source: questKeypair.publicKey(),
    })
  )
  // Operação 3: Issuer autoriza a trustline da Quest Account
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: questKeypair.publicKey(),
      asset: controlledAsset,
      flags: {
        authorized: true,
      },
    })
  )
  // Operação 4: Issuer envia 100 CONTROL para a Quest Account
  .addOperation(
    Operation.payment({
      destination: questKeypair.publicKey(),
      asset: controlledAsset,
      amount: "100",
    })
  )
  // Operação 5: Issuer revoga a autorização da Quest Account
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: questKeypair.publicKey(),
      asset: controlledAsset,
      flags: {
        authorized: false,
      },
    })
  )
  .setTimeout(30)
  .build()

// Deve ser assinado por AMBOS os pares de chaves:
// - issuerKeypair (Origem da transação & Ops 1, 3, 4, 5)
// - questKeypair (Origem da Op 2 changeTrust)
transaction.sign(issuerKeypair, questKeypair)

const res = await server.submitTransaction(transaction)
console.log(`Transaction Successful! Hash: ${res.hash}`)
```

---

## ⚠️ Alerta Importante: Armadilha Multisig da Quest 4 (`op_bad_auth`)

Se você encontrar o erro `op_bad_auth` na Operação 2 (`changeTrust`):

> [!CAUTION]
> **Por que o erro `op_bad_auth` ocorre:**
> No Nível 2 - Quest 4, você configurou os limites (*thresholds*) da sua Quest Account para **5** e adicionou dois assinantes aleatórios. Se as chaves privadas desses assinantes se perderem quando o script terminar, sua Quest Account na Testnet fica travada com threshold 5.
> Como a Operação 2 (`changeTrust`) exige limite Médio, a rede Stellar rejeitará a transação se ela for assinada apenas pela chave mestra (peso 1 < threshold 5).

### 🛠️ Solução:
Se a sua Quest Account estiver travada devido à Quest 4, peça para um moderador no **Discord oficial da Stellar Dev** resetar a sua *Quest Keypair*, ou solicite o reset da chave na plataforma!

---

## Como Executar

Use o script `set_flags.js` para rodar esta quest localmente:

```bash
node set_flags.js
```
