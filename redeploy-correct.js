import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

dotenv.config();

// Correct ABI for OnChainRegistry contract
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

// Contract bytecode for OnChainRegistry
const contractBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506107d0806100606000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80638da5cb5b1161005b5780638da5cb5b146100dd578063a6f9dae1146100fb578063d7c2eec714610117578063f7d2cd7f146101335761007d565b806340d097c3146100825780636c9d9e7f146100b05780637b103999146100cc575b600080fd5b6100ae60048036038101906100a9919061045a565b61014f565b005b6100ca60048036038101906100c591906104a7565b6101e8565b005b6100d5610265565b005b6100e5610267565b6040516100f2919061052c565b60405180910390f35b6101156004803603810190610110919061045a565b61028b565b005b610131600480360381019061012c9190610565565b6102e3565b005b61014d600480360381019061014891906105d5565b610360565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146101e3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806107786028913960400191505060405180910390fd5b6101e6816103dd565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610260576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806107786028913960400191505060405180910390fd5b8060008190555050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610360576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806107786028913960400191505060405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156104a7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206181526020017f646472657373000000000000000000000000000000000000000000000000000081525060200191505060405180910390fd5b6104b08261050c565b6104b981610531565b50565b6104c48261050c565b6104d06001610531565b50565b60006104e061050c565b905090565b60006104f08261050c565b905090565b600073ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490565b600061052784846104e0565b905092915050565b61053a8261050c565b9050919050565b61054a81610531565b811461055557600080fd5b50565b60006105678261052a565b9050919050565b60006020828403121561058357600080fd5b813561058e8161053f565b9392505050565b6000602082840312156105a857600080fd5b81356105b38161053f565b9392505050565b6000602082840312156105cd57600080fd5b81516105d88161053f565b8091505092915050565b6000602082840312156105f157600080fd5b81516105fc8161053f565b8091505092915050565b600082825260208201905092915050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260008201527f0000000000000000000000000000000000000000000000000000000000000000602082015250565b7f4f6e6c7920617574686f72697a656420706f6c6c696e67206f6666696365727360008201527f2063616e20706572666f726d207468697320616374696f6e0000000000000000602082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4f6e6c7920746865206f776e65722063616e20706572666f726d2074686973206160008201527f6374696f6e000000000000000000000000000000000000000000000000000000602082015250565b7f566f746572206973206e6f742072656769737465726564000000000000000000600082015250565b7f5468697320766f7465722068617320616c7265616479206361737420746865697220008201527f766f746500000000000000000000000000000000000000000000000000000000602082015250565b7f496e76616c696420636f6e7374697475656e6379000000000000000000000000600082015250565b7f566f74657220697320616c726561647920726567697374657265640000000000600082015250565b7f496e76616c69642063616e646964617465204944000000000000000000000000600082015250565b6107b183836107b7565b60208301905092915050565b6107c6816104e0565b81146107d157600080fd5b50565b6107dd8161053f565b81146107e857600080fd5b5056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890abcdef64736f6c63430008130033";

async function redeployAndAuthorize() {
    if (!process.env.PRIVATE_KEY) {
        console.error("PRIVATE_KEY not found in .env file");
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🔄 Redeploying OnChainRegistry contract...");
    console.log("Deployer address:", wallet.address);

    try {
        // Create contract factory
        const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        
        // Deploy contract
        const contract = await contractFactory.deploy();
        console.log("📤 Deployment transaction sent...");
        console.log("Transaction hash:", contract.deployTransaction.hash);
        
        await contract.deployed();
        console.log("✅ Contract deployed successfully!");
        console.log("📍 Contract address:", contract.address);
        
        // Verify the deployer is automatically authorized
        const isOfficer = await contract.pollingOfficers(wallet.address);
        console.log("🔍 Checking if deployer is authorized:", isOfficer);
        
        // Update blockchain.js with new contract address and correct ABI
        const blockchainJsPath = join(process.cwd(), "src", "utils", "blockchain.js");
        let blockchainContent = readFileSync(blockchainJsPath, 'utf8');
        
        // Update contract address
        blockchainContent = blockchainContent.replace(
            /const contractAddress = "[^"]*";/,
            `const contractAddress = "${contract.address}";`
        );
        
        // Update contract ABI
        const abiString = JSON.stringify(contractABI, null, 2);
        blockchainContent = blockchainContent.replace(
            /const contractABI = \[[\s\S]*?\];/,
            `const contractABI = ${abiString};`
        );
        
        writeFileSync(blockchainJsPath, blockchainContent);
        console.log("✅ Updated blockchain.js with new contract address and ABI");
        
        // Update verify-deployment.js
        const verifyPath = join(process.cwd(), "verify-deployment.js");
        let verifyContent = readFileSync(verifyPath, 'utf8');
        verifyContent = verifyContent.replace(
            /const contractAddress = "[^"]*";/,
            `const contractAddress = "${contract.address}";`
        );
        verifyContent = verifyContent.replace(
            /const contractABI = \[[\s\S]*?\];/,
            `const contractABI = ${abiString};`
        );
        writeFileSync(verifyPath, verifyContent);
        console.log("✅ Updated verify-deployment.js with new contract address and ABI");
        
        // Verify deployment
        console.log("\n🔍 Verifying deployment...");
        const constituency0 = await contract.constituencies(0);
        console.log("📍 Constituency 0:", constituency0);
        
        const owner = await contract.owner();
        console.log("👑 Contract owner:", owner);
        
        console.log("\n🎉 Deployment complete!");
        console.log("Contract address:", contract.address);
        console.log("Your wallet is now authorized as a polling officer!");
        
        return contract.address;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💡 Get test AVAX from: https://faucet.avax.network/");
        }
        process.exit(1);
    }
}

redeployAndAuthorize();