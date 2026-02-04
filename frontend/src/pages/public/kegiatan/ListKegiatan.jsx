// frontend/src/pages/public/kegiatan/ListKegiatan.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarPublic from '/src/components/NavbarPublic'; // Path absolut untuk menghindari error import
import FooterPublic from '/src/components/FooterPublic'; // Path absolut untuk menghindari error import

const ListKegiatan = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [expanded, setExpanded] = useState({}); // State untuk melacak kartu yang diperluas

  // Fungsi untuk fetch semua kegiatan dari backend
  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        console.log('Fetching kegiatan from: http://localhost:3000/public/kegiatan'); // Logging URL untuk debugging
        const response = await fetch('http://localhost:3000/public/kegiatan'); // Pastikan URL backend benar dan server berjalan
        console.log('Response status for kegiatan:', response.status); // Logging status HTTP
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Data kegiatan received:', data); // Logging data yang diterima
        // Sort berdasarkan waktu_kegiatan descending (terbaru dulu)
        const sortedData = data.sort((a, b) => new Date(b.waktu_kegiatan) - new Date(a.waktu_kegiatan));
        setKegiatan(sortedData);
      } catch (err) {
        console.error('Error fetching kegiatan:', err); // Logging error detail
        setError(err.message || 'Gagal mengambil data kegiatan. Periksa koneksi atau endpoint.');
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

  // Fungsi untuk memotong deskripsi (excerpt)
  const getExcerpt = (text, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fungsi untuk format waktu_kegiatan
  const formatWaktu = (waktu) => {
    if (!waktu) return 'Waktu belum ditentukan';
    return new Date(waktu).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fungsi untuk toggle expanded
  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Array ikon SVG (sesuai urutan kegiatan; bisa diganti jika ada field di backend)
  const icons = [
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4a4 4 0 014-4h4a4 4 0 014 4v4M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85M8 11a4 4 0 100-8 4 4 0 000 8z" />
    </svg>, // Masjid/komunitas
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>, // Kalender
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>, // Orang
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg> // Pesta/bintang
  ];

  // Hitung total halaman
  const totalPages = Math.ceil(kegiatan.length / itemsPerPage);

  // Potong kegiatan berdasarkan halaman saat ini
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKegiatan = kegiatan.slice(startIndex, endIndex);

  // Fungsi untuk navigasi halaman
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg pt-32 pb-20"> {/* Diubah dari py-20 menjadi pt-32 pb-20 untuk memberikan lebih banyak space di atas */}
          <div className="container mx-auto px-6 text-center">
            <div className="animate-pulse text-2xl text-[#1e293b]">Memuat kegiatan...</div>
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
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight">Kegiatan Ranting</h1>
            <p className="text-lg md:text-xl text-[#1e293b] max-w-3xl mx-auto leading-relaxed">
              Daftar lengkap kegiatan yang diselenggarakan oleh Ranting Masjid Muhammadiyah untuk kemajuan umat dan masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentKegiatan.length > 0 ? (
              currentKegiatan.map((item, index) => (
                <div
                  key={item.kegiatan_id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-4 border border-gray-100 stat-card-hover"
                >
                  <div className="p-6">
                    {/* Ikon di atas */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[#006227] to-[#004a1e] rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      {icons[index % icons.length] || (
                        <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )} {/* Fallback ikon */}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[#006227] mb-4 group-hover:text-[#004a1e] transition-colors line-clamp-2 leading-tight">
                      {item.nama_kegiatan}
                    </h3>
                    <div className="text-sm text-gray-500 space-y-2 mb-6">
                      <p className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong>Waktu:</strong> {formatWaktu(item.waktu_kegiatan)}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span><strong>Lokasi:</strong> {item.lokasi || 'Lokasi belum ditentukan'}</span>
                      </p>
                    </div>
                    <p className={`text-[#1e293b] leading-relaxed mb-6 ${expanded[item.kegiatan_id] ? '' : 'line-clamp-3'}`}>
                      {expanded[item.kegiatan_id] ? item.deskripsi : getExcerpt(item.deskripsi)}
                    </p>
                    {/* Tombol untuk expand/collapse */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleExpanded(item.kegiatan_id)}
                        className="text-[#006227] hover:text-[#004a1e] font-semibold transition-colors"
                      >
                        {expanded[item.kegiatan_id] ? 'Baca Lebih Sedikit' : 'Baca Selengkapnya'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-[#1e293b] py-12">
                <p className="text-lg">Tidak ada kegiatan tersedia.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#006227] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#004a1e] transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => goToPage(index + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === index + 1
                      ? 'bg-[#006227] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#006227] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#004a1e] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <FooterPublic />
    </div>
  );
};

export default ListKegiatan;