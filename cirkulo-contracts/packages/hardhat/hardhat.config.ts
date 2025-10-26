import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

// If not set, it uses ours Alchemy's default API key.
// You can get your own at https://dashboard.alchemyapi.io
const providerApiKey = process.env.ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF";
// If not set, it uses the hardhat account 0 private key.
// You can generate a random account with `yarn generate` or `yarn account:import` to import your existing PK
const deployerPrivateKey =
  process.env.__RUNTIME_DEPLOYER_PRIVATE_KEY ?? "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
// If not set, it uses our block explorers default API keys.
const etherscanApiKey = process.env.ETHERSCAN_V2_API_KEY || "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            // https://docs.soliditylang.org/en/latest/using-the-compiler.html#optimizer-options
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "localhost",
  namedAccounts: {
    deployer: {
      // By default, it will take the first Hardhat account as the deployer
      default: 0,
    },
  },
  networks: {
    // View the networks that are pre-configured.
    // If the network you are looking for is not here you can add new network settings
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${providerApiKey}`,
        enabled: process.env.MAINNET_FORKING_ENABLED === "true",
      },
    },
    mainnet: {
      url: "https://mainnet.rpc.buidlguidl.com",
      accounts: [deployerPrivateKey],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    arbitrumSepolia: {
      url: `https://arb-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    optimismSepolia: {
      url: `https://opt-sepolia.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonAmoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonZkEvm: {
      url: `https://polygonzkevm-mainnet.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    polygonZkEvmCardona: {
      url: `https://polygonzkevm-cardona.g.alchemy.com/v2/${providerApiKey}`,
      accounts: [deployerPrivateKey],
    },
    gnosis: {
      url: "https://rpc.gnosischain.com",
      accounts: [deployerPrivateKey],
    },
    chiado: {
      url: "https://rpc.chiadochain.net",
      accounts: [deployerPrivateKey],
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [deployerPrivateKey],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [deployerPrivateKey],
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: [deployerPrivateKey],
    },
    scroll: {
      url: "https://rpc.scroll.io",
      accounts: [deployerPrivateKey],
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [deployerPrivateKey],
    },
    celoSepolia: {
      url: "https://forno.celo-sepolia.celo-testnet.org/",
      accounts: [deployerPrivateKey],
    },
    // Citrea Testnet for Xersha deployment
    citreaTestnet: {
      url: process.env.CITREA_RPC_URL || "https://rpc.testnet.citrea.xyz",
      chainId: 5115, // Citrea Testnet chain ID
      accounts: [deployerPrivateKey],
      gasPrice: "auto",
    },
    // Lens Chain Testnet for Lens Protocol custom group rules (HACKATHON TARGET)
    lensTestnet: {
      url: process.env.LENS_TESTNET_RPC_URL || "https://rpc.testnet.lens.dev",
      chainId: 37111, // Lens Testnet chain ID
      accounts: [deployerPrivateKey],
      gasPrice: "auto",
      verify: {
        etherscan: {
          apiUrl: "https://block-explorer.testnet.lens.dev/api",
        },
      },
    },
    // Lens Chain Mainnet
    lensMainnet: {
      url: process.env.LENS_MAINNET_RPC_URL || "https://rpc.lens.xyz",
      chainId: 232, // Lens Mainnet chain ID
      accounts: [deployerPrivateKey],
      gasPrice: "auto",
      verify: {
        etherscan: {
          apiUrl: "https://explorer.lens.xyz/api",
        },
      },
    },
  },
  // Configuration for harhdat-verify plugin
  etherscan: {
    apiKey: {
      citreaTestnet: process.env.CITREA_API_KEY || "dummy-api-key-not-needed",
      lensTestnet: process.env.LENS_TESTNET_API_KEY || "dummy-api-key-not-needed",
      lensMainnet: process.env.LENS_MAINNET_API_KEY || "dummy-api-key-not-needed",
      mainnet: etherscanApiKey,
      sepolia: etherscanApiKey,
      arbitrum: etherscanApiKey,
      arbitrumSepolia: etherscanApiKey,
      optimism: etherscanApiKey,
      optimismSepolia: etherscanApiKey,
      polygon: etherscanApiKey,
      polygonAmoy: etherscanApiKey,
      base: etherscanApiKey,
      baseSepolia: etherscanApiKey,
    },
    customChains: [
      {
        network: "citreaTestnet",
        chainId: 5115,
        urls: {
          apiURL: process.env.CITREA_EXPLORER_API || "https://explorer-api.testnet.citrea.xyz/api",
          browserURL: process.env.CITREA_EXPLORER_URL || "https://explorer.testnet.citrea.xyz",
        },
      },
      {
        network: "lensTestnet",
        chainId: 37111,
        urls: {
          apiURL: "https://block-explorer.testnet.lens.dev/api",
          browserURL: "https://block-explorer.testnet.lens.dev",
        },
      },
      {
        network: "lensMainnet",
        chainId: 232,
        urls: {
          apiURL: "https://explorer.lens.xyz/api",
          browserURL: "https://explorer.lens.xyz",
        },
      },
    ],
  },
  // Configuration for etherscan-verify from hardhat-deploy plugin
  verify: {
    etherscan: {
      apiKey: etherscanApiKey,
    },
  },
  sourcify: {
    enabled: false,
  },
};

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  // Run the original deploy task
  await runSuper(args);
  // Force run the generateTsAbis script
  await generateTsAbis(hre);
});

export default config;
