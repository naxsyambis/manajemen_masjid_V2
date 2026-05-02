import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';
import DeskripsiMasjid from './DeskripsiMasjid';
import TotalJamaah from './TotalJamaah';
import GrafikKeuangan from './GrafikKeuangan';
import Inventaris from './Inventaris';
import StrukturOrganisasi from './StrukturOrganisasi';

const Masjid = () => {
  const { id } = useParams();

  const [masjid, setMasjid] = useState(null);
  const [jamaah, setJamaah] = useState([]);
  const [keuangan, setKeuangan] = useState([]);
  const [inventaris, setInventaris] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        masjidRes,
        keuanganRes,
        inventarisRes
      ] = await Promise.all([
        fetch(`http://localhost:3000/public/masjid/${id}`),
        fetch(`http://localhost:3000/public/keuangan?masjid_id=${id}`),
        fetch(`http://localhost:3000/public/inventaris?masjid_id=${id}`)
      ]);

      if (!masjidRes.ok) throw new Error('Gagal memuat data masjid');
      if (!keuanganRes.ok) throw new Error('Gagal memuat data keuangan');
      if (!inventarisRes.ok) throw new Error('Gagal memuat data inventaris');

      const masjidData = await masjidRes.json();
      const keuanganData = await keuanganRes.json();
      const inventarisData = await inventarisRes.json();

      setMasjid(masjidData.masjid);
      setJamaah(masjidData.jamaah || []);
      setKeuangan(keuanganData.data || []);
      setInventaris(inventarisData.data || []);

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

  if (loading) {
    return <div className="text-center py-32">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-32 text-red-500">{error}</div>;
  }

  if (!masjid) {
    return <div className="text-center py-32">Masjid tidak ditemukan</div>;
  }

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />


      <main className="site-bg py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">

            <DeskripsiMasjid masjid={masjid} />

            <div className="mt-10 mb-16">
              <h2 className="text-3xl font-bold text-[#006227] mb-8 text-center">
                Struktur Organisasi
              </h2>

              <StrukturOrganisasi masjidId={id} />
            </div>

            <TotalJamaah
              jamaah={jamaah}
              totalPemasukan={totalPemasukan}
              totalPengeluaran={totalPengeluaran}
              inventaris={inventaris}
            />

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