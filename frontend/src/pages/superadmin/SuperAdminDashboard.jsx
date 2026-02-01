// frontend/src/pages/superadmin/SuperAdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuperAdminNavbar from '../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import StatCard from '../../components/StatCard';
import { Calendar, RefreshCcw, AlertCircle } from 'lucide-react';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masjids, setMasjids] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter masjid berdasarkan search query
  const filteredMasjids = masjids.filter(masjid =>
    masjid.nama_masjid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    masjid.alamat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      setError(null);
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
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
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
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
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
          
          {/* Section Daftar Masjid */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Daftar Masjid</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Klik untuk melihat keuangan masjid
                </p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari masjid berdasarkan nama atau alamat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* List Masjid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMasjids.length > 0 ? (
                filteredMasjids.map((masjid) => (
                  <div 
                    key={masjid.masjid_id} 
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/superadmin/keuangan/${masjid.masjid_id}`)}
                  >
                    {masjid.logo_foto && (
                      <div className="relative h-48 overflow-hidden rounded-t-2xl">
                        <img
                          src={`http://localhost:3000${masjid.logo_foto}`}
                          alt={masjid.nama_masjid}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/placeholder-masjid.png'; // Fallback image
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-mu-green transition-colors duration-300">{masjid.nama_masjid}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 text-mu-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {masjid.alamat}
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-mu-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {masjid.no_hp}
                        </p>
                      </div>
                      {masjid.deskripsi && (
                        <p className="text-sm text-gray-500 mt-4 line-clamp-3">{masjid.deskripsi}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-500 text-lg font-medium">Tidak ada masjid ditemukan.</p>
                  <p className="text-gray-400 text-sm mt-1">Coba ubah kata kunci pencarian Anda.</p>
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
      </div>
    </div>
  );
};

export default SuperAdminDashboard;