import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function verifyCurrentStatus() {
    try {
        // Use the current contract address
        const contractAddress = "0xE26A0c5514a2C5B0E21A6E7bf3E4B2CC214e7972";
        
        const provider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
        
        // Your wallet address
        const walletAddress = "0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386";
        
        // Minimal ABI for checking polling officers
        const abi = [
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
            }
        ];

        const contract = new ethers.Contract(contractAddress, abi, provider);
        
        console.log('🔍 Checking authorization status...');
        console.log('📍 Contract:', contractAddress);
        console.log('👤 Wallet:', walletAddress);
        
        // Check if wallet is polling officer
        const isOfficer = await contract.pollingOfficers(walletAddress);
        console.log('✅ Is polling officer:', isOfficer);
        
        // Check contract owner
        const owner = await contract.owner();
        console.log('👑 Contract owner:', owner);
        
        // Check if wallet is owner
        const isOwner = owner.toLowerCase() === walletAddress.toLowerCase();
        console.log('✅ Is owner:', isOwner);
        
        if (!isOfficer && isOwner) {
            console.log('⚠️  Wallet is owner but not polling officer - this should not happen!');
        } else if (!isOfficer) {
            console.log('❌ Wallet is NOT authorized as polling officer');
        } else {
            console.log('🎉 Wallet IS authorized as polling officer!');
        }
        
        // Check contract bytecode to verify it exists
        const bytecode = await provider.getCode(contractAddress);
        console.log('📊 Contract bytecode length:', bytecode.length);
        
        if (bytecode === '0x') {
            console.log('❌ No contract deployed at this address');
        } else {
            console.log('✅ Contract exists at this address');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyCurrentStatus();