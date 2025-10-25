import { expect } from "chai";
import { ethers } from "hardhat";
import { DonationPool, MockCUSD, XershaFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("DonationPool", function () {
  let donationPool: DonationPool;
  let mockToken: MockCUSD;
  let xershaFactory: XershaFactory;
  let circleId: string;
  let creator: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;
  let backendManager: SignerWithAddress;
  let nonMember: SignerWithAddress;

  const circleName = "Test Charity Circle";
  const goalAmount = ethers.parseEther("5000"); // 5,000 CUSD
  let deadline: number;

  beforeEach(async function () {
    [creator, beneficiary, member1, member2, member3, backendManager, nonMember] = await ethers.getSigners();

    // Deploy Mock CUSD token
    const MockCUSDFactory = await ethers.getContractFactory("MockCUSD");
    mockToken = await MockCUSDFactory.deploy();

    // Mint tokens to all test users
    const mintAmount = ethers.parseEther("10000"); // 10,000 CUSD per user
    await mockToken.mint(creator.address, mintAmount);
    await mockToken.mint(member1.address, mintAmount);
    await mockToken.mint(member2.address, mintAmount);
    await mockToken.mint(member3.address, mintAmount);

    // Set deadline to 30 days from now
    deadline = (await time.latest()) + 86400 * 30;

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

    // Create Donation pool via factory
    await xershaFactory
      .connect(creator)
      .createDonationPool(circleId, circleName, beneficiary.address, goalAmount, deadline, await mockToken.getAddress(), false);

    // Get the created pool
    const poolAddress = await xershaFactory.circleToPool(circleId);
    donationPool = await ethers.getContractAt("DonationPool", poolAddress);
  });

  describe("Deployment", function () {
    it("Should set correct creator", async function () {
      expect(await donationPool.creator()).to.equal(creator.address);
    });

    it("Should set correct beneficiary", async function () {
      expect(await donationPool.beneficiary()).to.equal(beneficiary.address);
    });

    it("Should set correct goal amount", async function () {
      expect(await donationPool.goalAmount()).to.equal(goalAmount);
    });

    it("Should set correct deadline", async function () {
      expect(await donationPool.deadline()).to.equal(deadline);
    });

    it("Should initialize as active", async function () {
      expect(await donationPool.isActive()).to.be.true;
    });

    it("Should initialize with creator as first member", async function () {
      expect(await donationPool.getMemberCount()).to.equal(1);
      expect(await donationPool.isMember(creator.address)).to.be.true;
    });

    it("Should initialize with zero funds raised", async function () {
      expect(await donationPool.totalRaised()).to.equal(0);
    });

    it("Should set correct backend manager", async function () {
      expect(await donationPool.backendManager()).to.equal(backendManager.address);
    });
  });

  describe("Member Management", function () {
    it("Should allow creator to invite members", async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      expect(await donationPool.isInvited(member1.address)).to.be.true;
    });

    it("Should emit MemberInvited event", async function () {
      await expect(donationPool.connect(creator).inviteMember(member1.address))
        .to.emit(donationPool, "MemberInvited")
        .withArgs(member1.address, creator.address);
    });

    it("Should prevent non-creator and non-backend from inviting", async function () {
      await expect(donationPool.connect(member1).inviteMember(member2.address)).to.be.revertedWith(
        "Only creator or backend",
      );
    });

    it("Should prevent duplicate invitations", async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await expect(donationPool.connect(creator).inviteMember(member1.address)).to.be.revertedWith("Already invited");
    });

    it("Should prevent inviting zero address", async function () {
      await expect(donationPool.connect(creator).inviteMember(ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid address",
      );
    });

    it("Should allow invited member to join", async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await donationPool.connect(member1).joinPool();
      expect(await donationPool.isMember(member1.address)).to.be.true;
      expect(await donationPool.getMemberCount()).to.equal(2);
    });

    it("Should emit MemberJoined event", async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await expect(donationPool.connect(member1).joinPool()).to.emit(donationPool, "MemberJoined");
    });

    it("Should prevent non-invited from joining", async function () {
      await expect(donationPool.connect(member1).joinPool()).to.be.revertedWith("Not invited");
    });

    it("Should prevent joining twice", async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await donationPool.connect(member1).joinPool();
      await expect(donationPool.connect(member1).joinPool()).to.be.revertedWith("Already a member");
    });
  });

  describe("Backend Manager Permissions", function () {
    it("Should allow backend manager to invite members", async function () {
      await donationPool.connect(backendManager).inviteMember(member1.address);
      expect(await donationPool.isInvited(member1.address)).to.be.true;
    });

    it("Should emit MemberInvited event with backend manager as inviter", async function () {
      await expect(donationPool.connect(backendManager).inviteMember(member1.address))
        .to.emit(donationPool, "MemberInvited")
        .withArgs(member1.address, backendManager.address);
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await donationPool.connect(member1).joinPool();
      await donationPool.connect(creator).inviteMember(member2.address);
      await donationPool.connect(member2).joinPool();
    });

    it("Should allow member to donate", async function () {
      const donationAmount = ethers.parseEther("1000");
      await mockToken.connect(member1).approve(await donationPool.getAddress(), donationAmount);
      await expect(donationPool.connect(member1).donate(donationAmount)).to.changeTokenBalance(
        mockToken,
        donationPool,
        donationAmount,
      );
    });

    it("Should update total raised", async function () {
      const donationAmount = ethers.parseEther("1000");
      await mockToken.connect(member1).approve(await donationPool.getAddress(), donationAmount);
      await donationPool.connect(member1).donate(donationAmount);
      expect(await donationPool.totalRaised()).to.equal(donationAmount);
    });

    it("Should update donor's donation amount", async function () {
      const donationAmount = ethers.parseEther("1000");
      await mockToken.connect(member1).approve(await donationPool.getAddress(), donationAmount);
      await donationPool.connect(member1).donate(donationAmount);
      expect(await donationPool.donations(member1.address)).to.equal(donationAmount);
    });

    it("Should emit DonationMade event", async function () {
      const donationAmount = ethers.parseEther("1000");
      await mockToken.connect(member1).approve(await donationPool.getAddress(), donationAmount);
      await expect(donationPool.connect(member1).donate(donationAmount))
        .to.emit(donationPool, "DonationMade")
        .withArgs(member1.address, donationAmount);
    });

    it("Should allow multiple donations from same member", async function () {
      const donation1 = ethers.parseEther("1000");
      const donation2 = ethers.parseEther("500");

      await mockToken.connect(member1).approve(await donationPool.getAddress(), donation1 + donation2);
      await donationPool.connect(member1).donate(donation1);
      await donationPool.connect(member1).donate(donation2);

      expect(await donationPool.donations(member1.address)).to.equal(donation1 + donation2);
      expect(await donationPool.totalRaised()).to.equal(donation1 + donation2);
    });

    it("Should track donors", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await donationPool.connect(member1).donate(ethers.parseEther("1000"));
      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("500"));
      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("500"));
      await donationPool.connect(member2).donate(ethers.parseEther("500"));

      expect(await donationPool.getDonorCount()).to.equal(2);
      const donors = await donationPool.getDonors();
      expect(donors).to.include(member1.address);
      expect(donors).to.include(member2.address);
    });

    it("Should emit GoalReached event when goal is met", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("3000"));
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("3000"));
      await donationPool.connect(member1).donate(ethers.parseEther("3000"));

      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await expect(donationPool.connect(member2).donate(ethers.parseEther("2000")))
        .to.emit(donationPool, "GoalReached")
        .withArgs(goalAmount);
    });

    it("Should reject zero donations", async function () {
      await expect(donationPool.connect(member1).donate(0)).to.be.revertedWith("Must donate something");
    });

    it("Should allow non-members to donate (public donations)", async function () {
      await mockToken.mint(nonMember.address, ethers.parseEther("10000"));
      await mockToken.connect(nonMember).approve(await donationPool.getAddress(), ethers.parseEther("1000"));

      // Check token balance change
      await expect(donationPool.connect(nonMember).donate(ethers.parseEther("1000"))).to.changeTokenBalance(
        mockToken,
        nonMember,
        ethers.parseEther("-1000"),
      );

      // Check event emission (need to donate again since transaction was consumed)
      await mockToken.connect(nonMember).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await expect(donationPool.connect(nonMember).donate(ethers.parseEther("1000")))
        .to.emit(donationPool, "DonationMade")
        .withArgs(nonMember.address, ethers.parseEther("1000"));

      expect(await donationPool.totalRaised()).to.equal(ethers.parseEther("2000"));
      expect(await donationPool.donations(nonMember.address)).to.equal(ethers.parseEther("2000"));
    });

    it("Should prevent donations after deadline", async function () {
      await time.increaseTo(deadline + 1);
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await expect(donationPool.connect(member1).donate(ethers.parseEther("1000"))).to.be.revertedWith(
        "Deadline passed",
      );
    });

    it("Should prevent donations when pool is not active", async function () {
      // Release funds to make pool inactive
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));
      await donationPool.connect(creator).releaseFunds();

      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await expect(donationPool.connect(member2).donate(ethers.parseEther("1000"))).to.be.revertedWith(
        "Funds already released",
      );
    });
  });

  describe("Public Donations", function () {
    it("Should track non-member donors separately", async function () {
      await mockToken.mint(nonMember.address, ethers.parseEther("10000"));
      await mockToken.connect(nonMember).approve(await donationPool.getAddress(), ethers.parseEther("1000"));

      await donationPool.connect(nonMember).donate(ethers.parseEther("1000"));

      expect(await donationPool.getDonorCount()).to.equal(1);
      const donors = await donationPool.getDonors();
      expect(donors[0]).to.equal(nonMember.address);
    });

    it("Should allow non-members to donate multiple times", async function () {
      await mockToken.mint(nonMember.address, ethers.parseEther("10000"));
      await mockToken.connect(nonMember).approve(await donationPool.getAddress(), ethers.parseEther("3000"));

      await donationPool.connect(nonMember).donate(ethers.parseEther("1000"));
      await donationPool.connect(nonMember).donate(ethers.parseEther("2000"));

      expect(await donationPool.donations(nonMember.address)).to.equal(ethers.parseEther("3000"));
    });

    it("Should allow non-members to claim refunds if goal not met", async function () {
      await mockToken.mint(nonMember.address, ethers.parseEther("10000"));
      await mockToken.connect(nonMember).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await donationPool.connect(nonMember).donate(ethers.parseEther("1000"));

      // Move past deadline without reaching goal
      await time.increaseTo(deadline + 1);

      // Enable refunds
      await donationPool.connect(creator).enableRefunds();

      // Non-member can claim refund
      await expect(donationPool.connect(nonMember).claimRefund()).to.changeTokenBalance(
        mockToken,
        nonMember,
        ethers.parseEther("1000"),
      );
    });
  });

  describe("Fund Release", function () {
    beforeEach(async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await donationPool.connect(member1).joinPool();
      await donationPool.connect(creator).inviteMember(member2.address);
      await donationPool.connect(member2).joinPool();
    });

    it("Should allow creator to release funds after goal is met", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("3000"));
      await donationPool.connect(member1).donate(ethers.parseEther("3000"));
      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member2).donate(ethers.parseEther("2000"));

      await expect(donationPool.connect(creator).releaseFunds()).to.changeTokenBalance(mockToken, 
        beneficiary,
        ethers.parseEther("5000"),
      );
    });

    it("Should allow creator to release funds after deadline even if goal not met", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);

      await expect(donationPool.connect(creator).releaseFunds()).to.changeTokenBalance(mockToken, 
        beneficiary,
        ethers.parseEther("2000"),
      );
    });

    it("Should emit FundsReleased event", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));

      await expect(donationPool.connect(creator).releaseFunds())
        .to.emit(donationPool, "FundsReleased")
        .withArgs(beneficiary.address, ethers.parseEther("5000"));
    });

    it("Should mark pool as inactive after release", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));
      await donationPool.connect(creator).releaseFunds();

      expect(await donationPool.isActive()).to.be.false;
    });

    it("Should mark funds as released", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));
      await donationPool.connect(creator).releaseFunds();

      expect(await donationPool.fundsReleased()).to.be.true;
    });

    it("Should prevent non-creator from releasing funds", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));
      await expect(donationPool.connect(member1).releaseFunds()).to.be.revertedWith("Only creator can call this");
    });

    it("Should prevent double release", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));
      await donationPool.connect(creator).releaseFunds();

      await expect(donationPool.connect(creator).releaseFunds()).to.be.revertedWith("Already released");
    });

    it("Should prevent release before goal and deadline", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));

      await expect(donationPool.connect(creator).releaseFunds()).to.be.revertedWith(
        "Goal not met and deadline not passed",
      );
    });
  });

  describe("Refund Mechanism", function () {
    beforeEach(async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await donationPool.connect(member1).joinPool();
      await donationPool.connect(creator).inviteMember(member2.address);
      await donationPool.connect(member2).joinPool();
    });

    it("Should allow creator to enable refunds after deadline if goal not met", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);

      await donationPool.connect(creator).enableRefunds();
      expect(await donationPool.refundsEnabled()).to.be.true;
    });

    it("Should emit RefundsEnabled event", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);

      await expect(donationPool.connect(creator).enableRefunds()).to.emit(donationPool, "RefundsEnabled");
    });

    it("Should mark pool as inactive when refunds enabled", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);

      await donationPool.connect(creator).enableRefunds();
      expect(await donationPool.isActive()).to.be.false;
    });

    it("Should prevent enabling refunds before deadline", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await expect(donationPool.connect(creator).enableRefunds()).to.be.revertedWith("Deadline not passed");
    });

    it("Should prevent enabling refunds if goal was met", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));
      await time.increaseTo(deadline + 1);

      await expect(donationPool.connect(creator).enableRefunds()).to.be.revertedWith("Goal was met");
    });

    it("Should prevent non-creator from enabling refunds", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);

      await expect(donationPool.connect(member1).enableRefunds()).to.be.revertedWith("Only creator can call this");
    });

    it("Should allow donors to claim refunds", async function () {
      const donationAmount = ethers.parseEther("2000");
      await mockToken.connect(member1).approve(await donationPool.getAddress(), donationAmount);
      await donationPool.connect(member1).donate(donationAmount);
      await time.increaseTo(deadline + 1);
      await donationPool.connect(creator).enableRefunds();

      await expect(donationPool.connect(member1).claimRefund()).to.changeTokenBalance(mockToken, member1, donationAmount);
    });

    it("Should emit RefundClaimed event", async function () {
      const donationAmount = ethers.parseEther("2000");
      await mockToken.connect(member1).approve(await donationPool.getAddress(), donationAmount);
      await donationPool.connect(member1).donate(donationAmount);
      await time.increaseTo(deadline + 1);
      await donationPool.connect(creator).enableRefunds();

      await expect(donationPool.connect(member1).claimRefund())
        .to.emit(donationPool, "RefundClaimed")
        .withArgs(member1.address, donationAmount);
    });

    it("Should reset donor's donation amount after refund", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);
      await donationPool.connect(creator).enableRefunds();

      await donationPool.connect(member1).claimRefund();
      expect(await donationPool.donations(member1.address)).to.equal(0);
    });

    it("Should update total raised after refund", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await donationPool.connect(member2).donate(ethers.parseEther("1000"));
      await time.increaseTo(deadline + 1);
      await donationPool.connect(creator).enableRefunds();

      await donationPool.connect(member1).claimRefund();
      expect(await donationPool.totalRaised()).to.equal(ethers.parseEther("1000"));
    });

    it("Should prevent claiming refund when refunds not enabled", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await expect(donationPool.connect(member1).claimRefund()).to.be.revertedWith("Refunds not enabled");
    });

    it("Should prevent claiming refund with zero donation", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);
      await donationPool.connect(creator).enableRefunds();

      await expect(donationPool.connect(member2).claimRefund()).to.be.revertedWith("Nothing to refund");
    });

    it("Should prevent donating when refunds are enabled", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));
      await time.increaseTo(deadline + 1);
      await donationPool.connect(creator).enableRefunds();

      // Note: Deadline check happens before refunds check in the contract
      await expect(donationPool.connect(member2).donate(ethers.parseEther("1000"))).to.be.revertedWith(
        "Deadline passed",
      );
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await donationPool.connect(creator).inviteMember(member1.address);
      await donationPool.connect(member1).joinPool();
      await donationPool.connect(creator).inviteMember(member2.address);
      await donationPool.connect(member2).joinPool();
    });

    it("Should return donation amount", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("1500"));
      await donationPool.connect(member1).donate(ethers.parseEther("1500"));
      expect(await donationPool.getDonation(member1.address)).to.equal(ethers.parseEther("1500"));
    });

    it("Should return member count", async function () {
      expect(await donationPool.getMemberCount()).to.equal(3); // creator + member1 + member2
    });

    it("Should return time remaining", async function () {
      const currentTime = await time.latest();
      const remaining = await donationPool.getTimeRemaining();
      expect(remaining).to.be.closeTo(deadline - currentTime, 5);
    });

    it("Should return zero when deadline passed", async function () {
      await time.increaseTo(deadline + 1);
      expect(await donationPool.getTimeRemaining()).to.equal(0);
    });

    it("Should return progress", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member1).donate(ethers.parseEther("2000"));

      const [raised, goal] = await donationPool.getProgress();
      expect(raised).to.equal(ethers.parseEther("2000"));
      expect(goal).to.equal(goalAmount);
    });

    it("Should check if goal is reached", async function () {
      expect(await donationPool.isGoalReached()).to.be.false;

      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("5000"));
      await donationPool.connect(member1).donate(ethers.parseEther("5000"));

      expect(await donationPool.isGoalReached()).to.be.true;
    });

    it("Should return contract balance", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await donationPool.connect(member1).donate(ethers.parseEther("1000"));
      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("2000"));
      await donationPool.connect(member2).donate(ethers.parseEther("2000"));

      const poolAddress = await donationPool.getAddress();
      expect(await mockToken.balanceOf(poolAddress)).to.equal(ethers.parseEther("3000"));
    });

    it("Should return donor count", async function () {
      await mockToken.connect(member1).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await donationPool.connect(member1).donate(ethers.parseEther("1000"));
      await mockToken.connect(member2).approve(await donationPool.getAddress(), ethers.parseEther("1000"));
      await donationPool.connect(member2).donate(ethers.parseEther("1000"));

      expect(await donationPool.getDonorCount()).to.equal(2);
    });
  });
});
