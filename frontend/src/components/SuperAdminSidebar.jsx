// frontend/src/components/SuperAdminSidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Tambah untuk navigasi dan highlight aktif
import { 
  Home, LayoutGrid, Users, Calendar, FileText, DollarSign, LogOut, Menu, Activity 
} from 'lucide-react'; // Ganti icon ke lucide-react untuk konsistensi, tambah Activity untuk Kegiatan

const SuperAdminSidebar = ({ isOpen, setIsOpen, onLogout, user, setIsHovered, isExpanded }) => {
  const location = useLocation(); // Untuk menentukan menu aktif berdasarkan path

  const menus = [
    { title: "Dashboard", path: "/superadmin", icon: <Home size={20} /> },
    { title: "Data Masjid", path: "/superadmin/masjid", icon: <LayoutGrid size={20} /> },
    { title: "Data Takmir", path: "/superadmin/takmir", icon: <Users size={20} /> },
    { title: "Kepengurusan", path: "/superadmin/kepengurusan", icon: <Users size={20} /> }, // Icon sama dengan Data Takmir, bisa ganti jika perlu
    { title: "Program", path: "/superadmin/program", icon: <Calendar size={20} /> },
    { title: "Berita", path: "/superadmin/berita", icon: <FileText size={20} /> },
    { title: "Kegiatan", path: "/superadmin/kegiatan", icon: <Activity size={20} /> },
    { title: "Keuangan", path: "/superadmin/keuangan", icon: <DollarSign size={20} /> },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm pointer-events-auto" onClick={() => setIsOpen(false)} />
      )}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-mu-green text-white flex flex-col shadow-2xl z-[70] transition-all duration-300 ease-in-out border-r border-green-900
          ${isExpanded ? 'w-64' : 'w-20'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-green-900 overflow-hidden shrink-0">
          <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-lg hover:bg-green-800 text-mu-yellow transition-all flex-shrink-0 ${!isExpanded ? 'mx-auto' : ''}`}>
            <Menu size={24} />
          </button>
          <div className={`ml-4 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
            <h1 className="text-lg font-black text-mu-yellow tracking-tighter uppercase whitespace-nowrap leading-none">SUPER ADMIN</h1>
            <p className="text-[10px] font-black text-white/90 uppercase mt-1.5 flex items-center gap-1.5 tracking-wider">
              <span className="w-1.5 h-1.5 bg-mu-yellow rounded-full animate-pulse"></span>
              {user?.nama || "Memuat..."}
            </p>
          </div>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {menus.map((item) => {
            const isActive = location.pathname === item.path; // Highlight berdasarkan path saat ini
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false); // Tutup sidebar di mobile
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative
                  ${isActive ? 'bg-mu-yellow text-mu-green font-bold shadow-lg' : 'hover:bg-green-800 text-white/70 hover:text-white'}`}
              >
                <div className="min-w-[32px] flex justify-center shrink-0">{item.icon}</div>
                <span className={`ml-3 text-sm transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-green-900 shrink-0">
          <button onClick={onLogout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all group">
            <div className="min-w-[32px] flex justify-center shrink-0"><LogOut size={20} /></div>
            <span className={`ml-3 text-sm font-bold transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>Keluar</span>
          </button>
        </div>
      </div>
      <div className={`hidden lg:block transition-all duration-300 ease-in-out shrink-0 pointer-events-none ${isExpanded ? 'w-64' : 'w-20'}`} />
    </>
  );
};

export default SuperAdminSidebar;