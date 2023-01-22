const{ expect } = require("chai");
const hre = require("hardhat");

describe("TetraToken Contract", function() {
    let Token;
    let tetraToken;
    let owner;
    let addr1;
    let addr2;
    let tokenCap = 1000000000;
    let tokenBlockReward = 50;

    beforeEach(async function() {
        Token = await ethers.getContractFactory("TetraToken");
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        tetraToken = await Token.deploy(tokenCap, tokenBlockReward);
    });

    describe("Deployment", function() {
        it("Should set the right owner", async function(){
            expect(await tetraToken.owner()).to.equal(owner.address);
        });
        it("Should assign the total supply of tokens to the owner", async function(){
            const ownerBalance = await tetraToken.balanceOf(owner.address);
            expect(await tetraToken.totalSupply()).to.equal(ownerBalance);
        });
        it("Should set max capped supply to the argument provided during deployment", async function(){
            const cap = await tetraToken.cap();
            expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
        });
        it("Should set the blockReward to the argument provided during deployment", async function(){
            const blockReward = await tetraToken.blockReward();
            expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
          // Transfer 50 tokens from owner to addr1
          await tetraToken.transfer(addr1.address, 50);
          const addr1Balance = await tetraToken.balanceOf(addr1.address);
          expect(addr1Balance).to.equal(50);
    
          // Transfer 50 tokens from addr1 to addr2
          // We use .connect(signer) to send a transaction from another account
          await tetraToken.connect(addr1).transfer(addr2.address, 50);
          const addr2Balance = await tetraToken.balanceOf(addr2.address);
          expect(addr2Balance).to.equal(50);
        });
    
        it("Should fail if sender doesn't have enough tokens", async function () {
          const initialOwnerBalance = await tetraToken.balanceOf(owner.address);
          // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
          // `require` will evaluate false and revert the transaction.
          await expect(
            tetraToken.connect(addr1).transfer(owner.address, 1)
          ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    
          // Owner balance shouldn't have changed.
          expect(await tetraToken.balanceOf(owner.address)).to.equal(
            initialOwnerBalance
          );
        });
    
        it("Should update balances after transfers", async function () {
          const initialOwnerBalance = await tetraToken.balanceOf(owner.address);
    
          // Transfer 100 tokens from owner to addr1.
          await tetraToken.transfer(addr1.address, 100);
    
          // Transfer another 50 tokens from owner to addr2.
          await tetraToken.transfer(addr2.address, 50);
    
          // Check balances.
          const finalOwnerBalance = await tetraToken.balanceOf(owner.address);
          expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));
    
          const addr1Balance = await tetraToken.balanceOf(addr1.address);
          expect(addr1Balance).to.equal(100);
    
          const addr2Balance = await tetraToken.balanceOf(addr2.address);
          expect(addr2Balance).to.equal(50);
        });
      });
});