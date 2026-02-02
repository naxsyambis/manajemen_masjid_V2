// frontend/src/pages/superadmin/InformasiMasjid.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuperAdminNavbar from '../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Calendar, RefreshCcw, AlertCircle } from 'lucide-react'; // Hapus TrendingUp karena sudah di GrafikKeuangan
import GrafikKeuangan from '../public/masjid/GrafikKeuangan'; // Import komponen GrafikKeuangan dari public/masjid

const InformasiMasjid = ({ user, onLogout }) => {
  const { masjid_id } = useParams(); // Diperbaiki: parameter route adalah :masjid_id, bukan masjidId
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [masjid, setMasjid] = useState(null);
  const [keuanganData, setKeuanganData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk memproses data keuangan menjadi format grafik bulanan
  const processKeuanganData = (data) => {
    const monthlyData = {};

    data.forEach(item => {
      const date = new Date(item.tanggal);
      const monthYear = date.toLocaleString('id-ID', { month: 'short', year: 'numeric' }); // e.g., 'Jan 2023'

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { month: monthYear, pemasukan: 0, pengeluaran: 0 }; // Diperbaiki: ubah 'bulan' ke 'month' untuk konsistensi
      }

      // Asumsi: jumlah > 0 adalah pemasukan, < 0 adalah pengeluaran
      // Jika ada kategori_id, bisa ditambahkan logika untuk membedakan berdasarkan kategori
      if (parseFloat(item.jumlah) > 0) {
        monthlyData[monthYear].pemasukan += parseFloat(item.jumlah);
      } else {
        monthlyData[monthYear].pengeluaran += Math.abs(parseFloat(item.jumlah));
      }
    });

    // Konversi ke array dan urutkan berdasarkan bulan
    return Object.values(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA - dateB;
    });
  };

  const fetchMasjidData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Fetch data masjid
      const masjidRes = await axios.get(`http://localhost:3000/superadmin/masjid/${masjid_id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMasjid(masjidRes.data);

      // Fetch data keuangan dengan query masjid_id (diperbaiki: sesuai endpoint backend)
      const keuanganRes = await axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${masjid_id}`, { headers: { Authorization: `Bearer ${token}` } });
      
      // Proses data keuangan untuk grafik
      const processedData = processKeuanganData(keuanganRes.data.data); // Asumsi response.data.data adalah array keuangan
      setKeuanganData(processedData);
    } catch (err) {
      console.error('Error fetching masjid data:', err);
      setError('Gagal memuat data masjid. Pastikan ID masjid valid.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (masjid_id) {
      fetchMasjidData();
    }
  }, [masjid_id, token]);

  const handleRefresh = () => {
    fetchMasjidData();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Informasi Masjid...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => navigate('/superadmin')} className="mt-4 px-4 py-2 bg-mu-green text-white rounded-lg">Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Informasi <span className="text-mu-green">Masjid</span>
              </h1>
              <p className="text-lg font-medium text-gray-600 mt-2">{masjid?.nama_masjid || 'Nama Masjid'}</p>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Memuat...' : 'Refresh Data'}
              </button>
            </div>
          </div>
          
          {/* Panggil GrafikKeuangan dengan chartData yang sudah diproses */}
          <GrafikKeuangan chartData={keuanganData} />
          
          <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
            <div className="h-[1px] w-12 bg-gray-100"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformasiMasjid;