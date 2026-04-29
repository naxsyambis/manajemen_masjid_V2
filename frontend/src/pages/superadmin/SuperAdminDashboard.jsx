import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SuperAdminNavbar from '../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import StatCard from '../../components/StatCard';
import { Calendar, RefreshCcw } from 'lucide-react';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const [takmirRes, programRes, masjidRes, kegiatanRes, beritaRes] = await Promise.all([
        axios.get('http://localhost:3000/superadmin/takmir', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/program', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/masjid', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/kegiatan', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:3000/superadmin/berita', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats([
        { title: 'Total Takmir', value: takmirRes.data.length, icon: '👥', colorClass: 'bg-blue-100 text-blue-600' },
        { title: 'Total Masjid', value: masjidRes.data.length, icon: '🕌', colorClass: 'bg-yellow-100 text-yellow-600' },
        { title: 'Total Program', value: programRes.data.length, icon: '⚡', colorClass: 'bg-green-100 text-green-600' },
        { title: 'Total Kegiatan', value: kegiatanRes.data.length, icon: '📄', colorClass: 'bg-red-100 text-red-600' },
        { title: 'Total Berita', value: beritaRes.data.length, icon: '📰', colorClass: 'bg-purple-100 text-purple-600' },
      ]);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">
                Super Admin <span className="text-mu-green">Dashboard</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <button onClick={fetchStats} className="flex items-center gap-2 bg-white border px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:text-mu-green transition-all shadow-sm">
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter mb-10">Ringkasan Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;