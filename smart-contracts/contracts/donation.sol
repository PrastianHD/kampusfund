// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Donasi {
    address public owner;           // Siapa Adminnya
    IERC20 public tokenRupiah;      // Alamat Token Rupiah
    uint256 public totalDonasiMasuk; // Total donasi tercatat

    constructor(address _alamatToken) {  // Func Send
        owner = msg.sender;
        tokenRupiah = IERC20(_alamatToken);
    }

    function donasi(uint256 _jumlah) public { 
        tokenRupiah.transferFrom(msg.sender, address(this), _jumlah);
        totalDonasiMasuk += _jumlah;
    }

    function withdraw() public { 
        require(msg.sender == owner, "Kamu bukan Admin!");
        
        uint256 saldoSaatIni = tokenRupiah.balanceOf(address(this));
        tokenRupiah.transfer(owner, saldoSaatIni);
    }

    function getData() public view returns (uint256, uint256, address) { 
        return (totalDonasiMasuk, tokenRupiah.balanceOf(address(this)), owner);
    }
}