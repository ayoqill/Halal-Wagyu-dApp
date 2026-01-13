require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // <--- This loads your .env file

module.exports = {
  solidity: "0.8.28", // Make sure this matches your contract version
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL, // Reads "SEPOLIA_URL" from .env
      accounts: [process.env.PRIVATE_KEY] // Reads "PRIVATE_KEY" from .env
    },
  },
};