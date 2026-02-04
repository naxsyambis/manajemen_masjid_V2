// frontend/src/components/KegiatanSection.jsx (atau path yang sesuai)

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Asumsikan menggunakan React Router

const KegiatanSection = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState([]); // State untuk kartu yang expanded
  const hasFetched = useRef(false); // Flag untuk mencegah fetch ganda

  // Fungsi untuk fetch kegiatan dari backend
  useEffect(() => {
    if (hasFetched.current) return; // Jika sudah fetch, skip
    hasFetched.current = true;

    const fetchKegiatan = async () => {
      try {
        console.log('Fetching kegiatan from: http://localhost:3000/public/kegiatan'); // Logging URL untuk debugging
        const response = await fetch('http://localhost:3000/public/kegiatan'); // Pastikan URL backend benar dan server berjalan
        console.log('Response status for kegiatan:', response.status); // Logging status HTTP
        if (!response.ok) {
          throw new Error(`Gagal mengambil data kegiatan: ${response.status} ${response.statusText}`);
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

  // Fungsi untuk toggle expand kartu
  const toggleExpand = (index) => {
    setExpandedCards((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
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

  if (loading) {
    return (
      <section id="kegiatan" className="kegiatan-section animate-fadeIn relative py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse text-2xl text-[#1e293b]">Memuat kegiatan...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="kegiatan" className="kegiatan-section animate-fadeIn relative py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl text-red-500">Error: {error}</div>
          <p className="text-sm text-[#1e293b] mt-2">Periksa console browser untuk detail lebih lanjut.</p>
        </div>
      </section>
    );
  }

  // Ambil hanya 3 kegiatan terbaru
  const kegiatanTerbaru = kegiatan.slice(0, 3);

  return (
    <section id="kegiatan" className="kegiatan-section animate-fadeIn relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight">Kegiatan Ranting</h2>
          <p className="text-lg md:text-xl text-[#1e293b] max-w-3xl mx-auto leading-relaxed">
            Daftar kegiatan yang diselenggarakan oleh Ranting Masjid Muhammadiyah untuk kemajuan umat dan masyarakat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center relative z-10"> {/* Gunakan place-items-center untuk center item di grid */}
          {kegiatanTerbaru.length > 0 ? (
            kegiatanTerbaru.map((item, index) => (
              <div
                key={item.kegiatan_id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 stat-card-hover w-full max-w-sm min-h-[400px] flex flex-col" // min-h-[400px] untuk tinggi minimum sama, tanpa tinggi tetap
              >
                <div className="p-6 flex-grow flex flex-col"> {/* flex-grow dan flex flex-col untuk mengisi ruang, tanpa overflow-y-auto */}
                  {/* Ikon di atas */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[#006227] to-[#004a1e] rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {icons[index] || (
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
                  <p className={`text-[#1e293b] leading-relaxed mb-6 flex-grow ${expandedCards[index] ? '' : 'line-clamp-3'}`}> {/* flex-grow agar deskripsi mengisi ruang */}
                    {expandedCards[index] ? item.deskripsi : getExcerpt(item.deskripsi)}
                  </p>
                  {/* Tombol untuk expand/collapse */}
                  <div className="flex justify-end mt-auto"> {/* mt-auto untuk push ke bawah */}
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-[#006227] hover:text-[#004a1e] font-semibold transition-colors"
                    >
                      {expandedCards[index] ? 'Baca Lebih Sedikit' : 'Baca Selengkapnya'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-[#1e293b] py-12"> {/* Gunakan col-span-full untuk span seluruh grid */}
              <p className="text-lg">Tidak ada kegiatan tersedia.</p>
            </div>
          )}
        </div>

        {/* Button Kegiatan Lainnya */}
        <div className="text-center mt-12 relative z-10">
          <Link
            to="/kegiatan" // Link ke halaman kegiatan lengkap; sesuaikan dengan routing Anda
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold shadow-lg hover:bg-[#004a1e] transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
          >
            <span>Kegiatan Lainnya</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default KegiatanSection;