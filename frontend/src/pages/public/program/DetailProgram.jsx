import React, { useState, useEffect } from 'react';
import NavbarPublic from '../../../components/NavbarPublic'; // Path diperbaiki: naik tiga level ke src/components/
import FooterPublic from '../../../components/FooterPublic'; // Path diperbaiki: naik tiga level ke src/components/

const DetailProgram = () => {
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null); // State untuk card yang expanded

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
        setProgram(data);
      } catch (err) {
        console.error('Error fetching program:', err); // Logging error detail
        setError(err.message || 'Gagal mengambil data program. Periksa koneksi atau endpoint.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, []);

  // Fungsi untuk toggle expanded card
  const toggleExpanded = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Array ikon hardcoded (sesuai urutan program; bisa diganti jika ada field di backend)
  const icons = ['📖', '📚', '❤️', '🎓']; // Tambah lebih jika program > 4
  // Array peserta hardcoded (sesuai urutan; bisa diganti jika ada field di backend)
  const peserta = ['120 peserta', '85 peserta', '60 peserta', '45 peserta'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Memuat program...</div>
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Detail Program Masjid</h1>
        {program.length === 0 ? (
          <div className="text-center text-gray-600">Tidak ada program yang tersedia.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {program.map((item, index) => (
              <div
                key={item.program_id}
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  expandedIndex === index ? 'col-span-full md:col-span-2 lg:col-span-3' : ''
                }`} // Card memanjang saat expanded
                onClick={() => toggleExpanded(index)}
              >
                {/* Ikon di atas */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#235347] to-[#163832] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-white text-3xl">{icons[index % icons.length] || '📋'}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.nama_program}</h2>
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Jadwal Rutin:</strong> {item.jadwal_rutin || 'Jadwal belum ditentukan'}</p>
                  <p><strong>Peserta:</strong> {peserta[index % peserta.length] || 'N/A peserta'}</p>
                </div>
                {expandedIndex === index ? (
                  // Detail penuh saat expanded
                  <div className="mt-4">
                    <p className="text-gray-700">{item.deskripsi}</p>
                    <button
                      className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={(e) => {
                        e.stopPropagation(); // Mencegah toggle saat klik button
                        toggleExpanded(index);
                      }}
                    >
                      Tutup Detail
                    </button>
                  </div>
                ) : (
                  // Excerpt saat tidak expanded
                  <p className="text-gray-700">{item.deskripsi.length > 100 ? item.deskripsi.substring(0, 100) + '...' : item.deskripsi}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <FooterPublic />
    </div>
  );
};

export default DetailProgram;