import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the XershaFactory contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployXershaFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🚀 Deploying Xersha Factory...");
  console.log("Deployer address:", deployer);

  // Deploy XershaFactory
  const xershaFactory = await deploy("XershaFactory", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true, // Speed up deployment on local network (hardhat), no effect on live networks
  });

  console.log("✅ XershaFactory deployed to:", xershaFactory.address);

  // Get the deployed contract instance
  const xershaFactoryContract = await hre.ethers.getContract<Contract>("XershaFactory", deployer);

  console.log("\n📊 Xersha Factory Deployment Summary:");
  console.log("=====================================");
  console.log("Contract Address:", await xershaFactoryContract.getAddress());
  console.log("Deployer:", deployer);
  console.log("Total Pools Created:", (await xershaFactoryContract.getTotalPools()).toString());
  console.log("=====================================\n");

  // Verify the contract on Etherscan-like explorers (only if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations before verification...");
    // Wait for 6 block confirmations
    await new Promise((resolve) => setTimeout(resolve, 60000)); // 1 minute wait

    try {
      console.log("Verifying contract on block explorer...");
      await hre.run("verify:verify", {
        address: xershaFactory.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error: any) {
      if (error.message.toLowerCase().includes("already verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.error("❌ Error verifying contract:", error);
      }
    }
  }
};

export default deployXershaFactory;

// Tags are useful for selectively deploying contracts
deployXershaFactory.tags = ["XershaFactory", "core"];
