import React, { useState, useEffect } from 'react';
import NavbarPublic from '/src/components/NavbarPublic';
import FooterPublic from '/src/components/FooterPublic';

const Kepengurusan = () => {
  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPengurus = async () => {
    try {
      const apiUrl = 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/public/kepengurusan`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Data kepengurusan tidak ditemukan. Silakan hubungi administrator.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Coba lagi nanti.');
        } else {
          throw new Error(`Error ${response.status}: Gagal mengambil data.`);
        }
      }
      const data = await response.json();
      setPengurus(data);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.message.includes('404') || err.message.includes('Data kepengurusan tidak ditemukan')) {
        setPengurus([
          {
            pengurus_id: 1,
            nama_lengkap: 'Ahmad Fauzi',
            jabatan: 'Ketua Ranting',
            foto_pengurus: null,
            periode_mulai: '2023-01-01',
            periode_selesai: '2024-12-31'
          },
          {
            pengurus_id: 2,
            nama_lengkap: 'Siti Aminah',
            jabatan: 'Sekretaris',
            foto_pengurus: null,
            periode_mulai: '2023-01-01',
            periode_selesai: '2024-12-31'
          },
          {
            pengurus_id: 3,
            nama_lengkap: 'Budi Santoso',
            jabatan: 'Bendahara',
            foto_pengurus: null,
            periode_mulai: '2023-01-01',
            periode_selesai: '2024-12-31'
          }
        ]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengurus();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchPengurus();
  };

  if (loading) {
    return (
      <div className="font-sans overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <NavbarPublic />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-mu-green border-t-transparent mx-auto mb-6 shadow-lg"></div>
            <p className="text-gray-700 font-semibold text-xl">Memuat data kepengurusan...</p>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <NavbarPublic />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-2xl">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-red-600 text-2xl font-bold mb-4">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={handleRetry} 
              className="bg-mu-green text-white px-10 py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Coba Lagi
            </button>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="font-sans overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <NavbarPublic />
      <main className="pt-32 pb-20">
        <section className="py-16 px-6 text-gray-800">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight">
              Kepengurusan Ranting
            </h1>
            <p className="text-lg md:text-xl text-[#1e293b] max-w-3xl mx-auto leading-relaxed">
              Daftar lengkap pengurus yang berkomitmen membangun umat melalui masjid dan program Muhammadiyah.
            </p>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="container mx-auto">
            {pengurus.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-gray-700 text-3xl font-bold mb-4">Belum Ada Data Kepengurusan</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  Data akan muncul setelah administrator menambahkan pengurus.
                </p>
                <button 
                  onClick={handleRetry} 
                  className="bg-mu-green text-white px-10 py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Refresh Data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
  {pengurus.map((person) => (
    <div
      key={person.pengurus_id}
      className="w-full max-w-sm bg-white rounded-[28px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="relative">
        <img
          src={
            person.foto_pengurus
              ? `http://localhost:3000${person.foto_pengurus}`
              : "https://picsum.photos/400/500"
          }
          alt={person.nama_lengkap}
          className="w-full h-[300px] object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => {
            e.target.src = "https://picsum.photos/400/500";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="p-5 text-center">

        <h3 className="text-xl md:text-2xl font-bold text-[#006227] mb-3">
          {person.nama_lengkap}
        </h3>

        <div className="mb-5">
          <span className="inline-block bg-gradient-to-r from-slate-50/80 to-gray-50/80 backdrop-blur-sm text-slate-700 px-8 py-3 rounded-2xl text-base font-bold border border-slate-200/60 shadow-lg group-hover:bg-emerald-50/80 group-hover:text-emerald-700 group-hover:border-emerald-200/60 transition-all duration-500">
            {person.jabatan}
          </span>
        </div>

        {person.periode && (
          <p className="text-xs text-gray-400 mb-3">
            Periode: {person.periode}
          </p>
        )}

        <div className="w-12 h-[2px] bg-[#006227] mx-auto mb-4"></div>

        <p className="text-sm text-gray-500 leading-relaxed">
          Pengurus aktif di ranting Muhammadiyah, berkontribusi untuk kemajuan umat
        </p>

          </div>
        </div>
      ))}
    </div>
            )}
          </div>
        </section>
      </main>
      <FooterPublic />
    </div>
  );
};

export default Kepengurusan;