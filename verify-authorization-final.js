import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

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

const contractAddress = "0xEcD69589a7B4dD60B018725B551F1374B944ea4f";

async function verifyAuthorization() {
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY not found in .env file");
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("🔍 Verifying authorization for wallet:", wallet.address);
    console.log("📍 Contract:", contractAddress);

    try {
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Check current owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        // Check if wallet is polling officer
        const isPollingOfficer = await contract.pollingOfficers(wallet.address);
        console.log("✅ Is polling officer:", isPollingOfficer);
        
        if (!isPollingOfficer) {
            console.log("📝 Attempting to authorize wallet...");
            
            // Check if wallet is owner
            if (wallet.address.toLowerCase() === owner.toLowerCase()) {
                console.log("🎯 Wallet is owner, authorizing...");
                const tx = await contract.authorizeOfficer(wallet.address, {
                    gasLimit: 100000
                });
                console.log("⏳ Authorization transaction:", tx.hash);
                await tx.wait();
                console.log("✅ Successfully authorized as polling officer!");
                
                // Verify again
                const newStatus = await contract.pollingOfficers(wallet.address);
                console.log("🔍 New polling officer status:", newStatus);
            } else {
                console.log("❌ Wallet is not owner, cannot authorize");
            }
        } else {
            console.log("✅ Wallet is already authorized as polling officer!");
        }
        
    } catch (error) {
        console.error("❌ Error during verification:", error.message);
        
        // Try a more basic check
        try {
            const code = await provider.getCode(contractAddress);
            console.log("📄 Contract bytecode length:", code.length);
            if (code === "0x") {
                console.log("❌ No contract at this address");
            } else {
                console.log("✅ Contract exists at address");
            }
        } catch (codeError) {
            console.log("❌ Could not get contract code:", codeError.message);
        }
    }
}

verifyAuthorization();