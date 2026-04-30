// frontend/src/pages/public/berita/DetailBerita.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

const DetailBerita = () => {
  const { id } = useParams();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeritaDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/public/berita/${id}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setBerita(data);
      } catch (err) {
        console.error('Error fetching berita detail:', err);
        setError(err.message || 'Gagal mengambil data berita. Periksa koneksi atau endpoint.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBeritaDetail();
    }
  }, [id]);

  const formatTanggal = (tanggal) => {
    if (!tanggal) return 'Tanggal tidak tersedia';
    return new Date(tanggal).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-pulse text-2xl text-[#1e293b]">Memuat detail berita...</div>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl text-red-500">Error: {error}</div>
            <p className="text-sm text-[#1e293b] mt-2">Periksa console browser untuk detail lebih lanjut.</p>
            <Link
              to="/berita"
              className="inline-block mt-4 px-6 py-3 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition-all"
            >
              Kembali ke Daftar Berita
            </Link>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl text-[#1e293b]">Berita tidak ditemukan.</div>
            <Link
              to="/berita"
              className="inline-block mt-4 px-6 py-3 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition-all"
            >
              Kembali ke Daftar Berita
            </Link>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />
      <main className="site-bg pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Header Berita */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight leading-tight">
                {berita.judul}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Admin Ranting</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatTanggal(berita.tanggal)}</span>
                  </div>
                </div>
                <span className="px-4 py-2 bg-[#006227] text-white text-sm font-semibold rounded-full shadow-md">
                  Berita
                </span>
              </div>
            </div>

            {/* 🔴 PERBAIKAN 1: Tampilkan Gambar Utama (berita.gambar) */}
            <div className="mb-8">
              <img
                src={berita.gambar ? `http://localhost:3000/uploads/berita/${berita.gambar}` : 'https://via.placeholder.com/800x400?text=No+Image'}
                alt={berita.judul}
                className="w-full h-64 md:h-[450px] object-cover rounded-2xl shadow-lg"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
                }}
              />
            </div>

            {/* 🔴 PERBAIKAN 2: Tampilkan Gambar Tambahan (Jika diupload > 1 gambar) */}
            {berita.gambar_list && berita.gambar_list.length > 0 && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {berita.gambar_list.map((item, index) => (
                  <img
                    key={item.gambar_id}
                    src={`http://localhost:3000/uploads/berita/${item.path_gambar}`} // Diperbaiki jadi item.path_gambar
                    alt={`Tambahan ${berita.judul}-${index}`}
                    className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-md border border-gray-100"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Isi Berita */}
            <div className="prose prose-lg max-w-none text-[#1e293b] leading-relaxed mb-12 text-justify">
              <div className="whitespace-pre-wrap">{berita.isi}</div>
            </div>

            {/* Jika ada URL Youtube */}
            {berita.youtube_url && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-[#006227] mb-4">Video Terkait</h3>
                <a 
                  href={berita.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {berita.youtube_url}
                </a>
              </div>
            )}

            {/* Tombol Kembali */}
            <div className="text-center mt-10 border-t border-gray-200 pt-10">
              <Link
                to="/berita"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold shadow-lg hover:bg-[#004a1e] transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
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