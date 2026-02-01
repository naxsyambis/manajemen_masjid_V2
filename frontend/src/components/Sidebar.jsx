// frontend/src/components/Sidebar.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Wallet, Users, Package, ClipboardList, Settings, LogOut, Menu 
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, onLogout, user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;
  const navigate = useNavigate();

  const menus = [
    { id: 'dashboard', name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { id: 'keuangan', name: 'Kelola Keuangan', path: '/admin/keuangan', icon: <Wallet size={20} /> },
    { id: 'jamaah', name: 'Data Jamaah', path: '/admin/jamaah', icon: <Users size={20} /> },
    { id: 'inventaris', name: 'Inventaris Masjid', path: '/admin/inventaris', icon: <Package size={20} /> },
    { id: 'riwayat', name: 'Riwayat & Laporan', path: '/admin/riwayat', icon: <ClipboardList size={20} /> },
    { id: 'settings', name: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const currentPath = window.location.pathname;
  const activeMenu = menus.find(menu => menu.path === currentPath)?.id || 'dashboard';

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
            <h1 className="text-lg font-black text-mu-yellow tracking-tighter uppercase whitespace-nowrap leading-none">SIM MASJID</h1>
            <p className="text-[10px] font-black text-white/90 uppercase mt-1.5 flex items-center gap-1.5 tracking-wider">
              <span className="w-1.5 h-1.5 bg-mu-yellow rounded-full animate-pulse"></span>
              {user?.nama || "Memuat..."}
            </p>
          </div>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {menus.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative
                ${activeMenu === item.id ? 'bg-mu-yellow text-mu-green font-bold shadow-lg' : 'hover:bg-green-800 text-white/70 hover:text-white'}`}
            >
              <div className="min-w-[32px] flex justify-center shrink-0">{item.icon}</div>
              <span className={`ml-3 text-sm transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none hidden'}`}>
                {item.name}
              </span>
            </button>
          ))}
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

export default Sidebar;