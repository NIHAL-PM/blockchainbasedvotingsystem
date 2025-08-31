import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import dotenv from 'dotenv';
dotenv.config();

async function workingDeploy() {
    try {
        console.log('📋 Compiling OnChainRegistry.sol...');
        
        // Read contract source
        const contractPath = path.join(process.cwd(), 'contracts', 'OnChainRegistry.sol');
        const source = fs.readFileSync(contractPath, 'utf8');

        // Compile contract
        const input = {
            language: 'Solidity',
            sources: {
                'OnChainRegistry.sol': {
                    content: source
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                }
            }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors) {
            const errors = output.errors.filter(error => error.severity === 'error');
            if (errors.length > 0) {
                console.error('❌ Compilation errors:', errors);
                return;
            }
        }

        const contractData = output.contracts['OnChainRegistry.sol']['OnChainRegistry'];
        const abi = contractData.abi;
        const bytecode = '0x' + contractData.evm.bytecode.object;

        console.log('✅ Contract compiled successfully');

        // Deploy contract
        const provider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log('\n🚀 Deploying contract...');
        console.log('👤 Deployer address:', wallet.address);

        // Check balance
        const balance = await wallet.getBalance();
        console.log('💰 Balance:', ethers.utils.formatEther(balance), 'AVAX');

        if (balance.lt(ethers.utils.parseEther('0.01'))) {
            console.log('❌ Insufficient balance. Get test AVAX from: https://faucet.avax.network/');
            return;
        }

        const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        // Deploy with manual gas limit
        const contract = await contractFactory.deploy({
            gasLimit: 3000000
        });
        
        console.log('⏳ Waiting for deployment...');
        console.log('📤 Transaction hash:', contract.deployTransaction.hash);
        await contract.deployed();

        console.log('✅ Contract deployed to:', contract.address);

        // Verify authorization
        const isOfficer = await contract.pollingOfficers(wallet.address);
        console.log('✅ Deployer is polling officer:', isOfficer);

        if (!isOfficer) {
            console.log('📝 Authorizing wallet as polling officer...');
            const tx = await contract.authorizeOfficer(wallet.address, {
                gasLimit: 100000
            });
            await tx.wait();
            console.log('✅ Authorization successful!');
        }

        // Update blockchain.js
        const blockchainPath = path.join(process.cwd(), 'src', 'utils', 'blockchain.js');
        let blockchainContent = fs.readFileSync(blockchainPath, 'utf8');

        // Update contract address
        blockchainContent = blockchainContent.replace(
            /const contractAddress = ".*";/,
            `const contractAddress = "${contract.address}";`
        );

        // Update contract ABI
        const abiString = JSON.stringify(abi, null, 2);
        blockchainContent = blockchainContent.replace(
            /const contractABI = \[[\s\S]*?\];/,
            `const contractABI = ${abiString};`
        );

        fs.writeFileSync(blockchainPath, blockchainContent);
        console.log('✅ Updated blockchain.js with new contract details');

        // Update .env file
        const envPath = path.join(process.cwd(), '.env');
        const envContent = `PRIVATE_KEY=${process.env.PRIVATE_KEY}
VITE_CONTRACT_ADDRESS=${contract.address}`;
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env file');

        console.log('\n🎉 Deployment complete!');
        console.log('📍 Contract address:', contract.address);
        console.log('✅ Your wallet is now authorized as polling officer');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error('💡 Get test AVAX from: https://faucet.avax.network/');
        }
    }
}

workingDeploy();