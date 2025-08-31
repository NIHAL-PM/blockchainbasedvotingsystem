import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractAddress = "0xF0bf6C176E92f461149179dD96b7C7A6834d4A81";

const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "_officer", "type": "address"}],
    "name": "authorizeOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "constituencies",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "pollingOfficers",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_voterId", "type": "string"}, {"internalType": "string", "name": "_name", "type": "string"}, {"internalType": "uint256", "name": "_constituencyId", "type": "uint256"}],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_voterId", "type": "string"}, {"internalType": "uint256", "name": "_candidateId", "type": "uint256"}],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "name": "voterRegistry",
    "outputs": [
      {"internalType": "bytes32", "name": "voterIdHash", "type": "bytes32"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "constituencyId", "type": "uint256"},
      {"internalType": "bool", "name": "isRegistered", "type": "bool"},
      {"internalType": "bool", "name": "hasVoted", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "voteCounts",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function finalVerification() {
    console.log("🔍 Final verification of OnChainRegistry deployment...");
    console.log("Contract address:", contractAddress);
    console.log("Wallet address: 0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386");
    
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        // Check bytecode
        const bytecode = await provider.getCode(contractAddress);
        console.log("📊 Bytecode length:", bytecode.length);
        console.log("📊 Contract exists:", bytecode !== "0x");
        
        // Check owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        // Check if wallet is polling officer
        const isOfficer = await contract.pollingOfficers("0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386");
        console.log("✅ Is wallet polling officer?", isOfficer);
        
        // Check constituencies
        const constituency0 = await contract.constituencies(0);
        const constituency1 = await contract.constituencies(1);
        console.log("📍 Constituency 0:", constituency0);
        console.log("📍 Constituency 1:", constituency1);
        
        if (isOfficer) {
            console.log("\n🎉 SUCCESS! Your wallet is now authorized as a polling officer!");
            console.log("\n💡 You can now use the dashboard to:");
            console.log("   - Register voters");
            console.log("   - Cast votes");
            console.log("   - View election results");
        } else {
            console.log("\n❌ Your wallet is not yet authorized as a polling officer");
        }
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

// Wait a bit then verify
setTimeout(finalVerification, 10000);