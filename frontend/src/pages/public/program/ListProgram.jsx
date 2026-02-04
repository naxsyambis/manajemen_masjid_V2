// frontend/src/pages/public/program/ListProgram.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarPublic from '/src/components/NavbarPublic'; // Path absolut untuk menghindari error import
import FooterPublic from '/src/components/FooterPublic'; // Path absolut untuk menghindari error import

const ListProgram = () => {
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [expanded, setExpanded] = useState({}); // State untuk melacak kartu yang diperluas

  // Fungsi untuk fetch semua program dari backend
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        console.log('Fetching program from: http://localhost:3000/public/program'); // Logging URL untuk debugging
        const response = await fetch('http://localhost:3000/public/program'); // Pastikan URL backend benar dan server berjalan
        console.log('Response status for program:', response.status); // Logging status HTTP
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Data program received:', data); // Logging data yang diterima
        // Sort berdasarkan program_id descending (terbaru dulu, asumsikan ID auto-increment)
        const sortedData = data.sort((a, b) => b.program_id - a.program_id);
        setProgram(sortedData);
      } catch (err) {
        console.error('Error fetching program:', err); // Logging error detail
        setError(err.message || 'Gagal mengambil data program. Periksa koneksi atau endpoint.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, []);

  // Fungsi untuk memotong deskripsi (excerpt)
  const getExcerpt = (text, maxLength = 120) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fungsi untuk toggle expanded
  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Array ikon SVG (sesuai urutan program; bisa diganti jika ada field di backend)
  const icons = [
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>, // Buku untuk pendidikan
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>, // Buku lagi
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>, // Hati untuk sosial
    <svg className="w-8 h-8 text-[#fecb00]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg> // Topi wisuda untuk pendidikan
  ];

  // Hitung total halaman
  const totalPages = Math.ceil(program.length / itemsPerPage);

  // Potong program berdasarkan halaman saat ini
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProgram = program.slice(startIndex, endIndex);

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
            <div className="animate-pulse text-2xl text-[#1e293b]">Memuat program...</div>
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
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight">Program Ranting</h1>
            <p className="text-lg md:text-xl text-[#1e293b] max-w-3xl mx-auto leading-relaxed">
              Daftar lengkap program yang diselenggarakan oleh Ranting Masjid Muhammadiyah untuk kemajuan umat dan masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentProgram.length > 0 ? (
              currentProgram.map((item, index) => (
                <div
                  key={item.program_id}
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
                      {item.nama_program}
                    </h3>
                    <p className="text-[#1e293b] leading-relaxed mb-6 line-clamp-3">
                      {expanded[item.program_id] ? item.deskripsi : getExcerpt(item.deskripsi)}
                    </p>
                    {/* Tombol Baca Selengkapnya */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleExpanded(item.program_id)}
                        className="text-[#006227] hover:text-[#004a1e] transition-colors font-bold text-lg flex items-center space-x-1"
                      >
                        <span>{expanded[item.program_id] ? 'Tutup' : 'Baca Selengkapnya'}</span>
                        <span className={`transform transition-transform ${expanded[item.program_id] ? 'rotate-180' : ''}`}>↓</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-[#1e293b] py-12">
                <p className="text-lg">Tidak ada program tersedia.</p>
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

export default ListProgram;