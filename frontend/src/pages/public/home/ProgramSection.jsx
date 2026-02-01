import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Asumsikan menggunakan React Router

const ProgramSection = () => {
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch program dari backend
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch('http://localhost:3000/public/program'); // Ganti dengan URL backend Anda jika berbeda
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProgram(data);
      } catch (err) {
        console.error('Error fetching program:', err); // Logging detail untuk debugging
        setError(err.message || 'Gagal mengambil data program. Periksa koneksi atau endpoint.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, []);

  // Fungsi untuk memotong deskripsi (excerpt)
  const getExcerpt = (text, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Array ikon hardcoded (sesuai urutan program; bisa diganti jika ada field di backend)
  const icons = ['📖', '📚', '❤️', '🎓']; // Tambah lebih jika program > 4
  // Array peserta hardcoded (sesuai urutan; bisa diganti jika ada field di backend)
  const peserta = ['120 peserta', '85 peserta', '60 peserta', '45 peserta'];

  if (loading) {
    return (
      <section id="program" className="program-section fade-in relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl">Memuat program...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="program" className="program-section fade-in relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl text-red-500">Error: {error}</div>
          <p className="text-sm text-gray-600 mt-2">Periksa console browser untuk detail lebih lanjut.</p>
        </div>
      </section>
    );
  }

  // Ambil hanya 3 program pertama
  const programTerbaru = program.slice(0, 3);

  return (
    <section id="program" className="program-section fade-in relative py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#0b2b26] mb-4">
            Program Ranting
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Berbagai program yang kami jalankan untuk kemajuan umat dan masyarakat, dengan pendekatan modern, efisien, dan berkelanjutan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"> {/* Ubah ke 3 kolom */}
          {programTerbaru.length > 0 ? (
            programTerbaru.map((item, index) => (
              <div
                key={item.program_id}
                className="group bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#235347] to-[#163832] rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <span className="text-white text-3xl">{icons[index] || '📋'}</span> {/* Fallback ikon */}
                </div>
                <h3 className="text-xl font-bold text-[#0b2b26] mb-3 group-hover:text-[#235347] transition-colors">
                  {item.nama_program}
                </h3>
                <p className="text-gray-700 mb-5 leading-relaxed">
                  {getExcerpt(item.deskripsi)}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>👥</span>
                    <span>{peserta[index] || 'N/A peserta'}</span> {/* Fallback peserta */}
                  </div>
                  <span className="arrow text-[#235347] text-2xl transition-transform duration-300">→</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              Tidak ada program tersedia.
            </div>
          )}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link
            to="/program" // Link ke halaman program lengkap; sesuaikan dengan routing Anda
            className="px-10 py-4 bg-gradient-to-r from-[#235347] to-[#163832] text-white rounded-3xl font-semibold hover:from-[#163832] hover:to-[#0b2b26] transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 inline-flex items-center space-x-3 text-lg"
          >
            <span>Lihat Semua Program</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;