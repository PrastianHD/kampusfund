import { useState } from 'react';
import './App.css';
import { usePrivy } from '@privy-io/react-auth';
import { useReadContract, useWriteContract, useAccount, usePublicClient, useGasPrice } from 'wagmi';
import { parseEther, formatEther, maxUint256 } from 'viem'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_ADDRESS, TOKEN_ABI } from './config/constants';

function App() {
  const { login, user, authenticated, logout } = usePrivy();
  const { address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: currentGasPrice } = useGasPrice();
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ msg: "", type: "" });
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getData',
  });

  const totalDonasi = data ? formatEther(data[0]) : "0";
  const saldo = data ? formatEther(data[1]) : "0";
  const isAdmin = authenticated && data && (user?.wallet?.address || userAddress)?.toLowerCase() === data[2]?.toLowerCase();

  const fmtRupiah = (n) => parseFloat(n).toLocaleString('id-ID');

  const handleAction = async (actionType) => {
    setLoading(true);
    setNotif({ msg: "", type: "" });
    const gasTurbo = currentGasPrice ? (currentGasPrice * 200n) / 100n : undefined; // 150% (1.5x)
    
    try {
      if (actionType === 'DONASI') {
        try {
            setNotif({ msg: "Setujui Dulu Ya.", type: "proses" });
            const hashApprove = await writeContractAsync({ 
                address: TOKEN_ADDRESS, 
                abi: TOKEN_ABI, 
                functionName: 'approve', 
                args: [CONTRACT_ADDRESS, maxUint256],
                gasPrice: gasTurbo,
                gas: 100000n
            });
            
            await publicClient.waitForTransactionReceipt({ 
                hash: hashApprove,
                pollingInterval: 100 
            });

        } catch (err) {
            console.log("Info: Approve dilewati/sudah ada");
        }

        // ---  DONASI ---
        setNotif({ msg: "Konfirmasi Donasi.", type: "proses" });
        
        const hashDonasi = await writeContractAsync({ 
            address: CONTRACT_ADDRESS, 
            abi: CONTRACT_ABI, 
            functionName: 'donasi', 
            args: [parseEther("50000")],
            gasPrice: gasTurbo,
            gas: 100000n 
        });
        
        await publicClient.waitForTransactionReceipt({ 
            hash: hashDonasi,
            pollingInterval: 100 
        }); 

        setNotif({ msg: "Terima Kasih! Donasi Berhasil.", type: "sukses" });

      } else {
        // --- WITHDRAW ---
        const hash = await writeContractAsync({ 
            address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'withdraw',
            gasPrice: gasTurbo,
            gas: 100000n
        });
        await publicClient.waitForTransactionReceipt({ hash, pollingInterval: 1_000 }); 
        setNotif({ msg: "✅ Penarikan Berhasil!", type: "sukses" });
      }

      await refetch(); 

    } catch (err) {
      console.error(err);
      if(err.message.includes("User rejected")) {
          setNotif({ msg: "Transaksi Dibatalkan", type: "gagal" });
      } else {
          setNotif({ msg: "Transaksi Gagal", type: "gagal" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎓KampusFund</h1>
      <p>Platform Donasi Kemanusiaan Mahasiswa (Berbasis Blockchain)</p>

      {!authenticated ? (
        <button onClick={login} className="btn-connect">Sambungkan Dompet</button>
      ) : (
        <div className="user-bar">
           <div className="retro-box box-address">👤 {(user?.wallet?.address || userAddress)?.substring(0, 6)}...</div>
           <button onClick={logout} className="retro-box box-logout">LOGOUT</button>
           {isAdmin && <div className="retro-box box-admin">ADMIN</div>}
        </div>
      )}

      <div className="card">
        {notif.msg && (
            <div style={{
                padding: '15px', marginBottom: '20px', border: '3px solid black', 
                backgroundColor: notif.type === 'sukses' ? '#ccffcc' : notif.type === 'gagal' ? '#ffcccc' : '#fff3cd', 
                fontWeight: 'bold'
            }}>
                {notif.msg}
            </div>
        )}

        <div className="stats">
          <div><h3>Total Donasi</h3><p>Rp {fmtRupiah(totalDonasi)}</p></div>
          <div><h3>Saldo Tersedia</h3><p>Rp {fmtRupiah(saldo)}</p></div>
        </div>

        <button 
          onClick={() => handleAction('DONASI')} 
          disabled={loading || !authenticated} 
          className="btn-donate"
        >
          {loading ? "loading..." : "Donasi Rp 50.000"}
        </button>

        {isAdmin && (
            <div style={{marginTop: '30px', borderTop: '3px dashed black', paddingTop: '20px'}}>
                <button onClick={() => handleAction('WITHDRAW')} style={{backgroundColor: '#FF5252', color: 'white', border: '3px solid black', padding: '10px', width: '100%', fontWeight: 'bold', cursor: 'pointer'}}>
                    TARIK HASIL DONASI
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;