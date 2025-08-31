import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function authorizeWalletDirectly() {
    try {
        const contractAddress = "0xE26A0c5514a2C5B0E21A6E7bf3E4B2CC214e7972";
        const walletAddress = "0x2F8695ef7782C5D4BccE5A39Aa06ceE430ECE386";
        
        const provider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
        const privateKey = process.env.PRIVATE_KEY;
        const wallet = new ethers.Wallet(privateKey, provider);
        
        const abi = [
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
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(contractAddress, abi, wallet);
        
        console.log('🔍 Checking current authorization...');
        
        // Check if already authorized
        const isOfficer = await contract.pollingOfficers(walletAddress);
        console.log('✅ Is polling officer:', isOfficer);
        
        if (!isOfficer) {
            console.log('📝 Authorizing wallet as polling officer...');
            const tx = await contract.authorizeOfficer(walletAddress);
            console.log('⏳ Transaction hash:', tx.hash);
            await tx.wait();
            console.log('✅ Authorization successful!');
        } else {
            console.log('✅ Wallet is already authorized!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

authorizeWalletDirectly();