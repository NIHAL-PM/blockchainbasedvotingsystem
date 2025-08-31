import { ethers } from "ethers";
import { readFileSync } from "fs";
import { join } from "path";

// Generate the correct ABI from the contract source
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
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "constituencies",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_officer", "type": "address"}],
    "name": "authorizeOfficer",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "pollingOfficers",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
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
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

console.log("Correct ABI generated");
console.log("ABI length:", contractABI.length, "functions");

// Now let's check the current contract with this correct ABI
async function checkWithCorrectABI() {
    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const contract = new ethers.Contract("0x9B820855582e2E8F40d57292B45d3B41ceB8ff5d", contractABI, provider);
    
    try {
        const owner = await contract.owner();
        console.log("Contract owner:", owner);
        
        const isOfficer = await contract.pollingOfficers("0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386");
        console.log("Is 0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386 polling officer?", isOfficer);
        
        const constituency0 = await contract.constituencies(0);
        console.log("Constituency 0:", constituency0);
        
    } catch (error) {
        console.error("Error with contract:", error.message);
    }
}

checkWithCorrectABI();