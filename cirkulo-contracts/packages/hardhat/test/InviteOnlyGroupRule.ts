import { expect } from "chai";
import { ethers } from "hardhat";
import { InviteOnlyGroupRule } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("InviteOnlyGroupRule", function () {
  let inviteRule: InviteOnlyGroupRule;
  let owner: SignerWithAddress;
  let backend: SignerWithAddress;
  let invitee: SignerWithAddress;
  let attacker: SignerWithAddress;
  let newBackend: SignerWithAddress;

  const configSalt = ethers.encodeBytes32String("test-group-1");
  const inviteCode = "SECRET123";
  const inviteCodeHash = ethers.keccak256(ethers.toUtf8Bytes(inviteCode));

  beforeEach(async function () {
    // Get signers
    [owner, backend, invitee, attacker, newBackend] = await ethers.getSigners();

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
          invitee.address,
          inviteCodeHash,
          expiresAt
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, invitee.address, inviteCodeHash, expiresAt);
    });

    it("Should not allow non-backend to register invite", async function () {
      const expiresAt = (await time.latest()) + 86400;

      await expect(
        inviteRule.connect(attacker).registerInvite(
          configSalt,
          invitee.address,
          inviteCodeHash,
          expiresAt
        )
      ).to.be.revertedWithCustomError(inviteRule, "OnlyBackend");
    });

    it("Should allow multiple invites for same group", async function () {
      const expiresAt = (await time.latest()) + 86400;
      const invitee2 = attacker;

      // Register first invite
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        invitee.address,
        inviteCodeHash,
        expiresAt
      );

      // Register second invite
      const inviteCode2 = "SECRET456";
      const inviteCodeHash2 = ethers.keccak256(ethers.toUtf8Bytes(inviteCode2));

      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          invitee2.address,
          inviteCodeHash2,
          expiresAt
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, invitee2.address, inviteCodeHash2, expiresAt);
    });

    it("Should allow overwriting existing invite", async function () {
      const expiresAt1 = (await time.latest()) + 86400;
      const expiresAt2 = (await time.latest()) + 172800; // 48 hours

      // Register initial invite
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        invitee.address,
        inviteCodeHash,
        expiresAt1
      );

      // Overwrite with new invite
      const newInviteCode = "NEWSECRET789";
      const newInviteCodeHash = ethers.keccak256(ethers.toUtf8Bytes(newInviteCode));

      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          invitee.address,
          newInviteCodeHash,
          expiresAt2
        )
      )
        .to.emit(inviteRule, "InviteRegistered")
        .withArgs(configSalt, invitee.address, newInviteCodeHash, expiresAt2);
    });
  });

  describe("processJoining", function () {
    let expiresAt: number;

    beforeEach(async function () {
      expiresAt = (await time.latest()) + 86400;
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        invitee.address,
        inviteCodeHash,
        expiresAt
      );
    });

    it("Should validate correct invite code", async function () {
      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      )
        .to.emit(inviteRule, "InviteUsed")
        .withArgs(configSalt, invitee.address, inviteCodeHash);
    });

    it("Should reject wrong invite code", async function () {
      const wrongCode = "WRONGCODE";
      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(wrongCode) }
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

    it("Should reject non-existent invite", async function () {
      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          attacker.address, // Not invited
          [],
          ruleParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InviteNotFound");
    });

    it("Should reject expired invite", async function () {
      // Fast forward time past expiration
      await time.increaseTo(expiresAt + 1);

      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
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
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
      ];

      // Use invite first time (should succeed)
      await inviteRule.processJoining(
        configSalt,
        invitee.address,
        [],
        ruleParams
      );

      // Try to use again (should fail)
      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
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
      const ruleParams = [
        { key: "wrongKey", value: ethers.toUtf8Bytes(inviteCode) }
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
          invitee.address,
          inviteCodeHash,
          expiresAt
        )
      ).to.emit(inviteRule, "InviteRegistered");

      // Old backend should not be able to register
      await expect(
        inviteRule.connect(backend).registerInvite(
          configSalt,
          invitee.address,
          inviteCodeHash,
          expiresAt
        )
      ).to.be.revertedWithCustomError(inviteRule, "OnlyBackend");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long invite codes", async function () {
      const longCode = "A".repeat(1000);
      const longCodeHash = ethers.keccak256(ethers.toUtf8Bytes(longCode));
      const expiresAt = (await time.latest()) + 86400;

      await inviteRule.connect(backend).registerInvite(
        configSalt,
        invitee.address,
        longCodeHash,
        expiresAt
      );

      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(longCode) }
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
        invitee.address,
        inviteCodeHash,
        expiresAt
      );

      // Set time to one second before expiration
      await time.increaseTo(expiresAt - 1);

      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
      ];

      // Should succeed when block.timestamp <= expiresAt
      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          ruleParams
        )
      ).to.emit(inviteRule, "InviteUsed").withArgs(configSalt, invitee.address, inviteCodeHash);
    });

    it("Should handle multiple groups (different configSalts)", async function () {
      const configSalt2 = ethers.encodeBytes32String("test-group-2");
      const expiresAt = (await time.latest()) + 86400;

      // Register invite for group 1
      await inviteRule.connect(backend).registerInvite(
        configSalt,
        invitee.address,
        inviteCodeHash,
        expiresAt
      );

      // Register invite for group 2 (same invitee, different group)
      await inviteRule.connect(backend).registerInvite(
        configSalt2,
        invitee.address,
        inviteCodeHash,
        expiresAt
      );

      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
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
        invitee.address,
        codeHash,
        expiresAt
      );

      // Try with wrong case
      const wrongCaseParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes("secretcode123") }
      ];

      await expect(
        inviteRule.processJoining(
          configSalt,
          invitee.address,
          [],
          wrongCaseParams
        )
      ).to.be.revertedWithCustomError(inviteRule, "InvalidInviteCode");

      // Should work with correct case
      const correctParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(code) }
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
        invitee.address,
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
        invitee.address,
        inviteCodeHash,
        expiresAt
      );

      const ruleParams = [
        { key: "inviteCode", value: ethers.toUtf8Bytes(inviteCode) }
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
