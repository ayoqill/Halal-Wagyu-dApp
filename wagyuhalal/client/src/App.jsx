import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS_HERE"; // <--- PASTE YOUR ADDRESS HERE

// --- ABI (Paste the FULL ABI from artifacts/contracts/WagyuSupplyChain.sol/...) ---
const CONTRACT_ABI = [
    // Basic Interface for demo purposes - REPLACE WITH FULL ABI FOR PRODUCTION
    "function createBatch(string batchId, string productName, string origin, string grade) public",
    "function setHalalCertJP(string batchId, string certHash) public",
    "function transferBatch(string batchId, address to) public",
    "function getBatch(string batchId) public view returns (string, string, string, string, address, address, string, string, string, uint256)",
    "event BatchCreated(string batchId, string productName, address producer, uint256 timestamp)",
    "event StatusUpdated(string batchId, string newStatus, address updatedBy, uint256 timestamp)"
];

function App() {
  // --- STATE ---
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('track'); // track, producer, authority, transfer

  // --- FORM STATES ---
  const [trackId, setTrackId] = useState("");
  const [batchData, setBatchData] = useState(null);
  
  // Producer Form
  const [newBatchId, setNewBatchId] = useState("");
  const [productName, setProductName] = useState("Premium Wagyu A5");
  const [origin, setOrigin] = useState("Kobe, Japan");
  const [grade, setGrade] = useState("A5");

  // Auth Form
  const [authBatchId, setAuthBatchId] = useState("");
  const [certHash, setCertHash] = useState("");

  // Transfer Form
  const [transBatchId, setTransBatchId] = useState("");
  const [newOwner, setNewOwner] = useState("");

  // --- CONNECT WALLET ---
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        const _signer = await _provider.getSigner();
        const _account = await _signer.getAddress();
        const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);

        setProvider(_provider);
        setSigner(_signer);
        setAccount(_account);
        setContract(_contract);
      } catch (err) {
        console.error(err);
        alert("Connection failed");
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  // --- FUNCTIONS ---

  // 1. Track Batch (Read Only)
  const handleTrack = async () => {
    if (!contract) return alert("Connect Wallet first");
    try {
      const data = await contract.getBatch(trackId);
      // Format timestamp
      const date = new Date(Number(data[9]) * 1000).toLocaleString();
      
      setBatchData({
        name: data[0],
        id: data[1],
        origin: data[2],
        grade: data[3],
        producer: data[4],
        owner: data[5],
        status: data[6],
        certJP: data[7],
        date: date
      });
    } catch (err) {
      console.error(err);
      alert("Batch not found or Error");
    }
  };

  // 2. Create Batch (Producer)
  const handleCreate = async () => {
    if (!contract) return;
    try {
      const tx = await contract.createBatch(newBatchId, productName, origin, grade);
      await tx.wait();
      alert(`Batch ${newBatchId} Created Successfully!`);
    } catch (err) {
      console.error(err);
      alert("Transaction Failed: Are you a Producer?");
    }
  };

  // 3. Certify (Authority)
  const handleCertify = async () => {
    if (!contract) return;
    try {
      const tx = await contract.setHalalCertJP(authBatchId, certHash);
      await tx.wait();
      alert(`Batch ${authBatchId} Certified!`);
    } catch (err) {
      console.error(err);
      alert("Transaction Failed: Are you the Authority?");
    }
  };

  // 4. Transfer (Owner)
  const handleTransfer = async () => {
    if (!contract) return;
    try {
      const tx = await contract.transferBatch(transBatchId, newOwner);
      await tx.wait();
      alert(`Ownership Transferred to ${newOwner}`);
    } catch (err) {
      console.error(err);
      alert("Transfer Failed: Do you own this batch?");
    }
  };

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <header>
        <div>
          <h1 className="brand-title">Wagyu Chain</h1>
          <span style={{color: 'var(--gold-dim)', letterSpacing:'1px'}}>PREMIUM HALAL TRACKING</span>
        </div>
        <button className="wallet-btn" onClick={connectWallet}>
          {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "CONNECT WALLET"}
        </button>
      </header>

      {/* TABS */}
      <nav className="nav-tabs">
        <button className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setActiveTab('track')}>CONSUMER TRACKING</button>
        <button className={`tab-btn ${activeTab === 'producer' ? 'active' : ''}`} onClick={() => setActiveTab('producer')}>PRODUCER</button>
        <button className={`tab-btn ${activeTab === 'authority' ? 'active' : ''}`} onClick={() => setActiveTab('authority')}>HALAL AUTHORITY</button>
        <button className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`} onClick={() => setActiveTab('transfer')}>LOGISTICS</button>
      </nav>

      {/* CONTENT AREA */}
      <main className="glass-card">
        
        {/* VIEW 1: TRACKING */}
        {activeTab === 'track' && (
          <div>
            <h2>Trace Provenance</h2>
            <p style={{color: '#888', marginBottom:'20px'}}>Enter the Batch ID to verify authenticity and Halal status.</p>
            <div className="input-group">
              <label>Batch ID</label>
              <input 
                type="text" 
                placeholder="e.g. WAGYU-001" 
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
              />
            </div>
            <button className="action-btn" onClick={handleTrack}>VERIFY BATCH</button>

            {batchData && (
              <div className="result-box">
                <div className="result-row"><span>Product Name</span><span>{batchData.name}</span></div>
                <div className="result-row"><span>Grade</span><span style={{color: 'var(--gold-primary)'}}>{batchData.grade}</span></div>
                <div className="result-row"><span>Origin</span><span>{batchData.origin}</span></div>
                <div className="result-row"><span>Status</span><span>{batchData.status}</span></div>
                <div className="result-row"><span>Halal Cert (JP)</span><span>{batchData.certJP || "Pending"}</span></div>
                <div className="result-row"><span>Current Owner</span><span style={{fontSize:'0.8rem'}}>{batchData.owner}</span></div>
                <div className="result-row"><span>Created At</span><span>{batchData.date}</span></div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCER */}
        {activeTab === 'producer' && (
          <div>
            <h2>Origin Creation</h2>
            <div className="input-group">
              <label>New Batch ID</label>
              <input type="text" value={newBatchId} onChange={(e) => setNewBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Product Name</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Origin</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Grade (e.g. A5)</label>
              <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleCreate}>MINT BATCH ON CHAIN</button>
          </div>
        )}

        {/* VIEW 3: AUTHORITY */}
        {activeTab === 'authority' && (
          <div>
            <h2>Halal Certification</h2>
            <div className="input-group">
              <label>Target Batch ID</label>
              <input type="text" value={authBatchId} onChange={(e) => setAuthBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Certificate Hash (IPFS)</label>
              <input type="text" placeholder="Qm..." value={certHash} onChange={(e) => setCertHash(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleCertify}>APPROVE CERTIFICATION</button>
          </div>
        )}

        {/* VIEW 4: TRANSFER */}
        {activeTab === 'transfer' && (
          <div>
            <h2>Transfer Ownership</h2>
            <div className="input-group">
              <label>Batch ID</label>
              <input type="text" value={transBatchId} onChange={(e) => setTransBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>New Owner Address</label>
              <input type="text" placeholder="0x..." value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleTransfer}>TRANSFER ASSET</button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;