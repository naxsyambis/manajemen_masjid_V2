import React, { useState, useEffect } from 'react';
import NavbarPublic from '../../../components/NavbarPublic'; // Path diperbaiki: naik tiga level ke src/components/
import FooterPublic from '../../../components/FooterPublic'; // Path diperbaiki: naik tiga level ke src/components/

const DetailKegiatan = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fungsi untuk memotong deskripsi (excerpt) - opsional, bisa dihapus jika ingin tampilkan penuh
  const getExcerpt = (text, maxLength = 200) => { // Lebih panjang untuk halaman detail
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Memuat kegiatan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">Error: {error}</div>
        <p className="text-sm text-gray-600 mt-2">Periksa console browser untuk detail lebih lanjut.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPublic />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Detail Kegiatan Masjid</h1>
        {kegiatan.length === 0 ? (
          <div className="text-center text-gray-600">Tidak ada kegiatan yang tersedia.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kegiatan.map((item, index) => ( // Tampilkan semua kegiatan tanpa slice
              <div key={item.kegiatan_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Ikon di atas */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#235347] to-[#163832] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-white text-3xl">{icons[index % icons.length] || '📋'}</span> {/* Gunakan modulo untuk loop ikon */}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.nama_kegiatan}</h2>
                <p className="text-gray-600 mb-2">
                  <strong>Waktu:</strong> {formatWaktu(item.waktu_kegiatan)}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Lokasi:</strong> {item.lokasi || 'Lokasi belum ditentukan'}
                </p>
                <p className="text-gray-700">{getExcerpt(item.deskripsi)}</p> {/* Excerpt opsional */}
              </div>
            ))}
          </div>
        )}
      </main>
      <FooterPublic />
    </div>
  );
};

export default DetailKegiatan;