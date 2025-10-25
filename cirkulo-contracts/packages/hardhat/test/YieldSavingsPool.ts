import { expect } from "chai";
import { ethers } from "hardhat";
import { MockYieldVault, YieldSavingsPool, MockCUSD, XershaFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("YieldSavingsPool", function () {
  let cusdVault: MockYieldVault;
  let cbtcVault: MockYieldVault;
  let mockCUSD: MockCUSD;
  let cusdPool: YieldSavingsPool;
  let cbtcPool: YieldSavingsPool;
  let xershaFactory: XershaFactory;
  let cusdPoolAddress: string;
  let cbtcPoolAddress: string;
  let circleIdCUSD: string;
  let circleIdCBTC: string;
  let creator: SignerWithAddress;
  let member1: SignerWithAddress;
  let member2: SignerWithAddress;
  let member3: SignerWithAddress;
  let backendManager: SignerWithAddress;
  let nonMember: SignerWithAddress;

  const circleName = "Test Yield Circle";
  const CUSD_APY = 500; // 5.00%
  const CBTC_APY = 300; // 3.00%

  beforeEach(async function () {
    [creator, member1, member2, member3, backendManager, nonMember] = await ethers.getSigners();

    // Deploy Mock CUSD token
    const MockCUSDFactory = await ethers.getContractFactory("MockCUSD");
    mockCUSD = await MockCUSDFactory.deploy();

    // Mint tokens to test users
    const mintAmount = ethers.parseEther("10000"); // 10,000 CUSD per user
    await mockCUSD.mint(creator.address, mintAmount);
    await mockCUSD.mint(member1.address, mintAmount);
    await mockCUSD.mint(member2.address, mintAmount);
    await mockCUSD.mint(member3.address, mintAmount);

    // Deploy CUSD Yield Vault (5% APY)
    const MockYieldVaultFactory = await ethers.getContractFactory("MockYieldVault");
    cusdVault = await MockYieldVaultFactory.deploy(
      await mockCUSD.getAddress(),
      false, // isNativeToken
      CUSD_APY
    );

    // Deploy cBTC Yield Vault (3% APY)
    cbtcVault = await MockYieldVaultFactory.deploy(
      ethers.ZeroAddress,
      true, // isNativeToken
      CBTC_APY
    );

    // Use unique addresses as circle IDs
    circleIdCUSD = nonMember.address;
    circleIdCBTC = member3.address;

    // Deploy pool implementations
    const ROSCAPoolFactory = await ethers.getContractFactory("ROSCAPool");
    const roscaImpl = await ROSCAPoolFactory.deploy();

    const YieldSavingsPoolFactory = await ethers.getContractFactory("YieldSavingsPool");
    const savingsImpl = await YieldSavingsPoolFactory.deploy();

    const DonationPoolFactory = await ethers.getContractFactory("DonationPool");
    const donationImpl = await DonationPoolFactory.deploy();

    // Deploy XershaFactory with yield vaults
    const XershaFactoryFactory = await ethers.getContractFactory("XershaFactory");
    xershaFactory = await XershaFactoryFactory.deploy(
      creator.address,
      backendManager.address,
      await roscaImpl.getAddress(),
      await savingsImpl.getAddress(),
      await donationImpl.getAddress(),
      await cbtcVault.getAddress(),
      await cusdVault.getAddress()
    );

    // Create CUSD pool via factory
    await xershaFactory.connect(creator).createSavingsPool(
      circleIdCUSD,
      circleName + " CUSD",
      await mockCUSD.getAddress(),
      false // isNativeToken
    );

    // Create cBTC pool via factory
    await xershaFactory.connect(creator).createSavingsPool(
      circleIdCBTC,
      circleName + " cBTC",
      ethers.ZeroAddress,
      true // isNativeToken
    );

    // Get pool addresses
    cusdPoolAddress = await xershaFactory.circleToPool(circleIdCUSD);
    cbtcPoolAddress = await xershaFactory.circleToPool(circleIdCBTC);

    cusdPool = await ethers.getContractAt("YieldSavingsPool", cusdPoolAddress);
    cbtcPool = await ethers.getContractAt("YieldSavingsPool", cbtcPoolAddress);
  });

  describe("Deployment & Initialization", function () {
    it("Should set correct creator", async function () {
      expect(await cusdPool.creator()).to.equal(creator.address);
      expect(await cbtcPool.creator()).to.equal(creator.address);
    });

    it("Should set correct yield vaults", async function () {
      expect(await cusdPool.yieldVault()).to.equal(await cusdVault.getAddress());
      expect(await cbtcPool.yieldVault()).to.equal(await cbtcVault.getAddress());
    });

    it("Should initialize with correct APY", async function () {
      expect(await cusdPool.getAPY()).to.equal(CUSD_APY);
      expect(await cbtcPool.getAPY()).to.equal(CBTC_APY);
    });

    it("Should initialize as active", async function () {
      expect(await cusdPool.isActive()).to.be.true;
      expect(await cbtcPool.isActive()).to.be.true;
    });

    it("Should initialize with creator as first member", async function () {
      expect(await cusdPool.getMemberCount()).to.equal(1);
      expect(await cusdPool.isMember(creator.address)).to.be.true;
    });

    it("Should verify vault configuration matches pool", async function () {
      expect(await cusdVault.isNativeToken()).to.equal(false);
      expect(await cusdVault.tokenAddress()).to.equal(await mockCUSD.getAddress());
      expect(await cbtcVault.isNativeToken()).to.equal(true);
      expect(await cbtcVault.tokenAddress()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("CUSD Pool - Deposits & Yield", function () {
    beforeEach(async function () {
      await cusdPool.connect(creator).inviteMember(member1.address);
      await cusdPool.connect(creator).inviteMember(member2.address);
    });

    it("Should allow member to deposit CUSD", async function () {
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);

      await expect(cusdPool.connect(member1).deposit(depositAmount))
        .to.changeTokenBalance(mockCUSD, member1, -depositAmount);

      expect(await cusdPool.principalBalances(member1.address)).to.equal(depositAmount);
    });

    it("Should accrue 5% APY yield over 1 year", async function () {
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);

      // Accrue yield in vault
      await cusdVault.accrueYield();

      // Check yield earned (should be ~50 CUSD = 5% of 1000)
      const yieldEarned = await cusdPool.getYieldEarned(member1.address);
      const expectedYield = ethers.parseEther("50");

      // Allow 1% margin for time precision
      expect(yieldEarned).to.be.closeTo(expectedYield, ethers.parseEther("0.5"));
    });

    it("Should track principal separately from yield", async function () {
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      // Fast forward 6 months
      await time.increase(182 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      const principal = await cusdPool.principalBalances(member1.address);
      const totalBalance = await cusdPool.getBalanceWithYield(member1.address);
      const yieldEarned = await cusdPool.getYieldEarned(member1.address);

      expect(principal).to.equal(depositAmount);
      expect(totalBalance).to.be.gt(principal);
      expect(yieldEarned).to.equal(totalBalance - principal);
    });

    it("Should distribute yield proportionally to multiple members", async function () {
      // Member1 deposits 1000 CUSD
      const deposit1 = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, deposit1);
      await cusdPool.connect(member1).deposit(deposit1);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      // Member2 deposits 2000 CUSD
      const deposit2 = ethers.parseEther("2000");
      await mockCUSD.connect(member2).approve(cusdPoolAddress, deposit2);
      await cusdPool.connect(member2).deposit(deposit2);

      // Fast forward another 30 days
      await time.increase(30 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      const yield1 = await cusdPool.getYieldEarned(member1.address);
      const yield2 = await cusdPool.getYieldEarned(member2.address);

      // Member1 should have more yield (deposited earlier and for longer)
      expect(yield1).to.be.gt(yield2);

      // Both should have positive yield
      expect(yield1).to.be.gt(0);
      expect(yield2).to.be.gt(0);
    });

    it("Should include yield in withdrawal", async function () {
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      const balanceBeforeWithdraw = await cusdPool.getBalanceWithYield(member1.address);
      const initialBalance = await mockCUSD.balanceOf(member1.address);

      // Withdraw everything
      await cusdPool.connect(member1).withdraw(balanceBeforeWithdraw);

      const finalBalance = await mockCUSD.balanceOf(member1.address);
      const received = finalBalance - initialBalance;

      // Should receive principal + yield
      expect(received).to.be.closeTo(balanceBeforeWithdraw, ethers.parseEther("0.01"));
      expect(received).to.be.gt(depositAmount); // More than principal
    });

    it("Should handle partial withdrawals correctly", async function () {
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      const totalBalance = await cusdPool.getBalanceWithYield(member1.address);
      const withdrawAmount = totalBalance / 2n; // Withdraw half

      await cusdPool.connect(member1).withdraw(withdrawAmount);

      const remainingBalance = await cusdPool.getBalanceWithYield(member1.address);
      const remainingPrincipal = await cusdPool.principalBalances(member1.address);

      // Remaining should be approximately half
      expect(remainingBalance).to.be.closeTo(totalBalance / 2n, ethers.parseEther("0.01"));
      expect(remainingPrincipal).to.be.closeTo(depositAmount / 2n, ethers.parseEther("0.01"));
    });

    it("Should return correct pool statistics", async function () {
      // Member1 deposits 1000
      const deposit1 = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, deposit1);
      await cusdPool.connect(member1).deposit(deposit1);

      // Member2 deposits 500
      const deposit2 = ethers.parseEther("500");
      await mockCUSD.connect(member2).approve(cusdPoolAddress, deposit2);
      await cusdPool.connect(member2).deposit(deposit2);

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      const [totalPrincipal, totalYield, totalValue] = await cusdPool.getPoolStats();

      expect(totalPrincipal).to.equal(deposit1 + deposit2);
      expect(totalYield).to.be.gt(0);
      expect(totalValue).to.equal(totalPrincipal + totalYield);

      // Total yield should be ~5% of principal
      const expectedYield = (deposit1 + deposit2) * 5n / 100n;
      expect(totalYield).to.be.closeTo(expectedYield, ethers.parseEther("1"));
    });
  });

  describe("cBTC Pool - Native Token & Yield", function () {
    beforeEach(async function () {
      await cbtcPool.connect(creator).inviteMember(member1.address);
      await cbtcPool.connect(creator).inviteMember(member2.address);
    });

    it("Should allow member to deposit cBTC (native token)", async function () {
      const depositAmount = ethers.parseEther("1.0");

      await expect(
        cbtcPool.connect(member1).deposit(0, { value: depositAmount })
      ).to.changeEtherBalance(member1, -depositAmount);

      expect(await cbtcPool.principalBalances(member1.address)).to.equal(depositAmount);
    });

    it("Should accrue 3% APY yield on cBTC over 1 year", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await cbtcPool.connect(member1).deposit(0, { value: depositAmount });

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);
      await cbtcVault.accrueYield();

      // Check yield earned (should be ~0.03 cBTC = 3% of 1.0)
      const yieldEarned = await cbtcPool.getYieldEarned(member1.address);
      const expectedYield = ethers.parseEther("0.03");

      // Allow 1% margin for time precision
      expect(yieldEarned).to.be.closeTo(expectedYield, ethers.parseEther("0.0003"));
    });

    it("Should return only principal on cBTC withdrawal (yield is virtual for demo)", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await cbtcPool.connect(member1).deposit(0, { value: depositAmount });

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);

      // Get balance (includes virtual yield for display purposes)
      const balanceWithYield = await cbtcPool.getBalanceWithYield(member1.address);

      // Balance should show yield (for UI display)
      expect(balanceWithYield).to.be.gt(depositAmount);

      // But withdrawal should only return principal
      const initialBalance = await ethers.provider.getBalance(member1.address);
      const tx = await cbtcPool.connect(member1).withdraw(depositAmount); // Only withdraw principal
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      // Check the actual amount received
      const finalBalance = await ethers.provider.getBalance(member1.address);
      const actualReceived = finalBalance - initialBalance + gasUsed;

      // User should receive exactly their principal (no yield payout for cBTC)
      expect(actualReceived).to.equal(depositAmount);

      // Trying to withdraw more than principal should fail
      await expect(
        cbtcPool.connect(member1).withdraw(ethers.parseEther("0.01"))
      ).to.be.revertedWith("Cannot withdraw more than principal for native token");
    });

    it("Should handle multiple cBTC depositors", async function () {
      const deposit1 = ethers.parseEther("1.0");
      const deposit2 = ethers.parseEther("0.5");

      await cbtcPool.connect(member1).deposit(0, { value: deposit1 });
      await cbtcPool.connect(member2).deposit(0, { value: deposit2 });

      // Fast forward 6 months
      await time.increase(182 * 24 * 60 * 60);
      await cbtcVault.accrueYield();

      const yield1 = await cbtcPool.getYieldEarned(member1.address);
      const yield2 = await cbtcPool.getYieldEarned(member2.address);

      // Member1 should have ~2x the yield of member2
      expect(yield1).to.be.closeTo(yield2 * 2n, ethers.parseEther("0.001"));
    });
  });

  describe("APY Comparison - cBTC vs CUSD", function () {
    it("Should verify CUSD earns higher yield than cBTC", async function () {
      await cusdPool.connect(creator).inviteMember(member1.address);
      await cbtcPool.connect(creator).inviteMember(member1.address);

      // Deposit equivalent amounts (1000 units each)
      const depositAmount = ethers.parseEther("1000");

      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);
      await cbtcPool.connect(member1).deposit(0, { value: depositAmount });

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);
      await cusdVault.accrueYield();
      await cbtcVault.accrueYield();

      const cusdYield = await cusdPool.getYieldEarned(member1.address);
      const cbtcYield = await cbtcPool.getYieldEarned(member1.address);

      // CUSD should earn 5% vs cBTC 3%
      const expectedCUSDYield = ethers.parseEther("50"); // 5%
      const expectedCBTCYield = ethers.parseEther("30"); // 3%

      expect(cusdYield).to.be.closeTo(expectedCUSDYield, ethers.parseEther("0.5"));
      expect(cbtcYield).to.be.closeTo(expectedCBTCYield, ethers.parseEther("0.3"));
      expect(cusdYield).to.be.gt(cbtcYield);
    });
  });

  describe("Edge Cases & Error Handling", function () {
    beforeEach(async function () {
      await cusdPool.connect(creator).inviteMember(member1.address);
    });

    it("Should reject zero deposits", async function () {
      await expect(
        cusdPool.connect(member1).deposit(0)
      ).to.be.revertedWith("Must deposit something");
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const depositAmount = ethers.parseEther("100");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      const withdrawAmount = ethers.parseEther("200");
      await expect(
        cusdPool.connect(member1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should prevent non-members from depositing", async function () {
      const depositAmount = ethers.parseEther("100");
      await mockCUSD.connect(nonMember).approve(cusdPoolAddress, depositAmount);

      await expect(
        cusdPool.connect(nonMember).deposit(depositAmount)
      ).to.be.revertedWith("Not a member");
    });

    it("Should prevent deposits when pool is not active", async function () {
      await cusdPool.connect(creator).closePool();

      const depositAmount = ethers.parseEther("100");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);

      await expect(
        cusdPool.connect(member1).deposit(depositAmount)
      ).to.be.revertedWith("Pool not active");
    });

    it("Should still allow withdrawals after pool is closed", async function () {
      const depositAmount = ethers.parseEther("100");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      await cusdPool.connect(creator).closePool();

      // Withdrawal should still work
      await expect(
        cusdPool.connect(member1).withdraw(depositAmount)
      ).to.not.be.reverted;
    });

    it("Should handle rounding correctly for small deposits", async function () {
      const smallDeposit = ethers.parseEther("0.01");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, smallDeposit);
      await cusdPool.connect(member1).deposit(smallDeposit);

      const principal = await cusdPool.principalBalances(member1.address);
      expect(principal).to.equal(smallDeposit);
    });

    it("Should handle zero yield scenario (no time passed)", async function () {
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      // Check immediately (no time passed)
      const yieldEarned = await cusdPool.getYieldEarned(member1.address);
      expect(yieldEarned).to.equal(0);
    });
  });

  describe("Goal Management with Yield", function () {
    it("Should check goal including yield", async function () {
      await cusdPool.connect(creator).inviteMember(member1.address);

      const targetAmount = ethers.parseEther("1050");
      const targetDate = (await time.latest()) + 86400 * 365;
      await cusdPool.connect(creator).setTarget(targetAmount, targetDate);

      // Deposit 1000
      const depositAmount = ethers.parseEther("1000");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      expect(await cusdPool.isGoalReached()).to.be.false;

      // Fast forward 1 year (should earn ~50 yield)
      await time.increase(365 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      // Now should reach goal (1000 + 50 > 1050)
      expect(await cusdPool.isGoalReached()).to.be.true;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await cusdPool.connect(creator).inviteMember(member1.address);
      await cusdPool.connect(creator).inviteMember(member2.address);
    });

    it("Should return correct member count", async function () {
      expect(await cusdPool.getMemberCount()).to.equal(3); // creator + member1 + member2
    });

    it("Should return all members", async function () {
      const members = await cusdPool.getMembers();
      expect(members.length).to.equal(3);
      expect(members).to.include(creator.address);
      expect(members).to.include(member1.address);
      expect(members).to.include(member2.address);
    });

    it("Should return correct balance via balances() alias", async function () {
      const depositAmount = ethers.parseEther("100");
      await mockCUSD.connect(member1).approve(cusdPoolAddress, depositAmount);
      await cusdPool.connect(member1).deposit(depositAmount);

      const balance = await cusdPool.balances(member1.address);
      expect(balance).to.be.gte(depositAmount);
    });

    it("Should return total yield for pool", async function () {
      const deposit1 = ethers.parseEther("1000");
      const deposit2 = ethers.parseEther("500");

      await mockCUSD.connect(member1).approve(cusdPoolAddress, deposit1);
      await cusdPool.connect(member1).deposit(deposit1);

      await mockCUSD.connect(member2).approve(cusdPoolAddress, deposit2);
      await cusdPool.connect(member2).deposit(deposit2);

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);
      await cusdVault.accrueYield();

      const totalYield = await cusdPool.getTotalYield();

      // Should be ~5% of 1500 = 75
      const expectedYield = ethers.parseEther("75");
      expect(totalYield).to.be.closeTo(expectedYield, ethers.parseEther("1"));
    });
  });

  describe("Factory Integration", function () {
    it("Should create yield-enabled pool via factory", async function () {
      const newCircleId = member2.address;

      await xershaFactory.connect(creator).createSavingsPool(
        newCircleId,
        "New Yield Circle",
        await mockCUSD.getAddress(),
        false
      );

      const poolAddress = await xershaFactory.circleToPool(newCircleId);
      const pool = await ethers.getContractAt("YieldSavingsPool", poolAddress);

      // Verify it has yield vault
      const vaultAddress = await pool.yieldVault();
      expect(vaultAddress).to.equal(await cusdVault.getAddress());

      // Verify APY
      expect(await pool.getAPY()).to.equal(CUSD_APY);
    });

    it("Should select correct vault based on token type", async function () {
      // CUSD pool should use CUSD vault
      expect(await cusdPool.yieldVault()).to.equal(await cusdVault.getAddress());

      // cBTC pool should use cBTC vault
      expect(await cbtcPool.yieldVault()).to.equal(await cbtcVault.getAddress());
    });
  });
});
