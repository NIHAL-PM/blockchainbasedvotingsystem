import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractAddress = "0x79ac7a68077295d0b62379f3933171Bb05FD040F";

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
  }
];

async function verifyDeployment() {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        
        console.log("🔍 Verifying new contract deployment...");
        console.log("Contract address:", contractAddress);
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        // Check contract bytecode
        const bytecode = await provider.getCode(contractAddress);
        console.log("📊 Bytecode length:", bytecode.length);
        console.log("📊 Contract exists:", bytecode !== "0x");
        
        // Check owner
        try {
            const owner = await contract.owner();
            console.log("👑 Contract owner:", owner);
        } catch (error) {
            console.log("❌ Could not get owner:", error.message);
        }
        
        // Check if deployer is polling officer
        const deployerAddress = "0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386";
        try {
            const isOfficer = await contract.pollingOfficers(deployerAddress);
            console.log("✅ Is deployer polling officer?", isOfficer);
            
            if (isOfficer) {
                console.log("🎉 SUCCESS: Your wallet is authorized as a polling officer!");
            } else {
                console.log("❌ Your wallet is NOT authorized as a polling officer");
            }
        } catch (error) {
            console.log("❌ Could not check polling officer status:", error.message);
        }
        
        // Check constituencies
        try {
            const constituency0 = await contract.constituencies(0);
            console.log("📍 Constituency 0:", constituency0);
            
            const constituency1 = await contract.constituencies(1);
            console.log("📍 Constituency 1:", constituency1);
        } catch (error) {
            console.log("❌ Could not get constituencies:", error.message);
        }
        
    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }
}

verifyDeployment();