import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const BeritaSection = () => {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/public/berita');
        if (!res.ok) throw new Error("Gagal fetch berita");

        const result = await res.json();

        // 🔥 HANDLE kalau backend pakai { data: [] }
        const data = result.data || result;

        const sorted = data.sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
        );

        setBerita(sorted);

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getExcerpt = (text, maxLength = 100) => {
    return text?.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return 'Tanggal tidak tersedia';
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className="py-20 text-center">
        <div className="text-2xl">Memuat berita...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 text-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </section>
    );
  }

  const beritaTerbaru = berita.slice(0, 3);

  return (
    <section id="berita" className="py-20">
      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#006227] mb-4">
            Berita Terbaru
          </h2>
          <p className="text-gray-600">
            Update dan informasi terkini
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {beritaTerbaru.length > 0 ? (
            beritaTerbaru.map((item) => {

              // 🔥 FIX GAMBAR (prioritas)
              const gambarUrl =
                item.gambar
                  ? `http://localhost:3000/uploads/berita/${item.gambar}`
                  : item.gambar_list && item.gambar_list.length > 0
                    ? `http://localhost:3000/uploads/berita/${item.gambar_list[0].path_gambar}`
                    : 'https://via.placeholder.com/800x400';

              return (
                <Link
                  key={item.berita_id}
                  to={`/berita/${item.berita_id}`}
                  className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col h-full"
                >

                  {/* GAMBAR */}
                  <div className="h-56 overflow-hidden">
                    <img
                      src={gambarUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-grow">

                    {/* JUDUL */}
                    <h3 className="font-bold text-lg text-[#006227] mb-2 line-clamp-2 min-h-[48px]">
                      {item.judul}
                    </h3>

                    {/* DESKRIPSI */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                      {getExcerpt(item.isi)}
                    </p>

                    {/* FOOTER */}
                    <div className="text-sm text-gray-500 space-y-1 mt-auto">

                      {/* MASJID */}
                      <div className="font-semibold text-[#006227]">
                        {item.masjid && item.masjid.nama_masjid
                          ? item.masjid.nama_masjid
                          : "Masjid tidak diketahui"}
                      </div>

                      {/* TANGGAL */}
                      <div>
                        {formatTanggal(item.tanggal)}
                      </div>

                    </div>

                  </div>

                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center">
              Tidak ada berita
            </div>
          )}
        </div>

        {/* BUTTON */}
        <div className="text-center mt-10">
          <Link
            to="/berita"
            className="px-6 py-3 bg-[#006227] text-white rounded-lg hover:bg-[#004a1e] transition"
          >
            Lihat Semua Berita
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BeritaSection;