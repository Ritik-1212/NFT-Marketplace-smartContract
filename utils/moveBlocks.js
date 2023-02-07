const { network } = require("hardhat");

function sleep(timeInMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeInMs);
  });
}

async function moveBlocks(amount, sleepAmount = 0) {
  console.log("resolving blocks ...");
  for (let i = 0; i < amount; i++) {
    await network.provider.request({ method: "evm_mine", params: [] });
  }
  if (sleepAmount) {
    console.log("sleeping for " + sleepAmount);
    await sleep(sleepAmount);
  }
  console.log("moved " + amount + " blocks");
}

module.exports = {
  sleep,
  sleepAmount,
};
