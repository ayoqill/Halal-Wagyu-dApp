const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("WagyuSupplyChain Smart Contract", function () {
  
  // --- Fixture: Deploys the contract once before every test ---
  async function deployContractFixture() {
    // Get test accounts
    const [admin, producer, halalAuth, distributor, consumer] = await ethers.getSigners();

    // Deploy Contract
    const Wagyu = await ethers.getContractFactory("WagyuSupplyChain");
    const contract = await Wagyu.deploy();

    // Setup Roles (Admin adds Producer and Halal Authority)
    await contract.connect(admin).addProducer(producer.address);
    await contract.connect(admin).addHalalAuthority(halalAuth.address);
    await contract.connect(admin).addDistributor(distributor.address);

    return { contract, admin, producer, halalAuth, distributor, consumer };
  }

  // --- TEST 1: Access Control (Security) ---
  describe("1. Batch Creation & Access Control", function () {
    it("Should allow Producer to create a batch, but REVERT for others", async function () {
      const { contract, producer, consumer } = await loadFixture(deployContractFixture);
      
      const batchId = "WAGYU-001";

      // 1. Success Case: Producer creates batch
      await expect(contract.connect(producer).createBatch(batchId, "Kobe Beef", "Japan", "A5"))
        .to.emit(contract, "BatchCreated")
        .withArgs(batchId, "Kobe Beef", producer.address, (await ethers.provider.getBlock("latest")).timestamp + 1);

      // 2. Failure Case: Consumer tries to create batch (Should Revert)
      await expect(
        contract.connect(consumer).createBatch("WAGYU-FAKE", "Fake Beef", "Unknown", "F")
      ).to.be.revertedWith("Only producer");
    });
  });

  // --- TEST 2: Halal Certification Logic ---
  describe("2. Halal Certification Workflow", function () {
    it("Should update status and certificate when Halal Authority signs it", async function () {
      const { contract, producer, halalAuth } = await loadFixture(deployContractFixture);
      
      const batchId = "WAGYU-002";
      await contract.connect(producer).createBatch(batchId, "Matsusaka Beef", "Japan", "A5");

      const certHash = "IPFS_HASH_CERT_123";

      // Action: Halal Authority adds certificate
      await contract.connect(halalAuth).setHalalCertJP(batchId, certHash);

      // Validation: Check the Batch data
      const batchData = await contract.getBatch(batchId);
      
      // Expect status to be updated
      expect(batchData[6]).to.equal("Certified Halal (Japan)"); // Index 6 is 'status'
      // Expect certificate hash to be set
      expect(batchData[7]).to.equal(certHash); // Index 7 is 'halalCertJP'
    });
  });

  // --- TEST 3: Traceability & Ownership ---
  describe("3. Ownership Transfer (Traceability)", function () {
    it("Should correctly transfer ownership from Producer to Distributor", async function () {
      const { contract, producer, distributor } = await loadFixture(deployContractFixture);
      
      const batchId = "WAGYU-003";
      await contract.connect(producer).createBatch(batchId, "Omi Beef", "Japan", "A4");

      // Action: Producer transfers to Distributor
      await contract.connect(producer).transferBatch(batchId, distributor.address);

      // Validation: Check the new owner
      const batchData = await contract.getBatch(batchId);
      
      // The 'currentOwner' (Index 5) should now be the Distributor
      expect(batchData[5]).to.equal(distributor.address);
    });
  });

});