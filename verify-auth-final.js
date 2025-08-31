import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function verifyAuthorization() {
    try {
        console.log('🔍 Verifying authorization status...');
        
        // Get contract address from .env
        const contractAddress = process.env.VITE_CONTRACT_ADDRESS;
        console.log('📍 Contract address:', contractAddress);
        
        // Connect to Avalanche Fuji testnet
        const provider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        console.log('👤 Wallet address:', wallet.address);
        
        // Get contract ABI from blockchain.js
        const fs = await import('fs');
        const path = await import('path');
        const blockchainPath = path.default.join(process.cwd(), 'src', 'utils', 'blockchain.js');
        const blockchainContent = fs.default.readFileSync(blockchainPath, 'utf8');
        
        // Extract ABI using regex
        const abiMatch = blockchainContent.match(/const contractABI = (\[[\s\S]*?\]);/);
        if (!abiMatch) {
            throw new Error('Could not extract ABI from blockchain.js');
        }
        
        const contractABI = JSON.parse(abiMatch[1]);
        console.log('✅ Successfully extracted ABI');
        
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Check if wallet is authorized as polling officer
        console.log('🔍 Checking if wallet is authorized as polling officer...');
        
        // First check if the contract has the pollingOfficers function
        const functions = contractABI.filter(item => item.type === 'function').map(item => item.name);
        console.log('📋 Available functions:', functions);
        
        if (functions.includes('pollingOfficers')) {
            try {
                const isOfficer = await contract.pollingOfficers(wallet.address);
                console.log('✅ Is polling officer:', isOfficer);
                
                if (!isOfficer) {
                    console.log('⚠️ Wallet is not authorized. Attempting to authorize...');
                    const tx = await contract.authorizeOfficer(wallet.address, {
                        gasLimit: 100000
                    });
                    await tx.wait();
                    console.log('✅ Authorization successful!');
                    
                    // Verify again
                    const isOfficerNow = await contract.pollingOfficers(wallet.address);
                    console.log('✅ Is polling officer now:', isOfficerNow);
                }
            } catch (error) {
                console.error('❌ Error calling pollingOfficers:', error.message);
                
                // Try alternative approach - check if the contract has the owner function
                if (functions.includes('owner')) {
                    try {
                        const owner = await contract.owner();
                        console.log('👑 Contract owner:', owner);
                        console.log('🔍 Checking if wallet is the owner:', wallet.address === owner);
                        
                        if (wallet.address === owner) {
                            console.log('✅ Wallet is the contract owner, should have full access');
                        } else {
                            console.log('⚠️ Wallet is not the contract owner');
                        }
                    } catch (error) {
                        console.error('❌ Error calling owner:', error.message);
                    }
                }
            }
        } else {
            console.error('❌ Contract does not have pollingOfficers function');
            
            // Check if the contract has the owner function
            if (functions.includes('owner')) {
                try {
                    const owner = await contract.owner();
                    console.log('👑 Contract owner:', owner);
                    console.log('🔍 Checking if wallet is the owner:', wallet.address === owner);
                    
                    if (wallet.address === owner) {
                        console.log('✅ Wallet is the contract owner, should have full access');
                    } else {
                        console.log('⚠️ Wallet is not the contract owner');
                    }
                } catch (error) {
                    console.error('❌ Error calling owner:', error.message);
                }
            }
        }
        
        // Check if the contract has the authorizeOfficer function
        if (functions.includes('authorizeOfficer')) {
            console.log('✅ Contract has authorizeOfficer function');
        } else {
            console.error('❌ Contract does not have authorizeOfficer function');
        }
        
        console.log('\n📱 Dashboard URL: http://localhost:5173');
        console.log('🔄 If still seeing "Access Denied", try refreshing the page or clearing browser cache');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyAuthorization();