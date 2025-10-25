import { expect } from "chai";
import { ethers } from "hardhat";
import { SavingsPool, MockCUSD, XershaFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SavingsPool", function () {
  let savingsPool: SavingsPool;
  let mockToken: MockCUSD;
  let xershaFactory: XershaFactory;
  let circleId: string;
  let creator: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;
  let backendManager: SignerWithAddress;
  let nonMember: SignerWithAddress;

  const circleName = "Test Savings Circle";

  beforeEach(async function () {
    [creator, member1, member2, member3, backendManager, nonMember] = await ethers.getSigners();

    // Deploy Mock CUSD token
    const MockCUSDFactory = await ethers.getContractFactory("MockCUSD");
    mockToken = await MockCUSDFactory.deploy();

    // Mint tokens to all test users
    const mintAmount = ethers.parseEther("10000"); // 10,000 CUSD per user
    await mockToken.mint(creator.address, mintAmount);
    await mockToken.mint(member1.address, mintAmount);
    await mockToken.mint(member2.address, mintAmount);
    await mockToken.mint(member3.address, mintAmount);

    // Use a simple address as circleId (can be any non-zero address for cross-chain reference)
    circleId = nonMember.address; // Use nonMember address to avoid conflicts

    // Deploy implementation contracts
    const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
    const roscaImpl = await ROSCAPoolFactory.deploy();

    const SavingsPoolFactory = await ethers.getContractFactory("SavingsPool");
    const savingsImpl = await SavingsPoolFactory.deploy();

    const DonationPoolFactory = await ethers.getContractFactory("DonationPool");
    const donationImpl = await DonationPoolFactory.deploy();

    // Deploy XershaFactory
    const XershaFactoryFactory = await ethers.getContractFactory("XershaFactory");
    xershaFactory = await XershaFactoryFactory.deploy(
      creator.address,
      backendManager.address,         // backendManager
      await roscaImpl.getAddress(),
      await savingsImpl.getAddress(),
      await donationImpl.getAddress(),
    );

    // Create Savings pool via factory
    await xershaFactory.connect(creator).createSavingsPool(circleId, circleName, await mockToken.getAddress(), false);

    // Get the created pool
    const poolAddress = await xershaFactory.circleToPool(circleId);
    savingsPool = await ethers.getContractAt("SavingsPool", poolAddress);
  });

  describe("Deployment", function () {
    it("Should set correct creator", async function () {
      expect(await savingsPool.creator()).to.equal(creator.address);
    });

    it("Should set correct circle ID", async function () {
      expect(await savingsPool.circleId()).to.equal(circleId);
    });

    it("Should set correct circle name", async function () {
      expect(await savingsPool.circleName()).to.equal(circleName);
    });

    it("Should initialize as active", async function () {
      expect(await savingsPool.isActive()).to.be.true;
    });

    it("Should initialize with creator as first member", async function () {
      expect(await savingsPool.getMemberCount()).to.equal(1);
      expect(await savingsPool.isMember(creator.address)).to.be.true;
    });

    it("Should initialize with zero total saved", async function () {
      expect(await savingsPool.totalSaved()).to.equal(0);
    });

    it("Should set correct backend manager", async function () {
      expect(await savingsPool.backendManager()).to.equal(backendManager.address);
    });
  });

  describe("Member Management", function () {
    it("Should allow creator to invite members", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      expect(await savingsPool.isInvited(member1.address)).to.be.true;
    });

    it("Should emit MemberInvited event", async function () {
      await expect(savingsPool.connect(creator).inviteMember(member1.address))
        .to.emit(savingsPool, "MemberInvited")
        .withArgs(member1.address, creator.address);
    });

    it("Should prevent non-creator and non-backend from inviting", async function () {
      await expect(savingsPool.connect(member1).inviteMember(member2.address)).to.be.revertedWith(
        "Only creator or backend",
      );
    });

    it("Should prevent duplicate invitations", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await expect(savingsPool.connect(creator).inviteMember(member1.address)).to.be.revertedWith("Already invited");
    });

    it("Should prevent inviting zero address", async function () {
      await expect(savingsPool.connect(creator).inviteMember(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid address",
      );
    });

    it("Should allow invited member to join", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      expect(await savingsPool.isMember(member1.address)).to.be.true;
      expect(await savingsPool.getMemberCount()).to.equal(2);
    });

    it("Should emit MemberJoined event", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await expect(savingsPool.connect(member1).joinPool()).to.emit(savingsPool, "MemberJoined");
    });

    it("Should prevent non-invited from joining", async function () {
      await expect(savingsPool.connect(member1).joinPool()).to.be.revertedWith("Not invited");
    });

    it("Should prevent joining twice", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      await expect(savingsPool.connect(member1).joinPool()).to.be.revertedWith("Already a member");
    });
  });

  describe("Backend Manager Permissions", function () {
    it("Should allow backend manager to invite members", async function () {
      await savingsPool.connect(backendManager).inviteMember(member1.address);
      expect(await savingsPool.isInvited(member1.address)).to.be.true;
    });

    it("Should emit MemberInvited event with backend manager as inviter", async function () {
      await expect(savingsPool.connect(backendManager).inviteMember(member1.address))
        .to.emit(savingsPool, "MemberInvited")
        .withArgs(member1.address, backendManager.address);
    });

    it("Should prevent non-creator and non-backend from inviting", async function () {
      await expect(savingsPool.connect(member1).inviteMember(member2.address)).to.be.revertedWith(
        "Only creator or backend",
      );
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
    });

    it("Should allow member to deposit", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), depositAmount);
      await expect(savingsPool.connect(member1).deposit(depositAmount)).to.changeTokenBalance(
        mockToken,
        savingsPool,
        depositAmount,
      );
    });

    it("Should update member balance", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), depositAmount);
      await savingsPool.connect(member1).deposit(depositAmount);
      expect(await savingsPool.balances(member1.address)).to.equal(depositAmount);
    });

    it("Should update total saved", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), depositAmount);
      await savingsPool.connect(member1).deposit(depositAmount);
      expect(await savingsPool.totalSaved()).to.equal(depositAmount);
    });

    it("Should emit Deposited event", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), depositAmount);
      await expect(savingsPool.connect(member1).deposit(depositAmount))
        .to.emit(savingsPool, "Deposited")
        .withArgs(member1.address, depositAmount);
    });

    it("Should allow multiple deposits", async function () {
      const deposit1 = ethers.parseEther("1.0");
      const deposit2 = ethers.parseEther("0.5");

      await mockToken.connect(member1).approve(await savingsPool.getAddress(), deposit1 + deposit2);
      await savingsPool.connect(member1).deposit(deposit1);
      await savingsPool.connect(member1).deposit(deposit2);

      expect(await savingsPool.balances(member1.address)).to.equal(deposit1 + deposit2);
      expect(await savingsPool.totalSaved()).to.equal(deposit1 + deposit2);
    });

    it("Should reject zero deposits", async function () {
      await expect(savingsPool.connect(member1).deposit(0)).to.be.revertedWith("Must deposit something");
    });

    it("Should prevent non-members from depositing", async function () {
      await mockToken.connect(nonMember).approve(await savingsPool.getAddress(), ethers.parseEther("1.0"));
      await expect(savingsPool.connect(nonMember).deposit(ethers.parseEther("1.0"))).to.be.revertedWith(
        "Not a member",
      );
    });

    it("Should prevent deposits when pool is not active", async function () {
      await savingsPool.connect(creator).closePool();
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("1.0"));
      await expect(savingsPool.connect(member1).deposit(ethers.parseEther("1.0"))).to.be.revertedWith(
        "Pool not active",
      );
    });

    it("Should track individual member balances separately", async function () {
      await savingsPool.connect(creator).inviteMember(member2.address);
      await savingsPool.connect(member2).joinPool();

      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("1.0"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("1.0"));
      await mockToken.connect(member2).approve(await savingsPool.getAddress(), ethers.parseEther("2.0"));
      await savingsPool.connect(member2).deposit(ethers.parseEther("2.0"));

      expect(await savingsPool.balances(member1.address)).to.equal(ethers.parseEther("1.0"));
      expect(await savingsPool.balances(member2.address)).to.equal(ethers.parseEther("2.0"));
      expect(await savingsPool.totalSaved()).to.equal(ethers.parseEther("3.0"));
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("2.0"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("2.0"));
    });

    it("Should allow member to withdraw", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      await expect(savingsPool.connect(member1).withdraw(withdrawAmount)).to.changeTokenBalance(
        mockToken,
        member1,
        withdrawAmount,
      );
    });

    it("Should update member balance", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      await savingsPool.connect(member1).withdraw(withdrawAmount);
      expect(await savingsPool.balances(member1.address)).to.equal(ethers.parseEther("1.0"));
    });

    it("Should update total saved", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      await savingsPool.connect(member1).withdraw(withdrawAmount);
      expect(await savingsPool.totalSaved()).to.equal(ethers.parseEther("1.0"));
    });

    it("Should emit Withdrawn event", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      await expect(savingsPool.connect(member1).withdraw(withdrawAmount))
        .to.emit(savingsPool, "Withdrawn")
        .withArgs(member1.address, withdrawAmount);
    });

    it("Should allow full withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("2.0");
      await savingsPool.connect(member1).withdraw(withdrawAmount);
      expect(await savingsPool.balances(member1.address)).to.equal(0);
    });

    it("Should prevent withdrawal of more than balance", async function () {
      const withdrawAmount = ethers.parseEther("3.0");
      await expect(savingsPool.connect(member1).withdraw(withdrawAmount)).to.be.revertedWith("Insufficient balance");
    });

    it("Should prevent zero withdrawals", async function () {
      await expect(savingsPool.connect(member1).withdraw(0)).to.be.revertedWith("Must withdraw something");
    });

    it("Should prevent non-members from withdrawing", async function () {
      await expect(savingsPool.connect(nonMember).withdraw(ethers.parseEther("1.0"))).to.be.revertedWith(
        "Not a member",
      );
    });

    it("Should allow withdrawal even when pool is not active", async function () {
      await savingsPool.connect(creator).closePool();
      const withdrawAmount = ethers.parseEther("1.0");
      await expect(savingsPool.connect(member1).withdraw(withdrawAmount)).to.not.be.reverted;
    });
  });

  describe("Goal Management", function () {
    it("Should allow creator to set target", async function () {
      const targetAmount = ethers.parseEther("10.0");
      const targetDate = (await time.latest()) + 86400 * 30; // 30 days

      await savingsPool.connect(creator).setTarget(targetAmount, targetDate);
      expect(await savingsPool.targetAmount()).to.equal(targetAmount);
      expect(await savingsPool.targetDate()).to.equal(targetDate);
    });

    it("Should emit TargetSet event", async function () {
      const targetAmount = ethers.parseEther("10.0");
      const targetDate = (await time.latest()) + 86400 * 30;

      await expect(savingsPool.connect(creator).setTarget(targetAmount, targetDate))
        .to.emit(savingsPool, "TargetSet")
        .withArgs(targetAmount, targetDate);
    });

    it("Should prevent non-creator from setting target", async function () {
      const targetAmount = ethers.parseEther("10.0");
      const targetDate = (await time.latest()) + 86400 * 30;

      await expect(savingsPool.connect(member1).setTarget(targetAmount, targetDate)).to.be.revertedWith(
        "Only creator can call this",
      );
    });

    it("Should reject zero target amount", async function () {
      const targetDate = (await time.latest()) + 86400 * 30;
      await expect(savingsPool.connect(creator).setTarget(0, targetDate)).to.be.revertedWith(
        "Target amount must be positive",
      );
    });

    it("Should reject past target date", async function () {
      const targetAmount = ethers.parseEther("10.0");
      const pastDate = (await time.latest()) - 86400;

      await expect(savingsPool.connect(creator).setTarget(targetAmount, pastDate)).to.be.revertedWith(
        "Target date must be in future",
      );
    });

    it("Should return correct progress", async function () {
      const targetAmount = ethers.parseEther("10.0");
      const targetDate = (await time.latest()) + 86400 * 30;
      await savingsPool.connect(creator).setTarget(targetAmount, targetDate);

      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("3.0"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("3.0"));

      const [current, target] = await savingsPool.getProgress();
      expect(current).to.equal(ethers.parseEther("3.0"));
      expect(target).to.equal(targetAmount);
    });

    it("Should check if goal is reached", async function () {
      const targetAmount = ethers.parseEther("5.0");
      const targetDate = (await time.latest()) + 86400 * 30;
      await savingsPool.connect(creator).setTarget(targetAmount, targetDate);

      expect(await savingsPool.isGoalReached()).to.be.false;

      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("5.0"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("5.0"));

      expect(await savingsPool.isGoalReached()).to.be.true;
    });
  });

  describe("Pool Management", function () {
    it("Should allow creator to close pool", async function () {
      await savingsPool.connect(creator).closePool();
      expect(await savingsPool.isActive()).to.be.false;
    });

    it("Should emit PoolClosed event", async function () {
      await expect(savingsPool.connect(creator).closePool()).to.emit(savingsPool, "PoolClosed");
    });

    it("Should prevent non-creator from closing pool", async function () {
      await expect(savingsPool.connect(member1).closePool()).to.be.revertedWith("Only creator can call this");
    });

    it("Should prevent deposits after closure", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();

      await savingsPool.connect(creator).closePool();

      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("1.0"));
      await expect(savingsPool.connect(member1).deposit(ethers.parseEther("1.0"))).to.be.revertedWith(
        "Pool not active",
      );
    });

    it("Should still allow withdrawals after closure", async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("1.0"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("1.0"));

      await savingsPool.connect(creator).closePool();

      await expect(savingsPool.connect(member1).withdraw(ethers.parseEther("0.5"))).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await savingsPool.connect(creator).inviteMember(member1.address);
      await savingsPool.connect(member1).joinPool();
      await savingsPool.connect(creator).inviteMember(member2.address);
      await savingsPool.connect(member2).joinPool();
    });

    it("Should return member balance", async function () {
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("1.5"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("1.5"));
      expect(await savingsPool.getBalance(member1.address)).to.equal(ethers.parseEther("1.5"));
    });

    it("Should return member count", async function () {
      expect(await savingsPool.getMemberCount()).to.equal(3); // creator + member1 + member2
    });

    it("Should return all members", async function () {
      const members = await savingsPool.getMembers();
      expect(members.length).to.equal(3);
      expect(members).to.include(creator.address);
      expect(members).to.include(member1.address);
      expect(members).to.include(member2.address);
    });

    it("Should return contract balance", async function () {
      await mockToken.connect(member1).approve(await savingsPool.getAddress(), ethers.parseEther("1.0"));
      await savingsPool.connect(member1).deposit(ethers.parseEther("1.0"));
      await mockToken.connect(member2).approve(await savingsPool.getAddress(), ethers.parseEther("2.0"));
      await savingsPool.connect(member2).deposit(ethers.parseEther("2.0"));

      const poolAddress = await savingsPool.getAddress();
      expect(await mockToken.balanceOf(poolAddress)).to.equal(ethers.parseEther("3.0"));
    });
  });
});
