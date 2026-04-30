import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const BeritaSection = () => {
  const [berita, setBerita] = useState([]);
  const [masjidMap, setMasjidMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        // 🔥 ambil berita + masjid sekaligus
        const [beritaRes, masjidRes] = await Promise.all([
          fetch('http://localhost:3000/public/berita'),
          fetch('http://localhost:3000/public/masjid')
        ]);

        if (!beritaRes.ok || !masjidRes.ok) {
          throw new Error("Gagal fetch data");
        }

        const beritaData = await beritaRes.json();
        const masjidData = await masjidRes.json();

        // 🔥 mapping masjid_id → nama
        const map = {};
        masjidData.forEach(m => {
          map[m.masjid_id] = m.nama_masjid;
        });

        setMasjidMap(map);

        const sortedData = beritaData.sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
        );

        setBerita(sortedData);

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

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#006227] mb-4">
            Berita Terbaru
          </h2>
          <p className="text-gray-600">
            Update dan informasi terkini
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {beritaTerbaru.length > 0 ? (
            beritaTerbaru.map((item) => (
              <Link
                key={item.berita_id}
                to={`/berita/${item.berita_id}`}
                className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
              >

                <div className="h-52 overflow-hidden">
                  <img
                    src={
                      item.gambar
                        ? `http://localhost:3000/uploads/berita/${item.gambar}`
                        : 'https://via.placeholder.com/800x400'
                    }
                    alt={item.judul}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-[#006227] mb-2">
                    {item.judul}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {getExcerpt(item.isi)}
                  </p>

                  <div className="text-sm text-gray-500 space-y-1">

                    {/* 🔥 FIX DI SINI */}
                    <div>
                      🕌{" "}
                      <span className="font-semibold text-[#006227]">
                        {masjidMap[item.masjid_id] || "Masjid tidak diketahui"}
                      </span>
                    </div>

                    <div>
                      📅 {formatTanggal(item.tanggal)}
                    </div>

                  </div>
                </div>

              </Link>
            ))
          ) : (
            <div className="col-span-full text-center">
              Tidak ada berita
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/berita"
            className="px-6 py-3 bg-[#006227] text-white rounded-lg"
          >
            Lihat Semua Berita
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BeritaSection;