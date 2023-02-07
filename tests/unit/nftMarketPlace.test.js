const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper.hardhat.config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("NFTMarketPlace", function () {
      let deployer, user, basicNft, nftMarketPlace;

      const PRICE = ethers.utils.parseEther("0.1");

      const TOKEN_ID = 0;

      beforeEach(async function () {
        deployer = (await getNamedAccounts).deployer;
        const accounts = await ethers.getSigners();
        user = accounts[1];

        await deployments.fixture(["all"]);

        basicNft = await ethers.getContract("basicNFT");
        nftMarketPlace = await ethers.getContract("NFTMarketPlace");

        await basicNft.mintNFT();
        await basicNft.approve(nftMarketPlace.address, TOKEN_ID);
      });

      describe("listNFT", function () {
        it("emits the listed nft", async function () {
          await expect(
            nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE)
          ).to.emit(nftMarketPlace, "listingNFT");
        });
        it("can only be listed by the owner", async function () {
          await nftMarketPlace.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NFTMarketPLace__notOwner()");
        });
        it("should only list items not already listed", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          const error = `NFTMarketPLace__itemAlreadyListed("${basicNFT.address}", ${TOKEN_ID})`;

          await expect(
            nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith(error);
        });
        it("needs approvals to list item", async function () {
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketplace.listNFT(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NFTMarketPLace__nftNotApproved()");
        });
        it("updates the listings", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          const listing = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == PRICE);
          assert(listing.seller.toString() == deployer.toString());
        });
      });
      describe("buyItems", function () {
        it("only buys items that are already listed", async function () {
          const error = `NFTMarketPLace__itemNotListed("${basicNFT.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketPlace.buyItems(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith(error);
        });
        it("needs to have the price required", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          await expect(
            nftMarketPlace.buyItems(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NFTMarketPLace__PriceNotMet");
        });
        it("should be able to transfer the nft and emit it", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(user);
          expect(
            await nftMarketPlace.buyItems(basicNft.address, TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit("boughtNFT");
          const newOwner = await nftMarketPlace.ownerOf(TOKEN_ID);
          const deployerProceeds = await nftMarketPlace.getProceeds(deployer);
          assert(newOwner.toString() == user.address);
          assert(deployerProceeds.toString() == PRICE.toString());
        });
      });
      describe("cancelListing", function () {
        it("can be cancelled by owner of the nft", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);

          await expect(
            nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NFTMarketPLace__notOwner()");
        });
        it("needs to listed for it to be cancelled", async function () {
          const error = `NFTMarketPLace__itemNotListed("${basicNFT.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith(error);
        });
        it("cancels the listing and emits it", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.emit("itemRemoved");
          const listing = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == "0");
        });
      });
      describe("updateListing", function () {
        it("reverts if newPrice is 0", async function () {
          await expect(
            nftMarketPlace.updateListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NFTMarketPLace__newPriceNotValid");
        });
        it("emits the event and updates the newPrice", async function () {
          const newPrice = ethers.utils.parseEther("0.2");
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketPlace.updateListing(
              basicNft.address,
              TOKEN_ID,
              newPrice
            )
          ).to.emit("listingNFT");
          const listing = await nftMarketPlace.getListings(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == newPrice);
        });
      });
      describe("withdrawProceeds", function () {
        it("only withdraws when procceds > 0", async function () {
          await expect(nftMarketPlace.withdrawProceeds()).to.be.revertedWith(
            "NFTMarketPLace__notEnoughProceedsToWithdraw"
          );
        });
        it("withdraws the proceeds successfully", async function () {
          await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE);
          await nftMarketPlace.connect(user);
          await nftMarketPlace.buyItems(basicNft.address, TOKEN_ID);
          await nftMarketPlace.connect(deployer);

          const deployerProceedsBefore = await nftMarketPlace.getProceeds(
            deployer
          );
          const deployerBalance = await deployer.getBalance();
          const tx = await nftMarketPlace.withdrawProceeds();
          const txReceipt = await tx.wait(1);
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const deployerBalanceAfter = await deployer.getBalance();
          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalance).toString()
          );
        });
      });
    });
