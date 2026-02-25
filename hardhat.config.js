require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./",
    tests: "./",
    cache: "./.hardhat/cache",
    artifacts: "./.hardhat/artifacts",
  },
};
