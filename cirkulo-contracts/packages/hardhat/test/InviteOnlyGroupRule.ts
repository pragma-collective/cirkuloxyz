import { expect } from "chai";
import { ethers } from "hardhat";
import { InviteOnlyGroupRule } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("InviteOnlyGroupRule", function () {
  let inviteRule: InviteOnlyGroupRule;
  let owner: SignerWithAddress;
  let backend: SignerWithAddress;
  let inviter: SignerWithAddress;
  let invitee: SignerWithAddress;
  let attacker: SignerWithAddress;
  let newBackend: SignerWithAddress;

  const configSalt = ethers.encodeBytes32String("test-group-1");
  const inviteCode = "SECRET123";
  const inviteCodeHash = ethers.keccak256(ethers.toUtf8Bytes(inviteCode));
  const PARAM__INVITE_CODE = "0x5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e"; // keccak256("lens.param.inviteCode")

  beforeEach(async function () {
    // Get signers
    [owner, backend, inviter, invitee, attacker, newBackend] = await ethers.getSigners();

    // Deploy contract
    const InviteOnlyGroupRule = await ethers.getContractFactory("InviteOnlyGroupRule");
    inviteRule = await InviteOnlyGroupRule.deploy(backend.address);
    await inviteRule.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct backend address", async function () {
      expect(await inviteRule.backend()).to.equal(backend.address);
    });

    it("Should set the deployer as owner", async function () {
      expect(await inviteRule.owner()).to.equal(owner.address);
    });

    it("Should not allow zero address as backend", async function () {
      const InviteOnlyGroupRule = await ethers.getContractFactory("InviteOnlyGroupRule");
      await expect(
        InviteOnlyGroupRule.deploy(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(inviteRule, "InvalidAddress");
    });
  });

  describe("registerInvite", function () {
    it("Should allow backend to register an invite", async function () {
      const expiresAt = (await time.latest()) + 86400; // 24 hours from now

      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          inviter.address,
          inviteCodeHash,
          expiresAt
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, inviter.address, inviteCodeHash, expiresAt);
    });

    it("Should not allow non-backend to register invite", async function () {
      const expiresAt = (await time.latest()) + 86400;

      await expect(
        inviteRule.connect(attacker).registerInvite(
          configSalt,
          inviter.address,
          inviteCodeHash,
          expiresAt
        )
      ).to.be.revertedWithCustomError(inviteRule, "OnlyBackend");
    });

    it("Should allow multiple invites for same group", async function () {
      const expiresAt = (await time.latest()) + 86400;

      // Register first invite
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );

      // Register second invite with different code
      const inviteCode2 = "SECRET456";
      const inviteCodeHash2 = ethers.keccak256(ethers.toUtf8Bytes(inviteCode2));

      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          inviter.address,
          inviteCodeHash2,
          expiresAt
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, inviter.address, inviteCodeHash2, expiresAt);
    });

    it("Should allow same inviter to create multiple invites", async function () {
      const expiresAt1 = (await time.latest()) + 86400;
      const expiresAt2 = (await time.latest()) + 172800; // 48 hours

      // Register initial invite
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt1
      );

      // Create another invite with different code
      const newInviteCode = "NEWSECRET789";
      const newInviteCodeHash = ethers.keccak256(ethers.toUtf8Bytes(newInviteCode));

      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          inviter.address,
          newInviteCodeHash,
          expiresAt2
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, inviter.address, newInviteCodeHash, expiresAt2);
    });
  });

  describe("processJoining", function () {
    let expiresAt: number;

    beforeEach(async function () {
      expiresAt = (await time.latest()) + 86400;
      // Register invite created by 'inviter'
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );
    });

    it("Should validate correct invite code", async function () {
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      // 'invitee' uses the code to join
      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      )
        .to.emit(inviteRule, "InviteUsed")
        .withArgs(configSalt, invitee.address, inviteCodeHash, inviter.address);
    });

    it("Should reject wrong invite code", async function () {
      const wrongCode = "WRONGCODE";
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [wrongCode]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotFound");
    });

    it("Should reject non-existent invite", async function () {
      const unregisteredCode = "UNREGISTERED";
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [unregisteredCode]) }
      ];

      // Anyone trying to use a code that was never registered should fail
      await expect(
        inviteRule.processJoining(
          configSalt,
          attacker.address,
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotFound");
    });

    it("Should reject expired invite", async function () {
      // Fast forward time past expiration
      await time.increaseTo(expiresAt + 1);

      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteExpired");
    });

    it("Should reject already used invite", async function () {
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      // Use invite first time (should succeed)
      await inviteRule.processJoining(
        configSalt,
        invitee.address,
        [],
        ruleParams
      );

      // Try to use again with different person (should fail)
      await expect(
        inviteRule.processJoining(
          configSalt,
          attacker.address,
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteAlreadyUsed");
    });

    it("Should reject empty rule params", async function () {
      await expect(
        inviteRule.processJoining(configSalt, invitee.address, [], [])
      ).to.be.revertedWithCustomError(inviteRule, "InvalidInviteCode");
    });

    it("Should reject wrong param key", async function () {
      const wrongKey = ethers.keccak256(ethers.toUtf8Bytes("wrongKey"));
      const ruleParams = [
        { key: wrongKey, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InvalidInviteCode");
    });
  });

  describe("processAddition", function () {
    it("Should allow any addition (always pass)", async function () {
      // This should not revert regardless of parameters
      await expect(
        inviteRule.processAddition(configSalt, owner.address, invitee.address, [], [])
      ).to.not.be.reverted;
    });
  });

  describe("processRemoval", function () {
    it("Should allow any removal (always pass)", async function () {
      // This should not revert regardless of parameters
      await expect(
        inviteRule.processRemoval(configSalt, owner.address, invitee.address, [], [])
      ).to.not.be.reverted;
    });
  });

  describe("processLeaving", function () {
    it("Should allow any leaving (always pass)", async function () {
      // This should not revert regardless of parameters
      await expect(
        inviteRule.processLeaving(configSalt, invitee.address, [], [])
      ).to.not.be.reverted;
    });
  });

  describe("updateBackend", function () {
    it("Should allow owner to update backend address", async function () {
      await expect(
        inviteRule.connect(owner).updateBackend(newBackend.address)
      )
        .to.emit(inviteRule, "BackendUpdated")
        .withArgs(backend.address, newBackend.address);

      expect(await inviteRule.backend()).to.equal(newBackend.address);
    });

    it("Should not allow non-owner to update backend", async function () {
      await expect(
        inviteRule.connect(attacker).updateBackend(newBackend.address)
      ).to.be.revertedWithCustomError(inviteRule, "OnlyOwner");
    });

    it("Should not allow zero address as new backend", async function () {
      await expect(
        inviteRule.connect(owner).updateBackend(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(inviteRule, "InvalidAddress");
    });

    it("Should allow new backend to register invites", async function () {
      // Update backend
      await inviteRule.connect(owner).updateBackend(newBackend.address);

      // New backend should be able to register
      const expiresAt = (await time.latest()) + 86400;
      await expect(
        inviteRule.connect(newBackend).registerInvite(
          configSalt,
          inviter.address,
          inviteCodeHash,
          expiresAt
        )
      ).to.emit(inviteRule, "InviteRegistered");

      // Old backend should not be able to register
      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          inviter.address,
          inviteCodeHash,
          expiresAt
        )
      ).to.be.revertedWithCustomError(inviteRule, "OnlyBackend");
    });
  });

  describe("cancelInvite", function () {
    let expiresAt: number;

    beforeEach(async function () {
      expiresAt = (await time.latest()) + 86400;
      // Register an invite
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );
    });

    it("Should allow backend to cancel a pending invite", async function () {
      await expect(
        inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash)
      )
        .to.emit(inviteRule, "InviteCancelled")
        .withArgs(configSalt, inviter.address, inviteCodeHash);

      // Verify invite is deleted (inviter should be zero address)
      const invite = await inviteRule.getInvite(configSalt, inviteCodeHash);
      expect(invite.inviter).to.equal(ethers.ZeroAddress);
      expect(invite.expiresAt).to.equal(0);
      expect(invite.used).to.equal(false);
      expect(invite.usedBy).to.equal(ethers.ZeroAddress);
    });

    it("Should not allow non-backend to cancel invite", async function () {
      await expect(
        inviteRule.connect(attacker).cancelInvite(configSalt, inviteCodeHash)
      ).to.be.revertedWithCustomError(inviteRule, "OnlyBackend");
    });

    it("Should not allow canceling non-existent invite", async function () {
      const nonExistentCodeHash = ethers.keccak256(ethers.toUtf8Bytes("NONEXISTENT"));

      await expect(
        inviteRule.connect(backend).cancelInvite(configSalt, nonExistentCodeHash)
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotFound");
    });

    it("Should not allow canceling already used invite", async function () {
      // Use the invite first
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      await inviteRule.processJoining(
        configSalt,
        invitee.address,
        [],
        ruleParams
      );

      // Try to cancel used invite
      await expect(
        inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash)
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotCancellable");
    });

    it("Should prevent using cancelled invite", async function () {
      // Cancel the invite
      await inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash);

      // Try to use cancelled invite
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotFound");
    });

    it("Should allow re-registering after cancellation", async function () {
      // Cancel the invite
      await inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash);

      // Re-register with same hash
      const newExpiresAt = (await time.latest()) + 172800; // 48 hours
      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          inviter.address,
          inviteCodeHash,
          newExpiresAt
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, inviter.address, inviteCodeHash, newExpiresAt);

      // Verify new invite exists
      const invite = await inviteRule.getInvite(configSalt, inviteCodeHash);
      expect(invite.inviter).to.equal(inviter.address);
      expect(invite.expiresAt).to.equal(newExpiresAt);
      expect(invite.used).to.equal(false);
    });

    it("Should free storage slots after cancellation", async function () {
      // Cancel invite
      const tx = await inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash);
      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed || 0n;

      // Cancellation should use reasonable gas (with refund applied)
      // Should be less than 50k gas with refund
      expect(gasUsed).to.be.lessThan(50000);

      // Verify all fields are zeroed
      const invite = await inviteRule.getInvite(configSalt, inviteCodeHash);
      expect(invite.inviter).to.equal(ethers.ZeroAddress);
      expect(invite.expiresAt).to.equal(0);
      expect(invite.used).to.equal(false);
      expect(invite.usedBy).to.equal(ethers.ZeroAddress);
    });

    it("Should handle canceling multiple invites for same group", async function () {
      // Register second invite
      const inviteCode2 = "SECRET456";
      const inviteCodeHash2 = ethers.keccak256(ethers.toUtf8Bytes(inviteCode2));
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash2,
        expiresAt
      );

      // Cancel first invite
      await expect(
        inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash)
      ).to.emit(inviteRule, "InviteCancelled");

      // Second invite should still be usable
      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode2]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.emit(inviteRule, "InviteUsed");
    });

    it("Should handle canceling expired invite", async function () {
      // Fast forward past expiration
      await time.increaseTo(expiresAt + 1);

      // Should still be able to cancel expired invite
      await expect(
        inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash)
      )
        .to.emit(inviteRule, "InviteCancelled")
        .withArgs(configSalt, inviter.address, inviteCodeHash);
    });

    it("Should emit correct event data before deletion", async function () {
      // Verify invite exists before cancellation
      const inviteBefore = await inviteRule.getInvite(configSalt, inviteCodeHash);
      expect(inviteBefore.inviter).to.equal(inviter.address);

      // Cancel and check event
      await expect(
        inviteRule.connect(backend).cancelInvite(configSalt, inviteCodeHash)
      )
        .to.emit(inviteRule, "InviteCancelled")
        .withArgs(configSalt, inviter.address, inviteCodeHash);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long invite codes", async function () {
      const longCode = "A".repeat(1000);
      const longCodeHash = ethers.keccak256(ethers.toUtf8Bytes(longCode));
      const expiresAt = (await time.latest()) + 86400;

      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        longCodeHash,
        expiresAt
      );

      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [longCode]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.emit(inviteRule, "InviteUsed");
    });

    it("Should handle expiration at exact timestamp", async function () {
      const expiresAt = (await time.latest()) + 86400;
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );

      // Set time to one second before expiration
      await time.increaseTo(expiresAt - 1);

      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      // Should succeed when block.timestamp <= expiresAt
      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.emit(inviteRule, "InviteUsed").withArgs(configSalt, invitee.address, inviteCodeHash, inviter.address);
    });

    it("Should handle multiple groups (different configSalts)", async function () {
      const configSalt2 = ethers.encodeBytes32String("test-group-2");
      const expiresAt = (await time.latest()) + 86400;

      // Register invite for group 1
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );

      // Register invite for group 2 (same inviter, different group)
      await inviteRule.connect(backend).registerInvite(
        configSalt2,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );

      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      // Use invite for group 1
      await inviteRule.processJoining(
        configSalt,
        invitee.address,
        [],
        ruleParams
      );

      // Should still be able to use invite for group 2
      await expect(
        inviteRule.processJoining(
          configSalt2,
          invitee.address,
          [],
          ruleParams
        )
      ).to.emit(inviteRule, "InviteUsed");
    });

    it("Should handle case-sensitive invite codes", async function () {
      const expiresAt = (await time.latest()) + 86400;
      const code = "SecretCode123";
      const codeHash = ethers.keccak256(ethers.toUtf8Bytes(code));

      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        codeHash,
        expiresAt
      );

      // Try with wrong case
      const wrongCaseParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], ["secretcode123"]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          wrongCaseParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotFound");

      // Should work with correct case
      const correctParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [code]) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          correctParams
        )
      ).to.emit(inviteRule, "InviteUsed");
    });
  });

  describe("Gas Optimization Checks", function () {
    it("Should have reasonable gas cost for registering invite", async function () {
      const expiresAt = (await time.latest()) + 86400;

      const tx = await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );

      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed || 0n;

      // Should use less than 100k gas for registration
      expect(gasUsed).to.be.lessThan(100000);
    });

    it("Should have reasonable gas cost for processing join", async function () {
      const expiresAt = (await time.latest()) + 86400;
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        inviter.address,
        inviteCodeHash,
        expiresAt
      );

      const ruleParams = [
        { key: PARAM__INVITE_CODE, value: ethers.AbiCoder.defaultAbiCoder().encode(["string"], [inviteCode]) }
      ];

      const tx = await inviteRule.processJoining(
        configSalt,
        invitee.address,
        [],
        ruleParams
      );

      const receipt = await tx.wait();
      const gasUsed = receipt?.gasUsed || 0n;

      // Should use less than 100k gas for validation
      expect(gasUsed).to.be.lessThan(100000);
    });
  });
});
