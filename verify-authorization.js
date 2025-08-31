import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "pollingOfficers",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
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
    "inputs": [{"internalType": "address", "name": "_officer", "type": "address"}],
    "name": "authorizeOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0x1aFbe8C733b3703cA4e9b6AB30B84D117ee4Ab3e";

async function verifyAuthorization() {
    if (!process.env.PRIVATE_KEY) {
        console.error("PRIVATE_KEY not found in .env file");
        return;
    }

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("🔍 Verifying authorization for wallet:", wallet.address);
    console.log("📍 Contract:", contractAddress);
    
    try {
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Check if wallet is polling officer
        const isOfficer = await contract.pollingOfficers(wallet.address);
        console.log("✅ Is polling officer:", isOfficer);
        
        // Check contract owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        if (!isOfficer && wallet.address.toLowerCase() === owner.toLowerCase()) {
            console.log("📝 Authorizing deployer as polling officer...");
            const tx = await contract.authorizeOfficer(wallet.address);
            console.log("⏳ Transaction:", tx.hash);
            await tx.wait();
            console.log("✅ Successfully authorized!");
        } else if (!isOfficer) {
            console.log("❌ Wallet is not the contract owner - cannot authorize");
        } else {
            console.log("✅ Wallet is already authorized!");
        }
        
    } catch (error) {
        console.error("❌ Error verifying authorization:", error.message);
    }
}

verifyAuthorization();