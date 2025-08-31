import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config();

const contractAddress = "0x9B820855582e2E8F40d57292B45d3B41ceB8ff5d";

// Read ABI from contract
const contractPath = join(process.cwd(), "contracts", "OnChainRegistry.sol");
const contractSource = readFileSync(contractPath, "utf8");

// Use the same ABI as in blockchain.js
const contractABI = [
  "constructor()",
  "function authorizeOfficer(address _officer)",
  "function registerVoter(string _voterId, string _name, uint256 _constituencyId)",
  "function castVote(string _voterId, uint256 _candidateId)",
  "function pollingOfficers(address) view returns (bool)",
  "function voterRegistry(bytes32) view returns (bytes32 voterIdHash, string name, uint256 constituencyId, bool isRegistered, bool hasVoted)",
  "function voteCounts(uint256, uint256) view returns (uint256)",
  "function constituencies(uint256) view returns (string)",
  "function owner() view returns (address)",
  "event OfficerAuthorized(address indexed officer)",
  "event VoterRegistered(bytes32 indexed voterIdHash, uint256 constituencyId)",
  "event VoteCast(bytes32 indexed voterIdHash, uint256 constituencyId, uint256 candidateId)"
];

async function authorizeDeployer() {
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        
        if (!process.env.PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY not found in .env file");
        }
        
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const deployerAddress = wallet.address;
        
        console.log("Authorizing deployer as polling officer...");
        console.log("Deployer address:", deployerAddress);
        console.log("Contract address:", contractAddress);
        
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Check if already authorized
        try {
            const isAlreadyOfficer = await contract.pollingOfficers(deployerAddress);
            if (isAlreadyOfficer) {
                console.log("✅ Deployer is already authorized as polling officer");
                return;
            }
        } catch (error) {
            console.log("Could not check polling officer status, proceeding with authorization...");
        }
        
        // Authorize the deployer
        console.log("Sending authorization transaction...");
        const tx = await contract.authorizeOfficer(deployerAddress);
        console.log("Transaction hash:", tx.hash);
        
        console.log("Waiting for confirmation...");
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        
        // Verify authorization
        const isOfficer = await contract.pollingOfficers(deployerAddress);
        console.log("✅ Authorization successful! Deployer is now a polling officer:", isOfficer);
        
    } catch (error) {
        console.error("❌ Error authorizing deployer:", error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💡 Get test AVAX from: https://faucet.avax.network/");
        }
        process.exit(1);
    }
}

authorizeDeployer();