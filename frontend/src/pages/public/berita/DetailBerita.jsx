import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Asumsikan menggunakan React Router

const DetailBerita = () => {  // Nama komponen diubah ke DetailBerita untuk konsistensi dengan nama file
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fungsi untuk fetch semua berita dari backend
  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const response = await fetch('http://localhost:3000/public/berita'); // Endpoint publik untuk getBerita
        if (!response.ok) {
          throw new Error('Gagal mengambil data berita');
        }
        const data = await response.json();
        // Sort berdasarkan tanggal descending (terbaru dulu)
        const sortedData = data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        setBerita(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []);

  // Fungsi untuk memotong isi berita (excerpt)
  const getExcerpt = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fungsi untuk format tanggal
  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handler klik card untuk navigate ke detail
  const handleCardClick = (beritaId) => {
    navigate(`/berita/${beritaId}`);
  };

  if (loading) {
    return (
      <section className="berita-list-section fade-in relative py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl">Memuat berita...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="berita-list-section fade-in relative py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl text-red-500">Error: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="berita-list-section fade-in relative py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0b2b26] mb-4">Semua Berita</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Update dan informasi lengkap seputar kegiatan ranting Muhammadiyah
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {berita.length > 0 ? (
            berita.map((item) => (
              <article
                key={item.berita_id}
                onClick={() => handleCardClick(item.berita_id)}
                className="group relative bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 cursor-pointer transform hover:-translate-y-3"
              >
                <div className="relative h-60 overflow-hidden rounded-t-2xl">
                  <img
                    src={item.gambar || 'https://via.placeholder.com/800x400?text=No+Image'}
                    alt={item.judul}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#235347] to-[#163832] text-white text-xs font-semibold rounded-full shadow-md">
                      Berita
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-[#0b2b26] mb-3 group-hover:text-[#235347] transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    {getExcerpt(item.isi)}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-1 text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span>👤</span>
                        <span>Admin Ranting</span> {/* Hardcoded; ganti jika ada data user */}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span>{formatTanggal(item.tanggal)}</span>
                      </div>
                    </div>
                    <span className="text-[#235347] group-hover:translate-x-2 transition-transform font-bold text-lg">→</span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Tidak ada berita tersedia.
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center mt-12 relative z-10">
          <Link
            to="/" // Link kembali ke home atau halaman utama
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#235347] to-[#163832] text-white rounded-xl font-semibold shadow-lg hover:from-[#163832] hover:to-[#0b2b26] transform hover:-translate-y-1 transition-all"
          >
            <span>← Kembali</span>
          </Link>
        </div>
      </div>

      {/* Optional Decorative Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#daf1de]/20 via-transparent to-[#daf1de]/10 pointer-events-none"></div>
    </section>
  );
};

export default DetailBerita;  // Export sesuai nama komponen