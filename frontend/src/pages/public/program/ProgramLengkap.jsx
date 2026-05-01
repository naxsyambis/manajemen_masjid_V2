import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ProgramLengkap = () => {
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchProgram = async () => {
      try {
        const res = await fetch('http://localhost:3000/public/program');
        if (!res.ok) throw new Error('Gagal mengambil data program');

        const data = await res.json();
        setProgram(data);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, []);

  const getExcerpt = (text, max = 100) => {
    return text?.length > max ? text.substring(0, max) + '...' : text;
  };

  // 🔥 PAGINATION
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentData = program.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(program.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="py-20 text-center">
        <div className="text-xl">Memuat program...</div>
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

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-16 mt-6">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4">
            Program Ranting
          </h2>
          <p className="text-gray-600">
            Semua program yang tersedia di masjid
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <div
                key={item.program_id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col h-full"
              >

                {/* GAMBAR */}
                <div className="h-64 overflow-hidden">
                  <img
                    src={
                      item.gambar
                        ? `http://localhost:3000/uploads/program/${item.gambar}`
                        : 'https://via.placeholder.com/800x400'
                    }
                    alt={item.nama_program}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5 flex flex-col flex-grow">

                  <h3 className="font-bold text-lg text-[#006227] line-clamp-2 leading-tight mb-1">
                    {item.nama_program}
                  </h3>

                  <p className="text-sm text-gray-500 leading-tight mb-2">
                    {item.jadwal_rutin || '-'}
                  </p>

                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                    {getExcerpt(item.deskripsi)}
                  </p>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/program/${item.program_id}`}
                      className="text-[#006227] font-semibold hover:underline"
                    >
                      Selengkapnya
                    </Link>
                  </div>

                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full text-center">
              Tidak ada program
            </div>
          )}
        </div>

        {/* 🔥 PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2 flex-wrap items-center">

            {/* PREV */}
            <button
              onClick={() => goToPage(Math.max(currentPage - 1, 1))}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              disabled={currentPage === 1}
            >
              Sebelumnya
            </button>

            {/* PAGE */}
            {(() => {
              const pages = [];
              const maxVisible = 3;

              let start = Math.max(currentPage - 1, 1);
              let end = Math.min(start + maxVisible - 1, totalPages);

              if (end - start < maxVisible - 1) {
                start = Math.max(end - maxVisible + 1, 1);
              }

              if (start > 1) {
                pages.push(
                  <button key={1} onClick={() => goToPage(1)} className="px-4 py-2 bg-gray-200 rounded-lg">
                    1
                  </button>
                );
                if (start > 2) pages.push(<span key="s">...</span>);
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i
                        ? 'bg-[#006227] text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {i}
                  </button>
                );
              }

              if (end < totalPages) {
                if (end < totalPages - 1) pages.push(<span key="e">...</span>);
                pages.push(
                  <button key={totalPages} onClick={() => goToPage(totalPages)} className="px-4 py-2 bg-gray-200 rounded-lg">
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            {/* NEXT */}
            <button
              onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </button>

          </div>
        )}

        {/* BACK HOME */}
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
  );
};

export default ProgramLengkap;