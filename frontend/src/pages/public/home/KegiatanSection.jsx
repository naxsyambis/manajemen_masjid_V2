import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Asumsikan menggunakan React Router

const KegiatanSection = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch kegiatan dari backend
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

  // Array ikon hardcoded (sesuai urutan kegiatan; bisa diganti jika ada field di backend)
  const icons = ['🕌', '📅', '👥', '🎉']; // Tambah lebih jika kegiatan > 4

  if (loading) {
    return (
      <section id="kegiatan" className="py-20 bg-[#daf1de]/40">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl">Memuat kegiatan...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="kegiatan" className="py-20 bg-[#daf1de]/40">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl text-red-500">Error: {error}</div>
          <p className="text-sm text-gray-600 mt-2">Periksa console browser untuk detail lebih lanjut.</p>
        </div>
      </section>
    );
  }

  // Ambil hanya 3 kegiatan terbaru
  const kegiatanTerbaru = kegiatan.slice(0, 3);

  return (
    <section id="kegiatan" className="py-20 bg-[#daf1de]/40 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#163832] mb-4">
            Kegiatan Ranting
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Daftar kegiatan yang diselenggarakan oleh Ranting Masjid Muhammadiyah untuk kemajuan umat dan masyarakat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {kegiatanTerbaru.length > 0 ? (
            kegiatanTerbaru.map((item, index) => (
              <div
                key={item.kegiatan_id}
                className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-3 border border-gray-200/50"
              >
                {/* Ikon di atas */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#235347] to-[#163832] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-white text-3xl">{icons[index] || '📋'}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#163832] mb-4 group-hover:text-[#235347] transition-colors line-clamp-2">
                  {item.nama_kegiatan}
                </h3>
                <div className="text-sm text-gray-600 space-y-2 mb-6">
                  <p className="flex items-center space-x-2">
                    <span>🕒</span>
                    <span><strong>Waktu:</strong> {formatWaktu(item.waktu_kegiatan)}</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <span>📍</span>
                    <span><strong>Lokasi:</strong> {item.lokasi || 'Lokasi belum ditentukan'}</span>
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 line-clamp-3">
                  {getExcerpt(item.deskripsi)}
                </p>
                {/* Arrow untuk efek */}
                <div className="flex justify-end">
                  <span className="text-[#235347] group-hover:translate-x-2 transition-transform font-bold text-2xl">→</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Tidak ada kegiatan tersedia.
            </div>
          )}
        </div>

        {/* Button Kegiatan Lainnya */}
        <div className="text-center mt-16 relative z-10">
          <Link
            to="/kegiatan" // Link ke halaman kegiatan lengkap; sesuaikan dengan routing Anda
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#163832] to-[#235347] text-white font-semibold hover:from-[#235347] hover:to-[#0b2b26] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
          >
            Kegiatan Lainnya
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Optional Decorative Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#daf1de]/20 via-transparent to-[#daf1de]/10 pointer-events-none"></div>
    </section>
  );
};

export default KegiatanSection;