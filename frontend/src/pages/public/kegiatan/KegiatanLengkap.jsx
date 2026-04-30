import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

const KegiatanLengkap = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchKegiatan = async () => {
      try {
        const res = await fetch('http://localhost:3000/public/kegiatan');
        if (!res.ok) throw new Error('Gagal mengambil data');

        const data = await res.json();

        const sorted = data.sort(
          (a, b) => new Date(b.waktu_kegiatan) - new Date(a.waktu_kegiatan)
        );

        setKegiatan(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

  const formatWaktu = (waktu) => {
    return new Date(waktu).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getExcerpt = (text, max = 120) => {
    return text?.length > max ? text.substring(0, max) + '...' : text;
  };

  // PAGINATION
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = kegiatan.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(kegiatan.length / itemsPerPage);

  if (loading) {
    return <div className="py-20 text-center text-xl">Memuat kegiatan...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-red-500">{error}</div>;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 mt-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4">
            Kegiatan Ranting
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Daftar kegiatan yang diselenggarakan oleh ranting masjid.
          </p>
        </div>

        {/* CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentData.map((item) => (
            <div
              key={item.kegiatan_id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col"
            >
              {/* 🔥 JUDUL (FIX UTAMA DI SINI) */}
              <h3 className="text-xl font-bold text-[#006227] mb-3 leading-snug break-words min-h-[60px]">
                {item.nama_kegiatan}
              </h3>

              {/* 🔥 INFO DENGAN ICON */}
              <div className="text-sm text-gray-500 mb-3 space-y-2">
                
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#006227]" />
                  <span>
                    <strong>Waktu:</strong> {formatWaktu(item.waktu_kegiatan)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#006227]" />
                  <span>
                    <strong>Lokasi:</strong> {item.lokasi}
                  </span>
                </div>

              </div>

              {/* DESKRIPSI */}
              <p className="text-gray-700 mb-4 line-clamp-3 min-h-[72px] leading-relaxed">
                {item.deskripsi || 'Tidak ada deskripsi'}
                </p>

              {/* BUTTON */}
              <Link
                to={`/kegiatan/${item.kegiatan_id}`}
                className="text-[#006227] font-semibold text-right hover:underline"
              >
                Baca Selengkapnya →
              </Link>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg transition ${
                  currentPage === i + 1
                    ? 'bg-[#006227] text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* BUTTON BACK HOME */}
        <div className="text-center mt-12">
          <Link
            to="/"
            className="px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition"
          >
            Kembali ke Home
          </Link>
        </div>

      </div>
    </section>
  );
};

export default KegiatanLengkap;