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

  console.log("\n🚀 Deploying Xersha Factory with Minimal Proxy Pattern...");
  console.log("Deployer address:", deployer);

  // Step 1: Deploy Implementation Contracts
  console.log("\n📋 Step 1: Deploying Pool Implementation Contracts...");

  const roscaImpl = await deploy("ROSCAPool", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ ROSCA Implementation deployed to:", roscaImpl.address);

  const savingsImpl = await deploy("SavingsPool", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ Savings Implementation deployed to:", savingsImpl.address);

  const donationImpl = await deploy("DonationPool", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    waitConfirmations: hre.network.name === "hardhat" || hre.network.name === "localhost" ? 1 : 5,
  });
  console.log("✅ Donation Implementation deployed to:", donationImpl.address);

  // Step 2: Deploy XershaFactory with implementation addresses
  console.log("\n📋 Step 2: Deploying XershaFactory...");

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
      savingsImpl.address,   // Savings implementation
      donationImpl.address,  // Donation implementation
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
  console.log("ROSCA Implementation:", await xershaFactoryContract.roscaImplementation());
  console.log("Savings Implementation:", await xershaFactoryContract.savingsImplementation());
  console.log("Donation Implementation:", await xershaFactoryContract.donationImplementation());
  console.log("=====================================\n");

  // Verification instructions for non-local networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("💡 To verify contracts on block explorer, run:");
    console.log(`   yarn verify --network ${hre.network.name}\n`);
  }
};

export default deployXershaFactory;

// Tags are useful for selectively deploying contracts
deployXershaFactory.tags = ["XershaFactory", "core"];
