// frontend/src/AdminApp.jsx

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useRoutes, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';
import Keuangan from './pages/admin/keuangan/Keuangan';
import Riwayat from './pages/admin/keuangan/Riwayat';
import DataJamaah from './pages/admin/jamaah/DataJamaah';
import DataInventaris from './pages/admin/inventaris/DataInventaris';
import Settings from './pages/admin/Settings';

const AdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const syncUserContext = (data) => {
    if (data.nama) localStorage.setItem('userName', data.nama);
    if (data.nama_masjid) localStorage.setItem('namaMasjid', data.nama_masjid);
    if (data.foto_tanda_tangan) localStorage.setItem('ttdImage', data.foto_tanda_tangan);
  };

  const handleLogout = () => {
    if (window.confirm("Apakah anda yakin ingin keluar dari sistem Takmir?")) {
      localStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  // Memoize array routes
  const routesArray = useMemo(() => [
    { path: '', element: <Dashboard /> },
    { path: 'keuangan', element: <Keuangan /> },
    { path: 'riwayat', element: <Riwayat /> },
    { path: 'jamaah', element: <DataJamaah /> },
    { path: 'inventaris', element: <DataInventaris /> },
    { path: 'settings', element: <Settings /> },
  ], []);

  // Panggil useRoutes di top level dengan array yang dimemoize
  const routes = useRoutes(routesArray);

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:3000/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.role === 'takmir') {
            setUser(res.data);
            setIsLoggedIn(true);
            syncUserContext(res.data);
          } else {
            localStorage.clear();
            setIsLoggedIn(false);
            navigate('/login');
          }
        } catch (err) {
          localStorage.clear();
          setIsLoggedIn(false);
          navigate('/login');
        }
      } else {
        setIsLoggedIn(false);
        navigate('/login');
      }
      setLoading(false);
    };
    initApp();
  }, [navigate]);

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:3000/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.role === 'takmir') {
        setUser(res.data);
        setIsLoggedIn(true);
        syncUserContext(res.data);
      } else {
        localStorage.clear();
        setIsLoggedIn(false);
      }
    } catch (err) {
      alert("Gagal memproses profil.");
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
    return null; // Redirect handled by useEffect
  }

  return (
    <MainLayout 
      activeMenu="dashboard"  // Tetap set ke 'dashboard' untuk konsistensi
      setActiveMenu={() => {}}  // Kosongkan karena tidak ada menu lain
      onLogout={handleLogout}
      user={user}
    >
      {routes}
    </MainLayout>
  );
};

export default AdminApp;