# Stellar Quest - Nível 2: Set Options - Weights, Thresholds e Signers (Multisig)

> 🇺🇸 [Read this in English](README.md)

Nesta quest, exploramos o conceito de **Multisignature (Multisig / Multi-assinatura)** na rede Stellar.

Assinaturas são necessárias para autorizar transações. Por padrão, você assina transações com a **chave mestra** (*master key*). Algumas transações exigem assinaturas adicionais ou alternativas, configuradas com a operação `setOptions`.

Nesta quest, você definirá os pesos das assinaturas (*signature weights*), determinará os limites de operação (*operation thresholds*), adicionará assinantes adicionais (*signers*) e enviará uma transação multi-assinada com sucesso.

---

## Conceitos Chave

### 1. Pesos (Weights) e Assinantes (Signers)
- **`masterWeight`**: Peso da chave privada mestra da conta (o padrão é 1).
- **`signer`**: Adiciona ou remove assinantes adicionais (`ed25519PublicKey`) configurando seus respectivos pesos.

### 2. Limites de Operação (Thresholds)
Cada operação na Stellar pertence a uma de três categorias de segurança:
- **`lowThreshold`**: Operações de baixa segurança (ex: `allowTrust`).
- **`medThreshold`**: Operações de média segurança (ex: `payment`, `changeTrust`, `manageOffer`).
- **`highThreshold`**: Operações de alta segurança (ex: `setOptions`, `accountMerge`).

> ⚠️ **Aviso:** Tenha muito cuidado ao definir thresholds! Se você configurar o valor do threshold acima da soma do peso de todos os assinantes disponíveis, você bloqueará a conta permanentemente e ela se tornará inutilizável.

---

## Fórmula de Pesos desta Quest

Nesta quest:
- Peso da Master Key = 1
- Peso do Segundo Assinante = 2
- Peso do Terceiro Assinante = 2
- Thresholds (Baixo / Médio / Alto) = 5

Soma Total = 1 (Master) + 2 (Assinante 2) + 2 (Assinante 3) = **5**.
Para atingir o limite mínimo de 5, **todos os 3 assinantes precisam assinar** a transação!

---

## A Solução

Importe os módulos do `@stellar/stellar-sdk`:
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
const secondSigner = Keypair.random()
const thirdSigner = Keypair.random()

await friendbot(questKeypair.publicKey())

const server = new Horizon.Server('https://horizon-testnet.stellar.org')
const questAccount = await server.loadAccount(questKeypair.publicKey())
```

### Passo 1: Configurar Pesos, Thresholds & Assinantes
```javascript
const setupTransaction = new TransactionBuilder(questAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setOptions({
      masterWeight: 1,
      lowThreshold: 5,
      medThreshold: 5,
      highThreshold: 5,
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: secondSigner.publicKey(),
        weight: 2,
      },
    })
  )
  .addOperation(
    Operation.setOptions({
      signer: {
        ed25519PublicKey: thirdSigner.publicKey(),
        weight: 2,
      },
    })
  )
  .setTimeout(30)
  .build()

setupTransaction.sign(questKeypair)
await server.submitTransaction(setupTransaction)
```

### Passo 2: Enviar uma Transação Multisig Assinada pelas 3 Chaves
```javascript
const updatedAccount = await server.loadAccount(questKeypair.publicKey())

const multisigTransaction = new TransactionBuilder(updatedAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.manageData({
      name: 'Quest',
      value: 'Complete!',
    })
  )
  .setTimeout(30)
  .build()

// Assinar com as 3 chaves para alcançar a soma de pesos igual a 5
multisigTransaction.sign(questKeypair)
multisigTransaction.sign(secondSigner)
multisigTransaction.sign(thirdSigner)

const res = await server.submitTransaction(multisigTransaction)
console.log(`Transaction Successful! Hash: ${res.hash}`)
```

---

## Como Executar

Use o script `set_options_weights_thresholds_signers.js` para executar esta quest localmente:

```bash
node set_options_weights_thresholds_signers.js
```
