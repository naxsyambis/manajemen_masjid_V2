import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Asumsikan menggunakan React Router

const BeritaDetail = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch detail berita berdasarkan ID
  useEffect(() => {
    const fetchBeritaDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3000/superadmin/berita/${id}`); // Asumsikan endpoint superadmin untuk getById; ganti jika publik ada
        if (!response.ok) {
          throw new Error('Gagal mengambil detail berita');
        }
        const data = await response.json();
        setBerita(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBeritaDetail();
    }
  }, [id]);

  // Fungsi untuk format tanggal
  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <section className="berita-detail-section fade-in relative py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl">Memuat detail berita...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="berita-detail-section fade-in relative py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl text-red-500">Error: {error}</div>
        </div>
      </section>
    );
  }

  if (!berita) {
    return (
      <section className="berita-detail-section fade-in relative py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl text-gray-500">Berita tidak ditemukan.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="berita-detail-section fade-in relative py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg p-8">
          {/* Gambar Utama */}
          {berita.gambar && (
            <div className="mb-8">
              <img
                src={berita.gambar}
                alt={berita.judul}
                className="w-full h-64 md:h-96 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Judul dan Meta */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0b2b26] mb-4">{berita.judul}</h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500 space-y-2 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span>👤</span>
                <span>Admin Ranting</span> {/* Hardcoded; ganti jika ada data user */}
              </div>
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>{formatTanggal(berita.tanggal)}</span>
              </div>
            </div>
          </div>

          {/* Isi Berita */}
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8">
            <p>{berita.isi}</p>
          </div>

          {/* Elemen Tambahan (Opsional: Jika ada data kegiatan) */}
          {/* Jika berita terkait kegiatan, tambahkan fetch dari endpoint kegiatan atau relasi */}
          {/* Contoh hardcoded atau fetch tambahan */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-[#0b2b26] mb-4">Detail Kegiatan (Jika Ada)</h3>
            <ul className="space-y-2 text-gray-600">
              <li><strong>Nama Kegiatan:</strong> {berita.nama_kegiatan || 'Tidak ada'}</li>
              <li><strong>Waktu Kegiatan:</strong> {berita.waktu_kegiatan || 'Tidak ada'}</li>
              <li><strong>Lokasi:</strong> {berita.lokasi || 'Tidak ada'}</li>
              <li><strong>Deskripsi:</strong> {berita.deskripsi || 'Tidak ada'}</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <Link
              to="/berita" // Kembali ke list berita
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#235347] to-[#163832] text-white rounded-xl font-semibold shadow-lg hover:from-[#163832] hover:to-[#0b2b26] transform hover:-translate-y-1 transition-all"
            >
              <span>← Kembali ke Berita</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Optional Decorative Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#daf1de]/20 via-transparent to-[#daf1de]/10 pointer-events-none"></div>
    </section>
  );
};

export default BeritaDetail;