const { expect } = require("chai");

describe("WagyuSupplyChain", function () {
  async function deploy() {
    const [admin, producer, halal, distributor, retailer, random] =
      await ethers.getSigners();

    const Wagyu = await ethers.getContractFactory("WagyuSupplyChain");
    const wagyu = await Wagyu.deploy();
    await wagyu.waitForDeployment();

    // Admin assigns roles
    await wagyu.addProducer(producer.address);
    await wagyu.addHalalAuthority(halal.address);
    await wagyu.addDistributor(distributor.address);
    await wagyu.addRetailer(retailer.address);

    return { wagyu, admin, producer, halal, distributor, retailer, random };
  }

  it("Test 1: Only admin can add roles", async function () {
    const { wagyu, random } = await deploy();

    await expect(wagyu.connect(random).addProducer(random.address))
      .to.be.revertedWith("Only admin");
  });

  it("Test 2: Producer can create batch, non-producer cannot", async function () {
    const { wagyu, producer, random } = await deploy();

    await expect(
      wagyu.connect(producer).createBatch("BATCH1", "Wagyu A5", "Japan", "A5")
    ).to.not.be.reverted;

    await expect(
      wagyu.connect(random).createBatch("BATCH2", "Wagyu A5", "Japan", "A5")
    ).to.be.revertedWith("Only producer");
  });

  it("Test 3: Halal Authority can certify JP, non-halal cannot", async function () {
    const { wagyu, producer, halal, random } = await deploy();

    await wagyu
      .connect(producer)
      .createBatch("BATCH3", "Wagyu A5", "Japan", "A5");

    await expect(
      wagyu.connect(random).setHalalCertJP("BATCH3", "HASH123")
    ).to.be.revertedWith("Only halal authority");

    await expect(wagyu.connect(halal).setHalalCertJP("BATCH3", "HASH123")).to
      .not.be.reverted;

    const b = await wagyu.getBatch("BATCH3");
    // getBatch returns (productName, batchId, origin, grade, producerAddress, currentOwner, status, halalCertJP, halalCertMY, createdAt)
    expect(b[7]).to.equal("HASH123");
  });
});