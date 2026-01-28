import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard'; 
import Keuangan from './pages/admin/keuangan/Keuangan'; 
import Riwayat from './pages/admin/keuangan/Riwayat';
import DataJamaah from './pages/admin/jamaah/DataJamaah';
import DataInventaris from './pages/admin/inventaris/DataInventaris';
import Settings from './pages/admin/Settings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Fungsi internal untuk memetakan data profil ke localStorage
  const syncUserContext = (data) => {
    if (data.nama) localStorage.setItem('userName', data.nama);
    if (data.nama_masjid) localStorage.setItem('namaMasjid', data.nama_masjid);
    if (data.foto_tanda_tangan) localStorage.setItem('ttdImage', data.foto_tanda_tangan);
  };

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:3000/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
          setIsLoggedIn(true);
          syncUserContext(res.data); // Sinkronisasi data untuk laporan PDF
        } catch (err) {
          console.error("Sesi berakhir");
          localStorage.clear();
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };
    initApp();
  }, []);

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:3000/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setIsLoggedIn(true);
      syncUserContext(res.data); // Sinkronisasi saat login berhasil
    } catch (err) {
      alert("Gagal memproses profil.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah anda yakin ingin keluar dari sistem Takmir?")) {
      localStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
      setActiveMenu('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-mu-green uppercase tracking-[0.3em]">Menyinkronkan Sesi...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard />;
      case 'keuangan': return <Keuangan />;
      case 'riwayat': return <Riwayat />;
      case 'data-jamaah': return <DataJamaah />;
      case 'inventaris': return <DataInventaris />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <MainLayout 
      activeMenu={activeMenu} 
      setActiveMenu={setActiveMenu} 
      onLogout={handleLogout}
      user={user}
    >
      {renderContent()}
    </MainLayout>
  );
}

export default App;