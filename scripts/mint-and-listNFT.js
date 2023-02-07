const { ethers, network } = require("hardhat");
const { moveBlocks, sleepAmount } = require("../utils/moveBlocks");

const PRICE = ethers.utils.parseEther("0.1");

async function listAndMint() {
  const basicNft = await ethers.getContract("basicNFT");
  const nftMarketPlace = await ethers.getContract("NFTMarketPlace");
  console.log("minting nft ...");
  const txBasicNFT = await basicNft.mintNFT();
  const txReceipt = await txBasicNFT.wait(1);
  const tokenId = txReceipt.events[0].args.tokenId;

  console.log("approving nft for marketplace");

  await basicNft.approve(nftMarketPlace.address, tokenId);

  console.log("listing nft ...");

  const txNftMarketPlace = await nftMarketPlace.listNFT(
    basicNft.address,
    tokenId,
    PRICE
  );
  await txNftMarketPlace.wait(1);

  if (network.config.chainId == 31337) {
    console.log("moving blocks by 1");
    await moveBlocks(1, (sleepAmount = 10000));
  }
}

listAndMint()
  .then(process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
