const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontEndContractAddress =
  "../nftmarketplace-frontend/constants/contractAddresses.json";
const frontEndAbi = "../nftmarketplace-frontend/constants/";
module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    await updateContractAddress();
    await updateAbi();
  }

  async function updateAbi() {
    const nftMarketPlace = await ethers.getContract("NFTMarketPlace");
    fs.writeFileSync(
      `${frontEndAbi}nftMarketPlace.json`,
      nftMarketPlace.interface.format(ethers.utils.FormatTypes.json)
    );

    const basicNft = await ethers.getContract("basicNFT");
    fs.writeFileSync(
      `${frontEndAbi}basicNft.json`,
      basicNft.interface.format(ethers.utils.FormatTypes.json)
    );
  }

  async function updateContractAddress() {
    const nftMarketPlace = await ethers.getContract("NFTMarketPlace");
    const contractAddress = JSON.parse(
      fs.readFileSync(frontEndContractAddress, "utf8")
    );
    const chainId = network.config.chainId.toString();

    if (chainId in contractAddress) {
      if (
        !contractAddress[chainId]["NFTMarketPlace"].includes(
          nftMarketPlace.address
        )
      ) {
        contractAddress[chainId]["NFTMarketPlace"].push(nftMarketPlace.address);
      } else {
        contractAddress[chainId] = { NFTMarketPlace: [nftMarketPlace.address] };
      }
    }
    fs.writeFileSync(frontEndContractAddress, JSON.stringify(contractAddress));
  }
};

module.exports.tags = ["all", "front-end"];
