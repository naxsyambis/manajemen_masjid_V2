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
        const response = await fetch('http://localhost:3000/public/kegiatan'); // Gunakan full URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setKegiatan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

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
            {kegiatan.map((item) => (
              <div key={item.kegiatan_id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.nama_kegiatan}</h2>
                <p className="text-gray-600 mb-2">
                  <strong>Waktu:</strong> {new Date(item.waktu_kegiatan).toLocaleString('id-ID')}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Lokasi:</strong> {item.lokasi}
                </p>
                <p className="text-gray-700">{item.deskripsi}</p>
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