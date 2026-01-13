// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying WagyuSupplyChain contract...");

  // 1. Get the contract factory
  const WagyuSupplyChain = await hre.ethers.getContractFactory("WagyuSupplyChain");

  // 2. Deploy the contract
  const wagyu = await WagyuSupplyChain.deploy();

  // 3. Wait for it to be deployed
  await wagyu.waitForDeployment();

  const address = await wagyu.getAddress();

  console.log("----------------------------------------------------");
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", address);
  console.log("----------------------------------------------------");
  console.log("👉 COPY THIS ADDRESS INTO client/src/App.jsx");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});