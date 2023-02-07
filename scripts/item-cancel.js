const { ethers, network } = require("hardhat");
const { moveBlocks, sleepAmount } = require("../utils/moveBlocks");

const tokenId = 0;

async function cancelItem() {
  const basicNFT = await ethers.getContract("basicNFT");
  const nftMarketPlace = await ethers.getContract("NFTMarketPlace");

  const cancelTx = await nftMarketPlace.cancelListing(basicNFT.address, 0);

  await cancelTx.wait(1);

  if (network.config.chainId == "31337") {
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

cancelItem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
