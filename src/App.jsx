import { chains } from './chains'; 
import './App.css';

function App() {
  const { 
    akunSaya, totalDonasi, saldoSekarang, isAdmin, 
    sedangLoading, connectWallet, kirimDonasi, notifikasi, tarikDana 
  } = chains();

  const formatRupiah = (angka) => {
    // 1. Ubah string ke angka (menghilangkan .0 di belakang)
    const nilai = parseFloat(angka);
    // 2. Ubah ke format Indonesia (tambah titik ribuan)
    return nilai.toLocaleString('id-ID');
  };

  return (
    <div className="container">
      <h1>🎓KampusFund</h1>
      <p>Platform Donasi Kemanusiaan Mahasiswa (Berbasis Blockchain)</p>

      {/* --- HEADER LOGIN --- */}
      {!akunSaya ? (
        <button onClick={connectWallet} className="btn-connect">
          Sambungkan Dompet
        </button>
      ) : (
        <div>
           <p className="wallet-address">👤 {akunSaya.substring(0, 12)}</p>
           {isAdmin && <span style={{background:'white', color:'black', fontWeight:'bold', padding:'7px', borderColor:'black'}}>ADMIN </span>}
        </div>
      )}

      {/* --- KARTU UTAMA --- */}
      <div className="card">
        {notifikasi.pesan && (
            <div style={{
                padding: '15px', marginBottom: '20px', border: '3px solid black', 
                backgroundColor: notifikasi.tipe === 'sukses' ? '#ccffcc' : '#ffcccc', 
                color: notifikasi.tipe === 'sukses' ? 'green' : 'red', 
                fontWeight: 'bold', textTransform: 'capitalize'
            }}>
                {notifikasi.tipe === 'sukses' ? '✅ ' : '❌ '} 
                {notifikasi.pesan}
            </div>
        )}

        <div className="stats">
          <div>
            <h3>Total Donasi</h3>
            <p>Rp {formatRupiah(totalDonasi)}</p>
          </div>
          <div>
            <h3>Saldo Tersedia</h3>
            <p>Rp {formatRupiah(saldoSekarang)}</p>
          </div>
        </div>

        <button 
          onClick={kirimDonasi} 
          disabled={sedangLoading || !akunSaya} 
          className="btn-donate"
        >
          {sedangLoading ? "Memproses..." : "Donasi Rp 50.000"}
        </button>

        {/* --- PANEL ADMIN --- */}
        {isAdmin && (
            <div style={{marginTop: '30px', borderTop: '3px dashed black', paddingTop: '20px'}}>
                <p style={{fontSize: '16px'}}>Menu Admin</p>
                <button 
                    onClick={tarikDana}
                    style={{
                        backgroundColor: '#FF5252', color: 'white',
                        border: '3px solid black', padding: '10px',
                        width: '100%', cursor: 'pointer', fontWeight: 'bold'
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