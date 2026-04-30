// frontend/src/pages/public/berita/DetailBerita.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

// 🔥 FUNGSI PINTAR UNTUK MENGATASI PATH GAMBAR
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/800x400?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
  return `http://localhost:3000/uploads/berita/${imagePath}`;
};

const DetailBerita = () => {
  const { id } = useParams();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeritaDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/public/berita/${id}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        setBerita(data);
      } catch (err) {
        setError(err.message || 'Gagal mengambil data berita.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBeritaDetail();
  }, [id]);

  if (loading) return (
    <div className="font-sans overflow-x-hidden min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-2xl font-bold text-[#006227]">Memuat detail berita...</div>
    </div>
  );

  if (!berita) return null;

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />
      <main className="site-bg pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100">
            
            <div className="mb-8 text-center">
              <span className="inline-block px-4 py-1 bg-[#006227]/10 text-[#006227] text-sm font-bold rounded-full mb-4 uppercase tracking-widest">
                Berita Ranting
              </span>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-800 mb-6 leading-tight">
                {berita.judul}
              </h1>
              <p className="text-gray-500 font-medium">
                Dipublikasikan pada: {new Date(berita.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="mb-10 rounded-3xl overflow-hidden shadow-lg bg-gray-100">
              <img
                src={getImageUrl(berita.gambar)}
                alt={berita.judul}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/800x400?text=No+Image"; }}
              />
            </div>

            {berita.gambar_list && berita.gambar_list.length > 0 && (
              <div className="mb-10 grid grid-cols-2 md:grid-cols-3 gap-4">
                {berita.gambar_list.map((item, index) => (
                  <img
                    key={item.gambar_id}
                    src={getImageUrl(item.path_gambar)} 
                    alt={`Galeri ${index}`}
                    className="w-full h-32 md:h-48 object-cover rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:scale-105 transition"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}
            
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-12 whitespace-pre-wrap text-justify">
              {berita.isi}
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-100">
              <Link to="/berita" className="inline-flex items-center px-8 py-4 bg-[#006227] text-white rounded-2xl font-bold hover:bg-[#004a1e] transition-all shadow-lg hover:-translate-y-1">
                Kembali ke Daftar Berita
              </Link>
            </div>
            
          </div>
        </div>
      </main>
      <FooterPublic />
    </div>
  );
};

export default DetailBerita;