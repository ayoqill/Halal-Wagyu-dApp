// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WagyuSupplyChain {

    // --- Roles ---
    address public admin;
    mapping(address => bool) public producer;
    mapping(address => bool) public halalAuthority;
    mapping(address => bool) public distributor;
    mapping(address => bool) public retailer;

    // --- Events ---
    event BatchCreated(
        string batchId,
        string productName,
        address producer,
        uint256 timestamp
    );

    event HalalCertifiedJP(
        string batchId,
        address halalAuthority,
        string certHash,
        uint256 timestamp
    );

    event StatusUpdated(
        string batchId,
        string newStatus,
        address updatedBy,
        uint256 timestamp
    );

    event BatchTransferred(
        string batchId,
        address from,
        address to,
        uint256 timestamp
    );

    constructor() {
        admin = msg.sender;
    }

    // Assign roles (Only Admin)
    function addProducer(address user) public {
        require(msg.sender == admin, "Only admin");
        producer[user] = true;
    }

    function addHalalAuthority(address user) public {
        require(msg.sender == admin, "Only admin");
        halalAuthority[user] = true;
    }

    function addDistributor(address user) public {
        require(msg.sender == admin, "Only admin");
        distributor[user] = true;
    }

    function addRetailer(address user) public {
        require(msg.sender == admin, "Only admin");
        retailer[user] = true;
    }

    // --- Batch Structure ---
    struct Batch {
        string productName;
        string batchId;
        string origin;
        string grade;
        address producerAddress;
        address currentOwner;
        string status;
        string halalCertJP;
        string halalCertMY;
        uint256 createdAt;
    }

    mapping(string => Batch) public batches;

    // --- Create Batch (Producer Only) ---
    function createBatch(
        string memory batchId,
        string memory productName,
        string memory origin,
        string memory grade
    ) public {
        require(producer[msg.sender], "Only producer");
        require(batches[batchId].createdAt == 0, "Batch already exists");

        batches[batchId] = Batch(
            productName,
            batchId,
            origin,
            grade,
            msg.sender,
            msg.sender,
            "Produced",
            "",
            "",
            block.timestamp
        );

        emit BatchCreated(
            batchId,
            productName,
            msg.sender,
            block.timestamp
            );
    }

    // --- Set Halal Certificate (Japan) ---
    function setHalalCertJP(string memory batchId, string memory certHash) public {
        require(halalAuthority[msg.sender], "Only halal authority");
        require(batches[batchId].createdAt != 0, "Batch does not exist");
        require(bytes(batches[batchId].halalCertJP).length == 0, "Already certified (JP)");

        batches[batchId].halalCertJP = certHash;
        batches[batchId].status = "Certified Halal (Japan)";

        emit HalalCertifiedJP(batchId, msg.sender, certHash, block.timestamp);
        emit StatusUpdated(batchId, "Certified Halal (Japan)", msg.sender, block.timestamp);
    }


    // --- Update Status (Only Current Owner) ---
    function updateStatus(string memory batchId, string memory newStatus) public {
        require(msg.sender == batches[batchId].currentOwner, "Not batch owner");
        batches[batchId].status = newStatus;

        emit StatusUpdated(batchId, newStatus, msg.sender, block.timestamp);

    }

    // --- Transfer Ownership (Valid Flow) ---
    function transferBatch(string memory batchId, address to) public {
        require(msg.sender == batches[batchId].currentOwner, "Not owner");

        batches[batchId].currentOwner = to;

        address from = batches[batchId].currentOwner;
        batches[batchId].currentOwner = to;
        emit BatchTransferred(batchId, from, to, block.timestamp);

    }

    // --- Get Batch ---
    function getBatch(string memory batchId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            address,
            address,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        Batch memory b = batches[batchId];
        return (
            b.productName,
            b.batchId,
            b.origin,
            b.grade,
            b.producerAddress,
            b.currentOwner,
            b.status,
            b.halalCertJP,
            b.halalCertMY,
            b.createdAt
        );
    }
}

