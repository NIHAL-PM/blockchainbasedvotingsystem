import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractAddress = "0x9B820855582e2E8F40d57292B45d3B41ceB8ff5d";

const contractABI = [
  "function owner() view returns (address)",
  "function pollingOfficers(address) view returns (bool)",
  "function authorizeOfficer(address _officer)"
];

async function checkContractDetails() {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        
        if (!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY not found in .env file");
        }
        
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const currentAddress = wallet.address;
        
        console.log("Checking contract details...");
        console.log("Current wallet address:", currentAddress);
        console.log("Contract address:", contractAddress);
        
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        // Check contract owner
        const owner = await contract.owner();
        console.log("Contract owner:", owner);
        
        // Check if current wallet is owner
        const isOwner = owner.toLowerCase() === currentAddress.toLowerCase();
        console.log("Is current wallet owner?", isOwner);
        
        // Check if current wallet is already authorized
        const isOfficer = await contract.pollingOfficers(currentAddress);
        console.log("Is current wallet polling officer?", isOfficer);
        
        if (isOwner && !isOfficer) {
            console.log("\n📝 Current wallet is owner, authorizing as polling officer...");
            const contractWithSigner = contract.connect(wallet);
            const tx = await contractWithSigner.authorizeOfficer(currentAddress);
            console.log("Transaction hash:", tx.hash);
            await tx.wait();
            console.log("✅ Successfully authorized owner as polling officer");
        } else if (!isOwner) {
            console.log("\n❌ Current wallet is not the contract owner");
            console.log("Only the owner can authorize polling officers");
            console.log("Contract owner:", owner);
        } else if (isOfficer) {
            console.log("\n✅ Current wallet is already authorized as polling officer");
        }
        
    } catch (error) {
        console.error("❌ Error checking contract:", error.message);
        process.exit(1);
    }
}

checkContractDetails();