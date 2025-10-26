import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the XershaFactory contract with minimal proxy pattern
 * This includes deploying implementation contracts first
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployXershaFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🚀 Deploying Xersha Factory with Yield-Enabled Savings Pools...");
  console.log("Deployer address:", deployer);

  // Step 1: Get existing CUSD Token or deploy new one
  console.log("\n📋 Step 1: Getting CUSD Token...");

  let mockCUSD;
  const existingCUSDAddress = process.env.CUSD_TOKEN_ADDRESS;

  if (existingCUSDAddress) {
    console.log("✅ Using existing CUSDToken at:", existingCUSDAddress);
    mockCUSD = { address: existingCUSDAddress };
  } else {
    console.log("⚠️  CUSD_TOKEN_ADDRESS not set in .env, deploying new MockCUSD...");
    mockCUSD = await deploy("MockCUSD", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
      waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
    });
    console.log("✅ MockCUSD deployed to:", mockCUSD.address);
  }

  // Step 2: Deploy Yield Vaults
  console.log("\n📋 Step 2: Deploying Yield Vaults...");

  const CUSD_APY = 500; // 5.00%
  const CBTC_APY = 300; // 3.00%

  const cusdVault = await deploy("MockYieldVault", {
    from: deployer,
    contract: "MockYieldVault",
    args: [
      mockCUSD.address,  // tokenAddress
      false,             // isNativeToken
      CUSD_APY           // 5% APY
    ],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ CUSD Yield Vault deployed to:", cusdVault.address, "(5% APY)");

  const cbtcVault = await deploy("MockYieldVault_cBTC", {
    from: deployer,
    contract: "MockYieldVault",
    args: [
      hre.ethers.ZeroAddress,  // tokenAddress (native)
      true,                     // isNativeToken
      CBTC_APY                  // 3% APY
    ],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ cBTC Yield Vault deployed to:", cbtcVault.address, "(3% APY)");

  // Step 3: Deploy Pool Implementation Contracts
  console.log("\n📋 Step 3: Deploying Pool Implementation Contracts...");

  const roscaImpl = await deploy("ROSCAPool", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ ROSCA Implementation deployed to:", roscaImpl.address);

  const savingsImpl = await deploy("YieldSavingsPool", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ YieldSavingsPool Implementation deployed to:", savingsImpl.address);

  const donationImpl = await deploy("DonationPool", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ Donation Implementation deployed to:", donationImpl.address);

  // Step 4: Deploy XershaFactory with yield vaults
  console.log("\n📋 Step 4: Deploying XershaFactory...");

  // Get backend manager from environment variable
  // This should match the wallet address derived from BACKEND_SIGNER_PRIVATE_KEY in your API
  const backendManager = process.env.BACKEND_SIGNER_ADDRESS || deployer;

  console.log("Backend Manager Address:", backendManager);
  if (backendManager === deployer) {
    console.log("⚠️  WARNING: BACKEND_SIGNER_ADDRESS not set. Using deployer as backend manager.");
    console.log("    For production, set BACKEND_SIGNER_ADDRESS in .env to your API wallet address.");
  }

  const xershaFactory = await deploy("XershaFactory", {
    from: deployer,
    args: [
      deployer,              // initialOwner
      backendManager,        // backendManager (API wallet that can invite members to pools)
      roscaImpl.address,     // ROSCA implementation
      savingsImpl.address,   // YieldSavingsPool implementation
      donationImpl.address,  // Donation implementation
      cbtcVault.address,     // cBTC Yield Vault (3% APY)
      cusdVault.address,     // CUSD Yield Vault (5% APY)
    ],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });

  console.log("✅ XershaFactory deployed to:", xershaFactory.address);

  // Get the deployed contract instance
  const xershaFactoryContract = await hre.ethers.getContract<Contract>("XershaFactory", deployer);

  console.log("\n📊 Xersha Factory Deployment Summary:");
  console.log("=====================================");
  console.log("Factory Address:", await xershaFactoryContract.getAddress());
  console.log("Owner:", await xershaFactoryContract.owner());
  console.log("Backend Manager:", await xershaFactoryContract.backendManager());
  console.log("\nPool Implementations:");
  console.log("  ROSCA:", await xershaFactoryContract.roscaImplementation());
  console.log("  YieldSavingsPool:", await xershaFactoryContract.savingsImplementation());
  console.log("  Donation:", await xershaFactoryContract.donationImplementation());
  console.log("\nYield Vaults:");
  console.log("  cBTC Vault (3% APY):", await xershaFactoryContract.cBTCYieldVault());
  console.log("  CUSD Vault (5% APY):", await xershaFactoryContract.cusdYieldVault());
  console.log("\nReceipt Tokens (Portfolio Tracking):");
  console.log("  xshCUSD:", await xershaFactoryContract.cusdReceiptToken());
  console.log("  xshCBTC:", await xershaFactoryContract.cbtcReceiptToken());
  console.log("\n💰 All savings pools now earn yield automatically!");
  console.log("   cBTC pools: 3% APY");
  console.log("   CUSD pools: 5% APY");
  console.log("\n💎 Receipt tokens minted to user wallets:");
  console.log("   Users receive xshCUSD/xshCBTC on deposits");
  console.log("   Tokens burned on withdrawals");
  console.log("   Single balanceOf() shows total across all pools");
  console.log("=====================================\n");

  // Whitelist CUSD Vault as minter (for existing CUSD token)
  if (existingCUSDAddress) {
    console.log("\n📋 Checking CUSD Vault minter status...");

    // Full ABI for the existing CUSDToken contract
    const cusdTokenAbi = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "minter",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "status",
            "type": "bool"
          }
        ],
        "name": "setMinterStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "whitelistedMinters",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];

    // Get signer - use CUSD token owner if available, otherwise deployer
    let signer;
    const cusdTokenOwnerPrivateKey = process.env.CUSD_TOKEN_OWNER_PRIVATE_KEY;

    if (cusdTokenOwnerPrivateKey) {
      console.log("Using CUSD_TOKEN_OWNER_PRIVATE_KEY for whitelisting");
      signer = new hre.ethers.Wallet(cusdTokenOwnerPrivateKey, hre.ethers.provider);
    } else {
      const [deployerSigner] = await hre.ethers.getSigners();
      signer = deployerSigner;
    }

    const cusdTokenContract = new hre.ethers.Contract(existingCUSDAddress, cusdTokenAbi, signer);

    try {
      // Check if vault is already whitelisted
      const isWhitelisted = await cusdTokenContract.whitelistedMinters(cusdVault.address);

      if (isWhitelisted) {
        console.log("✅ CUSD Vault already whitelisted as minter");
      } else {
        console.log("Whitelisting CUSD Vault as minter...");
        const tx = await cusdTokenContract.setMinterStatus(cusdVault.address, true);
        await tx.wait();
        console.log("✅ CUSD Vault whitelisted successfully");
      }
    } catch (error: any) {
      console.log("❌ Error whitelisting vault:", error.message);
      console.log("⚠️  Make sure CUSD_TOKEN_OWNER_PRIVATE_KEY is set in .env");
      console.log("⚠️  Or manually whitelist the vault:");
      console.log(`   await cusdToken.setMinterStatus("${cusdVault.address}", true)\n`);
    }
  }

  // Verification instructions for non-local networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("💡 To verify contracts on block explorer, run:");
    console.log(`   yarn verify --network ${hre.network.name}\n`);
  }
};

export default deployXershaFactory;

// Tags are useful for selectively deploying contracts
deployXershaFactory.tags = ["XershaFactory", "core"];
