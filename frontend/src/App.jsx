import { useState, useEffect } from 'react';
import './App.css';
import { 
  useReadContract, 
  useWriteContract, 
  useAccount, 
  usePublicClient, 
  useConnect, 
  useDisconnect 
} from 'wagmi'; 
import { parseEther, formatEther, maxUint256 } from 'viem'; 
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKEN_ADDRESS, TOKEN_ABI } from './config/constants';

function App() {
  // --- WAGMI HOOKS ---
  const { address: userAddress, isConnected } = useAccount(); 
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ msg: "", type: "" });
  
  // --- DEBUGGING LOGS ---
  useEffect(() => {
    console.log("🔍 DEBUG STATE:");
    console.log(" - Wallet Connected:", isConnected);
    console.log(" - User Address:", userAddress);
  }, [isConnected, userAddress]);

  // --- READ CONTRACT ---
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, 
    abi: CONTRACT_ABI, 
    functionName: 'getData',
  });

  const totalDonasi = data ? formatEther(data[0]) : "0";
  const saldo = data ? formatEther(data[1]) : "0";
  // Logika Admin: Membandingkan address wallet dengan owner di contract
  const isAdmin = isConnected && data && userAddress?.toLowerCase() === data[2]?.toLowerCase();

  const fmtRupiah = (n) => parseFloat(n).toLocaleString('id-ID');

  // --- CORE LOGIC: TRANSAKSI ---
  const handleAction = async (actionType) => {
    if (!isConnected) {
        setNotif({ msg: "Silahkan sambungkan dompet terlebih dahulu!", type: "gagal" });
        return;
    }

    setLoading(true);
    setNotif({ msg: "", type: "" });
    
    try {
      if (actionType === 'DONASI') {
        // TAHAP 1: APPROVE (Izin kontrak menarik token)
        try {
            setNotif({ msg: "Menyetujui penggunaan token...", type: "proses" });
            const hashApprove = await writeContractAsync({ 
                address: TOKEN_ADDRESS, 
                abi: TOKEN_ABI, 
                functionName: 'approve', 
                args: [CONTRACT_ADDRESS, maxUint256],
            });
            await publicClient.waitForTransactionReceipt({ hash: hashApprove });
        } catch (err) {
            setNotif({ msg: "Gagal Approve (Wajib disetujui)", type: "gagal" });
            setLoading(false);
            return;
        }

        // TAHAP 2: DONASI
        setNotif({ msg: "Konfirmasi transaksi donasi...", type: "proses" });
        const hashDonasi = await writeContractAsync({ 
            address: CONTRACT_ADDRESS, 
            abi: CONTRACT_ABI, 
            functionName: 'donasi', 
            args: [parseEther("50000")], // Nominal statis Rp 50.000 (sesuai logika token Anda)
        });
        await publicClient.waitForTransactionReceipt({ hash: hashDonasi }); 
        setNotif({ msg: "🎉 Terima Kasih! Donasi Berhasil.", type: "sukses" });

      } else {
        // WITHDRAW (Hanya Admin)
        const hash = await writeContractAsync({ 
            address: CONTRACT_ADDRESS, 
            abi: CONTRACT_ABI, 
            functionName: 'withdraw',
        });
        await publicClient.waitForTransactionReceipt({ hash }); 
        setNotif({ msg: "✅ Penarikan Berhasil!", type: "sukses" });
      }

      await refetch(); 

    } catch (err) {
      console.error("❌ ERROR:", err);
      if(err.message.includes("User rejected")) {
          setNotif({ msg: "🚫 Transaksi Dibatalkan", type: "gagal" });
      } else {
          setNotif({ msg: "❌ Gagal: " + (err.shortMessage || "Terjadi kesalahan"), type: "gagal" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>🎓 KampusFund</h1>
      <p>Platform Donasi Kemanusiaan Mahasiswa (Base Mainnet)</p>

      {/* UI CONNECT WALLET */}
      {!isConnected ? (
        <div className="login-section">
          {connectors.map((connector) => (
            <button 
              key={connector.uid} 
              onClick={() => connect({ connector })}
              className="btn-connect"
            >
              Connect with {connector.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="user-bar">
           <div className="retro-box box-address">👤 {userAddress?.substring(0, 6)}...{userAddress?.substring(userAddress.length - 4)}</div>
           <button onClick={() => disconnect()} className="retro-box box-logout">DISCONNECT</button>
           {isAdmin && <div className="retro-box box-admin">ADMIN</div>}
        </div>
      )}

      <div className="card">
        {/* NOTIFIKASI SYSTEM */}
        {notif.msg && (
            <div style={{
                padding: '15px', marginBottom: '20px', border: '3px solid black', 
                backgroundColor: notif.type === 'sukses' ? '#ccffcc' : notif.type === 'gagal' ? '#ffcccc' : '#fff3cd', 
                fontWeight: 'bold', wordWrap: 'break-word'
            }}>
                {notif.type === 'proses' && "⏳ "} {notif.msg}
            </div>
        )}

        {/* STATS AREA */}
        <div className="stats">
          <div><h3>Total Donasi</h3><p>Rp {fmtRupiah(totalDonasi)}</p></div>
          <div><h3>Saldo Tersedia</h3><p>Rp {fmtRupiah(saldo)}</p></div>
        </div>

        {/* BUTTON ACTION */}
        <button 
          onClick={() => handleAction('DONASI')} 
          disabled={loading || !isConnected} 
          className="btn-donate"
          style={{ opacity: !isConnected ? 0.5 : 1 }}
        >
          {loading ? "Memproses..." : "Donasi Rp 50.000"}
        </button>

        {/* ADMIN SECTION */}
        {isAdmin && (
            <div style={{marginTop: '30px', borderTop: '3px dashed black', paddingTop: '20px'}}>
                <button 
                  onClick={() => handleAction('WITHDRAW')} 
                  disabled={loading}
                  style={{
                    backgroundColor: '#FF5252', color: 'white', border: '3px solid black', 
                    padding: '10px', width: '100%', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                    TARIK HASIL DONASI
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;