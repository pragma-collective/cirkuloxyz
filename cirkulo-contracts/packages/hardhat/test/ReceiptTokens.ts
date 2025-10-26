import { expect } from "chai";
import { ethers } from "hardhat";
import { XershaCUSD, XershaCBTC } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Receipt Tokens (XershaCUSD & XershaCBTC)", function () {
  let cusdToken: XershaCUSD;
  let cbtcToken: XershaCBTC;
  let owner: SignerWithAddress;
  let pool1: SignerWithAddress;
  let pool2: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  before(async function () {
    [owner, pool1, pool2, user1, user2, unauthorized] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Deploy XershaCUSD
    const XershaCUSDFactory = await ethers.getContractFactory("XershaCUSD");
    cusdToken = await XershaCUSDFactory.connect(owner).deploy();

    // Deploy XershaCBTC
    const XershaCBTCFactory = await ethers.getContractFactory("XershaCBTC");
    cbtcToken = await XershaCBTCFactory.connect(owner).deploy();
  });

  describe("Deployment", function () {
    it("Should deploy XershaCUSD successfully", async function () {
      expect(await cusdToken.getAddress()).to.be.properAddress;
      expect(await cusdToken.name()).to.equal("Xersha CUSD");
      expect(await cusdToken.symbol()).to.equal("xshCUSD");
    });

    it("Should deploy XershaCBTC successfully", async function () {
      expect(await cbtcToken.getAddress()).to.be.properAddress;
      expect(await cbtcToken.name()).to.equal("Xersha cBTC");
      expect(await cbtcToken.symbol()).to.equal("xshCBTC");
    });

    it("Should set correct owner", async function () {
      expect(await cusdToken.owner()).to.equal(owner.address);
      expect(await cbtcToken.owner()).to.equal(owner.address);
    });

    it("Should start with no authorized pools", async function () {
      expect(await cusdToken.authorizedPools(pool1.address)).to.be.false;
      expect(await cbtcToken.authorizedPools(pool1.address)).to.be.false;
    });
  });

  describe("Pool Authorization", function () {
    describe("XershaCUSD", function () {
      it("Should allow owner to authorize pools", async function () {
        await expect(cusdToken.connect(owner).addAuthorizedPool(pool1.address))
          .to.emit(cusdToken, "PoolAuthorized")
          .withArgs(pool1.address);

        expect(await cusdToken.authorizedPools(pool1.address)).to.be.true;
      });

      it("Should allow owner to authorize multiple pools", async function () {
        await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
        await cusdToken.connect(owner).addAuthorizedPool(pool2.address);

        expect(await cusdToken.authorizedPools(pool1.address)).to.be.true;
        expect(await cusdToken.authorizedPools(pool2.address)).to.be.true;
      });

      it("Should revert when non-owner tries to authorize pool", async function () {
        await expect(
          cusdToken.connect(unauthorized).addAuthorizedPool(pool1.address)
        ).to.be.revertedWith("Only owner");
      });

      it("Should revert when authorizing zero address", async function () {
        await expect(
          cusdToken.connect(owner).addAuthorizedPool(ethers.ZeroAddress)
        ).to.be.revertedWith("Invalid pool address");
      });

      it("Should allow owner to deauthorize pools", async function () {
        await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
        expect(await cusdToken.authorizedPools(pool1.address)).to.be.true;

        await expect(cusdToken.connect(owner).removeAuthorizedPool(pool1.address))
          .to.emit(cusdToken, "PoolDeauthorized")
          .withArgs(pool1.address);

        expect(await cusdToken.authorizedPools(pool1.address)).to.be.false;
      });

      it("Should revert when non-owner tries to deauthorize pool", async function () {
        await cusdToken.connect(owner).addAuthorizedPool(pool1.address);

        await expect(
          cusdToken.connect(unauthorized).removeAuthorizedPool(pool1.address)
        ).to.be.revertedWith("Only owner");
      });
    });

    describe("XershaCBTC", function () {
      it("Should allow owner to authorize pools", async function () {
        await expect(cbtcToken.connect(owner).addAuthorizedPool(pool1.address))
          .to.emit(cbtcToken, "PoolAuthorized")
          .withArgs(pool1.address);

        expect(await cbtcToken.authorizedPools(pool1.address)).to.be.true;
      });

      it("Should revert when non-owner tries to authorize pool", async function () {
        await expect(
          cbtcToken.connect(unauthorized).addAuthorizedPool(pool1.address)
        ).to.be.revertedWith("Only owner");
      });
    });
  });

  describe("Minting Principal", function () {
    beforeEach(async function () {
      // Authorize pool1 for both tokens
      await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
      await cbtcToken.connect(owner).addAuthorizedPool(pool1.address);
    });

    describe("XershaCUSD", function () {
      it("Should mint tokens from authorized pool", async function () {
        const amount = ethers.parseEther("100");

        await cusdToken.connect(pool1).mint(user1.address, amount);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(amount);
        expect(await cusdToken.principalBalances(user1.address)).to.equal(amount);
      });

      it("Should mint multiple times and accumulate principal", async function () {
        const amount1 = ethers.parseEther("100");
        const amount2 = ethers.parseEther("50");

        await cusdToken.connect(pool1).mint(user1.address, amount1);
        await cusdToken.connect(pool1).mint(user1.address, amount2);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(amount1 + amount2);
        expect(await cusdToken.principalBalances(user1.address)).to.equal(amount1 + amount2);
      });

      it("Should mint to multiple users", async function () {
        const amount1 = ethers.parseEther("100");
        const amount2 = ethers.parseEther("200");

        await cusdToken.connect(pool1).mint(user1.address, amount1);
        await cusdToken.connect(pool1).mint(user2.address, amount2);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(amount1);
        expect(await cusdToken.balanceOf(user2.address)).to.equal(amount2);
      });

      it("Should revert when unauthorized tries to mint", async function () {
        const amount = ethers.parseEther("100");

        await expect(
          cusdToken.connect(unauthorized).mint(user1.address, amount)
        ).to.be.revertedWith("Not authorized");
      });

      it("Should allow multiple authorized pools to mint", async function () {
        await cusdToken.connect(owner).addAuthorizedPool(pool2.address);

        const amount1 = ethers.parseEther("100");
        const amount2 = ethers.parseEther("50");

        await cusdToken.connect(pool1).mint(user1.address, amount1);
        await cusdToken.connect(pool2).mint(user1.address, amount2);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(amount1 + amount2);
      });
    });

    describe("XershaCBTC", function () {
      it("Should mint tokens from authorized pool", async function () {
        const amount = ethers.parseEther("0.5");

        await cbtcToken.connect(pool1).mint(user1.address, amount);

        expect(await cbtcToken.balanceOf(user1.address)).to.equal(amount);
        expect(await cbtcToken.principalBalances(user1.address)).to.equal(amount);
      });

      it("Should revert when unauthorized tries to mint", async function () {
        const amount = ethers.parseEther("0.5");

        await expect(
          cbtcToken.connect(unauthorized).mint(user1.address, amount)
        ).to.be.revertedWith("Not authorized");
      });
    });
  });

  describe("Minting Yield", function () {
    beforeEach(async function () {
      await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
      await cbtcToken.connect(owner).addAuthorizedPool(pool1.address);

      // Mint some principal first
      await cusdToken.connect(pool1).mint(user1.address, ethers.parseEther("100"));
      await cbtcToken.connect(pool1).mint(user1.address, ethers.parseEther("1"));
    });

    describe("XershaCUSD", function () {
      it("Should mint yield tokens without affecting principal", async function () {
        const yieldAmount = ethers.parseEther("5");

        await expect(cusdToken.connect(pool1).mintYield(user1.address, yieldAmount))
          .to.emit(cusdToken, "YieldMinted")
          .withArgs(user1.address, yieldAmount);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("105"));
        expect(await cusdToken.principalBalances(user1.address)).to.equal(ethers.parseEther("100"));
        expect(await cusdToken.yieldOf(user1.address)).to.equal(yieldAmount);
      });

      it("Should mint yield multiple times", async function () {
        const yield1 = ethers.parseEther("5");
        const yield2 = ethers.parseEther("3");

        await cusdToken.connect(pool1).mintYield(user1.address, yield1);
        await cusdToken.connect(pool1).mintYield(user1.address, yield2);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("108"));
        expect(await cusdToken.principalBalances(user1.address)).to.equal(ethers.parseEther("100"));
        expect(await cusdToken.yieldOf(user1.address)).to.equal(yield1 + yield2);
      });

      it("Should revert when unauthorized tries to mint yield", async function () {
        const yieldAmount = ethers.parseEther("5");

        await expect(
          cusdToken.connect(unauthorized).mintYield(user1.address, yieldAmount)
        ).to.be.revertedWith("Not authorized");
      });
    });

    describe("XershaCBTC", function () {
      it("Should mint yield tokens without affecting principal", async function () {
        const yieldAmount = ethers.parseEther("0.03");

        await expect(cbtcToken.connect(pool1).mintYield(user1.address, yieldAmount))
          .to.emit(cbtcToken, "YieldMinted")
          .withArgs(user1.address, yieldAmount);

        expect(await cbtcToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1.03"));
        expect(await cbtcToken.principalBalances(user1.address)).to.equal(ethers.parseEther("1"));
        expect(await cbtcToken.yieldOf(user1.address)).to.equal(yieldAmount);
      });
    });
  });

  describe("Burning Tokens", function () {
    beforeEach(async function () {
      await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
      await cbtcToken.connect(owner).addAuthorizedPool(pool1.address);
    });

    describe("XershaCUSD - Burning Principal Only", function () {
      it("Should burn tokens proportionally when no yield", async function () {
        const principal = ethers.parseEther("100");
        await cusdToken.connect(pool1).mint(user1.address, principal);

        const burnAmount = ethers.parseEther("30");
        await cusdToken.connect(pool1).burn(user1.address, burnAmount);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("70"));
        expect(await cusdToken.principalBalances(user1.address)).to.equal(ethers.parseEther("70"));
      });

      it("Should burn all tokens", async function () {
        const principal = ethers.parseEther("100");
        await cusdToken.connect(pool1).mint(user1.address, principal);

        await cusdToken.connect(pool1).burn(user1.address, principal);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(0);
        expect(await cusdToken.principalBalances(user1.address)).to.equal(0);
      });
    });

    describe("XershaCUSD - Burning with Yield", function () {
      it("Should burn proportionally from principal and yield", async function () {
        const principal = ethers.parseEther("100");
        const yieldAmount = ethers.parseEther("10");

        await cusdToken.connect(pool1).mint(user1.address, principal);
        await cusdToken.connect(pool1).mintYield(user1.address, yieldAmount);

        // Total balance: 110 (100 principal + 10 yield)
        // Burn 55 (half of total)
        const burnAmount = ethers.parseEther("55");
        await cusdToken.connect(pool1).burn(user1.address, burnAmount);

        // Should reduce principal by half: 100 -> 50
        expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("55"));
        expect(await cusdToken.principalBalances(user1.address)).to.equal(ethers.parseEther("50"));
        expect(await cusdToken.yieldOf(user1.address)).to.equal(ethers.parseEther("5"));
      });

      it("Should maintain yield ratio after partial burn", async function () {
        const principal = ethers.parseEther("100");
        const yieldAmount = ethers.parseEther("20"); // 20% yield

        await cusdToken.connect(pool1).mint(user1.address, principal);
        await cusdToken.connect(pool1).mintYield(user1.address, yieldAmount);

        // Burn 25% of total balance
        const burnAmount = ethers.parseEther("30");
        await cusdToken.connect(pool1).burn(user1.address, burnAmount);

        // Remaining: 90 total (75 principal + 15 yield)
        expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("90"));
        expect(await cusdToken.principalBalances(user1.address)).to.equal(ethers.parseEther("75"));
        expect(await cusdToken.yieldOf(user1.address)).to.equal(ethers.parseEther("15"));
      });
    });

    describe("XershaCBTC", function () {
      it("Should burn tokens proportionally", async function () {
        const principal = ethers.parseEther("1");
        await cbtcToken.connect(pool1).mint(user1.address, principal);

        const burnAmount = ethers.parseEther("0.3");
        await cbtcToken.connect(pool1).burn(user1.address, burnAmount);

        expect(await cbtcToken.balanceOf(user1.address)).to.equal(ethers.parseEther("0.7"));
        expect(await cbtcToken.principalBalances(user1.address)).to.equal(ethers.parseEther("0.7"));
      });
    });

    describe("Burn Validations", function () {
      it("Should revert when burning more than balance", async function () {
        const principal = ethers.parseEther("100");
        await cusdToken.connect(pool1).mint(user1.address, principal);

        const burnAmount = ethers.parseEther("101");
        await expect(
          cusdToken.connect(pool1).burn(user1.address, burnAmount)
        ).to.be.revertedWith("Insufficient balance");
      });

      it("Should revert when unauthorized tries to burn", async function () {
        const principal = ethers.parseEther("100");
        await cusdToken.connect(pool1).mint(user1.address, principal);

        await expect(
          cusdToken.connect(unauthorized).burn(user1.address, ethers.parseEther("10"))
        ).to.be.revertedWith("Not authorized");
      });
    });
  });

  describe("Non-Transferable (Soulbound)", function () {
    beforeEach(async function () {
      await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
      await cbtcToken.connect(owner).addAuthorizedPool(pool1.address);

      // Mint tokens to user1
      await cusdToken.connect(pool1).mint(user1.address, ethers.parseEther("100"));
      await cbtcToken.connect(pool1).mint(user1.address, ethers.parseEther("1"));
    });

    describe("XershaCUSD", function () {
      it("Should revert on transfer", async function () {
        await expect(
          cusdToken.connect(user1).transfer(user2.address, ethers.parseEther("10"))
        ).to.be.revertedWith("xshCUSD: Non-transferable");
      });

      it("Should revert on transferFrom", async function () {
        await expect(
          cusdToken.connect(user1).transferFrom(user1.address, user2.address, ethers.parseEther("10"))
        ).to.be.revertedWith("xshCUSD: Non-transferable");
      });
    });

    describe("XershaCBTC", function () {
      it("Should revert on transfer", async function () {
        await expect(
          cbtcToken.connect(user1).transfer(user2.address, ethers.parseEther("0.1"))
        ).to.be.revertedWith("xshCBTC: Non-transferable");
      });

      it("Should revert on transferFrom", async function () {
        await expect(
          cbtcToken.connect(user1).transferFrom(user1.address, user2.address, ethers.parseEther("0.1"))
        ).to.be.revertedWith("xshCBTC: Non-transferable");
      });
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
      await cbtcToken.connect(owner).addAuthorizedPool(pool1.address);
    });

    describe("principalOf()", function () {
      it("Should return principal balance", async function () {
        const principal = ethers.parseEther("100");
        await cusdToken.connect(pool1).mint(user1.address, principal);

        expect(await cusdToken.principalOf(user1.address)).to.equal(principal);
      });

      it("Should not include yield in principal", async function () {
        const principal = ethers.parseEther("100");
        const yieldAmount = ethers.parseEther("10");

        await cusdToken.connect(pool1).mint(user1.address, principal);
        await cusdToken.connect(pool1).mintYield(user1.address, yieldAmount);

        expect(await cusdToken.principalOf(user1.address)).to.equal(principal);
      });
    });

    describe("yieldOf()", function () {
      it("Should return zero when no yield", async function () {
        const principal = ethers.parseEther("100");
        await cusdToken.connect(pool1).mint(user1.address, principal);

        expect(await cusdToken.yieldOf(user1.address)).to.equal(0);
      });

      it("Should return yield amount", async function () {
        const principal = ethers.parseEther("100");
        const yieldAmount = ethers.parseEther("10");

        await cusdToken.connect(pool1).mint(user1.address, principal);
        await cusdToken.connect(pool1).mintYield(user1.address, yieldAmount);

        expect(await cusdToken.yieldOf(user1.address)).to.equal(yieldAmount);
      });

      it("Should return cumulative yield", async function () {
        const principal = ethers.parseEther("100");
        const yield1 = ethers.parseEther("5");
        const yield2 = ethers.parseEther("3");

        await cusdToken.connect(pool1).mint(user1.address, principal);
        await cusdToken.connect(pool1).mintYield(user1.address, yield1);
        await cusdToken.connect(pool1).mintYield(user1.address, yield2);

        expect(await cusdToken.yieldOf(user1.address)).to.equal(yield1 + yield2);
      });
    });

    describe("balanceOf()", function () {
      it("Should return total balance (principal + yield)", async function () {
        const principal = ethers.parseEther("100");
        const yieldAmount = ethers.parseEther("10");

        await cusdToken.connect(pool1).mint(user1.address, principal);
        await cusdToken.connect(pool1).mintYield(user1.address, yieldAmount);

        expect(await cusdToken.balanceOf(user1.address)).to.equal(principal + yieldAmount);
      });
    });
  });

  describe("Cross-Pool Scenarios", function () {
    beforeEach(async function () {
      await cusdToken.connect(owner).addAuthorizedPool(pool1.address);
      await cusdToken.connect(owner).addAuthorizedPool(pool2.address);
    });

    it("Should aggregate balances from multiple pools", async function () {
      // Pool1 mints 100 CUSD
      await cusdToken.connect(pool1).mint(user1.address, ethers.parseEther("100"));

      // Pool2 mints 50 CUSD
      await cusdToken.connect(pool2).mint(user1.address, ethers.parseEther("50"));

      // Total balance should be 150
      expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("150"));
      expect(await cusdToken.principalOf(user1.address)).to.equal(ethers.parseEther("150"));
    });

    it("Should allow different pools to burn", async function () {
      // Pool1 mints 100
      await cusdToken.connect(pool1).mint(user1.address, ethers.parseEther("100"));

      // Pool2 mints 50
      await cusdToken.connect(pool2).mint(user1.address, ethers.parseEther("50"));

      // Pool1 burns 30
      await cusdToken.connect(pool1).burn(user1.address, ethers.parseEther("30"));

      // Remaining: 120 (150 - 30)
      expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("120"));
    });

    it("Should track principal correctly across pools", async function () {
      // Pool1: 100 principal + 10 yield
      await cusdToken.connect(pool1).mint(user1.address, ethers.parseEther("100"));
      await cusdToken.connect(pool1).mintYield(user1.address, ethers.parseEther("10"));

      // Pool2: 50 principal + 5 yield
      await cusdToken.connect(pool2).mint(user1.address, ethers.parseEther("50"));
      await cusdToken.connect(pool2).mintYield(user1.address, ethers.parseEther("5"));

      // Total: 150 principal + 15 yield = 165 balance
      expect(await cusdToken.balanceOf(user1.address)).to.equal(ethers.parseEther("165"));
      expect(await cusdToken.principalOf(user1.address)).to.equal(ethers.parseEther("150"));
      expect(await cusdToken.yieldOf(user1.address)).to.equal(ethers.parseEther("15"));
    });
  });
});
