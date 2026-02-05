// frontend/src/pages/auth/ForgotPassword.jsx

import React from 'react';
import { MessageCircle, HelpCircle, ArrowLeft, Shield } from 'lucide-react'; // Tambahkan Shield untuk elemen dekoratif
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const adminWA = "6281234567890"; // Ganti dengan nomor WA admin yang sesuai
  const pesanWA = encodeURIComponent("Halo Admin SIM Masjid, saya Takmir ingin reset password akun saya. Mohon bantuan untuk langkah selanjutnya.");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f4f7fb] to-[#e8f4f8] flex items-center justify-center px-6 animate-fadeIn">
      {/* Overlay halus untuk efek modern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-lg px-10 py-14 rounded-3xl shadow-2xl border border-white/20 transition-all hover:shadow-3xl hover:scale-[1.02]">
        {/* Header dengan elemen dekoratif */}
        <div className="mb-12 space-y-4 text-center relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-mu-green to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight pt-10">
            Lupa Password
          </h2>
          <p className="text-sm text-gray-500 italic leading-relaxed">
            Jangan khawatir, kami siap membantu Anda reset password melalui WhatsApp.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-mu-green to-mu-yellow mx-auto rounded-full"></div>
        </div>

        {/* Konten Utama - Gradient Card dengan efek modern */}
        <div className="bg-gradient-to-br from-mu-green via-green-700 to-green-900 p-10 rounded-3xl shadow-2xl text-white space-y-6 relative overflow-hidden group transition-all hover:scale-[1.02] hover:shadow-3xl">
          {/* Elemen dekoratif animasi */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20"></div>
          <div className="absolute -right-8 -bottom-8 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <HelpCircle size={200} />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                <HelpCircle size={24} className="text-mu-yellow" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest opacity-90">Bantuan Reset</span>
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black leading-tight">Butuh Reset Password?</h4>
              <p className="text-xs opacity-80 font-medium italic leading-relaxed">
                Hubungi Pengurus Ranting melalui WhatsApp resmi untuk panduan reset cepat dan aman.
              </p>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${adminWA}?text=${pesanWA}`, '_blank')}
              className="w-full bg-white/95 text-mu-green py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mu-yellow hover:text-mu-green transition-all shadow-xl active:scale-95 backdrop-blur-sm"
            >
              <MessageCircle size={20} /> Chat Admin WA Sekarang
            </button>
          </div>
        </div>

        {/* Button Kembali dengan desain modern */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-mu-green py-4 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:from-gray-200 hover:to-gray-300 transition-all shadow-lg active:scale-95 border border-gray-300/50"
          >
            <ArrowLeft size={20} /> Ingat Password? Kembali ke Login
          </button>
        </div>

        {/* Footer dengan efek halus */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 italic leading-relaxed">
            © {new Date().getFullYear()} SIM MASJID — Sistem Informasi Manajemen Masjid
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-mu-green rounded-full"></div>
            <div className="w-2 h-2 bg-mu-yellow rounded-full"></div>
            <div className="w-2 h-2 bg-mu-green rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;