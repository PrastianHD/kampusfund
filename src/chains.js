import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_ADDRESS, TOKEN_ABI } from './contract/constants';

const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export const chains = () => {
  const [akunSaya, setAkunSaya] = useState("");
  const [totalDonasi, setTotalDonasi] = useState("0");
  const [saldoSekarang, setSaldoSekarang] = useState("0");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sedangLoading, setSedangLoading] = useState(false);
  const [notifikasi, setNotifikasi] = useState({ pesan: "", tipe: "" });
  
  const resetNotifikasi = () => setNotifikasi({ pesan: "", tipe: "" });

  const ambilDataBlockchain = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
      const kontrak = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const data = await kontrak.getData();

      setTotalDonasi(ethers.formatEther(data[0]));
      setSaldoSekarang(ethers.formatEther(data[1]));
      
      return data[2].toLowerCase(); 
    } catch (error) {
      console.log("Error ambil data:", error);
      return "";
    }
  };

  const cekStatusAdmin = async (akun, ownerAddress) => {
     if(!ownerAddress) {
         const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
         const kontrak = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
         ownerAddress = await kontrak.owner();
     }
     if (akun.toLowerCase() === ownerAddress.toLowerCase()) setIsAdmin(true);
     else setIsAdmin(false);
  };

  useEffect(() => {
    const init = async () => {
        const owner = await ambilDataBlockchain();
        if(window.ethereum && window.ethereum.selectedAddress) {
            setAkunSaya(window.ethereum.selectedAddress);
            cekStatusAdmin(window.ethereum.selectedAddress, owner);
        }
    };
    init();
  }, []);

  
  const connectWallet = async () => {
    resetNotifikasi();
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAkunSaya(accounts[0]);
        cekStatusAdmin(accounts[0]);
      } catch (error) {
        setNotifikasi({ pesan: "Gagal konek wallet!", tipe: "gagal" });
      }
    } else {
      setNotifikasi({ pesan: "Install Wallet dulu!", tipe: "gagal" });
    }
  };


  const kirimDonasi = async () => {
    resetNotifikasi();
    setSedangLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const kontrakDonasi = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const kontrakToken = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      const jumlahDonasi = ethers.parseEther("50000"); 
      const userAddress = await signer.getAddress();

      const allowance = await kontrakToken.allowance(userAddress, CONTRACT_ADDRESS);

      if (allowance < jumlahDonasi) {
        const txApprove = await kontrakToken.approve(CONTRACT_ADDRESS, ethers.MaxUint256);
        await txApprove.wait();
        setNotifikasi({ pesan: "Izin berhasil! Lanjut donasi", tipe: "sukses" });
      }

      const txDonasi = await kontrakDonasi.donasi(jumlahDonasi, { gasLimit: 150000 });
      await txDonasi.wait();
      
      setNotifikasi({ pesan: "Terima Kasih! Donasi Rupiah Berhasil.", tipe: "sukses" });
      ambilDataBlockchain();

    } catch (error) {
      console.error(error);
      setNotifikasi({ pesan: "Transaksi Gagal.", tipe: "gagal" });
    }
    setSedangLoading(false);
  };

  const tarikDana = async () => {
    resetNotifikasi();
    setSedangLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const kontrak = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await kontrak.withdraw({ gasLimit: 100000 });
      await tx.wait();

      setNotifikasi({ pesan: "Rupiah berhasil ditarik", tipe: "sukses" });
      ambilDataBlockchain();
    } catch (error) {
      setNotifikasi({ pesan: "Gagal tarik dana.", tipe: "gagal" });
    }
    setSedangLoading(false);
  };

  return {
    akunSaya, totalDonasi, saldoSekarang, isAdmin, sedangLoading, connectWallet, kirimDonasi, tarikDana, notifikasi
  };
};