import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const KegiatanSection = () => {
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchKegiatan = async () => {
      try {
        const response = await fetch('http://localhost:3000/public/kegiatan');
        if (!response.ok) throw new Error('Gagal mengambil data kegiatan');

        const data = await response.json();

        const sortedData = data.sort(
          (a, b) => new Date(b.waktu_kegiatan) - new Date(a.waktu_kegiatan)
        );

        setKegiatan(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, []);

  const formatWaktu = (waktu) => {
    if (!waktu) return 'Waktu belum ditentukan';
    return new Date(waktu).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className="py-20 text-center">
        <div className="text-xl">Memuat kegiatan...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 text-center">
        <div className="text-red-500">{error}</div>
      </section>
    );
  }

  const kegiatanTerbaru = kegiatan.slice(0, 3);

  return (
    <section id="kegiatan" className="py-20">
      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4">
            Kegiatan Ranting
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Daftar kegiatan yang diselenggarakan oleh ranting masjid.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {kegiatanTerbaru.length > 0 ? (
            kegiatanTerbaru.map((item) => (
              <div
                key={item.kegiatan_id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col h-full"
              >
                {/* JUDUL */}
                <h3 className="text-xl font-bold text-[#006227] mb-3 leading-snug break-words min-h-[60px]">
                  {item.nama_kegiatan}
                </h3>

                {/* INFO */}
                <div className="text-sm text-gray-500 mb-3 space-y-2">
                  <p>
                    <strong>Waktu:</strong> {formatWaktu(item.waktu_kegiatan)}
                  </p>
                  <p>
                    <strong>Lokasi:</strong> {item.lokasi || 'Lokasi belum ditentukan'}
                  </p>
                </div>

                {/* DESKRIPSI */}
                <p className="text-gray-700 mb-4 line-clamp-3 min-h-[72px] leading-relaxed">
                  {item.deskripsi || 'Tidak ada deskripsi'}
                </p>

                {/* BUTTON */}
                <Link
                  to={`/kegiatan/${item.kegiatan_id}`}
                  className="text-[#006227] font-semibold text-right hover:underline mt-auto"
                >
                  Baca Selengkapnya →
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              Tidak ada kegiatan tersedia.
            </div>
          )}
        </div>

        {/* BUTTON KEGIATAN LAINNYA */}
        <div className="text-center mt-12">
          <Link
            to="/kegiatan"
            className="px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition"
          >
            Kegiatan Lainnya
          </Link>
        </div>

      </div>
    </section>
  );
};

export default KegiatanSection;