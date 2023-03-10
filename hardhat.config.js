require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// const MAINNET_RPC_URL =
//   process.env.MAINNET_RPC_URL ||
//   process.env.ALCHEMY_MAINNET_RPC_URL ||
//   "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
// const GOERLI_RPC_URL =
//   process.env.GOERLI_RPC_URL ||
//   "https://eth-goerli.alchemyapi.io/v2/your-api-key";
// const POLYGON_MAINNET_RPC_URL =
//   process.env.POLYGON_MAINNET_RPC_URL ||
//   "https://polygon-mainnet.alchemyapi.io/v2/your-api-key";
// const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";
// // optional
// const MNEMONIC = process.env.MNEMONIC || "your mnemonic";

// // Your API key for Etherscan, obtain one at https://etherscan.io/
// const ETHERSCAN_API_KEY =
//   process.env.ETHERSCAN_API_KEY || "Your etherscan API key";

// const REPORT_GAS = process.env.REPORT_GAS || false;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
    ],
  },

  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    goerli: {
      // url: GOERLI_RPC_URL,
      // accounts: [PRIVATE_KEY] ,
      saveDeployments: true,
      chainId: 5,
      blockConfirmations: 6,
    },
    mainnet: {
      // url: MAINNET_RPC_URL,
      // accounts: [PRIVATE_KEY],
      saveDeployments: true,
      chainId: 1,
      blockConfirmations: 6,
    },
  },

  // etherscan: {
  //   apiKey: {
  //     goerli: ETHERSCAN_API_KEY,
  //     polygon: POLYGONSCAN_API_KEY,
  //   },
  // },
  // gasReporter: {
  //   enabled: REPORT_GAS,
  //   currency: "USD",
  //   outputFile: "gas-report.txt",
  //   noColors: true,
  // },
  // contractSizer: {
  //   runOnCompile: false,
  //   only: ["NftMarketplace"],
  // },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
  },
  mocha: {
    timeout: 200000,
  },
};
