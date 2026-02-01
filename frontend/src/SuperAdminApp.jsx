// frontend/src/SuperAdminApp.jsx

import React, { useState, useEffect, useMemo } from 'react'; // Tambahkan useMemo
import axios from 'axios';
import { useRoutes, useNavigate } from 'react-router-dom'; // Tambah useNavigate
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import DataMasjid from './pages/superadmin/masjid/DataMasjid';
import TambahMasjid from './pages/superadmin/masjid/TambahMasjid';
import EditMasjid from './pages/superadmin/masjid/EditMasjid';
import DetailMasjid from './pages/superadmin/masjid/DetailMasjid';
import HapusMasjid from './pages/superadmin/masjid/HapusMasjid';

// Import untuk takmir
import DataTakmir from './pages/superadmin/takmir/DataTakmir';
import TambahTakmir from './pages/superadmin/takmir/TambahTakmir';
import EditTakmir from './pages/superadmin/takmir/EditTakmir';
import DetailTakmir from './pages/superadmin/takmir/DetailTakmir';
import HapusTakmir from './pages/superadmin/takmir/HapusTakmir';

// Import untuk kepengurusan
import DataKepengurusan from './pages/superadmin/kepengurusan/DataKepengurusan';
import TambahKepengurusan from './pages/superadmin/kepengurusan/TambahKepengurusan';
import EditKepengurusan from './pages/superadmin/kepengurusan/EditKepengurusan';
import DetailKepengurusan from './pages/superadmin/kepengurusan/DetailKepengurusan';
import HapusKepengurusan from './pages/superadmin/kepengurusan/HapusKepengurusan';

// Import untuk program
import DataProgram from './pages/superadmin/program/DataProgram';
import TambahProgram from './pages/superadmin/program/TambahProgram';
import EditProgram from './pages/superadmin/program/EditProgram';
import DetailProgram from './pages/superadmin/program/DetailProgram';
import HapusProgram from './pages/superadmin/program/HapusProgram';

// Import untuk berita (BARU)
import DataBerita from './pages/superadmin/berita/DataBerita';
import TambahBerita from './pages/superadmin/berita/TambahBerita';
import EditBerita from './pages/superadmin/berita/EditBerita';
import DetailBerita from './pages/superadmin/berita/DetailBerita';
import HapusBerita from './pages/superadmin/berita/HapusBerita';

// Import untuk kegiatan (BARU)
import DataKegiatan from './pages/superadmin/kegiatan/DataKegiatan';
import TambahKegiatan from './pages/superadmin/kegiatan/TambahKegiatan';
import EditKegiatan from './pages/superadmin/kegiatan/EditKegiatan';
import DetailKegiatan from './pages/superadmin/kegiatan/DetailKegiatan';
import HapusKegiatan from './pages/superadmin/kegiatan/HapusKegiatan';

const SuperAdminApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Tambah navigate

  const handleLogout = () => {
    if (window.confirm("Apakah anda yakin ingin keluar?")) {
      localStorage.clear();
      setUser(null);
      setIsLoggedIn(false);
      navigate('/login'); // Redirect ke /login
    }
  };

  // Memoize array routes, tapi panggil useRoutes di top level
  const routesArray = useMemo(() => [
    { path: '', element: <SuperAdminDashboard user={user} onLogout={handleLogout} /> },
    { path: 'masjid', element: <DataMasjid user={user} onLogout={handleLogout} /> },
    { path: 'masjid/tambah', element: <TambahMasjid user={user} onLogout={handleLogout} /> },
    { path: 'masjid/edit/:id', element: <EditMasjid user={user} onLogout={handleLogout} /> },
    { path: 'masjid/detail/:id', element: <DetailMasjid user={user} onLogout={handleLogout} /> },
    { path: 'masjid/hapus/:id', element: <HapusMasjid user={user} onLogout={handleLogout} /> },
    
    // Routes untuk takmir
    { path: 'takmir', element: <DataTakmir user={user} onLogout={handleLogout} /> },
    { path: 'takmir/tambah', element: <TambahTakmir user={user} onLogout={handleLogout} /> },
    { path: 'takmir/edit/:id', element: <EditTakmir user={user} onLogout={handleLogout} /> },
    { path: 'takmir/detail/:id', element: <DetailTakmir user={user} onLogout={handleLogout} /> },
    { path: 'takmir/hapus/:id', element: <HapusTakmir user={user} onLogout={handleLogout} /> },
    
    // Routes untuk kepengurusan
    { path: 'kepengurusan', element: <DataKepengurusan user={user} onLogout={handleLogout} /> },
    { path: 'kepengurusan/tambah', element: <TambahKepengurusan user={user} onLogout={handleLogout} /> },
    { path: 'kepengurusan/edit/:id', element: <EditKepengurusan user={user} onLogout={handleLogout} /> },
    { path: 'kepengurusan/detail/:id', element: <DetailKepengurusan user={user} onLogout={handleLogout} /> },
    { path: 'kepengurusan/hapus/:id', element: <HapusKepengurusan user={user} onLogout={handleLogout} /> },
    
    // Routes untuk program
    { path: 'program', element: <DataProgram user={user} onLogout={handleLogout} /> },
    { path: 'program/tambah', element: <TambahProgram user={user} onLogout={handleLogout} /> },
    { path: 'program/edit/:id', element: <EditProgram user={user} onLogout={handleLogout} /> },
    { path: 'program/detail/:id', element: <DetailProgram user={user} onLogout={handleLogout} /> },
    { path: 'program/hapus/:id', element: <HapusProgram user={user} onLogout={handleLogout} /> },
    
    // Routes untuk berita (BARU)
    { path: 'berita', element: <DataBerita user={user} onLogout={handleLogout} /> },
    { path: 'berita/tambah', element: <TambahBerita user={user} onLogout={handleLogout} /> },
    { path: 'berita/edit/:id', element: <EditBerita user={user} onLogout={handleLogout} /> },
    { path: 'berita/detail/:id', element: <DetailBerita user={user} onLogout={handleLogout} /> },
    { path: 'berita/hapus/:id', element: <HapusBerita user={user} onLogout={handleLogout} /> },
    
    // Routes untuk kegiatan (BARU)
    { path: 'kegiatan', element: <DataKegiatan user={user} onLogout={handleLogout} /> },
    { path: 'kegiatan/tambah', element: <TambahKegiatan user={user} onLogout={handleLogout} /> },
    { path: 'kegiatan/edit/:id', element: <EditKegiatan user={user} onLogout={handleLogout} /> },
    { path: 'kegiatan/detail/:id', element: <DetailKegiatan user={user} onLogout={handleLogout} /> },
    { path: 'kegiatan/hapus/:id', element: <HapusKegiatan user={user} onLogout={handleLogout} /> },
  ], [user]); // Dependensi user

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
          if (res.data.role === 'super admin') {
            setUser(res.data);
            setIsLoggedIn(true);
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
    <div className="min-h-screen bg-gray-100">
      {routes}
    </div>
  );
};

export default SuperAdminApp;