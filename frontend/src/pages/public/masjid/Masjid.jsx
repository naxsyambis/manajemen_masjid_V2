import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';
import DeskripsiMasjid from './DeskripsiMasjid';
import TotalJamaah from './TotalJamaah';
import GrafikKeuangan from './GrafikKeuangan';
import Inventaris from './Inventaris';

const Masjid = () => {
  const { id } = useParams();

  const [masjid, setMasjid] = useState(null);
  const [jamaah, setJamaah] = useState([]);
  const [keuangan, setKeuangan] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [struktur, setStruktur] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [
        masjidRes,
        keuanganRes,
        inventarisRes,
        strukturRes
      ] = await Promise.all([
        fetch(`http://localhost:3000/public/masjid/${id}`),
        fetch(`http://localhost:3000/public/keuangan?masjid_id=${id}`),
        fetch(`http://localhost:3000/public/inventaris?masjid_id=${id}`),
        fetch(`http://localhost:3000/public/struktur-organisasi?masjid_id=${id}`)
      ]);

      if (!masjidRes.ok) throw new Error('Gagal memuat data masjid');
      if (!keuanganRes.ok) throw new Error('Gagal memuat data keuangan');
      if (!inventarisRes.ok) throw new Error('Gagal memuat data inventaris');
      if (!strukturRes.ok) throw new Error('Gagal memuat struktur organisasi');

      const masjidData = await masjidRes.json();
      const keuanganData = await keuanganRes.json();
      const inventarisData = await inventarisRes.json();
      const strukturData = await strukturRes.json();

      setMasjid(masjidData.masjid);
      setJamaah(masjidData.jamaah);
      setKeuangan(keuanganData.data);
      setInventaris(inventarisData.data);
      setStruktur(strukturData.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    keuangan.forEach(item => {
      const jumlah = parseFloat(item.jumlah);
      if (jumlah >= 0) totalPemasukan += jumlah;
      else totalPengeluaran += Math.abs(jumlah);
    });

    return { totalPemasukan, totalPengeluaran };
  };

  const { totalPemasukan, totalPengeluaran } = calculateTotals();

  if (loading) return <div className="text-center py-32">Loading...</div>;
  if (error) return <div className="text-center py-32 text-red-500">{error}</div>;
  if (!masjid) return <div className="text-center py-32">Masjid tidak ditemukan</div>;

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />

      <main className="site-bg py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">

            {/* DESKRIPSI */}
            <DeskripsiMasjid masjid={masjid} />

            {/* STRUKTUR */}
            <div className="mt-20 mb-16">
              <h2 className="text-3xl font-bold text-[#006227] mb-10 text-center">
                Struktur Organisasi
              </h2>

              {struktur.length === 0 ? (
                <p className="text-center text-gray-500">
                  Belum ada struktur organisasi
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {struktur.map(item => (
                    <div
                      key={item.struktur_id}
                      className="bg-white rounded-2xl shadow-lg p-6 text-center"
                    >
                      <img
                        src={
                          item.foto
                            ? `http://localhost:3000/uploads/kepengurusan/${item.foto}`
                            : '/images/no-image.jpg'
                        }
                        className="w-28 h-28 rounded-full mx-auto object-cover mb-4"
                      />

                      <h3 className="font-bold text-[#006227] text-lg">
                        {item.nama}
                      </h3>

                      <p className="text-gray-600">{item.jabatan}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TOTAL */}
            <TotalJamaah
              jamaah={jamaah}
              totalPemasukan={totalPemasukan}
              totalPengeluaran={totalPengeluaran}
              inventaris={inventaris}
            />

            {/* 🔥 FIX DI SINI */}
            <GrafikKeuangan 
              masjidId={id}
              namaMasjid={masjid?.nama_masjid}
            />

            <Inventaris inventaris={inventaris} />

          </div>
        </div>
      </main>

      <FooterPublic />
    </div>
  );
};

export default Masjid;