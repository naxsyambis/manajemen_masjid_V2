// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
// import PublicApp from './PublicApp'; // Uncomment jika ada komponen PublicApp
import AdminApp from './AdminApp';
import SuperAdminApp from './SuperAdminApp';
import Login from './pages/auth/Login'; // Tambah import Login

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
            navigate('/admin');
          } else if (res.data.role === 'super admin') {
            setCurrentApp('superadmin');
            navigate('/superadmin');
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
    // Placeholder untuk public app, ganti dengan <PublicApp /> jika ada komponen
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div>
          <h1 className="text-2xl font-bold mb-4">Selamat Datang di SIM MASJID</h1>
          <p>Klik <a href="/login" className="text-blue-500 underline">di sini</a> untuk login.</p>
        </div>
      </div>
    );
  }
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppWrapper />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/superadmin/*" element={<SuperAdminApp />} />
        <Route path="/*" element={<AppWrapper />} />
      </Routes>
    </Router>
  );
};

export default App;