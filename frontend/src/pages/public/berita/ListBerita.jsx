// frontend/src/pages/public/berita/ListBerita.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

// 🔥 FUNGSI PINTAR UNTUK MENGATASI PATH GAMBAR
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/800x400?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
  return `http://localhost:3000/uploads/berita/${imagePath}`;
};

const ListBerita = () => {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const response = await fetch('http://localhost:3000/public/berita');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        
        const sortedData = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setBerita(sortedData);
      } catch (err) {
        setError(err.message || 'Gagal mengambil data berita.');
      } finally {
        setLoading(false);
      }
    };
    fetchBerita();
  }, []);

  const getExcerpt = (text, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const totalPages = Math.ceil(berita.length / itemsPerPage);
  const currentBerita = berita.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-2xl font-bold text-[#006227]">Memuat berita...</div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />
      <main className="site-bg pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight">Berita Ranting</h1>
            <p className="text-lg md:text-xl text-[#1e293b] max-w-3xl mx-auto leading-relaxed">
              Daftar lengkap berita dan informasi terkini seputar kegiatan ranting Muhammadiyah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentBerita.length > 0 ? (
              currentBerita.map((item) => {
                
                // 🔥 LOGIKA MENGAMBIL NAMA MASJID: 
                // Cek langsung dari berita, kalau gak ada ambil dari relasi takmir pembuat berita
                const namaMasjid = item.masjid?.nama_masjid || item.user?.takmirs?.[0]?.masjid?.nama_masjid || 'Masjid tidak diketahui';

                return (
                  <Link
                    key={item.berita_id}
                    to={`/berita/${item.berita_id}`}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 block border border-gray-100 flex flex-col"
                  >
                    <div className="relative h-60 w-full overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={getImageUrl(item.gambar)}
                        alt={item.judul}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'; }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-[#006227] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                          Berita
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#006227] mb-3 group-hover:text-[#004a1e] transition-colors line-clamp-2 leading-snug">
                          {item.judul || 'Judul tidak tersedia'}
                        </h3>
                        <p className="text-[#1e293b] mb-4 line-clamp-3 leading-relaxed text-sm">
                          {getExcerpt(item.isi || 'Isi berita tidak tersedia')}
                        </p>

                        <div className="flex items-center gap-2 mb-2 text-sm text-[#006227] font-semibold">
                          <span>🕌</span>
                          <span>{namaMasjid}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <span>🗓️</span> 
                          {new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[#006227] group-hover:translate-x-2 transition-transform font-bold text-lg">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center text-[#1e293b] py-12">
                <p className="text-lg">Tidak ada berita tersedia.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-[#006227] text-white rounded-lg disabled:opacity-50">Prev</button>
              <span className="px-4 font-bold text-[#006227]">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-[#006227] text-white rounded-lg disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      </main>
      <FooterPublic />
    </div>
  );
};

export default ListBerita;