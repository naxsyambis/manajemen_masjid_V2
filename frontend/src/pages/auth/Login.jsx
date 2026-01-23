import React, { useState } from 'react';
import axios from 'axios';
import Button from '../../components/Button';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: email,
        password: password
      });

      if (response.data.token) {
        const token = response.data.token;
        
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        
        localStorage.setItem('token', token);
        
        localStorage.setItem('user_session', JSON.stringify({ 
          email: email, 
          role: payload.role,
          masjid_id: payload.masjid_id,
          user_id: payload.user_id,
          nama: email.split('@')[0].toUpperCase() 
        }));
        
        onLogin();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login Gagal! Akun tidak ditemukan di XAMPP.");
    }
  };

  return (
    <div className="min-h-screen bg-mu-green flex items-center justify-center p-0 md:p-6">
      <div className="bg-white w-full max-w-5xl md:h-[600px] flex rounded-none md:rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex flex-1 bg-mu-yellow items-center justify-center p-12 relative overflow-hidden">
          <div className="z-10 text-center">
            <h1 className="text-5xl font-black text-mu-green tracking-tighter mb-4 uppercase">SIM MASJID</h1>
            <p className="text-mu-green font-bold text-lg opacity-80 uppercase tracking-widest">Panel Takmir</p>
            <div className="h-1 w-20 bg-mu-green mx-auto my-8"></div>
            <p className="text-mu-green italic font-medium leading-relaxed max-w-xs mx-auto">
              Sistem Informasi Manajemen Administrasi Masjid.
            </p>
          </div>
          <div className="absolute -bottom-10 -left-10 text-[300px] opacity-10 text-mu-green">🕌</div>
        </div>

        <div className="flex-1 flex flex-col justify-center p-8 md:p-16">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Login Takmir</h2>
            <p className="text-gray-400 mt-2 font-medium italic">Masukkan akun dari Super Admin.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
              <input 
                type="email" required placeholder="syafira@gmail.com"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-mu-green"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <input 
                type="password" required placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-mu-green"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="primary" className="w-full py-4 rounded-2xl text-lg shadow-xl">
              Masuk Sekarang
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;