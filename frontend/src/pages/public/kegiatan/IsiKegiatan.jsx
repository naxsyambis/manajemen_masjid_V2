import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

const IsiKegiatan = () => {
  const { id } = useParams();
  const [kegiatan, setKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const response = await fetch(`http://localhost:3000/public/kegiatan/${id}`);
        if (!response.ok) throw new Error('Kegiatan tidak ditemukan');
        const data = await response.json();
        setKegiatan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, [id]);

  if (loading) {
    return (
      <section className="py-20 text-center">
        <div className="text-2xl">Memuat Kegiatan...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 text-center">
        <div className="text-red-500 text-xl">{error}</div>
      </section>
    );
  }

  if (!kegiatan) {
    return (
      <section className="py-20 text-center">
        <div className="text-xl">Kegiatan tidak ditemukan</div>
      </section>
    );
  }

  return (
    <>
      <NavbarPublic />

      <section id="kegiatan" className="py-20">
        <div className="container mx-auto px-6">

          {/* HEADER */}
          <div className="mb-12 text-center mt-10">
            <h1 className="text-4xl font-bold text-[#006227] mb-4 break-words">
              {kegiatan.nama_kegiatan}
            </h1>

            <p className="text-gray-600 text-lg">
              <strong>Waktu:</strong>{" "}
              {new Date(kegiatan.waktu_kegiatan).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            <p className="text-gray-600 text-lg">
              <strong>Lokasi:</strong> {kegiatan.lokasi}
            </p>
          </div>

          {/* 🔥 FIX LAYOUT DI SINI */}
          <div className="flex flex-col md:flex-row justify-center items-start gap-8 max-w-5xl mx-auto mb-12">

            {/* POSTER */}
            {kegiatan.poster && (
              <div className="md:w-[320px] flex-shrink-0">
                <img
                  src={`http://localhost:3000/uploads/kegiatan/${kegiatan.poster}`}
                  alt={kegiatan.nama_kegiatan}
                  className="w-full rounded-lg shadow-md object-contain"
                />
              </div>
            )}

            {/* DESKRIPSI */}
            <div className="flex-1 text-justify leading-relaxed text-[#1e293b] max-w-2xl">
              <div className="whitespace-pre-wrap break-words">
                {kegiatan.deskripsi || 'Deskripsi kegiatan belum tersedia.'}
              </div>
            </div>

          </div>

          {/* BUTTON */}
          <div className="text-center mt-10">
            <a
              href="/kegiatan"
              className="px-6 py-3 bg-[#006227] text-white rounded-lg"
            >
              Kembali ke Semua Kegiatan
            </a>
          </div>

        </div>
      </section>

      <FooterPublic />
    </>
  );
};

export default IsiKegiatan;