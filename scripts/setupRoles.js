async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress || !/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error(
      "Missing CONTRACT_ADDRESS in .env. Add CONTRACT_ADDRESS=0x... then run: npx hardhat run scripts/setupRoles.js --network sepolia"
    );
  }

  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  const code = await ethers.provider.getCode(contractAddress);
  if (!code || code === "0x") {
    throw new Error(
      `No contract bytecode found at ${contractAddress} on this network. Make sure MetaMask + Hardhat are using Sepolia and the address is a deployed contract.`
    );
  }

  const contract = await ethers.getContractAt("WagyuSupplyChain", contractAddress, signer);

  const admin = await contract.admin();
  console.log("Signer:", signerAddress);
  console.log("Contract:", contractAddress);
  console.log("Admin:", admin);

  if (admin.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error(
      "Your current PRIVATE_KEY is not the contract admin/deployer. Switch PRIVATE_KEY to the deployer wallet, or ask the deployer to assign roles."
    );
  }

  const ensureRole = async (label, getter, setter) => {
    const hasRole = await getter(signerAddress);
    if (hasRole) {
      console.log(`${label}: already true`);
      return;
    }
    const tx = await setter(signerAddress);
    console.log(`${label}: sending tx ${tx.hash}`);
    await tx.wait();
    console.log(`${label}: set to true`);
  };

  await ensureRole("Producer", contract.producer.bind(contract), contract.addProducer.bind(contract));
  await ensureRole(
    "HalalAuthority",
    contract.halalAuthority.bind(contract),
    contract.addHalalAuthority.bind(contract)
  );
  await ensureRole(
    "Distributor",
    contract.distributor.bind(contract),
    contract.addDistributor.bind(contract)
  );
  await ensureRole("Retailer", contract.retailer.bind(contract), contract.addRetailer.bind(contract));

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
