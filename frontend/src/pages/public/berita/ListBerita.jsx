// frontend/src/pages/public/berita/ListBerita.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic'; // Path relatif untuk menghindari error import
import FooterPublic from '../../../components/FooterPublic'; // Path relatif untuk menghindari error import

const ListBerita = () => {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch semua berita dari backend
  useEffect(() => {
    const fetchBerita = async () => {
      try {
        console.log('Fetching berita from: http://localhost:3000/public/berita'); // Logging URL untuk debugging
        const response = await fetch('http://localhost:3000/public/berita'); // Pastikan URL backend benar dan server berjalan
        console.log('Response status for berita:', response.status); // Logging status HTTP
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Data berita received:', data); // Logging data yang diterima
        // Sort berdasarkan tanggal descending (terbaru dulu)
        const sortedData = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setBerita(sortedData);
      } catch (err) {
        console.error('Error fetching berita:', err); // Logging error detail
        setError(err.message || 'Gagal mengambil data berita. Periksa koneksi atau endpoint.');
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []);

  // Fungsi untuk memotong isi berita (excerpt)
  const getExcerpt = (text, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fungsi untuk format tanggal
  const formatTanggal = (tanggal) => {
    if (!tanggal) return 'Tanggal tidak tersedia';
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg pt-32 pb-20"> {/* Diubah dari py-20 menjadi pt-32 pb-20 untuk memberikan lebih banyak space di atas */}
          <div className="container mx-auto px-6 text-center">
            <div className="animate-pulse text-2xl text-[#1e293b]">Memuat berita...</div>
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
        <main className="site-bg pt-32 pb-20"> {/* Diubah dari py-20 menjadi pt-32 pb-20 untuk memberikan lebih banyak space di atas */}
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl text-red-500">Error: {error}</div>
            <p className="text-sm text-[#1e293b] mt-2">Periksa console browser untuk detail lebih lanjut.</p>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />
      <main className="site-bg pt-32 pb-20"> {/* Diubah dari py-20 menjadi pt-32 pb-20 untuk memberikan lebih banyak space di atas */}
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight">Berita Ranting</h1>
            <p className="text-lg md:text-xl text-[#1e293b] max-w-3xl mx-auto leading-relaxed">
              Daftar lengkap berita dan informasi terkini seputar kegiatan ranting Muhammadiyah.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            {berita.length > 0 ? (
              berita.map((item) => (
                <Link
                  key={item.berita_id}
                  to={`/berita/${item.berita_id}`} // Link ke halaman detail berita; sesuaikan dengan routing Anda
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-4 block border border-gray-100 stat-card-hover max-w-lg w-full"
                >
                  <div className="relative h-60 overflow-hidden rounded-t-2xl">
                    <img
                      src={item.gambar ? `http://localhost:3000${item.gambar}` : 'https://via.placeholder.com/800x400?text=No+Image'} // Fallback jika gambar kosong, dan gunakan full URL untuk gambar
                      alt={item.judul}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'; }} // Fallback jika gambar gagal load
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-[#006227] text-white text-sm font-semibold rounded-full shadow-md backdrop-blur-sm">
                        Berita
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-[#006227] mb-3 group-hover:text-[#004a1e] transition-colors line-clamp-2 leading-tight">
                      {item.judul || 'Judul tidak tersedia'}
                    </h3>
                    <p className="text-[#1e293b] mb-4 line-clamp-3 leading-relaxed">
                      {getExcerpt(item.isi || 'Isi berita tidak tersedia')}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex flex-col space-y-1 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Admin Ranting</span> {/* Hardcoded; ganti jika ada data user */}
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatTanggal(item.tanggal)}</span>
                        </div>
                      </div>
                      <span className="text-[#006227] group-hover:translate-x-2 transition-transform font-bold text-lg">→</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-[#1e293b] py-12">
                <p className="text-lg">Tidak ada berita tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <FooterPublic />
    </div>
  );
};

export default ListBerita;