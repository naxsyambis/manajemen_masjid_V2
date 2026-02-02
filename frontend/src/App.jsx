import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PublicApp from './PublicApp';
import AdminApp from './AdminApp';
import SuperAdminApp from './SuperAdminApp';
import Login from './pages/auth/Login';

const AppWrapper = () => {
  const [currentApp, setCurrentApp] = useState('public'); // 'public', 'admin', 'superadmin'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:3000/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.role === 'takmir') {
            setCurrentApp('admin');
            navigate('/admin'); // Navigasi otomatis ke admin
          } else if (res.data.role === 'super admin') {
            setCurrentApp('superadmin');
            navigate('/superadmin'); // Navigasi otomatis ke superadmin
          } else {
            setCurrentApp('public');
            localStorage.clear();
          }
        } catch (err) {
          setCurrentApp('public');
          localStorage.clear();
        }
      } else {
        setCurrentApp('public');
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

  if (currentApp === 'admin') {
    return <AdminApp />;
  } else if (currentApp === 'superadmin') {
    return <SuperAdminApp />;
  } else {
    // Render PublicApp untuk public (default)
    return <PublicApp />;
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<PublicApp />} /> {/* Ubah dari "/" ke "/*" agar parent match semua path dan child routes di PublicApp bisa render tanpa warning */}
        <Route path="/login" element={<Login />} /> {/* Halaman login */}
        <Route path="/admin/*" element={<AdminApp />} /> {/* Panggil AdminApp untuk route admin */}
        <Route path="/superadmin/*" element={<SuperAdminApp />} /> {/* Panggil SuperAdminApp untuk route superadmin */}
        {/* Hapus fallback <Route path="/*" element={<PublicApp />} /> karena sudah digantikan di atas */}
      </Routes>
    </Router>
  );
};

export default App;