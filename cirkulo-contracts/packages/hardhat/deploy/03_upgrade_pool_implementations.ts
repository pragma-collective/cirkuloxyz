import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Upgrades pool implementation contracts without redeploying the factory
 *
 * This script:
 * 1. Deploys new versions of pool implementation contracts
 * 2. Updates the XershaFactory to point to the new implementations
 * 3. Preserves existing pools (they continue using old implementation)
 * 4. New pools will use the upgraded implementations
 *
 * Usage:
 *   yarn deploy --network citrea --tags upgrade
 *
 * Prerequisites:
 *   - XershaFactory must already be deployed
 *   - Deployer must be the factory owner
 */
const upgradePoolImplementations: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🔄 Upgrading Pool Implementations...");
  console.log("Deployer address:", deployer);

  // Step 1: Verify XershaFactory exists
  let xershaFactoryDeployment;
  try {
    xershaFactoryDeployment = await hre.deployments.get("XershaFactory");
  } catch (error) {
    console.error("\n❌ ERROR: XershaFactory not found!");
    console.error("   You must deploy the factory first using:");
    console.error("   yarn deploy --network <network>");
    throw new Error("XershaFactory not deployed");
  }

  const xershaFactoryAddress = xershaFactoryDeployment.address;
  console.log("\n📍 Using existing XershaFactory at:", xershaFactoryAddress);

  // Get factory contract instance
  const xershaFactory = await hre.ethers.getContract<Contract>("XershaFactory", deployer);

  // Get current implementations for comparison
  const currentROSCA = await xershaFactory.roscaImplementation();
  const currentSavings = await xershaFactory.savingsImplementation();
  const currentDonation = await xershaFactory.donationImplementation();

  console.log("\n📋 Current Implementations:");
  console.log("  ROSCA:    ", currentROSCA);
  console.log("  Savings:  ", currentSavings);
  console.log("  Donation: ", currentDonation);

  // Step 2: Deploy new implementation contracts
  console.log("\n🚀 Deploying New Pool Implementations...");

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

  // Step 3: Update factory implementations
  console.log("\n🔧 Updating XershaFactory...");

  const tx = await xershaFactory.setImplementations(
    roscaImpl.address,
    savingsImpl.address,
    donationImpl.address
  );

  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("✅ Factory updated successfully!");

  // Step 4: Verify updates
  const newROSCA = await xershaFactory.roscaImplementation();
  const newSavings = await xershaFactory.savingsImplementation();
  const newDonation = await xershaFactory.donationImplementation();

  console.log("\n📊 Upgrade Summary:");
  console.log("=".repeat(80));
  console.log("Factory Address:", xershaFactoryAddress);
  console.log("Gas Used:", receipt?.gasUsed?.toString() || "N/A");
  console.log("\nROSCA Pool:");
  console.log("  Old:", currentROSCA);
  console.log("  New:", newROSCA);
  console.log("  Changed:", currentROSCA !== newROSCA ? "✅ YES" : "⚠️  NO");
  console.log("\nSavings Pool:");
  console.log("  Old:", currentSavings);
  console.log("  New:", newSavings);
  console.log("  Changed:", currentSavings !== newSavings ? "✅ YES" : "⚠️  NO");
  console.log("\nDonation Pool:");
  console.log("  Old:", currentDonation);
  console.log("  New:", newDonation);
  console.log("  Changed:", currentDonation !== newDonation ? "✅ YES" : "⚠️  NO");
  console.log("=".repeat(80));

  console.log("\n📝 Important Notes:");
  console.log("  • Existing pools continue using the old implementation");
  console.log("  • New pools created after this upgrade will use the new implementation");
  console.log("  • No migration needed - all pools operate independently\n");

  // Verification instructions for non-local networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("💡 To verify new implementations on block explorer, run:");
    console.log(`   yarn verify --network ${hre.network.name} ${roscaImpl.address}`);
    console.log(`   yarn verify --network ${hre.network.name} ${savingsImpl.address}`);
    console.log(`   yarn verify --network ${hre.network.name} ${donationImpl.address}\n`);
  }
};

export default upgradePoolImplementations;

// Tags for selective deployment
upgradePoolImplementations.tags = ["UpgradeImplementations", "upgrade"];
