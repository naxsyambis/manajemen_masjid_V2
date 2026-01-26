import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  RefreshCcw 
} from 'lucide-react';
import { formatRupiah } from '../utils/formatCurrency';

const handleAuthError = (err) => {
  if (err.response && err.response.status === 401) {
    alert(err.response.data.message || "Sesi Anda telah berakhir");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }
  return false;
};

const Dashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ saldo: 0, masuk: 0, keluar: 0 });
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [filterRange, setFilterRange] = useState('minggu');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/takmir/keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const rawData = res.data;
      const now = new Date();
      let m = 0, k = 0;
    
      rawData.forEach(item => {
        const val = parseFloat(item.jumlah);
        if (val > 0) m += val;
        else k += Math.abs(val);
      });
      setStats({ masuk: m, keluar: k, saldo: m - k });

      let processedData = [];

      if (filterRange === 'tahun') {
        const monthlyMap = Array(12).fill(0).map((_, i) => ({
          name: new Date(0, i).toLocaleDateString('id-ID', { month: 'short' }),
          masuk: 0,
          keluar: 0
        }));

        rawData.forEach(item => {
          const d = new Date(item.tanggal);
          if (d.getFullYear() === now.getFullYear()) {
            const val = parseFloat(item.jumlah);
            if (val > 0) monthlyMap[d.getMonth()].masuk += val;
            else monthlyMap[d.getMonth()].keluar += Math.abs(val);
          }
        });
        processedData = monthlyMap;

      } else if (filterRange === 'bulan') {
        const getWeekOfMonth = (date) => {
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
          return Math.ceil((date.getDate() + (firstDay === 0 ? 6 : firstDay - 1)) / 7);
        };

        const weeklyMap = [1, 2, 3, 4].map(w => ({
          name: `Minggu ${w}`,
          masuk: 0,
          keluar: 0
        }));

        rawData.forEach(item => {
          const d = new Date(item.tanggal);
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            const weekIdx = getWeekOfMonth(d) - 1;
            const val = parseFloat(item.jumlah);
            if (weeklyMap[weekIdx]) {
              if (val > 0) weeklyMap[weekIdx].masuk += val;
              else weeklyMap[weekIdx].keluar += Math.abs(val);
            } else {
              if (!weeklyMap[4]) weeklyMap[4] = { name: 'Minggu 5', masuk: 0, keluar: 0 };
              if (val > 0) weeklyMap[4].masuk += val;
              else weeklyMap[4].keluar += Math.abs(val);
            }
          }
        });
        processedData = weeklyMap;

      } else {
        const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        const dailyMap = dayNames.map(day => ({ name: day, masuk: 0, keluar: 0 }));
        const currentDay = now.getDay(); 
        const diffToMonday = now.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
        const mondayThisWeek = new Date(now.setDate(diffToMonday));
        mondayThisWeek.setHours(0,0,0,0);

        rawData.forEach(item => {
          const d = new Date(item.tanggal);
          if (d >= mondayThisWeek) {
            const dayIdx = d.getDay(); 
            const finalIdx = dayIdx === 0 ? 6 : dayIdx - 1; 
            const val = parseFloat(item.jumlah);
            if (val > 0) dailyMap[finalIdx].masuk += val;
            else dailyMap[finalIdx].keluar += Math.abs(val);
          }
        });
        processedData = dailyMap;
      }

      setChartData(processedData);

    } catch (err) {
      if (handleAuthError(err)) return;
      console.error("Gagal sinkronisasi Dashboard:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token, filterRange]);

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
            Dashboard <span className="text-mu-green">Takmir</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <Calendar size={12} className="text-mu-green" />
            <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="mx-2">•</span>
            <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
        
        <button 
          onClick={fetchDashboard}
          className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>
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
              {loading ? "Rp ---" : formatRupiah(stats.saldo)}
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
            {loading ? "..." : formatRupiah(stats.masuk)}
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
            {loading ? "..." : formatRupiah(stats.keluar)}
          </h3>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Analisis Arus Kas</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Filter Aktif: <span className="text-mu-green font-black">{filterRange}</span>
            </p>
          </div>
          
          <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
            {['minggu', 'bulan', 'tahun'].map((range) => (
              <button
                key={range}
                onClick={() => setFilterRange(range)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filterRange === range ? 'bg-white text-mu-green shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[450px] w-full relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
               <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
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
                  <Bar dataKey="masuk" fill="#006227" radius={[6, 6, 0, 0]} barSize={filterRange === 'minggu' ? 25 : 15} />
                  <Bar dataKey="keluar" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={filterRange === 'minggu' ? 25 : 15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
        <div className="h-[1px] w-12 bg-gray-100"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
        <div className="h-[1px] w-12 bg-gray-100"></div>
      </div>
    </div>
  );
};

export default Dashboard;