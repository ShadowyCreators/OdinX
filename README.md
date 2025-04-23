# Frontend Template

## Getting Started

### Prerequisites

- [Xverse Wallet](https://www.xverse.app/) for Bitcoin
- [MetaMask](https://metamask.io/) for Ethereum

1. This repository uses Bun but you can also use npm:

   With Bun:

   ```bash
   bun install
   ```

   With npm:

   ```bash
   npm install
   ```

2. Development mode:

   ```bash
   bun run dev
   ```

3. Production mode:

   ```bash
   bun run build
   bun run preview
   ```

4. Environment setup:
   The `.env.template` file contains the correct environment variables for testnet:
   - Bitcoin `Testnet 3` network
   - Ethereum `Sepolia` network

   Make sure your wallets are configured to use these test networks before connecting.
