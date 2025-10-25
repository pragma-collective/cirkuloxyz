import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { XershaFactory, ROSCAPool, YieldSavingsPool, DonationPool, MockCUSD, MockYieldVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("XershaFactory", function () {
  let xershaFactory: XershaFactory;
  let roscaImpl: ROSCAPool;
  let savingsImpl: YieldSavingsPool;
  let donationImpl: DonationPool;
  let mockToken: MockCUSD;
  let cbtcVault: MockYieldVault;
  let cusdVault: MockYieldVault;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let backendManager: SignerWithAddress;
  let circleId: string;
  let tokenAddress: string;

  before(async function () {
    [deployer, user1, user2, backendManager] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy Mock CUSD token
    const MockCUSDFactory = await ethers.getContractFactory("MockCUSD");
    mockToken = await MockCUSDFactory.deploy();
    tokenAddress = await mockToken.getAddress();

    // Deploy yield vaults
    const MockYieldVaultFactory = await ethers.getContractFactory("MockYieldVault");
    cbtcVault = await MockYieldVaultFactory.deploy(ethers.ZeroAddress, true, 300); // 3% APY
    cusdVault = await MockYieldVaultFactory.deploy(tokenAddress, false, 500); // 5% APY

    // Deploy implementation contracts
    const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
    roscaImpl = await ROSCAPoolFactory.deploy();

    const YieldSavingsPoolFactory = await ethers.getContractFactory("YieldSavingsPool");
    savingsImpl = await YieldSavingsPoolFactory.deploy();

    const DonationPoolFactory = await ethers.getContractFactory("DonationPool");
    donationImpl = await DonationPoolFactory.deploy();

    // Deploy XershaFactory with implementation addresses and vaults
    const XershaFactoryFactory = await ethers.getContractFactory("XershaFactory");
    xershaFactory = await XershaFactoryFactory.deploy(
      deployer.address,               // owner
      backendManager.address,         // backendManager
      await roscaImpl.getAddress(),
      await savingsImpl.getAddress(),
      await donationImpl.getAddress(),
      await cbtcVault.getAddress(),   // cBTC vault
      await cusdVault.getAddress(),   // CUSD vault
    );

    // Use a simple address as circleId (can be any non-zero address for cross-chain reference)
    circleId = user2.address; // Use user2 for circleId
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await xershaFactory.getAddress()).to.be.properAddress;
    });

    it("Should initialize with zero pools", async function () {
      expect(await xershaFactory.getTotalPools()).to.equal(0);
    });
  });

  describe("ROSCA Pool Creation", function () {
    it("Should create a ROSCA pool successfully", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      const circleName = "Test Circle";

      const tx = await xershaFactory
        .connect(user1)
        .createROSCA(circleId, circleName, contributionAmount, tokenAddress, false);

      const receipt = await tx.wait();
      const poolAddress = await xershaFactory.circleToPool(circleId);

      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
      expect(await xershaFactory.isValidPool(poolAddress)).to.be.true;
      expect(await xershaFactory.getTotalPools()).to.equal(1);
    });

    it("Should emit PoolCreated event", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      const circleName = "Test Circle";

      const tx = await xershaFactory
        .connect(user1)
        .createROSCA(circleId, circleName, contributionAmount, tokenAddress, false);
      const receipt = await tx.wait();
      const poolAddress = await xershaFactory.circleToPool(circleId);

      // Check for PoolCreated event
      await expect(tx)
        .to.emit(xershaFactory, "PoolCreated")
        .withArgs(circleId, poolAddress, user1.address, 0); // 0 = ROSCA
    });

    it("Should fail if circle already has a pool", async function () {
      const contributionAmount = ethers.parseEther("0.1");

      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", contributionAmount, tokenAddress, false);

      await expect(
        xershaFactory.connect(user1).createROSCA(circleId, "Test Circle 2", contributionAmount, tokenAddress, false),
      ).to.be.revertedWith("Circle already has pool");
    });

    it("Should fail with zero contribution amount", async function () {
      await expect(
        xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", 0, tokenAddress, false),
      ).to.be.revertedWith("Invalid contribution amount");
    });

    it("Should fail with zero address as circle ID", async function () {
      await expect(
        xershaFactory
          .connect(user1)
          .createROSCA(ethers.ZeroAddress, "Test Circle", ethers.parseEther("0.1"), tokenAddress, false),
      ).to.be.revertedWith("Zero address not allowed");
    });

    it("Should set correct pool type", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", contributionAmount, tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.poolTypes(poolAddress)).to.equal(0); // PoolType.ROSCA = 0
    });
  });

  describe("Savings Pool Creation", function () {
    it("Should create a Savings pool successfully", async function () {
      const circleName = "Savings Circle";

      const tx = await xershaFactory.connect(user1).createSavingsPool(circleId, circleName, tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);

      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
      expect(await xershaFactory.isValidPool(poolAddress)).to.be.true;
      expect(await xershaFactory.getTotalPools()).to.equal(1);
    });

    it("Should set correct pool type", async function () {
      await xershaFactory.connect(user1).createSavingsPool(circleId, "Savings Circle", tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.poolTypes(poolAddress)).to.equal(1); // PoolType.SAVINGS = 1
    });
  });

  describe("Donation Pool Creation", function () {
    it("Should create a Donation pool successfully", async function () {
      const circleName = "Charity Circle";
      const beneficiary = user2.address;
      const goalAmount = ethers.parseEther("1");
      const deadline = (await time.latest()) + 86400; // 1 day from now

      const tx = await xershaFactory
        .connect(user1)
        .createDonationPool(circleId, circleName, beneficiary, goalAmount, deadline, tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);

      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
      expect(await xershaFactory.isValidPool(poolAddress)).to.be.true;
      expect(await xershaFactory.getTotalPools()).to.equal(1);
    });

    it("Should set correct pool type", async function () {
      const beneficiary = user2.address;
      const goalAmount = ethers.parseEther("1");
      const deadline = (await time.latest()) + 86400;

      await xershaFactory
        .connect(user1)
        .createDonationPool(circleId, "Charity Circle", beneficiary, goalAmount, deadline, tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.poolTypes(poolAddress)).to.equal(2); // PoolType.DONATION = 2
    });

    it("Should fail with invalid beneficiary", async function () {
      const goalAmount = ethers.parseEther("1");
      const deadline = (await time.latest()) + 86400;

      await expect(
        xershaFactory
          .connect(user1)
          .createDonationPool(circleId, "Charity Circle", ethers.ZeroAddress, goalAmount, deadline, tokenAddress, false),
      ).to.be.revertedWith("Invalid beneficiary");
    });

    it("Should fail with zero goal amount", async function () {
      const deadline = (await time.latest()) + 86400;

      await expect(
        xershaFactory.connect(user1).createDonationPool(circleId, "Charity Circle", user2.address, 0, deadline, tokenAddress, false),
      ).to.be.revertedWith("Invalid goal");
    });

    it("Should fail with past deadline", async function () {
      const goalAmount = ethers.parseEther("1");
      const pastDeadline = (await time.latest()) - 86400; // 1 day ago

      await expect(
        xershaFactory
          .connect(user1)
          .createDonationPool(circleId, "Charity Circle", user2.address, goalAmount, pastDeadline, tokenAddress, false),
      ).to.be.revertedWith("Invalid deadline");
    });
  });

  describe("View Functions", function () {
    it("Should return correct circle pool mapping", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", contributionAmount, tokenAddress, false);

      const poolAddress = await xershaFactory.getCirclePool(circleId);
      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should track total pools correctly", async function () {
      // Use different addresses as circle IDs (simulating cross-chain references)
      const circle1 = user1.address;
      const circle2 = user2.address;
      const circle3 = deployer.address;

      await xershaFactory.connect(user1).createROSCA(circle1, "Circle 1", ethers.parseEther("0.1"), tokenAddress, false);
      expect(await xershaFactory.getTotalPools()).to.equal(1);

      await xershaFactory.connect(user1).createSavingsPool(circle2, "Circle 2", tokenAddress, false);
      expect(await xershaFactory.getTotalPools()).to.equal(2);

      const deadline = (await time.latest()) + 86400;
      await xershaFactory
        .connect(user1)
        .createDonationPool(circle3, "Circle 3", user2.address, ethers.parseEther("1"), deadline, tokenAddress, false);
      expect(await xershaFactory.getTotalPools()).to.equal(3);
    });

    it("Should return all pools", async function () {
      const circle1 = user1.address;
      const circle2 = user2.address;

      await xershaFactory.connect(user1).createROSCA(circle1, "Circle 1", ethers.parseEther("0.1"), tokenAddress, false);
      await xershaFactory.connect(user1).createSavingsPool(circle2, "Circle 2", tokenAddress, false);

      const allPools = await xershaFactory.getAllPools();
      expect(allPools.length).to.equal(2);
    });

    it("Should return pool type correctly", async function () {
      await xershaFactory.connect(user1).createROSCA(circleId, "Test", ethers.parseEther("0.1"), tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.getPoolType(poolAddress)).to.equal(0); // ROSCA
    });
  });

  describe("Clone Pattern", function () {
    it("Should create pools as clones", async function () {
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", ethers.parseEther("0.1"), tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      const pool = await ethers.getContractAt("ROSCAPool", poolAddress);

      // Verify pool was initialized correctly
      expect(await pool.creator()).to.equal(user1.address);
      expect(await pool.circleName()).to.equal("Test Circle");
    });

    it("Should prevent double initialization of clones", async function () {
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", ethers.parseEther("0.1"), tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      const pool = await ethers.getContractAt("ROSCAPool", poolAddress);

      // Attempt to initialize again should fail
      await expect(
        pool.initialize(
          deployer.address,
          circleId,
          "New Name",
          user2.address, // backendManager
          ethers.parseEther("0.2"),
          tokenAddress,
          false,
        ),
      ).to.be.revertedWith("Already initialized");
    });

    it("Should prevent initialization of implementation contracts", async function () {
      // Attempt to initialize the implementation directly should fail
      await expect(
        roscaImpl.initialize(
          deployer.address,
          circleId,
          "Test",
          user2.address, // backendManager
          ethers.parseEther("0.1"),
          tokenAddress,
          false,
        ),
      ).to.be.revertedWith("Already initialized");
    });

    it("Should deploy factory under 24KB limit", async function () {
      const code = await ethers.provider.getCode(await xershaFactory.getAddress());
      const sizeInBytes = (code.length - 2) / 2; // Remove 0x and convert hex to bytes

      console.log(`      XershaFactory size: ${sizeInBytes} bytes (limit: 24576 bytes)`);
      expect(sizeInBytes).to.be.lessThan(24576);
    });
  });

  describe("Implementation Upgrades", function () {
    it("Should return correct implementation addresses", async function () {
      expect(await xershaFactory.roscaImplementation()).to.equal(await roscaImpl.getAddress());
      expect(await xershaFactory.savingsImplementation()).to.equal(await savingsImpl.getAddress());
      expect(await xershaFactory.donationImplementation()).to.equal(await donationImpl.getAddress());
    });

    it("Should allow owner to update ROSCA implementation", async function () {
      const NewROSCAFactory = await ethers.getContractFactory("ROSCAPool");
      const newImpl = await NewROSCAFactory.deploy();

      await expect(xershaFactory.connect(deployer).setROSCAImplementation(await newImpl.getAddress()))
        .to.emit(xershaFactory, "ImplementationUpdated")
        .withArgs("ROSCA", await newImpl.getAddress());

      expect(await xershaFactory.roscaImplementation()).to.equal(await newImpl.getAddress());
    });

    it("Should allow owner to update Savings implementation", async function () {
      const NewSavingsFactory = await ethers.getContractFactory("SavingsPool");
      const newImpl = await NewSavingsFactory.deploy();

      await expect(xershaFactory.connect(deployer).setSavingsImplementation(await newImpl.getAddress()))
        .to.emit(xershaFactory, "ImplementationUpdated")
        .withArgs("SAVINGS", await newImpl.getAddress());

      expect(await xershaFactory.savingsImplementation()).to.equal(await newImpl.getAddress());
    });

    it("Should allow owner to update Donation implementation", async function () {
      const NewDonationFactory = await ethers.getContractFactory("DonationPool");
      const newImpl = await NewDonationFactory.deploy();

      await expect(xershaFactory.connect(deployer).setDonationImplementation(await newImpl.getAddress()))
        .to.emit(xershaFactory, "ImplementationUpdated")
        .withArgs("DONATION", await newImpl.getAddress());

      expect(await xershaFactory.donationImplementation()).to.equal(await newImpl.getAddress());
    });

    it("Should allow owner to update all implementations at once", async function () {
      const NewROSCAFactory = await ethers.getContractFactory("ROSCAPool");
      const newROSCA = await NewROSCAFactory.deploy();

      const NewSavingsFactory = await ethers.getContractFactory("SavingsPool");
      const newSavings = await NewSavingsFactory.deploy();

      await xershaFactory
        .connect(deployer)
        .setImplementations(await newROSCA.getAddress(), await newSavings.getAddress(), ethers.ZeroAddress);

      expect(await xershaFactory.roscaImplementation()).to.equal(await newROSCA.getAddress());
      expect(await xershaFactory.savingsImplementation()).to.equal(await newSavings.getAddress());
      expect(await xershaFactory.donationImplementation()).to.equal(await donationImpl.getAddress()); // Unchanged
    });

    it("Should prevent non-owner from updating implementations", async function () {
      const NewROSCAFactory = await ethers.getContractFactory("ROSCAPool");
      const newImpl = await NewROSCAFactory.deploy();

      await expect(xershaFactory.connect(user1).setROSCAImplementation(await newImpl.getAddress())).to.be.reverted;
    });

    it("Should prevent setting zero address as implementation", async function () {
      await expect(xershaFactory.connect(deployer).setROSCAImplementation(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid implementation",
      );
    });

    it("Should create new pools with updated implementation", async function () {
      // Deploy new implementation
      const NewROSCAFactory = await ethers.getContractFactory("ROSCAPool");
      const newImpl = await NewROSCAFactory.deploy();

      // Update implementation
      await xershaFactory.connect(deployer).setROSCAImplementation(await newImpl.getAddress());

      // Create new pool - should use new implementation
      const circle2 = deployer.address;
      await xershaFactory.connect(user1).createROSCA(circle2, "Test Circle 2", ethers.parseEther("0.1"), tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circle2);
      expect(poolAddress).to.not.equal(ethers.ZeroAddress);

      // Verify pool works correctly
      const pool = await ethers.getContractAt("ROSCAPool", poolAddress);
      expect(await pool.creator()).to.equal(user1.address);
    });
  });

  describe("Backend Manager", function () {
    it("Should set correct backend manager on deployment", async function () {
      expect(await xershaFactory.backendManager()).to.equal(backendManager.address);
    });

    it("Should allow owner to update backend manager", async function () {
      const newBackendManager = user1.address;

      await expect(xershaFactory.connect(deployer).setBackendManager(newBackendManager))
        .to.emit(xershaFactory, "BackendManagerUpdated")
        .withArgs(backendManager.address, newBackendManager);

      expect(await xershaFactory.backendManager()).to.equal(newBackendManager);
    });

    it("Should prevent non-owner from updating backend manager", async function () {
      await expect(xershaFactory.connect(user1).setBackendManager(user1.address)).to.be.reverted;
    });

    it("Should prevent setting zero address as backend manager", async function () {
      await expect(xershaFactory.connect(deployer).setBackendManager(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid address",
      );
    });

    it("Should pass backend manager to created pools", async function () {
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", ethers.parseEther("0.1"), tokenAddress, false);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      const pool = await ethers.getContractAt("ROSCAPool", poolAddress);

      expect(await pool.backendManager()).to.equal(backendManager.address);
    });
  });
});
