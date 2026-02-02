// frontend/src/pages/superadmin/SuperAdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuperAdminNavbar from '../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import StatCard from '../../components/StatCard';
import Carimasjid from './Carimasjid'; // Import komponen Carimasjid
import { Calendar, RefreshCcw, AlertCircle } from 'lucide-react'; // Hapus Search karena sudah di Carimasjid

const SuperAdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masjids, setMasjids] = useState([]);
  // Hapus state yang tidak perlu: searchQuery, showDropdown, error (karena error sudah ada untuk stats)
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      // Hapus setError(null) karena error sudah untuk stats
      // Fetch data dari backend
      const [takmirRes, programRes, masjidRes, kegiatanRes] = await Promise.all([
        axios.get('http://localhost:3000/superadmin/takmir', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/program', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/masjid', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/kegiatan', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // Hitung total takmir
      const totalTakmir = takmirRes.data.length;

      // Hitung total program
      const totalProgram = programRes.data.length;

      // Hitung total masjid
      const totalMasjid = masjidRes.data.length;

      // Hitung total kegiatan
      const totalKegiatan = kegiatanRes.data.length;

      // Set stats dengan data dinamis
      setStats([
        { title: 'Total Takmir', value: totalTakmir, icon: '👥', colorClass: 'bg-blue-100 text-blue-600' },
        { title: 'Total Program', value: totalProgram, icon: '⚡', colorClass: 'bg-green-100 text-green-600' },
        { title: 'Total Masjid', value: totalMasjid, icon: '💰', colorClass: 'bg-yellow-100 text-yellow-600' },
        { title: 'Total Kegiatan', value: totalKegiatan, icon: '📄', colorClass: 'bg-red-100 text-red-600' },
      ]);

      // Set masjids
      setMasjids(masjidRes.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Hapus setError karena tidak ada state error terpisah
      // Fallback ke data statis jika error
      setStats([
        { title: 'Total Takmir', value: 0, icon: '👥', colorClass: 'bg-blue-100 text-blue-600' },
        { title: 'Total Program', value: 0, icon: '⚡', colorClass: 'bg-green-100 text-green-600' },
        { title: 'Total Masjid', value: 0, icon: '💰', colorClass: 'bg-yellow-100 text-yellow-600' },
        { title: 'Total Kegiatan', value: 0, icon: '📄', colorClass: 'bg-red-100 text-red-600' },
      ]);
      setMasjids([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleRefresh = () => {
    fetchStats();
  };

  // Diperbaiki: Navigasi relatif ke route informasi masjid (tanpa slash awal)
  const handleMasjidClick = (masjidId) => {
    navigate(`informasi/${masjidId}`);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Dashboard...</p>
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
                Super Admin <span className="text-mu-green">Dashboard</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Hanya tombol Refresh Data di sini */}
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
          
          {/* Stats Cards */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Ringkasan Sistem</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Statistik Data Terbaru
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard 
                  key={index} 
                  title={stat.title} 
                  value={stat.value} 
                  icon={stat.icon} 
                  colorClass={stat.colorClass} 
                />
              ))}
            </div>
          </div>
          
          {/* Bagian Cari Masjid - Sekarang cukup panggil Carimasjid saja */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Cari Masjid</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Pilih masjid untuk melihat informasi
              </p>
            </div>
            
            {/* Panggil Carimasjid dengan prop onMasjidClick saja */}
            <Carimasjid onMasjidClick={handleMasjidClick} />
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

export default SuperAdminDashboard;