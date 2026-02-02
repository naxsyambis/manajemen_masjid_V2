// frontend/src/pages/superadmin/InformasiMasjid.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuperAdminNavbar from '../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { Calendar, RefreshCcw, AlertCircle, Package, Users, UserCheck, UserX } from 'lucide-react'; // Tambahkan UserCheck dan UserX untuk ikon jamaah
import GrafikKeuangan from '../public/masjid/GrafikKeuangan'; // Import komponen GrafikKeuangan dari public/masjid

const InformasiMasjid = ({ user, onLogout }) => {
  const { masjid_id } = useParams(); // Diperbaiki: parameter route adalah :masjid_id, bukan masjidId
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [masjid, setMasjid] = useState(null);
  const [keuanganData, setKeuanganData] = useState([]);
  const [inventarisData, setInventarisData] = useState([]); // State untuk inventaris
  const [jamaahData, setJamaahData] = useState([]); // State untuk jamaah
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

      // Fetch data keuangan, inventaris, dan jamaah secara paralel
      const [keuanganRes, inventarisRes, jamaahRes] = await Promise.all([
        axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${masjid_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:3000/superadmin/inventaris?masjid_id=${masjid_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://localhost:3000/superadmin/jamaah?masjid_id=${masjid_id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      // Proses data keuangan untuk grafik
      const processedData = processKeuanganData(keuanganRes.data.data); // Asumsi response.data.data adalah array keuangan
      setKeuanganData(processedData);

      // Set data inventaris dan jamaah
      setInventarisData(inventarisRes.data.data || []);
      setJamaahData(jamaahRes.data.data || []);
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

  // Hitung total jamaah aktif dan tidak aktif
  const totalJamaahAktif = jamaahData.filter(item => item.status === 'aktif').length;
  const totalJamaahTidakAktif = jamaahData.filter(item => item.status === 'tidak aktif').length;

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
          
          {/* Bagian Jamaah - Diperbaiki: tampilkan jumlah keseluruhan aktif dan tidak aktif */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users size={24} className="text-white" />
                </div>
                Data Jamaah
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Statistik Anggota Masjid
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserCheck size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-green-800">{totalJamaahAktif}</h4>
                    <p className="text-sm font-medium text-green-700">Jamaah Aktif</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserX size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-800">{totalJamaahTidakAktif}</h4>
                    <p className="text-sm font-medium text-gray-700">Jamaah Tidak Aktif</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bagian Inventaris */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package size={24} className="text-white" />
                </div>
                Inventaris Masjid
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Daftar Barang dan Kondisi
              </p>
            </div>
            {inventarisData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Nama Barang</th>
                      <th className="px-6 py-3">Jumlah</th>
                      <th className="px-6 py-3">Kondisi</th>
                      <th className="px-6 py-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventarisData.map((item) => (
                      <tr key={item.inventaris_id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.nama_barang}</td>
                        <td className="px-6 py-4">{item.jumlah}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.kondisi === 'baik' ? 'bg-green-100 text-green-800' :
                            item.kondisi === 'rusak' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.kondisi}
                          </span>
                        </td>
                        <td className="px-6 py-4">{item.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada data inventaris tersedia.</p>
              </div>
            )}
          </div>
          
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