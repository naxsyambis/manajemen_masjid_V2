import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic'; // Mengimpor NavbarPublic
import FooterPublic from '../../../components/FooterPublic'; // Mengimpor FooterPublic

const IsiKegiatan = () => {
  const { id } = useParams();
  const [kegiatan, setKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const response = await fetch(`http://localhost:3000/public/kegiatan/${id}`);
        if (!response.ok) {
          throw new Error('Kegiatan tidak ditemukan');
        }
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
      {/* Navbar */}
      <NavbarPublic />

      {/* Isi Kegiatan */}
      <section id="kegiatan" className="py-20">
        <div className="container mx-auto px-6">
          {/* Header Kegiatan dengan jarak antara judul dan navbar */}
          <div className="mb-12 text-center mt-8">
            <h1 className="text-4xl font-bold text-[#006227] mb-4">{kegiatan.nama_kegiatan}</h1>
            <p className="text-gray-600 text-lg">
              <strong>Waktu:</strong> {new Date(kegiatan.waktu_kegiatan).toLocaleDateString('id-ID', {
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

          {/* Gambar Poster Kegiatan */}
          {kegiatan.poster && (
            <div className="mb-8 flex justify-center">
              <img
                src={`http://localhost:3000/uploads/kegiatan/${kegiatan.poster}`}
                alt={kegiatan.nama_kegiatan}
                className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Deskripsi Kegiatan */}
          <div className="max-w-full mx-auto text-justify leading-relaxed mb-12">
            <div className="whitespace-pre-wrap break-words">
              {kegiatan.deskripsi || 'Deskripsi kegiatan belum tersedia.'}
            </div>
          </div>

          {/* Tombol Kembali */}
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

      {/* Footer */}
      <FooterPublic />
    </>
  );
};

export default IsiKegiatan;