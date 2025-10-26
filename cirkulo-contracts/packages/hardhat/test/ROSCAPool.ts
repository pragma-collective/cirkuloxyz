import { expect } from "chai";
import { ethers } from "hardhat";
import { ROSCAPool, MockCUSD, XershaFactory, MockYieldVault, YieldSavingsPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ROSCAPool", function () {
  let roscaPool: ROSCAPool;
  let mockToken: MockCUSD;
  let xershaFactory: XershaFactory;
  let circleId: string;
  let creator: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;
  let member4: SignerWithAddress;
  let member5: SignerWithAddress;
  let backendManager: SignerWithAddress;
  let nonMember: SignerWithAddress;

  const contributionAmount = ethers.parseEther("100"); // 100 CUSD tokens
  const circleName = "Test ROSCA Circle";

  beforeEach(async function () {
    [creator, member1, member2, member3, member4, member5, backendManager, nonMember] = await ethers.getSigners();

    // Deploy Mock CUSD token
    const MockCUSDFactory = await ethers.getContractFactory("MockCUSD");
    mockToken = await MockCUSDFactory.deploy();

    // Mint tokens to all test users
    const mintAmount = ethers.parseEther("10000"); // 10,000 CUSD per user
    await mockToken.mint(creator.address, mintAmount);
    await mockToken.mint(member1.address, mintAmount);
    await mockToken.mint(member2.address, mintAmount);
    await mockToken.mint(member3.address, mintAmount);
    await mockToken.mint(member4.address, mintAmount);
    await mockToken.mint(member5.address, mintAmount);

    // Use a simple address as circleId (can be any non-zero address for cross-chain reference)
    circleId = nonMember.address; // Use nonMember address to avoid conflicts

    // Deploy yield vaults (required for factory)
    const MockYieldVaultFactory = await ethers.getContractFactory("MockYieldVault");
    const cbtcVault = await MockYieldVaultFactory.deploy(ethers.ZeroAddress, true, 300);
    const cusdVault = await MockYieldVaultFactory.deploy(await mockToken.getAddress(), false, 500);

    // Deploy implementation contracts
    const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
    const roscaImpl = await ROSCAPoolFactory.deploy();

    const YieldSavingsPoolFactory = await ethers.getContractFactory("YieldSavingsPool");
    const savingsImpl = await YieldSavingsPoolFactory.deploy();

    const DonationPoolFactory = await ethers.getContractFactory("DonationPool");
    const donationImpl = await DonationPoolFactory.deploy();

    // Deploy XershaFactory with vault addresses
    const XershaFactoryFactory = await ethers.getContractFactory("XershaFactory");
    xershaFactory = await XershaFactoryFactory.deploy(
      creator.address,
      backendManager.address,
      await roscaImpl.getAddress(),
      await savingsImpl.getAddress(),
      await donationImpl.getAddress(),
      await cbtcVault.getAddress(),
      await cusdVault.getAddress(),
    );

    // Create ROSCA pool via factory
    await xershaFactory
      .connect(creator)
      .createROSCA(circleId, circleName, contributionAmount, await mockToken.getAddress(), false);

    // Get the created pool
    const poolAddress = await xershaFactory.circleToPool(circleId);
    roscaPool = await ethers.getContractAt("ROSCAPool", poolAddress);
  });

  describe("Deployment", function () {
    it("Should set correct creator", async function () {
      expect(await roscaPool.creator()).to.equal(creator.address);
    });

    it("Should set correct circle ID", async function () {
      expect(await roscaPool.circleId()).to.equal(circleId);
    });

    it("Should set correct contribution amount", async function () {
      expect(await roscaPool.contributionAmount()).to.equal(contributionAmount);
    });

    it("Should initialize with creator as first member", async function () {
      expect(await roscaPool.getMemberCount()).to.equal(1);
      expect(await roscaPool.isMember(creator.address)).to.be.true;
    });

    it("Should not be active initially", async function () {
      expect(await roscaPool.isActive()).to.be.false;
    });

    it("Should set correct backend manager", async function () {
      expect(await roscaPool.backendManager()).to.equal(backendManager.address);
    });
  });

  describe("Member Management", function () {
    it("Should allow creator to invite members", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      expect(await roscaPool.isMember(member1.address)).to.be.true;
    });

    it("Should emit MemberJoined event", async function () {
      await expect(roscaPool.connect(creator).inviteMember(member1.address))
        .to.emit(roscaPool, "MemberJoined")
        .withArgs(member1.address, creator.address);
    });

    it("Should prevent non-creator and non-backend from inviting", async function () {
      await expect(roscaPool.connect(member1).inviteMember(member2.address)).to.be.revertedWith(
        "Only creator or backend",
      );
    });

    it("Should prevent duplicate invitations", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await expect(roscaPool.connect(creator).inviteMember(member1.address)).to.be.revertedWith("Already a member");
    });

    it("Should allow creator to add member", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      expect(await roscaPool.isMember(member1.address)).to.be.true;
      expect(await roscaPool.getMemberCount()).to.equal(2);
    });

    it("Should emit MemberJoined event with addedBy parameter", async function () {
      await expect(roscaPool.connect(creator).inviteMember(member1.address))
        .to.emit(roscaPool, "MemberJoined")
        .withArgs(member1.address, creator.address);
    });

    it("Should prevent non-creator and non-backend from adding members", async function () {
      await expect(roscaPool.connect(member1).inviteMember(member2.address))
        .to.be.revertedWith("Only creator or backend");
    });

    it("Should prevent adding member twice", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await expect(roscaPool.connect(creator).inviteMember(member1.address))
        .to.be.revertedWith("Already a member");
    });

    it("Should enforce MAX_MEMBERS limit", async function () {
      // Invite and join 11 more members (creator is already 1, so total will be 12)
      for (let i = 0; i < 11; i++) {
        const signer = (await ethers.getSigners())[i + 1];
        await roscaPool.connect(creator).inviteMember(signer.address);
      }

      const extraMember = (await ethers.getSigners())[12];
      await expect(roscaPool.connect(creator).inviteMember(extraMember.address)).to.be.revertedWith(
        "Max members reached",
      );
    });

    it("Should prevent inviting after ROSCA starts", async function () {
      // Add minimum members
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      await expect(roscaPool.connect(creator).inviteMember(member5.address)).to.be.revertedWith(
        "Cannot invite after ROSCA starts",
      );
    });
  });

  describe("Backend Manager Permissions", function () {
    it("Should allow backend manager to add members", async function () {
      await roscaPool.connect(backendManager).inviteMember(member1.address);
      expect(await roscaPool.isMember(member1.address)).to.be.true;
    });

    it("Should emit MemberJoined event with backend manager as addedBy", async function () {
      await expect(roscaPool.connect(backendManager).inviteMember(member1.address))
        .to.emit(roscaPool, "MemberJoined")
        .withArgs(member1.address, backendManager.address);
    });

    it("Should prevent backend manager from inviting after ROSCA starts", async function () {
      // Invite enough members
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);

      // Start ROSCA
      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      // Backend manager should not be able to invite after start
      await expect(roscaPool.connect(backendManager).inviteMember(member5.address)).to.be.revertedWith(
        "Cannot invite after ROSCA starts",
      );
    });
  });

  describe("Starting ROSCA", function () {
    beforeEach(async function () {
      // Setup 5 members
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);
    });

    it("Should start ROSCA with valid payout order", async function () {
      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      expect(await roscaPool.isActive()).to.be.true;
      expect(await roscaPool.currentRound()).to.equal(1);
    });

    it("Should emit ROSCAStarted event", async function () {
      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await expect(roscaPool.connect(creator).startROSCA(payoutOrder)).to.emit(roscaPool, "ROSCAStarted");
    });

    it("Should fail with less than MIN_MEMBERS", async function () {
      // Create new pool with only 3 members
      const smallCircleId = member4.address; // Use a different circle ID
      await xershaFactory
        .connect(creator)
        .createROSCA(smallCircleId, "Small Circle", contributionAmount, await mockToken.getAddress(), false);
      const smallPoolAddress = await xershaFactory.circleToPool(smallCircleId);
      const smallPool = await ethers.getContractAt("ROSCAPool", smallPoolAddress);

      await smallPool.connect(creator).inviteMember(member1.address);
      await smallPool.connect(creator).inviteMember(member2.address);

      const payoutOrder = [creator.address, member1.address, member2.address];
      await expect(smallPool.connect(creator).startROSCA(payoutOrder)).to.be.revertedWith("Not enough members");
    });

    it("Should fail with invalid payout order length", async function () {
      const invalidOrder = [creator.address, member1.address]; // Only 2, should be 5
      await expect(roscaPool.connect(creator).startROSCA(invalidOrder)).to.be.revertedWith(
        "Invalid payout order length",
      );
    });

    it("Should fail with duplicate in payout order", async function () {
      const duplicateOrder = [creator.address, member1.address, member1.address, member3.address, member4.address];
      await expect(roscaPool.connect(creator).startROSCA(duplicateOrder)).to.be.revertedWith(
        "Duplicate in payout order",
      );
    });

    it("Should fail with non-member in payout order", async function () {
      const invalidOrder = [creator.address, member1.address, member2.address, member3.address, nonMember.address];
      await expect(roscaPool.connect(creator).startROSCA(invalidOrder)).to.be.revertedWith(
        "Payout order contains non-member",
      );
    });

    it("Should prevent non-creator from starting", async function () {
      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await expect(roscaPool.connect(member1).startROSCA(payoutOrder)).to.be.revertedWith(
        "Only creator can call this",
      );
    });

    it("Should prevent starting twice", async function () {
      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);
      await expect(roscaPool.connect(creator).startROSCA(payoutOrder)).to.be.revertedWith("Already started");
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      // Setup and start ROSCA
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);
    });

    it("Should allow member to contribute correct amount", async function () {
      // Approve tokens first
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);

      await expect(
        roscaPool.connect(creator).contribute(),
      ).to.changeTokenBalance(mockToken, roscaPool, contributionAmount);
    });

    it("Should emit ContributionMade event", async function () {
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await expect(roscaPool.connect(creator).contribute())
        .to.emit(roscaPool, "ContributionMade")
        .withArgs(creator.address, 1, contributionAmount);
    });

    it("Should track total contributed", async function () {
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(creator).contribute();
      expect(await roscaPool.totalContributed(creator.address)).to.equal(contributionAmount);
    });

    it("Should prevent contributing twice in same round", async function () {
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount * 2n);
      await roscaPool.connect(creator).contribute();
      await expect(roscaPool.connect(creator).contribute()).to.be.revertedWith(
        "Already contributed",
      );
    });

    it("Should prevent non-members from contributing", async function () {
      await mockToken.connect(nonMember).approve(await roscaPool.getAddress(), contributionAmount);
      await expect(roscaPool.connect(nonMember).contribute()).to.be.revertedWith(
        "Not a member",
      );
    });

    it("Should emit AllMembersContributed when everyone pays", async function () {
      // Approve and contribute for all members
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member1).contribute();
      await mockToken.connect(member2).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member2).contribute();
      await mockToken.connect(member3).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member3).contribute();

      await mockToken.connect(member4).approve(await roscaPool.getAddress(), contributionAmount);
      await expect(roscaPool.connect(member4).contribute())
        .to.emit(roscaPool, "AllMembersContributed")
        .withArgs(1);
    });

    it("Should track round contributors correctly", async function () {
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member1).contribute();

      const contributors = await roscaPool.getRoundContributors();
      expect(contributors.length).to.equal(2);
      expect(contributors).to.include(creator.address);
      expect(contributors).to.include(member1.address);
    });
  });

  describe("Payout", function () {
    beforeEach(async function () {
      // Setup and start ROSCA
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      // All members approve and contribute
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member1).contribute();
      await mockToken.connect(member2).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member2).contribute();
      await mockToken.connect(member3).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member3).contribute();
      await mockToken.connect(member4).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member4).contribute();
    });

    it("Should allow recipient to trigger payout", async function () {
      const expectedPayout = contributionAmount * 5n;
      await expect(roscaPool.connect(creator).triggerPayout()).to.changeTokenBalance(mockToken, creator, expectedPayout);
    });

    it("Should emit PayoutTriggered event", async function () {
      const expectedPayout = contributionAmount * 5n;
      await expect(roscaPool.connect(creator).triggerPayout())
        .to.emit(roscaPool, "PayoutTriggered")
        .withArgs(creator.address, expectedPayout, 1);
    });

    it("Should mark recipient as received", async function () {
      await roscaPool.connect(creator).triggerPayout();
      expect(await roscaPool.hasReceivedPayout(creator.address)).to.be.true;
    });

    it("Should prevent non-recipient from triggering", async function () {
      await expect(roscaPool.connect(member1).triggerPayout()).to.be.revertedWith("Only recipient can claim payout");
    });

    it("Should prevent payout before everyone contributes", async function () {
      // Create new round scenario
      const newCircleId = member5.address; // Use a different circle ID
      await xershaFactory
        .connect(creator)
        .createROSCA(newCircleId, "Payout Test Circle", contributionAmount, await mockToken.getAddress(), false);
      const newPoolAddress = await xershaFactory.circleToPool(newCircleId);
      const newPool = await ethers.getContractAt("ROSCAPool", newPoolAddress);

      await newPool.connect(creator).inviteMember(member1.address);
      await newPool.connect(creator).inviteMember(member2.address);
      await newPool.connect(creator).inviteMember(member3.address);
      await newPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await newPool.connect(creator).startROSCA(payoutOrder);

      // Only 3 out of 5 contribute
      await mockToken.connect(creator).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(member1).contribute();
      await mockToken.connect(member2).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(member2).contribute();

      await expect(newPool.connect(creator).triggerPayout()).to.be.revertedWith("Not everyone has paid");
    });

    it("Should prevent double payout", async function () {
      await roscaPool.connect(creator).triggerPayout();
      await expect(roscaPool.connect(creator).triggerPayout()).to.be.revertedWith("Round already paid out");
    });
  });

  describe("Round Progression", function () {
    beforeEach(async function () {
      // Setup and start ROSCA
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      // Complete round 1
      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member1).contribute();
      await mockToken.connect(member2).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member2).contribute();
      await mockToken.connect(member3).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member3).contribute();
      await mockToken.connect(member4).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member4).contribute();
      await roscaPool.connect(creator).triggerPayout();
    });

    it("Should allow starting next round after cooldown", async function () {
      await time.increase(30 * 24 * 60 * 60); // 30 days

      const tx = await roscaPool.connect(member1).startNextRound();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx).to.emit(roscaPool, "RoundStarted").withArgs(2, block!.timestamp);

      expect(await roscaPool.currentRound()).to.equal(2);
    });

    it("Should prevent starting next round before cooldown", async function () {
      await expect(roscaPool.connect(member1).startNextRound()).to.be.revertedWith("30-day cycle not complete");
    });

    it("Should prevent starting next round before payout", async function () {
      // Start a new test case
      const roundCircleId = ethers.Wallet.createRandom().address; // Use a random address for this test
      await xershaFactory
        .connect(creator)
        .createROSCA(roundCircleId, "Round Test Circle", contributionAmount, await mockToken.getAddress(), false);
      const newPoolAddress = await xershaFactory.circleToPool(roundCircleId);
      const newPool = await ethers.getContractAt("ROSCAPool", newPoolAddress);

      await newPool.connect(creator).inviteMember(member1.address);
      await newPool.connect(creator).inviteMember(member2.address);
      await newPool.connect(creator).inviteMember(member3.address);
      await newPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await newPool.connect(creator).startROSCA(payoutOrder);

      await mockToken.connect(creator).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(member1).contribute();
      await mockToken.connect(member2).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(member2).contribute();
      await mockToken.connect(member3).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(member3).contribute();
      await mockToken.connect(member4).approve(await newPool.getAddress(), contributionAmount);
      await newPool.connect(member4).contribute();

      await time.increase(30 * 24 * 60 * 60);

      await expect(newPool.connect(member1).startNextRound()).to.be.revertedWith("Current round not paid out");
    });

    it("Should mark ROSCA complete after final round", async function () {
      // Complete all 5 rounds
      for (let round = 2; round <= 5; round++) {
        await time.increase(30 * 24 * 60 * 60);
        await roscaPool.connect(member1).startNextRound();

        await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
        await roscaPool.connect(creator).contribute();
        await mockToken.connect(member1).approve(await roscaPool.getAddress(), contributionAmount);
        await roscaPool.connect(member1).contribute();
        await mockToken.connect(member2).approve(await roscaPool.getAddress(), contributionAmount);
        await roscaPool.connect(member2).contribute();
        await mockToken.connect(member3).approve(await roscaPool.getAddress(), contributionAmount);
        await roscaPool.connect(member3).contribute();
        await mockToken.connect(member4).approve(await roscaPool.getAddress(), contributionAmount);
        await roscaPool.connect(member4).contribute();

        const recipient = await roscaPool.getCurrentRecipient();
        const recipientSigner = await ethers.getSigner(recipient);
        await roscaPool.connect(recipientSigner).triggerPayout();
      }

      expect(await roscaPool.isComplete()).to.be.true;
      expect(await roscaPool.isActive()).to.be.false;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(creator).inviteMember(member4.address);

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);
    });

    it("Should return current recipient", async function () {
      expect(await roscaPool.getCurrentRecipient()).to.equal(creator.address);
    });

    it("Should return member count", async function () {
      expect(await roscaPool.getMemberCount()).to.equal(5);
    });

    it("Should return all members", async function () {
      const members = await roscaPool.getMembers();
      expect(members.length).to.equal(5);
      expect(members).to.include(creator.address);
      expect(members).to.include(member1.address);
    });

    it("Should return payout order", async function () {
      const payout = await roscaPool.getPayoutOrder();
      expect(payout[0]).to.equal(creator.address);
      expect(payout[1]).to.equal(member1.address);
    });

    it("Should check if everyone paid", async function () {
      expect(await roscaPool.everyonePaid()).to.be.false;

      await mockToken.connect(creator).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(creator).contribute();
      await mockToken.connect(member1).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member1).contribute();
      await mockToken.connect(member2).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member2).contribute();
      await mockToken.connect(member3).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member3).contribute();
      await mockToken.connect(member4).approve(await roscaPool.getAddress(), contributionAmount);
      await roscaPool.connect(member4).contribute();

      expect(await roscaPool.everyonePaid()).to.be.true;
    });
  });
});
