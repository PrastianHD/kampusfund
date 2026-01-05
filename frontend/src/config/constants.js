// 1. Address Contract DONASI 
export const CONTRACT_ADDRESS = "0x196235859a816156db16beB2cBea71bBc9AA63Ae"; 

// 2. Address Token RUPIAH 
export const TOKEN_ADDRESS = "0x97493d8b4b693762cf058c9374ac818e6af965a4";

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