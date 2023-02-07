const { ethers, network } = require("hardhat");
const { moveBlocks, sleepAmount } = require("../utils/moveBlocks");

const tokenId = 0;

async function buyItems() {
  const basicNft = await ethers.getContract("basicNFT");
  const nftMarketPlace = await ethers.getContract("NFTMarketPlace");

  const listingTx = await nftMarketPlace.getListing(basicNft.address, tokenId);
  const listingTxResponse = await listingTx.wait(1);

  const price = await listingTxResponse.price.toString();

  const tx = await nftMarketPlace.buyItems(basicNft.address, tokenId, {
    value: price,
  });
  await tx.wait(1);

  if (network.config.chainId == 31337) {
    await moveBlocks(1, (sleepAmount = 1000));
  }
}

buyItems()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
