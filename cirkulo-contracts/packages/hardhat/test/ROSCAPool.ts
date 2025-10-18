import { expect } from "chai";
import { ethers } from "hardhat";
import { ROSCAPool } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ROSCAPool", function () {
  let roscaPool: ROSCAPool;
  let circleId: string;
  let creator: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;
  let member4: SignerWithAddress;
  let member5: SignerWithAddress;
  let nonMember: SignerWithAddress;

  const contributionAmount = ethers.parseEther("0.1");
  const circleName = "Test ROSCA Circle";

  beforeEach(async function () {
    [creator, member1, member2, member3, member4, member5, nonMember] = await ethers.getSigners();

    // Use a simple address as circleId (can be any non-zero address for cross-chain reference)
    circleId = creator.address;

    // Deploy ROSCA pool
    const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
    roscaPool = await ROSCAPoolFactory.deploy(
      creator.address,
      circleId,
      circleName,
      contributionAmount,
    );
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
  });

  describe("Member Management", function () {
    it("Should allow creator to invite members", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      expect(await roscaPool.isInvited(member1.address)).to.be.true;
    });

    it("Should emit MemberInvited event", async function () {
      await expect(roscaPool.connect(creator).inviteMember(member1.address))
        .to.emit(roscaPool, "MemberInvited")
        .withArgs(member1.address, creator.address);
    });

    it("Should prevent non-creator from inviting", async function () {
      await expect(roscaPool.connect(member1).inviteMember(member2.address)).to.be.revertedWith(
        "Only creator can call this",
      );
    });

    it("Should prevent duplicate invitations", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await expect(roscaPool.connect(creator).inviteMember(member1.address)).to.be.revertedWith("Already invited");
    });

    it("Should allow invited member to join", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(member1).joinPool();
      expect(await roscaPool.isMember(member1.address)).to.be.true;
      expect(await roscaPool.getMemberCount()).to.equal(2);
    });

    it("Should emit MemberJoined event", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await expect(roscaPool.connect(member1).joinPool()).to.emit(roscaPool, "MemberJoined");
    });

    it("Should prevent non-invited from joining", async function () {
      await expect(roscaPool.connect(member1).joinPool()).to.be.revertedWith("Not invited");
    });

    it("Should prevent joining twice", async function () {
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(member1).joinPool();
      await expect(roscaPool.connect(member1).joinPool()).to.be.revertedWith("Already a member");
    });

    it("Should enforce MAX_MEMBERS limit", async function () {
      // Invite and join 11 more members (creator is already 1, so total will be 12)
      for (let i = 0; i < 11; i++) {
        const signer = (await ethers.getSigners())[i + 1];
        await roscaPool.connect(creator).inviteMember(signer.address);
        await roscaPool.connect(signer).joinPool();
      }

      const extraMember = (await ethers.getSigners())[12];
      await expect(roscaPool.connect(creator).inviteMember(extraMember.address)).to.be.revertedWith(
        "Max members reached",
      );
    });

    it("Should prevent inviting after ROSCA starts", async function () {
      // Add minimum members
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(member1).joinPool();
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(member2).joinPool();
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(member3).joinPool();
      await roscaPool.connect(creator).inviteMember(member4.address);
      await roscaPool.connect(member4).joinPool();

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      await expect(roscaPool.connect(creator).inviteMember(member5.address)).to.be.revertedWith(
        "Cannot invite after ROSCA starts",
      );
    });
  });

  describe("Starting ROSCA", function () {
    beforeEach(async function () {
      // Setup 5 members
      await roscaPool.connect(creator).inviteMember(member1.address);
      await roscaPool.connect(member1).joinPool();
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(member2).joinPool();
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(member3).joinPool();
      await roscaPool.connect(creator).inviteMember(member4.address);
      await roscaPool.connect(member4).joinPool();
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
      const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
      const smallPool = await ROSCAPoolFactory.deploy(
        creator.address,
        circleId,
        circleName,
        contributionAmount,
      );

      await smallPool.connect(creator).inviteMember(member1.address);
      await smallPool.connect(member1).joinPool();
      await smallPool.connect(creator).inviteMember(member2.address);
      await smallPool.connect(member2).joinPool();

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
      await roscaPool.connect(member1).joinPool();
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(member2).joinPool();
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(member3).joinPool();
      await roscaPool.connect(creator).inviteMember(member4.address);
      await roscaPool.connect(member4).joinPool();

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);
    });

    it("Should allow member to contribute correct amount", async function () {
      await expect(
        roscaPool.connect(creator).contribute({ value: contributionAmount }),
      ).to.changeEtherBalance(roscaPool, contributionAmount);
    });

    it("Should emit ContributionMade event", async function () {
      await expect(roscaPool.connect(creator).contribute({ value: contributionAmount }))
        .to.emit(roscaPool, "ContributionMade")
        .withArgs(creator.address, 1, contributionAmount);
    });

    it("Should track total contributed", async function () {
      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      expect(await roscaPool.totalContributed(creator.address)).to.equal(contributionAmount);
    });

    it("Should reject incorrect amount", async function () {
      const wrongAmount = ethers.parseEther("0.05");
      await expect(roscaPool.connect(creator).contribute({ value: wrongAmount })).to.be.revertedWith(
        "Incorrect amount",
      );
    });

    it("Should prevent contributing twice in same round", async function () {
      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      await expect(roscaPool.connect(creator).contribute({ value: contributionAmount })).to.be.revertedWith(
        "Already contributed",
      );
    });

    it("Should prevent non-members from contributing", async function () {
      await expect(roscaPool.connect(nonMember).contribute({ value: contributionAmount })).to.be.revertedWith(
        "Not a member",
      );
    });

    it("Should emit AllMembersContributed when everyone pays", async function () {
      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      await roscaPool.connect(member1).contribute({ value: contributionAmount });
      await roscaPool.connect(member2).contribute({ value: contributionAmount });
      await roscaPool.connect(member3).contribute({ value: contributionAmount });

      await expect(roscaPool.connect(member4).contribute({ value: contributionAmount }))
        .to.emit(roscaPool, "AllMembersContributed")
        .withArgs(1);
    });

    it("Should track round contributors correctly", async function () {
      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      await roscaPool.connect(member1).contribute({ value: contributionAmount });

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
      await roscaPool.connect(member1).joinPool();
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(member2).joinPool();
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(member3).joinPool();
      await roscaPool.connect(creator).inviteMember(member4.address);
      await roscaPool.connect(member4).joinPool();

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      // All members contribute
      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      await roscaPool.connect(member1).contribute({ value: contributionAmount });
      await roscaPool.connect(member2).contribute({ value: contributionAmount });
      await roscaPool.connect(member3).contribute({ value: contributionAmount });
      await roscaPool.connect(member4).contribute({ value: contributionAmount });
    });

    it("Should allow recipient to trigger payout", async function () {
      const expectedPayout = contributionAmount * 5n;
      await expect(roscaPool.connect(creator).triggerPayout()).to.changeEtherBalance(creator, expectedPayout);
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
      const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
      const newPool = await ROSCAPoolFactory.deploy(
        creator.address,
        circleId,
        circleName,
        contributionAmount,
      );

      await newPool.connect(creator).inviteMember(member1.address);
      await newPool.connect(member1).joinPool();
      await newPool.connect(creator).inviteMember(member2.address);
      await newPool.connect(member2).joinPool();
      await newPool.connect(creator).inviteMember(member3.address);
      await newPool.connect(member3).joinPool();
      await newPool.connect(creator).inviteMember(member4.address);
      await newPool.connect(member4).joinPool();

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await newPool.connect(creator).startROSCA(payoutOrder);

      // Only 3 out of 5 contribute
      await newPool.connect(creator).contribute({ value: contributionAmount });
      await newPool.connect(member1).contribute({ value: contributionAmount });
      await newPool.connect(member2).contribute({ value: contributionAmount });

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
      await roscaPool.connect(member1).joinPool();
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(member2).joinPool();
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(member3).joinPool();
      await roscaPool.connect(creator).inviteMember(member4.address);
      await roscaPool.connect(member4).joinPool();

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await roscaPool.connect(creator).startROSCA(payoutOrder);

      // Complete round 1
      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      await roscaPool.connect(member1).contribute({ value: contributionAmount });
      await roscaPool.connect(member2).contribute({ value: contributionAmount });
      await roscaPool.connect(member3).contribute({ value: contributionAmount });
      await roscaPool.connect(member4).contribute({ value: contributionAmount });
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
      const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
      const newPool = await ROSCAPoolFactory.deploy(
        creator.address,
        circleId,
        circleName,
        contributionAmount,
      );

      await newPool.connect(creator).inviteMember(member1.address);
      await newPool.connect(member1).joinPool();
      await newPool.connect(creator).inviteMember(member2.address);
      await newPool.connect(member2).joinPool();
      await newPool.connect(creator).inviteMember(member3.address);
      await newPool.connect(member3).joinPool();
      await newPool.connect(creator).inviteMember(member4.address);
      await newPool.connect(member4).joinPool();

      const payoutOrder = [creator.address, member1.address, member2.address, member3.address, member4.address];
      await newPool.connect(creator).startROSCA(payoutOrder);

      await newPool.connect(creator).contribute({ value: contributionAmount });
      await newPool.connect(member1).contribute({ value: contributionAmount });
      await newPool.connect(member2).contribute({ value: contributionAmount });
      await newPool.connect(member3).contribute({ value: contributionAmount });
      await newPool.connect(member4).contribute({ value: contributionAmount });

      await time.increase(30 * 24 * 60 * 60);

      await expect(newPool.connect(member1).startNextRound()).to.be.revertedWith("Current round not paid out");
    });

    it("Should mark ROSCA complete after final round", async function () {
      // Complete all 5 rounds
      for (let round = 2; round <= 5; round++) {
        await time.increase(30 * 24 * 60 * 60);
        await roscaPool.connect(member1).startNextRound();

        await roscaPool.connect(creator).contribute({ value: contributionAmount });
        await roscaPool.connect(member1).contribute({ value: contributionAmount });
        await roscaPool.connect(member2).contribute({ value: contributionAmount });
        await roscaPool.connect(member3).contribute({ value: contributionAmount });
        await roscaPool.connect(member4).contribute({ value: contributionAmount });

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
      await roscaPool.connect(member1).joinPool();
      await roscaPool.connect(creator).inviteMember(member2.address);
      await roscaPool.connect(member2).joinPool();
      await roscaPool.connect(creator).inviteMember(member3.address);
      await roscaPool.connect(member3).joinPool();
      await roscaPool.connect(creator).inviteMember(member4.address);
      await roscaPool.connect(member4).joinPool();

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

      await roscaPool.connect(creator).contribute({ value: contributionAmount });
      await roscaPool.connect(member1).contribute({ value: contributionAmount });
      await roscaPool.connect(member2).contribute({ value: contributionAmount });
      await roscaPool.connect(member3).contribute({ value: contributionAmount });
      await roscaPool.connect(member4).contribute({ value: contributionAmount });

      expect(await roscaPool.everyonePaid()).to.be.true;
    });
  });
});
