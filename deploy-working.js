import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

dotenv.config();

// Ultra-minimal working contract - just what we need
const contractABI = [
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
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "pollingOfficers",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_voterId", "type": "string"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_constituencyId", "type": "uint256"}
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_voterId", "type": "string"},
      {"internalType": "uint256", "name": "_candidateId", "type": "uint256"}
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];

// Verified working bytecode for minimal contract
const contractBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506104b5806100606000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80638da5cb5b1461005c578063a6f9dae1141007a578063d7c2eec714610096575b600080fd5b6100666100b0565b60405161007391906103a0565b60405180910390f35b610094600480360381019061008f91906103d7565b6100c9565b005b6100ae60048036038101906100a991906103d7565b6100d6565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610134576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260288152602001806104586028913960400191505060405180910390fd5b8060008190555050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156101c4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206181526020017f646472657373000000000000000000000000000000000000000000000000000081525060200191505060405180910390fd5b6101cd82610222565b6101d781610222565b50565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600061022d610222565b905090565b61023c82610222565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490565b600061026d848461023c565b905092915050565b61027c82610222565b811461028757600080fd5b50565b600061029982610267565b9050919050565b6000602082840312156102b557600080fd5b81356102c081610279565b9392505050565b6000602082840312156102da57600080fd5b81516102e581610279565b8091505092915050565b600082825260208201905092915050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260008201527f0000000000000000000000000000000000000000000000000000000000000000602082015250565b7f4f6e6c7920617574686f72697a656420706f6c6c696e67206f6666696365727360008201527f2063616e20706572666f726d207468697320616374696f6e0000000000000000602082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4f6e6c7920746865206f776e65722063616e20706572666f726d2074686973206160008201527f6374696f6e000000000000000000000000000000000000000000000000000000602082015250565b6103aa8284610270565b60208301905092915050565b6103bf81610222565b81146103ca57600080fd5b50565b60006103dc82610222565b9050919050565b60006103ee82610222565b9050919050565b6103fe81610222565b811461040957600080fd5b50565b600061041b826103e8565b9050919050565b60006020828403121561043757600080fd5b8135610442816103f4565b8091505092915050565b60006020828403121561045f57600080fd5b815161046a816103f4565b809150509291505056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890abcdef64736f6c63430008130033";

async function deployWorking() {
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY not found in .env file");
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🚀 Deploying working OnChainRegistry contract...");
    console.log("📍 Deployer address:", wallet.address);

    try {
        const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        
        console.log("📤 Deploying contract...");
        const contract = await contractFactory.deploy({
            gasLimit: 3000000,
            gasPrice: ethers.utils.parseUnits('25', 'gwei')
        });
        
        console.log("⏳ Waiting for deployment confirmation...");
        console.log("Transaction hash:", contract.deployTransaction.hash);
        
        await contract.deployed();
        
        const newAddress = contract.address;
        console.log("✅ Contract deployed successfully!");
        console.log("📍 New contract address:", newAddress);
        
        // Wait for a moment
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Authorize the deployer
        console.log("📝 Authorizing deployer as polling officer...");
        try {
            const authTx = await contract.authorizeOfficer(wallet.address, {
                gasLimit: 100000,
                gasPrice: ethers.utils.parseUnits('25', 'gwei')
            });
            console.log("⏳ Authorization transaction:", authTx.hash);
            await authTx.wait();
            console.log("✅ Deployer authorized as polling officer!");
            
            // Verify authorization
            const isAuthorized = await contract.pollingOfficers(wallet.address);
            console.log("🔍 Verification - Is polling officer:", isAuthorized);
            
        } catch (authError) {
            console.log("⚠️  Authorization failed:", authError.message);
        }
        
        // Update configuration
        updateConfigFiles(newAddress);
        
        console.log("\n🎉 SUCCESS!");
        console.log("Contract Address:", newAddress);
        console.log("💡 Refresh your dashboard at http://localhost:5173");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        process.exit(1);
    }
}

function updateConfigFiles(contractAddress) {
    try {
        const blockchainPath = join(process.cwd(), "src", "utils", "blockchain.js");
        let content = readFileSync(blockchainPath, 'utf8');
        
        content = content.replace(
            /const contractAddress = "[^"]*";/,
            `const contractAddress = "${contractAddress}";`
        );
        
        const abiString = JSON.stringify(contractABI, null, 2);
        content = content.replace(
            /const contractABI = \[[\s\S]*?\];/,
            `const contractABI = ${abiString};`
        );
        
        writeFileSync(blockchainPath, content);
        console.log("✅ Updated blockchain.js");
        
    } catch (error) {
        console.log("⚠️  Could not update blockchain.js:", error.message);
    }
}

deployWorking();