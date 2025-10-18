# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Scaffold-ETH 2 monorepo for building decentralized applications on Ethereum. The tech stack includes NextJS (App Router), RainbowKit, Hardhat, Wagmi, Viem, and TypeScript.

## Monorepo Structure

This is a Yarn workspace monorepo with two main packages:

- `packages/hardhat`: Solidity smart contracts, tests, and deployment scripts
- `packages/nextjs`: Next.js frontend application with web3 integration

## Development Commands

### Local Development Workflow

Run these commands in parallel terminals for local development:

```bash
yarn chain          # Start local Hardhat network (terminal 1)
yarn deploy         # Deploy contracts to local network (terminal 2)
yarn start          # Start Next.js frontend on http://localhost:3000 (terminal 3)
```

### Smart Contract Commands

```bash
yarn compile                # Compile Solidity contracts
yarn hardhat:test           # Run all tests with gas reporting
yarn hardhat:test --grep "test name"  # Run specific test
yarn deploy                 # Deploy contracts (auto-generates TypeScript ABIs)
yarn deploy --network <network>       # Deploy to specific network
yarn deploy --tags <TagName>          # Deploy specific contract by tag
yarn verify --network <network>       # Verify contracts on Etherscan
```

### Account Management

```bash
yarn generate               # Generate new deployer account
yarn account:import         # Import existing private key
yarn account                # Check account balance across networks
yarn account:reveal-pk      # Reveal private key (use with caution)
```

### Frontend Commands

```bash
yarn start                  # Start development server
yarn next:build             # Build for production
yarn next:lint              # Lint Next.js code
yarn next:check-types       # TypeScript type checking
yarn format                 # Format all code (Prettier)
```

### Other Commands

```bash
yarn lint                   # Lint both packages
yarn hardhat:fork           # Fork Ethereum mainnet
yarn hardhat:clean          # Clean Hardhat artifacts
```

## Architecture

### Smart Contract Development

**Location**: `packages/hardhat/contracts/`

- Write Solidity contracts here (currently using v0.8.20)
- OpenZeppelin contracts available via `@openzeppelin/contracts`
- Use `hardhat/console.sol` for debugging (remove for production)

**Deployment**: `packages/hardhat/deploy/`

- Uses hardhat-deploy plugin for deployment
- Files run in alphabetical order (e.g., `00_deploy_your_contract.ts`)
- Each deployment script should export tags for selective deployment
- After deployment, TypeScript ABIs are auto-generated via `generateTsAbis` script

**Testing**: `packages/hardhat/test/`

- Use Hardhat's testing framework (Chai matchers)
- Tests run with gas reporting enabled by default
- Use `before()` hook for fixtures to reuse setup across tests

### Frontend Architecture

**Contract Integration**:

The frontend automatically reads contract data from:
- `packages/nextjs/contracts/deployedContracts.ts` (auto-generated)
- `packages/nextjs/contracts/externalContracts.ts` (for external contracts)

**Contract Interaction Hooks** (`packages/nextjs/hooks/scaffold-eth/`):

ALWAYS use these hooks for contract interactions:

1. **Reading contract data**: `useScaffoldReadContract`
   ```typescript
   const { data } = useScaffoldReadContract({
     contractName: "YourContract",
     functionName: "greeting",
     args: [arg1, arg2], // optional
   });
   ```

2. **Writing contract data**: `useScaffoldWriteContract`
   ```typescript
   const { writeContractAsync } = useScaffoldWriteContract({
     contractName: "YourContract"
   });

   await writeContractAsync({
     functionName: "setGreeting",
     args: ["Hello"],
     value: parseEther("0.1"), // optional, for payable functions
   });
   ```

3. **Reading events**: `useScaffoldEventHistory`
   ```typescript
   const { data: events } = useScaffoldEventHistory({
     contractName: "YourContract",
     eventName: "GreetingChange",
     watch: true, // optional, watch for new events
   });
   ```

Never use other patterns for contract interaction. Additional hooks available: `useScaffoldWatchContractEvent`, `useDeployedContractInfo`, `useScaffoldContract`, `useTransactor`.

**UI Components** (`packages/nextjs/components/scaffold-eth/`):

Pre-built components for common web3 use cases:
- `<Address>`: Display Ethereum addresses
- `<AddressInput>`: Input field for addresses
- `<Balance>`: Display ETH/USDC balance
- `<EtherInput>`: Number input with ETH/USD conversion

### Configuration

**Hardhat**: `packages/hardhat/hardhat.config.ts`
- Configured with multiple networks (mainnet, sepolia, arbitrum, optimism, polygon, base, etc.)
- Uses environment variables for API keys and deployer private key
- Solidity compiler set to v0.8.20 with optimizer enabled (200 runs)

**Next.js**: `packages/nextjs/scaffold.config.ts`
- Configure target networks (currently set to `hardhat` local network)
- Set polling interval for RPC queries
- Configure Alchemy API key and WalletConnect project ID
- Set `onlyLocalBurnerWallet` to `true` for local-only burner wallet

**Environment Variables**:
- Hardhat: Copy `packages/hardhat/.env.example` to `.env`
- DO NOT manually set `DEPLOYER_PRIVATE_KEY_ENCRYPTED` - use `yarn generate` or `yarn account:import`

### Development Flow

1. Write smart contract in `packages/hardhat/contracts/`
2. Update deployment script in `packages/hardhat/deploy/` if needed
3. Deploy locally with `yarn deploy`
4. Test contract at `http://localhost:3000/debug` (auto-generated UI)
5. Write tests in `packages/hardhat/test/`
6. Build custom UI using Scaffold-ETH hooks and components
7. Update `scaffold.config.ts` to point to target network
8. Deploy to live network: `yarn deploy --network <network>`
9. Verify contracts: `yarn verify --network <network>`

## Key Features

- **Contract Hot Reload**: Frontend auto-updates when contracts change
- **Burner Wallet**: Quick testing with local burner wallet and faucet
- **Debug UI**: Auto-generated UI at `/debug` for contract interaction
- **TypeScript ABIs**: Auto-generated from contract compilation
- **Multi-network Support**: Pre-configured for mainnet and popular L2s
