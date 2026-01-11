async function main() {
  const Wagyu = await ethers.getContractFactory("WagyuSupplyChain");
  const wagyu = await Wagyu.deploy();
  await wagyu.deployed();
  console.log("WagyuSupplyChain deployed to:", wagyu.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});