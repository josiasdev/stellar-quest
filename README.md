
# Stellar Quest - JavaScript Implementation

> A JavaScript implementation of Stellar Quest challenges to help developers learn the Stellar ecosystem through hands-on coding exercises.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Stellar SDK](https://img.shields.io/badge/Stellar%20SDK-13.3.0-blue.svg)](https://github.com/stellar/js-stellar-sdk)

## About

This project is a JavaScript implementation of the [Stellar Quest](https://quest.stellar.org/) challenges. Since no public repository was found for contributing to the original quests, this implementation was created from scratch to provide developers with working code examples for each challenge.

The project is organized into progressive levels, each focusing on different aspects of Stellar development:

- **Level 1**: Basic operations (Account creation, Payments, Trust lines)
- **Level 2**: Advanced operations (Account merge, Data management, Options)
- **Level 3**: Coming soon...

## Quick Start

### Prerequisites

- **Node.js** (v20+ recommended)
- **npm** (comes with Node.js)
- Basic knowledge of JavaScript and blockchain concepts

### Installation

1. Clone the repository:
```bash
git clone https://github.com/josiasdev/stellar-quest
cd stellar-quest
```

2. Install dependencies:
```bash
npm install
```

3. Run any example:
```bash
node src/level-01/1_create_account.js
node src/level-01/2_payments.js
node src/level-01/3_change_trust.js
```

## Learning Path

### Level 1: Fundamentals
- **1_create_account.js** - Learn how to create new Stellar accounts
- **2_payments.js** - Send native XLM payments between accounts
- **3_change_trust.js** - Establish trust lines for custom assets
- **4_manager_offers.js** - Create and manage trading offers
- **5_path_payments.js** - Execute path payments for asset conversion

### Level 2: Advanced Operations
- **1_account_merge.js** - Merge accounts and transfer balances
- **2_manager_data.js** - Store and retrieve account data
- **3_set_options.js** - Configure account options
- **4_set_options_signers.js** - Manage account signers
- **5_set_flags.js** - Set account flags and permissions

### Level 3: Coming Soon
- Advanced trading strategies
- Multi-signature operations
- Custom asset management
- Smart contract interactions

## Development

### Project Structure
```
stellar-quest/
├── src/
│   ├── level-01/          # Basic operations
│   ├── level-02/          # Advanced operations
│   └── level-03/          # Expert level (coming soon)
├── package.json
└── README.md
```

### Dependencies
- **stellar-sdk**: Official Stellar JavaScript SDK
- **axios**: HTTP client for API requests

## Configuration

### Testnet Setup
All examples use the Stellar Testnet for safe experimentation:

- **Horizon Server**: `https://horizon-testnet.stellar.org`
- **Friendbot**: `https://friendbot.stellar.org` (for funding test accounts)
- **Network**: Stellar Testnet

### Environment Variables
For production use, consider using environment variables for sensitive data:

```bash
export STELLAR_SECRET_KEY="your_secret_key_here"
export STELLAR_NETWORK="testnet" # or "mainnet"
```

## Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
- **Report bugs** - Found an issue? Open an issue!
- **Suggest features** - Have an idea? We'd love to hear it!
- **Improve documentation** - Help others learn better
- **Add examples** - Create new learning exercises
- **Write tests** - Help ensure code quality

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use meaningful variable names
- Add comments for complex operations
- Follow JavaScript best practices
- Include error handling

## 📋 Roadmap

- [ ] Complete Level 3 examples
- [ ] Add TypeScript support
- [ ] Create interactive tutorials
- [ ] Add automated testing
- [ ] Build a web interface
- [ ] Add more blockchain networks

## Important Notes

- **Testnet Only**: All examples use Stellar Testnet - never use test keys on Mainnet!
- **Educational Purpose**: This project is for learning - always verify code before production use
- **Security**: Never commit real secret keys to version control
- **Friendbot**: Used for funding test accounts - has rate limits

## Useful Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar SDK Reference](https://stellar.github.io/js-stellar-sdk/)
- [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)
- [Stellar Discord](https://discord.gg/stellar)

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[Stellar Quest](https://quest.stellar.org/)** - Original quest challenges and learning platform
- [Stellar Development Foundation](https://stellar.org/) for the amazing blockchain platform
- The Stellar community for continuous support and feedback
- All contributors who help make this project better

## Disclaimer

This project is an independent implementation of Stellar Quest challenges. It is not officially affiliated with the Stellar Development Foundation or the original Stellar Quest platform. The challenges and concepts are inspired by the official [Stellar Quest](https://quest.stellar.org/) but implemented from scratch in JavaScript.

---

**Happy coding! 🚀** If you find this project helpful, please give it a ⭐!