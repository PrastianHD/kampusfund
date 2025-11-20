// 1. Address Contract DONASI 
export const CONTRACT_ADDRESS = "0xC7dCf4eF4F4bc9f055F3b6CfA61F51E3a0451754"; 

// 2. Address Token RUPIAH 
export const TOKEN_ADDRESS = "0x304287575c4d434DD81af75b15618daF1b6fbd5e";

export const CONTRACT_ABI = [
  { "inputs": [{"internalType": "uint256","name": "_jumlah","type": "uint256"}], "name": "donasi", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getData", "outputs": [{"internalType": "uint256","name": "","type": "uint256"}, {"internalType": "uint256","name": "","type": "uint256"}, {"internalType": "address","name": "","type": "address"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "owner", "outputs": [{"internalType": "address","name": "","type": "address"}], "stateMutability": "view", "type": "function" }
];

export const TOKEN_ABI = [
  { "inputs": [{"internalType": "address","name": "spender","type": "address"}, {"internalType": "uint256","name": "value","type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool","name": "","type": "bool"}], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType": "address","name": "owner","type": "address"}, {"internalType": "address","name": "spender","type": "address"}], "name": "allowance", "outputs": [{"internalType": "uint256","name": "","type": "uint256"}], "stateMutability": "view", "type": "function" }
];