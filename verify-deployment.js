import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractAddress = "0xFa5C03Ba5e1983447AfF75ed1A70373323AE0E18";

// Complete ABI from the actual contract
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "officer",
                "type": "address"
            }
        ],
        "name": "OfficerAuthorized",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "voterIdHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "constituencyId",
                "type": "uint256"
            }
        ],
        "name": "VoterRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "voterIdHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "constituencyId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "candidateId",
                "type": "uint256"
            }
        ],
        "name": "VoteCast",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "constituencies",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_officer",
                "type": "address"
            }
        ],
        "name": "authorizeOfficer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_voterId",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_constituencyId",
                "type": "uint256"
            }
        ],
        "name": "registerVoter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_voterId",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "castVote",
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
        "name": "pollingOfficers",
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
        "inputs": [],
        "name": "owner",
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
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "voterRegistry",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "voterIdHash",
                "type": "bytes32"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "constituencyId",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isRegistered",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "hasVoted",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "voteCounts",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function verifyDeployment() {
    console.log("🔍 VERIFYING CONTRACT DEPLOYMENT...");
    console.log("=".repeat(50));
    
    try {
        const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
        
        // Check if contract exists
        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
            console.error("❌ CONTRACT NOT FOUND AT ADDRESS:", contractAddress);
            return false;
        }
        
        console.log("✅ Contract found at address:", contractAddress);
        console.log("📏 Contract bytecode length:", code.length, "characters");
        
        // Get deployer wallet
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            console.error("❌ PRIVATE_KEY not found in .env");
            return false;
        }
        
        const wallet = new ethers.Wallet(privateKey, provider);
        const deployerAddress = wallet.address;
        
        console.log("👤 Deployer address:", deployerAddress);
        
        // Create contract instance with complete ABI
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        // Check if deployer is polling officer
        const isOfficer = await contract.pollingOfficers(deployerAddress);
        console.log("🛡️  Deployer is polling officer:", isOfficer);
        
        // Check contract owner
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        // Check constituencies
        console.log("📍 Constituencies:");
        for (let i = 0; i < 5; i++) {
            try {
                const constituency = await contract.constituencies(i);
                console.log(`   ${i}: ${constituency}`);
            } catch (error) {
                console.log(`   ${i}: ERROR - ${error.message}`);
            }
        }
        
        console.log("\n" + "=".repeat(50));
        console.log("🎯 FINAL VERIFICATION RESULTS:");
        console.log("Contract Address:", contractAddress);
        console.log("Deployer Address:", deployerAddress);
        console.log("Contract Owner:", owner);
        console.log("Deployer is Officer:", isOfficer);
        
        // Verify all conditions
        const ownerMatches = owner.toLowerCase() === deployerAddress.toLowerCase();
        const isAuthorized = isOfficer === true;
        const contractExists = code !== "0x";
        
        console.log("\n📋 VERIFICATION CHECKLIST:");
        console.log("✅ Contract exists:", contractExists);
        console.log("✅ Owner matches deployer:", ownerMatches);
        console.log("✅ Deployer is polling officer:", isAuthorized);
        
        if (contractExists && ownerMatches && isAuthorized) {
            console.log("\n🎉 ALL VERIFICATIONS PASSED!");
            console.log("✅ SYSTEM IS FULLY OPERATIONAL");
            console.log("✅ NO SIMULATION - REAL DEPLOYMENT CONFIRMED");
            console.log("✅ POLLING OFFICER ACCESS VERIFIED");
            console.log("\n🚀 READY TO USE:");
            console.log("   📱 Open: http://localhost:5173");
            console.log("   🔗 Network: Avalanche Fuji Testnet");
            console.log("   👤 Your wallet is authorized as Polling Officer");
            return true;
        } else {
            console.log("\n❌ VERIFICATION FAILED");
            console.log("⚠️  Contract deployment may need attention");
            return false;
        }
        
    } catch (error) {
        console.error("❌ VERIFICATION ERROR:", error.message);
        console.error("Stack:", error.stack);
        return false;
    }
}

verifyDeployment()
    .then(success => {
        if (success) {
            console.log("\n🎉 DEPLOYMENT VERIFICATION COMPLETE");
        } else {
            console.log("\n⚠️  DEPLOYMENT NEEDS ATTENTION");
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error("❌ UNEXPECTED ERROR:", error);
        process.exit(1);
    });