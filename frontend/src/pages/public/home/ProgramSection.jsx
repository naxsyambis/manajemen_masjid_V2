import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ProgramSection = () => {
  const [program, setProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const programTerbaru = program.slice(0, 3);

  return (
    <section id="program" className="py-20">
      <div className="container mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4">
            Program Ranting
          </h2>
          <p className="text-gray-600">
            Program-program unggulan dari masjid
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {programTerbaru.length > 0 ? (
            programTerbaru.map((item) => (
              <div
                key={item.program_id}
                className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col h-full"
              >

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

                <div className="p-5 flex flex-col flex-grow">

                  <h3 className="font-bold text-lg text-[#006227] line-clamp-2 leading-tight mb-3">
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

        <div className="text-center mt-10">
          <Link
            to="/program"
            className="px-6 py-3 bg-[#006227] text-white rounded-lg"
          >
            Lihat Semua Program
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramSection;