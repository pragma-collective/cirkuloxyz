import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

/**
 * Deploys the InviteOnlyGroupRule contract
 * 
 * This contract implements Lens Protocol's IGroupRule interface
 * to enable invite-only groups with on-chain validation.
 * 
 * Prerequisites:
 * 1. Set BACKEND_SIGNER_ADDRESS in environment variables
 * 2. Ensure deployer wallet has GRASS tokens for gas
 * 
 * After deployment:
 * 1. Copy contract address to .env: INVITE_RULE_CONTRACT_ADDRESS=0x...
 * 2. Fund backend signer address with GRASS tokens
 * 3. Use contract address when creating groups in frontend
 */
const deployInviteRule: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get backend signer address from environment
  const backendAddress = process.env.BACKEND_SIGNER_ADDRESS;
  
  if (!backendAddress) {
    console.error("\n❌ ERROR: BACKEND_SIGNER_ADDRESS not set!");
    console.error("\n📝 To fix this:");
    console.error("   1. Generate a backend wallet:");
    console.error("      npx ts-node scripts/generate-backend-signer.ts");
    console.error("   2. Add to .env:");
    console.error("      BACKEND_SIGNER_ADDRESS=0x...");
    console.error("      BACKEND_SIGNER_PRIVATE_KEY=0x...\n");
    throw new Error("BACKEND_SIGNER_ADDRESS not set in environment");
  }

  // Validate address format
  if (!ethers.isAddress(backendAddress)) {
    throw new Error(`Invalid BACKEND_SIGNER_ADDRESS: ${backendAddress}`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 DEPLOYMENT CONFIGURATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Network:         ${hre.network.name}`);
  console.log(`Deployer:        ${deployer}`);
  console.log(`Backend Address: ${backendAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🚀 Deploying InviteOnlyGroupRule...\n");

  const deployment = await deploy("InviteOnlyGroupRule", {
    from: deployer,
    args: [backendAddress],
    log: true,
    autoMine: true, // Speed up deployment on local network
    waitConfirmations: hre.network.name === "lensTestnet" ? 2 : 1,
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ DEPLOYMENT SUCCESSFUL");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Contract Address: ${deployment.address}`);
  console.log(`Backend Address:  ${backendAddress}`);
  console.log(`Deployer:         ${deployer}`);
  console.log(`Gas Used:         ${deployment.receipt?.gasUsed?.toString() || "N/A"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Add contract address to your .env file:");
  console.log(`   INVITE_RULE_CONTRACT_ADDRESS=${deployment.address}\n`);
  console.log("2. Fund backend signer with GRASS tokens:");
  console.log(`   Backend address: ${backendAddress}`);
  console.log("   Needed for: registerInvite() transactions\n");
  console.log("3. Verify contract on explorer (optional):");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${deployment.address} ${backendAddress}\n`);
  console.log("4. Update frontend environment variables:");
  console.log(`   NEXT_PUBLIC_INVITE_RULE_CONTRACT_ADDRESS=${deployment.address}\n`);
  console.log("5. Restart your API server to load new contract address\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info to a file for easy reference
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: deployment.address,
    backendAddress: backendAddress,
    deployer: deployer,
    deployedAt: new Date().toISOString(),
    transactionHash: deployment.receipt?.transactionHash,
    gasUsed: deployment.receipt?.gasUsed?.toString(),
  };

  const deploymentsDir = `${__dirname}/../deployments-info`;
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${deploymentsDir}/InviteOnlyGroupRule-${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment info saved to: deployments-info/InviteOnlyGroupRule-${hre.network.name}.json\n`);

  return true;
};

export default deployInviteRule;
deployInviteRule.tags = ["InviteOnlyGroupRule", "invite"];
deployInviteRule.dependencies = []; // No dependencies
