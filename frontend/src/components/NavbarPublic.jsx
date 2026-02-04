// frontend/src/components/NavbarPublic.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react'; // Tambahkan ChevronDown untuk icon dropdown
import logoMu from '../assets/logo_mu.png'; // Import logo dari assets

const NavbarPublic = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false); // State untuk dropdown login
  const navigate = useNavigate();

  const handleSectionLink = (section) => {
    navigate('/', { state: { scrollTo: section } });
    setIsMobileMenuOpen(false); // Tutup menu mobile setelah klik
  };

  const handlePageLink = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Tutup menu mobile setelah klik
  };

  const handleLoginOption = (option) => {
    // Untuk sementara, kedua opsi navigasi ke halaman login yang sama
    // Jika perlu beda path, bisa sesuaikan: misal '/login-takmir' atau '/login-ranting'
    navigate('/login'); // Navigasi ke halaman login
    setIsLoginDropdownOpen(false); // Tutup dropdown setelah klik
    setIsMobileMenuOpen(false); // Tutup menu mobile jika di mobile
  };

  return (
    <header className="h-20 bg-green-900 text-white flex items-center justify-between px-6 lg:px-10 fixed top-0 left-0 right-0 z-50 transition-all border-b border-black shadow-md">
      {/* Logo dan Teks */}
      <div className="flex items-center gap-4 group">
        <div className="w-12 h-12 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-50 p-1 transform group-hover:scale-110 transition-transform duration-300">
          <img 
            src={logoMu} // Menggunakan logo yang diimpor dari assets
            alt="Logo Muhammadiyah" 
            className="w-full h-full object-contain"
            onError={(e) => { 
              e.target.src = 'https://picsum.photos/48/48?random=1'; // Placeholder stabil sebagai fallback
            }}
          />
        </div>

        <div className="flex flex-col">
          <h2 className="text-mu-yellow font-black text-lg md:text-xl uppercase tracking-tighter leading-none truncate max-w-[180px] md:max-w-md">
            Muhammadiyah
          </h2>
          <p className="text-[9px] font-bold text-white/90 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-1.5">
            <span className="w-1 h-1 bg-mu-yellow rounded-full"></span>
            Manajemen Masjid
          </p>
        </div>
      </div>

      {/* Menu Desktop */}
      <nav className="hidden md:flex items-center space-x-2" role="navigation" aria-label="Main navigation">
        <button onClick={() => handleSectionLink('home')} className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Home</button>
        <button onClick={() => handleSectionLink('masjid')} className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Masjid</button>
        <button onClick={() => handleSectionLink('berita')} className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Berita Ranting</button>
        <button onClick={() => handleSectionLink('program')} className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Program Ranting</button>
        <button onClick={() => handleSectionLink('kegiatan')} className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Kegiatan</button>
        <button onClick={() => handlePageLink('/kepengurusan')} className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Kepengurusan Ranting</button>
        
        {/* Tombol Login dengan Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)} 
            className="px-4 py-2 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none flex items-center gap-1"
            aria-label="Login options"
            aria-expanded={isLoginDropdownOpen}
          >
            Login <ChevronDown size={16} />
          </button>
          {isLoginDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-xl shadow-lg border border-gray-200 z-50">
              <button 
                onClick={() => handleLoginOption('takmir')} 
                className="block w-full text-left px-4 py-3 hover:bg-mu-yellow hover:text-mu-green rounded-t-xl transition-all font-semibold focus:outline-none"
              >
                Takmir
              </button>
              <button 
                onClick={() => handleLoginOption('ranting')} 
                className="block w-full text-left px-4 py-3 hover:bg-mu-yellow hover:text-mu-green rounded-b-xl transition-all font-semibold focus:outline-none"
              >
                Ranting
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hamburger Menu untuk Mobile */}
      <div className="md:hidden">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-2 text-mu-yellow hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-colors focus:outline-none"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-green-900 border-t border-black shadow-lg md:hidden z-40" role="navigation" aria-label="Mobile navigation">
          <div className="px-6 py-4 space-y-2 max-h-96 overflow-y-auto">
            <button onClick={() => handleSectionLink('home')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Home</button>
            <button onClick={() => handleSectionLink('masjid')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Masjid</button>
            <button onClick={() => handleSectionLink('berita')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Berita Ranting</button>
            <button onClick={() => handleSectionLink('program')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Program Ranting</button>
            <button onClick={() => handleSectionLink('kegiatan')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Kegiatan</button>
            <button onClick={() => handlePageLink('/kepengurusan')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Kepengurusan Ranting</button>
            
            {/* Login Options di Mobile Menu */}
            <div className="border-t border-white/20 pt-2">
              <p className="text-white/70 font-semibold mb-2">Login</p>
              <button onClick={() => handleLoginOption('takmir')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Takmir</button>
              <button onClick={() => handleLoginOption('ranting')} className="block w-full text-left px-4 py-3 text-white/70 hover:bg-mu-yellow hover:text-mu-green rounded-xl transition-all font-semibold focus:outline-none">Ranting</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarPublic;