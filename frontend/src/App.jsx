import { useState, useEffect } from 'react'; // Tambahkan useEffect
import './App.css';
import { usePrivy } from '@privy-io/react-auth';
import { useReadContract, useWriteContract, useAccount, usePublicClient } from 'wagmi'; // Hapus useGasPrice agar otomatis
import { parseEther, formatEther, maxUint256 } from 'viem'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_ADDRESS, TOKEN_ABI } from './config/constants';

function App() {
  const { login, user, authenticated, logout } = usePrivy();
  // Ambil isConnected untuk cek status koneksi Wagmi
  const { address: userAddress, isConnected } = useAccount(); 
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ msg: "", type: "" });
  
  // --- DEBUGGING LOGS (Cek Console Browser) ---
  useEffect(() => {
    console.log("🔍 DEBUG STATE:");
    console.log(" - Privy Authenticated:", authenticated);
    console.log(" - Wagmi Connected:", isConnected);
    console.log(" - User Address:", userAddress);
  }, [authenticated, isConnected, userAddress]);
  // --------------------------------------------

  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getData',
  });

  const totalDonasi = data ? formatEther(data[0]) : "0";
  const saldo = data ? formatEther(data[1]) : "0";
  const isAdmin = authenticated && data && (user?.wallet?.address || userAddress)?.toLowerCase() === data[2]?.toLowerCase();

  const fmtRupiah = (n) => parseFloat(n).toLocaleString('id-ID');

  const handleAction = async (actionType) => {
    console.log(`👉 Tombol ${actionType} diklik`);
    
    // --- PENGAMAN UTAMA (Supaya tidak error ConnectorNotConnected) ---
    if (!isConnected) {
        console.warn("⚠️ Wagmi belum connect! Mencegah crash...");
        setNotif({ msg: "⏳ Sinkronisasi Wallet... Tunggu 3 detik & coba lagi.", type: "proses" });
        return; // Berhenti di sini, jangan lanjut transaksi
    }
    // -----------------------------------------------------------------

    setLoading(true);
    setNotif({ msg: "", type: "" });
    
    try {
      if (actionType === 'DONASI') {
        // --- TAHAP 1: APPROVE ---
        try {
            setNotif({ msg: "Setujui Dulu Ya...", type: "proses" });
            console.log("🚀 Mulai Approve...");
            
            const hashApprove = await writeContractAsync({ 
                address: TOKEN_ADDRESS, 
                abi: TOKEN_ABI, 
                functionName: 'approve', 
                args: [CONTRACT_ADDRESS, maxUint256],
            });
            
            console.log("✅ Approve Hash:", hashApprove);
            // Tunggu sampai transaksi approve BENAR-BENAR selesai
            await publicClient.waitForTransactionReceipt({ hash: hashApprove });

        } catch (err) {
            console.error("❌ Gagal Approve:", err);
            // JANGAN LANJUT kalau approve gagal!
            setNotif({ msg: "Gagal Approve (Wajib disetujui)", type: "gagal" });
            setLoading(false); // Matikan loading
            return; // <--- STOP DISINI
        }

        // --- TAHAP 2: DONASI ---
        // Kode ini hanya akan jalan kalau tahap 1 sukses
        setNotif({ msg: "Konfirmasi Transaksi Donasi...", type: "proses" });
        
        const hashDonasi = await writeContractAsync({ 
            address: CONTRACT_ADDRESS, 
            abi: CONTRACT_ABI, 
            functionName: 'donasi', 
            args: [parseEther("50000")],
        });
        
        console.log("✅ Donasi Hash:", hashDonasi);
        await publicClient.waitForTransactionReceipt({ hash: hashDonasi }); 

        setNotif({ msg: "🎉 Terima Kasih! Donasi Berhasil.", type: "sukses" });

      } else {
        // --- WITHDRAW ---
        console.log("🚀 Mulai Withdraw...");
        const hash = await writeContractAsync({ 
            address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'withdraw',
        });
        await publicClient.waitForTransactionReceipt({ hash }); 
        setNotif({ msg: "✅ Penarikan Berhasil!", type: "sukses" });
      }

      await refetch(); 

    } catch (err) {
      console.error("❌ ERROR TRANSAKSI:", err);
      
      if(err.message.includes("User rejected")) {
          setNotif({ msg: "🚫 Transaksi Dibatalkan User", type: "gagal" });
      } else {
          // Tampilkan error spesifik di notif biar gampang debug
          setNotif({ msg: "❌ Gagal: " + (err.shortMessage || err.message), type: "gagal" });
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
                fontWeight: 'bold', wordWrap: 'break-word'
            }}>
                {notif.msg}
            </div>
        )}

        <div className="stats">
          <div><h3>Total Donasi</h3><p>Rp {fmtRupiah(totalDonasi)}</p></div>
          <div><h3>Saldo Tersedia</h3><p>Rp {fmtRupiah(saldo)}</p></div>
        </div>

        {/* Tambahkan Link Faucet Manual untuk Debugging Saldo */}
        {authenticated && (
             <a 
               href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" 
               target="_blank" 
               rel="noopener noreferrer"
               style={{fontSize: '11px', display: 'block', marginBottom: '10px', color: 'blue', cursor: 'pointer'}}
             >
               [DEBUG] Butuh Saldo Sepolia? Klik disini
             </a>
        )}

        <button 
          onClick={() => handleAction('DONASI')} 
          // Tombol menyala asal authenticated true (jangan pakai isConnected disini biar gak greyed out terus)
          disabled={loading || !authenticated} 
          className="btn-donate"
        >
          {loading ? "Memproses..." : "Donasi Rp 50.000"}
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