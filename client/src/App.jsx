import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = import.meta?.env?.VITE_CONTRACT_ADDRESS || "0x434dD1D40981C8cCDc6453d4f24bA63d9AdeC078";
const EXPECTED_CHAIN_ID = 11155111; // Sepolia
const EXPECTED_NETWORK_NAME = "Sepolia";
const EXPECTED_CHAIN_ID_HEX = "0xaa36a7"; // 11155111

// --- ABI (Full ABI from artifacts) ---
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "producer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BatchCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BatchTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "halalAuthority",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "certHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "HalalCertifiedJP",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newStatus",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "updatedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "addDistributor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "addHalalAuthority",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "addProducer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "addRetailer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "batches",
    "outputs": [
      {
        "internalType": "string",
        "name": "productName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "origin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "grade",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "producerAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "currentOwner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "halalCertJP",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "halalCertMY",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "createdAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "productName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "origin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "grade",
        "type": "string"
      }
    ],
    "name": "createBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "distributor",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      }
    ],
    "name": "getBatch",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "halalAuthority",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "producer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "retailer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "certHash",
        "type": "string"
      }
    ],
    "name": "setHalalCertJP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "transferBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "batchId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "newStatus",
        "type": "string"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function App() {
  // --- STATE ---
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('track'); // track, producer, authority, distributor, retailer, admin

  const [chainId, setChainId] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [adminAddress, setAdminAddress] = useState(null);
  const [roles, setRoles] = useState({
    isAdmin: false,
    producer: false,
    halalAuthority: false,
    distributor: false,
    retailer: false,
  });
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [uiError, setUiError] = useState("");

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

  // Owner Status Form (Distributor/Retailer/Owner)
  const [statusBatchId, setStatusBatchId] = useState("");
  const [newStatus, setNewStatus] = useState("In Transit");

  // Admin Form
  const [roleAddress, setRoleAddress] = useState("");

  const getReadableError = (err) => {
    if (!err) return "Unknown error";
    if (typeof err === 'string') return err;
    if (err?.shortMessage) return err.shortMessage;
    const msg = err?.info?.error?.message || err?.message;
    if (!msg) return "Transaction failed";
    return msg;
  };

  const refreshRoles = async (_contract, _account) => {
    if (!_contract || !_account) return;
    setIsLoadingRoles(true);
    try {
      const [admin, isProducer, isAuthority, isDistributor, isRetailer] = await Promise.all([
        _contract.admin(),
        _contract.producer(_account),
        _contract.halalAuthority(_account),
        _contract.distributor(_account),
        _contract.retailer(_account),
      ]);
      setAdminAddress(admin);
      setRoles({
        isAdmin: admin?.toLowerCase?.() === _account.toLowerCase(),
        producer: Boolean(isProducer),
        halalAuthority: Boolean(isAuthority),
        distributor: Boolean(isDistributor),
        retailer: Boolean(isRetailer),
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const connect = async ({ requestAccounts } = { requestAccounts: true }) => {
    setUiError("");
    if (!window.ethereum) {
      setUiError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      if (requestAccounts) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }

      const _provider = new ethers.BrowserProvider(window.ethereum);
      const net = await _provider.getNetwork();
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setChainId(Number(net.chainId));
      setNetworkName(net.name);

      // Stop here if user is on the wrong network.
      if (Number(net.chainId) !== EXPECTED_CHAIN_ID) {
        setContract(null);
        setAdminAddress(null);
        setRoles({
          isAdmin: false,
          producer: false,
          halalAuthority: false,
          distributor: false,
          retailer: false,
        });
        setUiError(`Wrong network. Please switch MetaMask to ${EXPECTED_NETWORK_NAME}.`);
        return;
      }

      // Ensure there is contract code at this address on this network.
      const code = await _provider.getCode(CONTRACT_ADDRESS);
      if (!code || code === '0x') {
        setContract(null);
        setUiError(`No contract found at ${CONTRACT_ADDRESS} on ${EXPECTED_NETWORK_NAME}. Check your deployed contract address.`);
        return;
      }

      const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
      setContract(_contract);

      await refreshRoles(_contract, _account);
    } catch (err) {
      console.error(err);
      setUiError(getReadableError(err));
    }
  };

  // --- CONNECT WALLET ---
  const connectWallet = async () => {
    await connect({ requestAccounts: true });
  };

  const switchToSepolia = async () => {
    setUiError("");
    if (!window.ethereum) {
      setUiError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_ID_HEX }],
      });
      await connect({ requestAccounts: false });
    } catch (err) {
      // 4902 = chain not added to MetaMask
      if (err?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: EXPECTED_CHAIN_ID_HEX,
                chainName: 'Sepolia',
                rpcUrls: ['https://rpc.sepolia.org'],
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          await connect({ requestAccounts: false });
          return;
        } catch (addErr) {
          console.error(addErr);
          setUiError(getReadableError(addErr));
          return;
        }
      }

      console.error(err);
      setUiError(getReadableError(err));
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = () => {
      connect({ requestAccounts: false });
    };
    const handleChainChanged = () => {
      // MetaMask recommends reloading on chain change
      window.location.reload();
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    (async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts?.length) {
          await connect({ requestAccounts: false });
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FUNCTIONS ---

  const isWrongNetwork = chainId != null && chainId !== EXPECTED_CHAIN_ID;

  // 1. Track Batch (Read Only)
  const handleTrack = async () => {
    if (!contract) return alert("Connect wallet on Sepolia first");
    if (isWrongNetwork) return alert(`Wrong network. Switch to ${EXPECTED_NETWORK_NAME}.`);
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
      alert(getReadableError(err));
    }
  };

  // 2. Create Batch (Producer)
  const handleCreate = async () => {
    if (!contract) return;
    if (isWrongNetwork) return alert(`Wrong network. Switch to ${EXPECTED_NETWORK_NAME}.`);
    try {
      const tx = await contract.createBatch(newBatchId, productName, origin, grade);
      await tx.wait();
      alert(`Batch ${newBatchId} Created Successfully!`);
      await refreshRoles(contract, account);
    } catch (err) {
      console.error(err);
      alert(getReadableError(err));
    }
  };

  // 3. Certify (Authority)
  const handleCertify = async () => {
    if (!contract) return;
    if (isWrongNetwork) return alert(`Wrong network. Switch to ${EXPECTED_NETWORK_NAME}.`);
    try {
      const tx = await contract.setHalalCertJP(authBatchId, certHash);
      await tx.wait();
      alert(`Batch ${authBatchId} Certified!`);
      await refreshRoles(contract, account);
    } catch (err) {
      console.error(err);
      alert(getReadableError(err));
    }
  };

  // 4. Transfer (Owner)
  const handleTransfer = async () => {
    if (!contract) return;
    if (isWrongNetwork) return alert(`Wrong network. Switch to ${EXPECTED_NETWORK_NAME}.`);
    try {
      const tx = await contract.transferBatch(transBatchId, newOwner);
      await tx.wait();
      alert(`Ownership Transferred to ${newOwner}`);
    } catch (err) {
      console.error(err);
      alert(getReadableError(err));
    }
  };

  const handleUpdateStatus = async () => {
    if (!contract) return;
    if (isWrongNetwork) return alert(`Wrong network. Switch to ${EXPECTED_NETWORK_NAME}.`);
    try {
      const tx = await contract.updateStatus(statusBatchId, newStatus);
      await tx.wait();
      alert(`Status updated for ${statusBatchId}`);
    } catch (err) {
      console.error(err);
      alert(getReadableError(err));
    }
  };

  const handleAdminGrant = async (role) => {
    if (!contract) return;
    if (!roles.isAdmin) return alert("Only admin can assign roles.");
    if (!ethers.isAddress(roleAddress)) return alert("Enter a valid wallet address.");
    try {
      let tx;
      if (role === 'producer') tx = await contract.addProducer(roleAddress);
      else if (role === 'authority') tx = await contract.addHalalAuthority(roleAddress);
      else if (role === 'distributor') tx = await contract.addDistributor(roleAddress);
      else if (role === 'retailer') tx = await contract.addRetailer(roleAddress);
      else throw new Error('Unknown role');

      await tx.wait();
      alert(`Role granted successfully`);
      await refreshRoles(contract, account);
    } catch (err) {
      console.error(err);
      alert(getReadableError(err));
    }
  };

  return (
    <div className="app-container">
      
      {/* HEADER */}
      <header>
        <div>
          <h1 className="brand-title">Wagyu Chain</h1>
          <span style={{color: 'var(--gold-dim)', letterSpacing:'1px'}}>PREMIUM HALAL TRACKING</span>
          <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#888' }}>
            Network: {networkName || '—'} {chainId ? `(chainId ${chainId})` : ''}
            {chainId && chainId !== EXPECTED_CHAIN_ID ? (
              <span style={{ marginLeft: '10px', color: '#ff6b6b' }}>
                Wrong network (switch to {EXPECTED_NETWORK_NAME})
              </span>
            ) : null}
          </div>
          {account ? (
            <div style={{ marginTop: '6px', fontSize: '0.85rem', color: '#888' }}>
              Roles: 
              <span style={{ marginLeft: 6, color: roles.producer ? 'var(--gold-primary)' : '#666' }}>Producer</span>
              <span style={{ marginLeft: 10, color: roles.halalAuthority ? 'var(--gold-primary)' : '#666' }}>Authority</span>
              <span style={{ marginLeft: 10, color: roles.distributor ? 'var(--gold-primary)' : '#666' }}>Distributor</span>
              <span style={{ marginLeft: 10, color: roles.retailer ? 'var(--gold-primary)' : '#666' }}>Retailer</span>
              <span style={{ marginLeft: 10, color: roles.isAdmin ? 'var(--gold-primary)' : '#666' }}>Admin</span>
              {isLoadingRoles ? <span style={{ marginLeft: 10 }}>(loading...)</span> : null}
            </div>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isWrongNetwork ? (
            <button className="wallet-btn" onClick={switchToSepolia}>
              SWITCH TO SEPOLIA
            </button>
          ) : null}
          <button className="wallet-btn" onClick={connectWallet}>
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "CONNECT WALLET"}
          </button>
        </div>
      </header>

      {uiError ? (
        <div className="glass-card" style={{ marginTop: '12px', padding: '14px', color: '#ff6b6b' }}>
          {uiError}
        </div>
      ) : null}

      {/* TABS */}
      <nav className="nav-tabs">
        <button className={`tab-btn ${activeTab === 'track' ? 'active' : ''}`} onClick={() => setActiveTab('track')}>CONSUMER TRACKING</button>
        <button className={`tab-btn ${activeTab === 'producer' ? 'active' : ''}`} onClick={() => setActiveTab('producer')}>PRODUCER</button>
        <button className={`tab-btn ${activeTab === 'authority' ? 'active' : ''}`} onClick={() => setActiveTab('authority')}>HALAL AUTHORITY</button>
        <button className={`tab-btn ${activeTab === 'distributor' ? 'active' : ''}`} onClick={() => setActiveTab('distributor')}>DISTRIBUTOR</button>
        <button className={`tab-btn ${activeTab === 'retailer' ? 'active' : ''}`} onClick={() => setActiveTab('retailer')}>RETAILER</button>
        <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>ADMIN</button>
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
            <p style={{color: '#888', marginBottom:'20px'}}>Requires Producer role.</p>
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
            <button
              className="action-btn"
              onClick={handleCreate}
              disabled={!account || chainId !== EXPECTED_CHAIN_ID || !roles.producer}
              title={!roles.producer ? 'You need Producer role' : ''}
            >
              MINT BATCH ON CHAIN
            </button>
          </div>
        )}

        {/* VIEW 3: AUTHORITY */}
        {activeTab === 'authority' && (
          <div>
            <h2>Halal Certification</h2>
            <p style={{color: '#888', marginBottom:'20px'}}>Requires Halal Authority role.</p>
            <div className="input-group">
              <label>Target Batch ID</label>
              <input type="text" value={authBatchId} onChange={(e) => setAuthBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Certificate Hash (IPFS)</label>
              <input type="text" placeholder="Qm..." value={certHash} onChange={(e) => setCertHash(e.target.value)} />
            </div>
            <button
              className="action-btn"
              onClick={handleCertify}
              disabled={!account || chainId !== EXPECTED_CHAIN_ID || !roles.halalAuthority}
              title={!roles.halalAuthority ? 'You need Halal Authority role' : ''}
            >
              APPROVE CERTIFICATION
            </button>
          </div>
        )}

        {/* VIEW 4: DISTRIBUTOR */}
        {activeTab === 'distributor' && (
          <div>
            <h2>Distributor Operations</h2>
            <p style={{color: '#888', marginBottom:'20px'}}>
              Note: the smart contract currently enforces <b>current owner</b> for status/transfer. Distributor role is tracked on-chain, but ownership is what matters for these actions.
            </p>

            <div className="input-group">
              <label>Batch ID (for status update)</label>
              <input type="text" value={statusBatchId} onChange={(e) => setStatusBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>New Status</label>
              <input type="text" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleUpdateStatus} disabled={!account || chainId !== EXPECTED_CHAIN_ID}>
              UPDATE STATUS
            </button>

            <hr style={{ margin: '20px 0', opacity: 0.2 }} />

            <h3 style={{ marginBottom: '10px' }}>Transfer Ownership</h3>
            <div className="input-group">
              <label>Batch ID</label>
              <input type="text" value={transBatchId} onChange={(e) => setTransBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>New Owner Address</label>
              <input type="text" placeholder="0x..." value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleTransfer} disabled={!account || chainId !== EXPECTED_CHAIN_ID}>
              TRANSFER ASSET
            </button>
          </div>
        )}

        {/* VIEW 5: RETAILER */}
        {activeTab === 'retailer' && (
          <div>
            <h2>Retailer Operations</h2>
            <p style={{color: '#888', marginBottom:'20px'}}>
              Note: the smart contract currently enforces <b>current owner</b> for status/transfer. Retailer role is tracked on-chain, but ownership is what matters for these actions.
            </p>

            <div className="input-group">
              <label>Batch ID (for status update)</label>
              <input type="text" value={statusBatchId} onChange={(e) => setStatusBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>New Status</label>
              <input type="text" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleUpdateStatus} disabled={!account || chainId !== EXPECTED_CHAIN_ID}>
              UPDATE STATUS
            </button>

            <hr style={{ margin: '20px 0', opacity: 0.2 }} />

            <h3 style={{ marginBottom: '10px' }}>Transfer Ownership</h3>
            <div className="input-group">
              <label>Batch ID</label>
              <input type="text" value={transBatchId} onChange={(e) => setTransBatchId(e.target.value)} />
            </div>
            <div className="input-group">
              <label>New Owner Address</label>
              <input type="text" placeholder="0x..." value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
            </div>
            <button className="action-btn" onClick={handleTransfer} disabled={!account || chainId !== EXPECTED_CHAIN_ID}>
              TRANSFER ASSET
            </button>
          </div>
        )}

        {/* VIEW 6: ADMIN */}
        {activeTab === 'admin' && (
          <div>
            <h2>Admin Panel</h2>
            <p style={{color: '#888', marginBottom:'20px'}}>
              Admin address: <span style={{ fontSize: '0.85rem' }}>{adminAddress || '—'}</span>
            </p>
            <p style={{color: '#888', marginBottom:'20px'}}>
              Only the contract admin can assign roles. If you are not the admin, switch MetaMask to the deployer wallet.
            </p>

            <div className="input-group">
              <label>Wallet Address to Grant Role</label>
              <input type="text" placeholder="0x..." value={roleAddress} onChange={(e) => setRoleAddress(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="action-btn" onClick={() => handleAdminGrant('producer')} disabled={!account || chainId !== EXPECTED_CHAIN_ID || !roles.isAdmin}>
                GRANT PRODUCER
              </button>
              <button className="action-btn" onClick={() => handleAdminGrant('authority')} disabled={!account || chainId !== EXPECTED_CHAIN_ID || !roles.isAdmin}>
                GRANT AUTHORITY
              </button>
              <button className="action-btn" onClick={() => handleAdminGrant('distributor')} disabled={!account || chainId !== EXPECTED_CHAIN_ID || !roles.isAdmin}>
                GRANT DISTRIBUTOR
              </button>
              <button className="action-btn" onClick={() => handleAdminGrant('retailer')} disabled={!account || chainId !== EXPECTED_CHAIN_ID || !roles.isAdmin}>
                GRANT RETAILER
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button className="action-btn" onClick={() => refreshRoles(contract, account)} disabled={!contract || !account}>
                REFRESH ROLES
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;