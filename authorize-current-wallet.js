import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "_officer", "type": "address"}],
    "name": "authorizeOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const contractAddress = "0x1aFbe8C733b3703cA4e9b6AB30B84D117ee4Ab3e";

async function authorizeCurrentWallet() {
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY not found in .env file");
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("🔐 Authorizing wallet as polling officer...");
    console.log("📍 Wallet address:", wallet.address);
    console.log("📍 Contract:", contractAddress);
    
    try {
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Check if already authorized
        const isAlreadyOfficer = await contract.pollingOfficers(wallet.address);
        if (isAlreadyOfficer) {
            console.log("✅ Wallet is already authorized as polling officer!");
            return;
        }
        
        // Check if wallet is the owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        if (wallet.address.toLowerCase() !== owner.toLowerCase()) {
            console.log("❌ Only the contract owner can authorize polling officers");
            console.log("💡 Current wallet:", wallet.address);
            console.log("💡 Contract owner:", owner);
            return;
        }
        
        console.log("📝 Authorizing wallet as polling officer...");
        const tx = await contract.authorizeOfficer(wallet.address);
        console.log("⏳ Transaction submitted:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Successfully authorized! Transaction confirmed in block:", receipt.blockNumber);
        
        // Verify authorization
        const isNowOfficer = await contract.pollingOfficers(wallet.address);
        console.log("✅ Verification - Is now polling officer:", isNowOfficer);
        
    } catch (error) {
        console.error("❌ Error authorizing wallet:", error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💡 Get test AVAX from: https://faucet.avax.network/");
        }
        process.exit(1);
    }
}

authorizeCurrentWallet();