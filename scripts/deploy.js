async function main() {
  const Wagyu = await ethers.getContractFactory("WagyuSupplyChain");
  const wagyu = await Wagyu.deploy();
  await wagyu.waitForDeployment();
  const address = await wagyu.getAddress();
  console.log("WagyuSupplyChain deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});