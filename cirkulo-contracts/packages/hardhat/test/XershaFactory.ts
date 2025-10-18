import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { XershaFactory, ROSCAPool, SavingsPool, DonationPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("XershaFactory", function () {
  let xershaFactory: XershaFactory;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let circleId: string;

  before(async function () {
    [deployer, user1, user2] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy a fresh contract for each test
    await deployments.fixture(["XershaFactory"]);
    xershaFactory = await ethers.getContract<XershaFactory>("XershaFactory");

    // Use a simple address as circleId (can be any non-zero address for cross-chain reference)
    circleId = user1.address;
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

      const tx = await xershaFactory.connect(user1).createROSCA(circleId, circleName, contributionAmount);

      const receipt = await tx.wait();
      const poolAddress = await xershaFactory.circleToPool(circleId);

      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
      expect(await xershaFactory.isValidPool(poolAddress)).to.be.true;
      expect(await xershaFactory.getTotalPools()).to.equal(1);
    });

    it("Should emit PoolCreated event", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      const circleName = "Test Circle";

      const tx = await xershaFactory.connect(user1).createROSCA(circleId, circleName, contributionAmount);
      const receipt = await tx.wait();
      const poolAddress = await xershaFactory.circleToPool(circleId);

      // Check for PoolCreated event
      await expect(tx)
        .to.emit(xershaFactory, "PoolCreated")
        .withArgs(circleId, poolAddress, user1.address, 0); // 0 = ROSCA
    });

    it("Should fail if circle already has a pool", async function () {
      const contributionAmount = ethers.parseEther("0.1");

      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", contributionAmount);

      await expect(
        xershaFactory.connect(user1).createROSCA(circleId, "Test Circle 2", contributionAmount),
      ).to.be.revertedWith("Circle already has pool");
    });

    it("Should fail with zero contribution amount", async function () {
      await expect(xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", 0)).to.be.revertedWith(
        "Invalid contribution amount",
      );
    });

    it("Should fail with zero address as circle ID", async function () {
      await expect(
        xershaFactory.connect(user1).createROSCA(ethers.ZeroAddress, "Test Circle", ethers.parseEther("0.1")),
      ).to.be.revertedWith("Zero address not allowed");
    });

    it("Should set correct pool type", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", contributionAmount);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.poolTypes(poolAddress)).to.equal(0); // PoolType.ROSCA = 0
    });
  });

  describe("Savings Pool Creation", function () {
    it("Should create a Savings pool successfully", async function () {
      const circleName = "Savings Circle";

      const tx = await xershaFactory.connect(user1).createSavingsPool(circleId, circleName);

      const poolAddress = await xershaFactory.circleToPool(circleId);

      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
      expect(await xershaFactory.isValidPool(poolAddress)).to.be.true;
      expect(await xershaFactory.getTotalPools()).to.equal(1);
    });

    it("Should set correct pool type", async function () {
      await xershaFactory.connect(user1).createSavingsPool(circleId, "Savings Circle");

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
        .createDonationPool(circleId, circleName, beneficiary, goalAmount, deadline);

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
        .createDonationPool(circleId, "Charity Circle", beneficiary, goalAmount, deadline);

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.poolTypes(poolAddress)).to.equal(2); // PoolType.DONATION = 2
    });

    it("Should fail with invalid beneficiary", async function () {
      const goalAmount = ethers.parseEther("1");
      const deadline = (await time.latest()) + 86400;

      await expect(
        xershaFactory
          .connect(user1)
          .createDonationPool(circleId, "Charity Circle", ethers.ZeroAddress, goalAmount, deadline),
      ).to.be.revertedWith("Invalid beneficiary");
    });

    it("Should fail with zero goal amount", async function () {
      const deadline = (await time.latest()) + 86400;

      await expect(
        xershaFactory.connect(user1).createDonationPool(circleId, "Charity Circle", user2.address, 0, deadline),
      ).to.be.revertedWith("Invalid goal");
    });

    it("Should fail with past deadline", async function () {
      const goalAmount = ethers.parseEther("1");
      const pastDeadline = (await time.latest()) - 86400; // 1 day ago

      await expect(
        xershaFactory
          .connect(user1)
          .createDonationPool(circleId, "Charity Circle", user2.address, goalAmount, pastDeadline),
      ).to.be.revertedWith("Invalid deadline");
    });
  });

  describe("View Functions", function () {
    it("Should return correct circle pool mapping", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      await xershaFactory.connect(user1).createROSCA(circleId, "Test Circle", contributionAmount);

      const poolAddress = await xershaFactory.getCirclePool(circleId);
      expect(poolAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should track total pools correctly", async function () {
      // Use different addresses as circle IDs (simulating cross-chain references)
      const circle1 = user1.address;
      const circle2 = user2.address;
      const circle3 = deployer.address;

      await xershaFactory.connect(user1).createROSCA(circle1, "Circle 1", ethers.parseEther("0.1"));
      expect(await xershaFactory.getTotalPools()).to.equal(1);

      await xershaFactory.connect(user1).createSavingsPool(circle2, "Circle 2");
      expect(await xershaFactory.getTotalPools()).to.equal(2);

      const deadline = (await time.latest()) + 86400;
      await xershaFactory
        .connect(user1)
        .createDonationPool(circle3, "Circle 3", user2.address, ethers.parseEther("1"), deadline);
      expect(await xershaFactory.getTotalPools()).to.equal(3);
    });

    it("Should return all pools", async function () {
      const circle1 = user1.address;
      const circle2 = user2.address;

      await xershaFactory.connect(user1).createROSCA(circle1, "Circle 1", ethers.parseEther("0.1"));
      await xershaFactory.connect(user1).createSavingsPool(circle2, "Circle 2");

      const allPools = await xershaFactory.getAllPools();
      expect(allPools.length).to.equal(2);
    });

    it("Should return pool type correctly", async function () {
      await xershaFactory.connect(user1).createROSCA(circleId, "Test", ethers.parseEther("0.1"));

      const poolAddress = await xershaFactory.circleToPool(circleId);
      expect(await xershaFactory.getPoolType(poolAddress)).to.equal(0); // ROSCA
    });
  });
});
