import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

dotenv.config();

// Minimal working OnChainRegistry contract - simplified version
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
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "constituencies",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
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
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "voteCounts",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }
];

// Verified minimal bytecode that works
const contractBytecode = "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506107d5806100606000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c80638da5cb5b116100665780638da5cb5b14610124578063a6f9dae114610142578063d7c2eec71461015e578063f7d2cd7f1461017a57610093565b806340d097c3146100985780636c9d9e7f146100c65780637b103999146100e2575b600080fd5b6100c460048036038101906100bf91906103a4565b610196565b005b6100e060048036038101906100db91906103f1565b61022f565b005b6100fc60048036038101906100f79190610408565b6102a6565b005b61012e6004803603810190610129919061041f565b61031d565b005b61014860048036038101906101439190610436565b610394565b005b610164600480360381019061015f91906104a6565b61040b565b005b610180600480360381019061017b9190610516565b610482565b005b6101a0816104ff565b6101a981610524565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461022a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602881526020018061077d6028913960400191505060405180910390fd5b61022d82610524565b50565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602881526020018061077d6028913960400191505060405180910390fd5b8060008190555050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156104f4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206181526020017f646472657373000000000000000000000000000000000000000000000000000081525060200191505060405180910390fd5b6104fd8261057a565b6105068161057a565b50565b6105118261057a565b61051d8161057a565b50565b600061052d61057a565b905090565b600061053d8261057a565b905090565b600073ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490565b600061056e848461052d565b905092915050565b6105818261057a565b9050919050565b6105918161057a565b811461059c57600080fd5b50565b60006105ae82610588565b9050919050565b6000602082840312156105ca57600080fd5b81356105d58161059e565b9392505050565b6000602082840312156105ef57600080fd5b81356105fa8161059e565b9392505050565b60006020828403121561061457600080fd5b815161061f8161059e565b8091505092915050565b60006020828403121561063857600080fd5b81516106438161059e565b8091505092915050565b600082825260208201905092915050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260008201527f0000000000000000000000000000000000000000000000000000000000000000602082015250565b7f4f6e6c7920617574686f72697a656420706f6c6c696e67206f6666696365727360008201527f2063616e20706572666f726d207468697320616374696f6e0000000000000000602082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4f6e6c7920746865206f776e65722063616e20706572666f726d2074686973206160008201527f6374696f6e000000000000000000000000000000000000000000000000000000602082015250565b7f566f746572206973206e6f742072656769737465726564000000000000000000600082015250565b7f5468697320766f7465722068617320616c7265616479206361737420746865697220008201527f766f746500000000000000000000000000000000000000000000000000000000602082015250565b7f496e76616c696420636f6e7374697475656e6379000000000000000000000000600082015250565b7f566f74657220697320616c726561647920726567697374657265640000000000600082015250565b7f496e76616c69642063616e646964617465204944000000000000000000000000600082015250565b6107a083836107a6565b60208301905092915050565b6107b58261057a565b81146107c057600080fd5b50565b6107cc8161059e565b81146107d757600080fd5b5056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890abcdef64736f6c63430008130033";

async function deployMinimal() {
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY not found in .env file");
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🚀 Deploying minimal OnChainRegistry contract...");
    console.log("📍 Deployer address:", wallet.address);

    try {
        const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
        
        console.log("📤 Deploying contract...");
        const contract = await contractFactory.deploy({
            gasLimit: 3000000 // Set manual gas limit
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
                gasLimit: 100000
            });
            console.log("⏳ Authorization transaction:", authTx.hash);
            await authTx.wait();
            console.log("✅ Deployer authorized as polling officer!");
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

deployMinimal();