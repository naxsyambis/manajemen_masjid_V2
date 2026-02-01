// frontend/src/pages/superadmin/SuperAdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuperAdminNavbar from '../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import StatCard from '../../components/StatCard';

const SuperAdminDashboard = ({ user, onLogout }) => { // Tambah prop user dan onLogout
  const [isOpen, setIsOpen] = useState(false); // State untuk toggle sidebar
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    const fetchStats = async () => {
      try {
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
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Fallback ke data statis jika error
        setStats([
          { title: 'Total Takmir', value: 0, icon: '👥', colorClass: 'bg-blue-100 text-blue-600' },
          { title: 'Total Program', value: 0, icon: '⚡', colorClass: 'bg-green-100 text-green-600' },
          { title: 'Total Masjid', value: 0, icon: '💰', colorClass: 'bg-yellow-100 text-yellow-600' },
          { title: 'Total Kegiatan', value: 0, icon: '📄', colorClass: 'bg-red-100 text-red-600' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

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
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <h1 className="text-2xl font-bold mb-6">Super Admin Dashboard</h1>
          
          {/* Grid untuk StatCard */}
          <div className="stat-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          
          {/* Tambahkan konten lain jika diperlukan, seperti tabel atau grafik */}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;