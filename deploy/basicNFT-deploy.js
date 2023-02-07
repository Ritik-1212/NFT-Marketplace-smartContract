const { network } = require("hardhat");
const { developmentChains } = require("../helper.hardhat.config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;

  let args = [];

  const basicNft = await deploy("basicNFT", {
    from: deployer,
    log: true,
    args: args,
    waitConfimations: network.config.blockConfirmations || 1,
  });
};

if (
  !developmentChains.includes(network.name) &&
  process.env.ETHERSCAN_API_KEY
) {
  log("verifying ............");

  await verify(basicNft.address, args);
}

module.exports.tags = ["all", "basicNft"];
