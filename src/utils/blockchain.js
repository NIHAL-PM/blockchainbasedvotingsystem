import { ethers } from "ethers";

const contractAddress = "0x094359634f5EBcc8076a5A7cf722764170Aae8C9";
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
  }
];

let provider;
let signer;
let contract;

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId !== 43113) {
                throw new Error("Please connect to Avalanche Fuji Testnet");
            }
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            const address = await signer.getAddress();
            // If contract ABI/address not set, pollingOfficers call will fail - handle gracefully
            let isOfficer = false;
            try {
                isOfficer = contract.pollingOfficers ? await contract.pollingOfficers(address) : false;
            } catch (err) {
                console.warn("Could not read pollingOfficers from contract:", err.message || err);
                isOfficer = false;
            }
            return { address, isOfficer };
        } catch (error) {
            console.error("Error connecting wallet:", error);
            return { address: null, isOfficer: false, error: error.message };
        }
    } else {
        return { address: null, isOfficer: false, error: "Please install MetaMask" };
    }
};

export const registerVoterOnChain = async (voterId, name, constituencyId) => {
    if (!contract) {
        return { success: false, message: "Contract not initialized" };
    }
    try {
        const tx = await contract.registerVoter(voterId, name, constituencyId);
        await tx.wait();
        return { success: true, message: "Voter registered successfully!" };
    } catch (error) {
        console.error("Error registering voter:", error);
        return { success: false, message: error.reason || error.message || "Failed to register voter" };
    }
};

export const castVoteOnChain = async (voterId, candidateId) => {
    if (!contract) {
        return { success: false, message: "Contract not initialized" };
    }
    try {
        const tx = await contract.castVote(voterId, candidateId);
        await tx.wait();
        return { success: true, message: "Vote cast successfully!" };
    } catch (error) {
        console.error("Error casting vote:", error);
        return { success: false, message: error.reason || error.message || "Failed to cast vote" };
    }
};

export const getVoterInfo = async (voterId) => {
    if (!contract) {
        return { success: false, message: "Contract not initialized" };
    }
    try {
        const voterIdHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(voterId));
        const voterData = await contract.voterRegistry(voterIdHash);
        // voterData is a struct: (voterIdHash, name, constituencyId, isRegistered, hasVoted)
        return { success: true, data: {
            voterIdHash: voterData.voterIdHash,
            name: voterData.name,
            constituencyId: Number(voterData.constituencyId),
            isRegistered: voterData.isRegistered,
            hasVoted: voterData.hasVoted
        } };
    } catch (error) {
        console.error("Error fetching voter info:", error);
        return { success: false, message: error.message || "Failed to fetch voter info" };
    }
};

export const authorizeOfficerOnChain = async (officerAddress) => {
    if (!contract) {
        return { success: false, message: "Contract not initialized" };
    }
    try {
        const tx = await contract.authorizeOfficer(officerAddress);
        await tx.wait();
        return { success: true, message: "Officer authorized successfully!" };
    } catch (error) {
        console.error("Error authorizing officer:", error);
        return { success: false, message: error.reason || error.message || "Failed to authorize officer" };
    }
};
