import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

const IsiProgram = () => {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await fetch(`http://localhost:3000/public/program/${id}`);
        if (!res.ok) throw new Error('Program tidak ditemukan');

        const data = await res.json();
        setProgram(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

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

  if (!program) {
    return (
      <section className="py-20 text-center">
        <div>Program tidak ditemukan</div>
      </section>
    );
  }

  return (
    <>
      <NavbarPublic />

      <section className="py-20">
        <div className="container mx-auto px-6">

          <div className="text-center mb-12 mt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#006227] leading-tight mb-3">
              {program.nama_program}
            </h1>

            <p className="text-gray-500">
              {program.jadwal_rutin || '-'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-10 max-w-5xl mx-auto">

            {program.gambar && (
              <div className="md:w-1/3 flex justify-center">
                <img
                  src={`http://localhost:3000/uploads/program/${program.gambar}`}
                  alt={program.nama_program}
                  className="w-full max-w-sm rounded-lg shadow-md object-contain"
                />
              </div>
            )}

            <div className="md:w-2/3 text-justify text-[#1e293b] leading-relaxed">
              <div className="whitespace-pre-wrap break-words">
                {program.deskripsi || 'Deskripsi belum tersedia.'}
              </div>
            </div>

          </div>

          <div className="text-center mt-12">
            <a
              href="/program"
              className="px-6 py-3 bg-[#006227] text-white rounded-lg hover:bg-[#004a1e]"
            >
              Kembali ke Program
            </a>
          </div>

        </div>
      </section>
      <FooterPublic />
    </>
  );
};

export default IsiProgram;