// frontend/src/pages/superadmin/keuangan/KeuanganMasjid.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

const KeuanganMasjid = ({ user, onLogout }) => {
  const { masjid_id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [masjid, setMasjid] = useState(null);
  const [keuanganData, setKeuanganData] = useState([]);
  const [stats, setStats] = useState({ pemasukan: 0, pengeluaran: 0, total: 0 });
  const [chartData, setChartData] = useState([]);
  const [time, setTime] = useState(new Date());
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        // Fetch masjid details
        const masjidRes = await axios.get(`http://localhost:3000/superadmin/masjid/${masjid_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMasjid(masjidRes.data);

        // Fetch keuangan data
        const keuanganRes = await axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${masjid_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = keuanganRes.data.data || [];
        setKeuanganData(data);

        // Calculate stats
        let pemasukan = 0;
        let pengeluaran = 0;
        data.forEach(item => {
          if (item.jumlah > 0) {
            pemasukan += parseFloat(item.jumlah);
          } else {
            pengeluaran += Math.abs(parseFloat(item.jumlah));
          }
        });
        const total = pemasukan - pengeluaran;
        setStats({ pemasukan, pengeluaran, total });

        // Prepare chart data (group by month)
        const grouped = data.reduce((acc, item) => {
          const date = new Date(item.tanggal);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!acc[month]) {
            acc[month] = { name: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }), masuk: 0, keluar: 0 };
          }
          if (item.jumlah > 0) {
            acc[month].masuk += parseFloat(item.jumlah);
          } else {
            acc[month].keluar += Math.abs(parseFloat(item.jumlah));
          }
          return acc;
        }, {});
        const chartArray = Object.values(grouped).sort((a, b) => {
          const [aYear, aMonth] = a.name.split(' ');
          const [bYear, bMonth] = b.name.split(' ');
          return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
        });
        setChartData(chartArray);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data keuangan masjid. Pastikan masjid_id valid dan coba lagi.');
        // Fallback data kosong
        setMasjid(null);
        setKeuanganData([]);
        setStats({ pemasukan: 0, pengeluaran: 0, total: 0 });
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (masjid_id) {
      fetchData();
    } else {
      setError('Masjid ID tidak ditemukan.');
      setLoading(false);
    }
  }, [masjid_id, token]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Keuangan Masjid...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="keuangan-masjid h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
        <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
        
        <div className="flex-1 flex flex-col">
          <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
          
          <div className="main-content p-8 h-full overflow-y-auto space-y-8">
            {/* Error Message */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button 
                  onClick={() => navigate('/superadmin')}
                  className="mt-4 bg-mu-green text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="keuangan-masjid h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Keuangan <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95"
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-mu-green to-green-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <Wallet size={24} className="text-mu-yellow" />
                  </div>
                  <ArrowUpRight size={20} className="opacity-50" />
                </div>
                <p className="text-[10px] opacity-70 font-bold uppercase tracking-[0.2em]">Total Saldo Kas</p>
                <h3 className="text-4xl font-black text-mu-yellow mt-2 tracking-tighter">
                  {formatRupiah(stats.total)}
                </h3>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] text-[12rem] opacity-5 font-black uppercase">MU</div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <TrendingUp size={24} />
                </div>
                <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full">+ Total Masuk</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pemasukan</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1 tracking-tight">
                {formatRupiah(stats.pemasukan)}
              </h3>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <TrendingDown size={24} />
                </div>
                <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full">- Total Keluar</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pengeluaran</p>
              <h3 className="text-3xl font-black text-gray-800 mt-1 tracking-tight">
                {formatRupiah(stats.pengeluaran)}
              </h3>
            </div>
          </div>
          
          {/* Chart */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Analisis Arus Kas</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Data Bulanan Masjid {masjid?.nama_masjid || 'Tidak Diketahui'}
                </p>
              </div>
            </div>

            <div className="min-h-[450px] w-full relative">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={10} 
                      fontWeight={800}
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={15}
                      stroke="#94a3b8"
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 space-y-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase">{payload[0].payload.name}</p>
                              <div className="flex items-center gap-4">
                                  <div>
                                      <p className="text-[8px] font-bold text-mu-green uppercase">Masuk</p>
                                      <p className="text-sm font-black text-mu-green">{formatRupiah(payload[0].value)}</p>
                                  </div>
                                  <div>
                                      <p className="text-[8px] font-bold text-red-500 uppercase">Keluar</p>
                                      <p className="text-sm font-black text-red-500">{formatRupiah(payload[1].value)}</p>
                                  </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="masuk" fill="#006227" radius={[6, 6, 0, 0]} barSize={15} />
                    <Bar dataKey="keluar" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
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

export default KeuanganMasjid;