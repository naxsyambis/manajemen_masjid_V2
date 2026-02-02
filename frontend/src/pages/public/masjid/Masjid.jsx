// frontend/src/pages/public/masjid/Masjid.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const masjidResponse = await fetch(`http://localhost:3000/public/masjid/${id}`);
      if (!masjidResponse.ok) throw new Error('Gagal memuat data masjid');
      const masjidData = await masjidResponse.json();
      setMasjid(masjidData.masjid);
      setJamaah(masjidData.jamaah);

      const keuanganResponse = await fetch(`http://localhost:3000/public/keuangan?masjid_id=${id}`);
      if (!keuanganResponse.ok) throw new Error('Gagal memuat data keuangan');
      const keuanganData = await keuanganResponse.json();
      setKeuangan(keuanganData.data);

      const inventarisResponse = await fetch(`http://localhost:3000/public/inventaris?masjid_id=${id}`);
      if (!inventarisResponse.ok) throw new Error('Gagal memuat data inventaris');
      const inventarisData = await inventarisResponse.json();
      setInventaris(inventarisData.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processKeuanganData = () => {
    const monthlyData = {};
    
    keuangan.forEach(item => {
      const date = new Date(item.tanggal);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, pemasukan: 0, pengeluaran: 0 };
      }
      
      const jumlah = parseFloat(item.jumlah);
      if (jumlah >= 0) {
        monthlyData[monthKey].pemasukan += jumlah;
      } else {
        monthlyData[monthKey].pengeluaran += Math.abs(jumlah);
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const calculateTotals = () => {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;
    
    keuangan.forEach(item => {
      const jumlah = parseFloat(item.jumlah);
      if (jumlah >= 0) {
        totalPemasukan += jumlah;
      } else {
        totalPengeluaran += Math.abs(jumlah);
      }
    });
    
    return { totalPemasukan, totalPengeluaran };
  };

  const chartData = processKeuanganData();
  const { totalPemasukan, totalPengeluaran } = calculateTotals();

  if (loading) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="animate-pulse text-2xl text-[#1e293b]">Memuat detail masjid...</div>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl text-red-500">Error: {error}</div>
            <p className="text-sm text-[#1e293b] mt-2">Periksa console browser untuk detail lebih lanjut.</p>
            <Link
              to="/masjid"
              className="inline-block mt-4 px-6 py-3 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition-all"
            >
              Kembali ke Daftar Masjid
            </Link>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="font-sans overflow-x-hidden">
        <NavbarPublic />
        <main className="site-bg py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="text-2xl text-[#1e293b]">Masjid tidak ditemukan.</div>
            <Link
              to="/masjid"
              className="inline-block mt-4 px-6 py-3 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition-all"
            >
              Kembali ke Daftar Masjid
            </Link>
          </div>
        </main>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />
      <main className="site-bg py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                <li>
                  <Link to="/" className="hover:text-[#006227] transition-colors">Home</Link>
                </li>
                <li>/</li>
                <li>
                  <Link to="/masjid" className="hover:text-[#006227] transition-colors">Masjid</Link>
                </li>
                <li>/</li>
                <li className="text-[#006227] font-semibold">{masjid.nama_masjid}</li>
              </ol>
            </nav>

            <DeskripsiMasjid masjid={masjid} />
            <TotalJamaah jamaah={jamaah} totalPemasukan={totalPemasukan} totalPengeluaran={totalPengeluaran} inventaris={inventaris} />
            <GrafikKeuangan chartData={chartData} />
            <Inventaris inventaris={inventaris} />

          </div>
        </div>
      </main>
      <FooterPublic />
    </div>
  );
};

export default Masjid;