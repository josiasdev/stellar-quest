# 🚀 Stellar Quest - Implementação em JavaScript

> 🇺🇸 [Read this in English](README.md)

> Uma implementação em JavaScript dos desafios do Stellar Quest para ajudar desenvolvedores a aprenderem sobre o ecossistema Stellar de forma prática!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Stellar SDK](https://img.shields.io/badge/Stellar%20SDK-13.3.0-blue.svg)](https://github.com/stellar/js-stellar-sdk)

## 🌟 O que é a Stellar?
A [Stellar](https://stellar.org/) é uma rede blockchain de código aberto otimizada para pagamentos e emissão de ativos. Ela foi criada para conectar as infraestruturas financeiras do mundo, permitindo transações rápidas (menos de 5 segundos) e com taxas extremamente baixas (frações de centavo).

## 🎮 A Jornada do Stellar Quest
*"Inicie sua educação em Blockchain. Aprenda a blockchain Stellar, colecione NFTs únicos."*

O [Stellar Quest](https://quest.stellar.org/) é uma plataforma gamificada oficial onde você completa desafios cada vez mais difíceis, aprendendo a usar as APIs e SDKs da rede Stellar. Ao concluir missões, você ganha recompensas e *badges* (NFTs) exclusivos que podem ser exibidos no seu perfil.

**Sobre este Repositório:** Este projeto é uma implementação em código JavaScript dos desafios do Stellar Quest. Ele serve como um "gabarito" ou material de estudo prático para você entender como as operações funcionam nos bastidores usando código de verdade.

---

## 🎒 Preparando o Terreno (Conceitos Básicos)

Antes de rodar o código, aqui estão dois conceitos essenciais no mundo blockchain:
- **Public Key (Chave Pública):** Começa com a letra **`G`**. É como se fosse a sua "chave PIX" ou número da sua conta. Você pode (e deve) compartilhá-la para receber fundos.
- **Secret Key (Chave Privada):** Começa com a letra **`S`**. É a sua senha! **NUNCA** compartilhe esta chave com ninguém e nunca a coloque em repositórios públicos.

> [!CAUTION]
> **Aviso de Segurança:** Nunca faça commit das suas *Secret Keys* reais no controle de versão!

---

## 🛠️ Guia: Como usar a Carteira Albedo
Para resgatar suas NFTs e recompensas no site oficial do [Stellar Quest](https://quest.stellar.org/), você não precisa de uma carteira para começar, mas precisará de uma para **guardar seus NFTs**. A carteira recomendada pela plataforma é a **Albedo**.

1. Acesse [albedo.link](https://albedo.link/).
2. Clique em **"Create a new account"** (Criar uma nova conta).
3. Siga as instruções da tela para guardar as 24 palavras (sua frase de recuperação) em um lugar **extremamente seguro** (preferencialmente anote em um papel).
4. Crie uma senha forte.
5. No Stellar Quest, conecte-se usando o Albedo. Quando você rodar os desafios deste repositório e entender como a rede funciona, poderá aplicar esse conhecimento no site oficial e receber suas *Badges* diretamente na sua conta Albedo!

---

## 🚀 Quick Start (Início Rápido)

### Pré-requisitos
- **Node.js** (v20+ recomendado) - O ambiente que vai executar nosso código JavaScript.
- **npm** (já vem com o Node.js) - O gerenciador de pacotes para baixar as ferramentas da Stellar.

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/josiasdev/stellar-quest
cd stellar-quest
```

2. Instale as dependências:
```bash
npm install
```

3. Rode um exemplo do Nível 1:
```bash
node "src/level-1/1 - createAccount/createAccount.js"
```

**O que você deve esperar ver no terminal?**
Ao rodar o comando acima, você verá algo parecido com isto:
```
Account created successfully!
Public Key: G...
Secret Key: S...
```

### 🔍 Fechando o Ciclo: Veja a mágica acontecer!
Tudo que fazemos aqui roda na **Testnet** (uma rede de testes com dinheiro de mentira). 
Copie a `Public Key` (que começa com `G`) gerada pelo seu terminal e cole-a no **[Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)**. Você verá que a sua conta realmente foi criada na blockchain!

---

## 📚 Trilha de Aprendizado

### Nível 1: Fundamentos
- **[1 - createAccount](src/level-1/1%20-%20createAccount/README_PT_BR.md)** - Aprenda a criar novas contas Stellar
- **[2 - payments](src/level-1/2%20-%20payments/README_PT_BR.md)** - Envie pagamentos em XLM entre contas
- **[3 - change_trust](src/level-1/3-%20change_trust/README_PT_BR.md)** - Estabeleça linhas de confiança (*trustlines*) para novos ativos
- **[4 - manage_offers](src/level-1/4-%20manage_offers/README_PT_BR.md)** - Crie e gerencie ofertas de negociação na DEX
- **[5 - path_payments](src/level-1/5%20-%20path_payments/README_PT_BR.md)** - Execute pagamentos com conversão de ativos (*path payments*)

### Nível 2: Operações Avançadas
- **[1 - account_merge](src/level-2/1%20-%20account_merge/README_PT_BR.md)** - Mescle contas e transfira o saldo nativo em XLM
- **[2 - manage_data](src/level-2/2%20-%20manage_data/README_PT_BR.md)** - Salve e recupere pares chave/valor nos metadados de uma conta
- **[3 - set_options_home_domain](src/level-2/3%20-%20set_options_home_domain/README_PT_BR.md)** - Vincule contas Stellar a domínios web (`stellar.toml`)
- **[4 - set_options_weights_thresholds_signers](src/level-2/4%20-%20set_options_weights_thresholds_signers/README_PT_BR.md)** - Configure multi-assinatura (*multisig*), pesos e limites de operação
- **[5 - set_flags](src/level-2/5%20-%20set_flags/README_PT_BR.md)** - Configure permissões de ativos (`authRequired`/`authRevocable`) e gerencie *trustlines*

### Nível 3: Em Breve
- Estratégias avançadas de negociação
- Operações Multi-assinatura
- Gerenciamento de Ativos Customizados
- Interação com Contratos Inteligentes (Soroban)

---

## 💻 Ambiente (Testnet & Friendbot)

Todos os exemplos usam a rede de testes da Stellar (**Testnet**) para experimentação segura:
- **Horizon Server**: `https://horizon-testnet.stellar.org`
- **Friendbot**: É um robô amigável da rede Stellar que deposita 10.000 XLM de teste na sua conta recém-criada para você brincar à vontade!
- **Rede**: Stellar Testnet

> [!NOTE]
> Você pode esbarrar em *Rate Limits* (limite de uso) ao chamar o Friendbot muitas vezes seguidas. Se isso acontecer, basta aguardar alguns minutos.

---

## 🤝 Comunidade e Suporte

Ainda tem dúvidas? A comunidade Stellar é extremamente acolhedora com desenvolvedores iniciantes!
- 💬 **Discord da Stellar Dev:** [Junte-se ao Discord](https://discord.com/invite/stellardev)
- 📖 **Documentação da Stellar:** [developers.stellar.org](https://developers.stellar.org/)

---

## 📝 Licença
Este projeto está sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos
- **[Stellar Quest](https://quest.stellar.org/)** - Pelos desafios originais fantásticos.
- A comunidade Stellar pelo suporte e feedback contínuos!

---
> **Aviso Legal:** Este projeto é uma implementação independente. Não é oficialmente afiliado à Stellar Development Foundation ou à plataforma oficial Stellar Quest.
