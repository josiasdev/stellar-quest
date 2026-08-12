# Stellar Quest - Nível 2: Set Options - Home Domain (Domínio Principal)

> 🇺🇸 [Read this in English](README.md)

É hora de mergulhar na poderosa operação `setOptions`. A operação `setOptions` permite configurar diversos parâmetros de nível de conta no ledger da Stellar. Nesta quest, focaremos especificamente na configuração do campo **Home Domain** (Domínio Principal).

O campo **Home Domain** associa sua conta Stellar a um domínio web na internet que hospeda um arquivo `stellar.toml` (especificação SEP-001). Esse arquivo estabelece a propriedade do domínio, lista os ativos emitidos, nós validadores e endpoints públicos de serviços associados a essa conta.

Para ser válido, o arquivo `stellar.toml` deve ser hospedado obrigatoriamente sob HTTPS em:
`https://<SEU_DOMINIO>/.well-known/stellar.toml`

---

## 🛠️ Hospedando o arquivo `stellar.toml` na Vercel (Recomendado)

Ao tentar hospedar em ferramentas estáticas como Surge.sh, você pode encontrar um erro `400 Bad Request` no validador da Stellar Quest por causa de cabeçalhos de CORS ou tipo de conteúdo (`Content-Type: text/plain`).

Hospedar via **Vercel** conectado ao GitHub garante que todos os cabeçalhos sejam configurados corretamente!

### Passo a Passo de Configuração na Vercel

1. **Crie a estrutura de diretórios pública:**
   ```bash
   mkdir -p public/.well-known
   ```

2. **Adicione o `stellar.toml` em `public/.well-known/`:**
   Crie o arquivo `public/.well-known/stellar.toml` com o conteúdo (substitua `SUA_CHAVE_PUBLICA_QUEST` pela chave pública da sua Quest Account):
   ```toml
   VERSION = "0.1.0"
   NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"
   ACCOUNTS = [
     "SUA_CHAVE_PUBLICA_QUEST"
   ]
   ```

3. **Crie o arquivo `vercel.json` para configurar os cabeçalhos HTTP:**
   Crie `vercel.json` na raiz do projeto:
   ```json
   {
     "headers": [
       {
         "source": "/.well-known/stellar.toml",
         "headers": [
           { "key": "Access-Control-Allow-Origin", "value": "*" },
           { "key": "Content-Type", "value": "text/plain; charset=utf-8" }
         ]
       }
     ]
   }
   ```

4. **Envie as alterações para o GitHub:**
   ```bash
   git add -f public/.well-known/stellar.toml vercel.json
   git commit -m "feat: add stellar.toml and vercel headers configuration"
   git push
   ```

5. **Deploy & Validação:**
   - Conecte seu repositório do GitHub à Vercel.
   - Teste no navegador: `https://seu-projeto.vercel.app/.well-known/stellar.toml`.
   - Atualize a variável `HOME_DOMAIN` no script `set_options_home_domain.js` com o seu domínio Vercel (sem `https://`).

---

## Parâmetros da Operação

Os parâmetros da operação `setOptions` para `homeDomain` são:
- `homeDomain`: A string contendo o domínio web (deve possuir **máximo de 32 caracteres**).
- `source`: (opcional) A conta para a qual a opção será configurada. Por padrão, é a conta de origem da transação.

---

## A Solução

Importe os módulos do `@stellar/stellar-sdk` e carregue a conta:

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

Construa, assine e envie a transação:
```javascript
const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(Operation.setOptions({
    homeDomain: 'stellar-quest-vert.vercel.app'
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

## Especificação SEP-001

- **Padrão SEP-001:** [SEP-001 Specification](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md)
- **Limite de tamanho do Home Domain:** Máximo de 32 caracteres.

---

## Como Executar

Use o script `set_options_home_domain.js` para executar esta quest localmente:

```bash
node set_options_home_domain.js
```
