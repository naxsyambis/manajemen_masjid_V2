// frontend/src/pages/auth/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Tambah import untuk redirect

const Login = () => { // Hapus prop { onLogin } karena tidak digunakan
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook untuk navigasi

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password
      });

      if (response.data.token) {
        const token = response.data.token;
        const payload = JSON.parse(window.atob(token.split('.')[1])); // Parse token untuk data dasar

        localStorage.setItem('token', token);
        localStorage.setItem('user_session', JSON.stringify({ 
          email,
          role: payload.role,
          masjid_id: payload.masjid_id,
          user_id: payload.user_id
          // Nama akan diambil dari profile nanti
        }));

        // Hapus onLogin(); karena AppWrapper akan handle fetch profile otomatis saat mount

        // Redirect berdasarkan role setelah login sukses
        if (payload.role === 'super admin') {
          navigate('/superadmin'); // Redirect ke dashboard super admin
        } else if (payload.role === 'takmir') {
          navigate('/admin'); // Asumsikan admin path adalah /admin, sesuaikan jika berbeda
        } else {
          // Jika role tidak valid, redirect ke home publik
          alert("Role tidak valid. Anda akan diarahkan ke halaman utama.");
          navigate('/');
        }
      }
    } catch (err) {
      // Perbaiki error handling: lebih spesifik
      const errorMessage = err.response?.data?.message || "Login gagal. Periksa email/password atau koneksi server.";
      alert(errorMessage);
      console.error("Login error:", err); // Tambah logging untuk debug
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-[#f4f7fb]">
      {/* ================= LEFT IMAGE ================= */}
      <div 
        className="hidden md:flex relative items-center justify-center text-white"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* content */}
        <div className="relative z-10 max-w-xl px-12 space-y-8 text-center">
          <h1 className="text-5xl font-black tracking-tight leading-tight">
            SIM MASJID
          </h1>

          <div className="h-[2px] w-24 bg-mu-yellow mx-auto"></div>

          <p className="text-lg text-white/90 leading-relaxed">
            Sistem Informasi Manajemen Masjid untuk mengelola administrasi,
            keuangan, jamaah, dan inventaris secara terpusat dan profesional.
          </p>

          <div className="flex justify-center gap-8 text-sm pt-6 text-white/80">
            <span>Transparan</span>
            <span>Terintegrasi</span>
            <span>Aman</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT FORM ================= */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white px-10 py-14 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
          {/* brand */}
          <div className="mb-10 space-y-3">
            <p className="text-xs tracking-[0.3em] text-mu-green font-bold uppercase">
              Panel Takmir
            </p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Login Sistem
            </h2>
            <p className="text-sm text-gray-400 italic">
              Gunakan akun resmi yang terdaftar.
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Email
              </label>
              <input 
                type="email"
                required
                placeholder="takmir@masjid.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-mu-green focus:ring-2 focus:ring-mu-green/30 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-mu-green focus:ring-2 focus:ring-mu-green/30 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-mu-green text-mu-yellow rounded-lg font-bold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-[1px] transition-all disabled:opacity-60"
            >
              {loading ? "MEMVERIFIKASI..." : "MASUK SISTEM"}
            </button>
          </form>

          {/* Tambahan: Link Lupa Password */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-mu-green hover:text-mu-green/80 font-semibold underline transition-all"
            >
              Lupa Password?
            </button>
          </div>

          <p className="mt-12 text-center text-[11px] text-gray-400 italic">
            © {new Date().getFullYear()} SIM MASJID — Sistem Informasi Manajemen Masjid
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;