import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

const ListBerita = () => {
  const [berita, setBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const res = await fetch('http://localhost:3000/public/berita');
        if (!res.ok) throw new Error('Gagal mengambil data');

        const data = await res.json();

        const sorted = data.sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
        );

        setBerita(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBerita();
  }, []);

  const getExcerpt = (text, max = 100) => {
    return text?.length > max ? text.substring(0, max) + '...' : text;
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = berita.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(berita.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <NavbarPublic />
        <div className="text-center py-20 text-xl">Memuat berita...</div>
        <FooterPublic />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarPublic />
        <div className="text-center py-20 text-red-500">{error}</div>
        <FooterPublic />
      </>
    );
  }

  return (
    <>
      <NavbarPublic />

      <section className="py-20">
        <div className="container mx-auto px-6">

          <div className="text-center mb-16 mt-6">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4">
              Berita Ranting
            </h2>
            <p className="text-gray-600">
              Semua berita dan informasi terbaru
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {currentData.length > 0 ? (
              currentData.map((item) => {

                const gambarUrl =
                  item.gambar
                    ? `http://localhost:3000/uploads/berita/${item.gambar}`
                    : item.gambar_list?.length > 0
                      ? `http://localhost:3000/uploads/berita/${item.gambar_list[0].path_gambar}`
                      : 'https://via.placeholder.com/800x400';

                const namaMasjid =
                  item.masjid?.nama_masjid ||
                  item.user?.takmirs?.[0]?.masjid?.nama_masjid ||
                  "Cabang Muhammadiyah Pundong";

                return (
                  <div
                    key={item.berita_id}
                    className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col h-full"
                  >

                    <div className="h-56 overflow-hidden">
                      <img
                        src={gambarUrl}
                        alt={item.judul}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-grow">

                      <h3 className="font-bold text-lg text-[#006227] mb-2 line-clamp-2 min-h-[48px]">
                        {item.judul}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                        {getExcerpt(item.isi)}
                      </p>

                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="font-semibold text-[#006227]">
                          {namaMasjid}
                        </div>
                        <div>
                          {formatTanggal(item.tanggal)}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link
                        to={`/berita/${item.berita_id}`}
                        className="text-[#006227] font-semibold hover:underline"
                        >
                        Selengkapnya
                         </Link>
                     </div>

                    </div>

                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                Tidak ada berita
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2 flex-wrap items-center">

              <button
                onClick={() => goToPage(Math.max(currentPage - 1, 1))}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === 1}
              >
                Sebelumnya
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-[#006227] text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                disabled={currentPage === totalPages}
              >
                Selanjutnya
              </button>

            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/"
              className="px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e]"
            >
              Kembali ke Home
            </Link>
          </div>

        </div>
      </section>
      <FooterPublic />
    </>
  );
};

export default ListBerita;