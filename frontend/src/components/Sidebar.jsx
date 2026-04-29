import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wallet,
  Users,
  Package,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  Newspaper
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, onLogout, user }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;

  const navigate = useNavigate();
  const location = useLocation(); // 🔥 FIX
  const currentPath = location.pathname;

  const menus = [
    { id: 'dashboard', name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { id: 'keuangan', name: 'Kelola Keuangan', path: '/admin/keuangan', icon: <Wallet size={20} /> },
    { id: 'jamaah', name: 'Data Jamaah', path: '/admin/jamaah', icon: <Users size={20} /> },
    { id: 'inventaris', name: 'Inventaris Masjid', path: '/admin/inventaris', icon: <Package size={20} /> },
    { id: 'riwayat', name: 'Riwayat & Laporan', path: '/admin/riwayat', icon: <ClipboardList size={20} /> },
    { id: 'berita', name: 'Berita Masjid', path: '/admin/berita', icon: <Newspaper size={20} /> },
    { id: 'settings', name: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  // 🔥 FIX ACTIVE MENU (prioritas path paling panjang)
  const activeMenu =
    menus
      .slice()
      .sort((a, b) => b.path.length - a.path.length)
      .find(menu => currentPath.startsWith(menu.path))?.id || 'dashboard';

  return (
    <>
      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-mu-green text-white flex flex-col shadow-2xl z-[70] transition-all duration-300 border-r border-green-900
          ${isExpanded ? 'w-64' : 'w-20'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >

        {/* HEADER */}
        <div className="h-20 flex items-center px-6 border-b border-green-900 overflow-hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg hover:bg-green-800 text-mu-yellow transition ${!isExpanded ? 'mx-auto' : ''}`}
          >
            <Menu size={24} />
          </button>

          <div className={`ml-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
            <h1 className="text-lg font-black text-mu-yellow uppercase">
              SIM MASJID
            </h1>
            <p className="text-[10px] font-black text-white/90 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-mu-yellow rounded-full animate-pulse"></span>
              {user?.nama || "Memuat..."}
            </p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 mt-6 px-3 space-y-2 overflow-y-auto no-scrollbar">
          {menus.map((item) => {
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 relative
                  ${isActive
                    ? 'bg-mu-yellow text-mu-green font-bold shadow-lg scale-[1.03]'
                    : 'hover:bg-green-800 text-white/70 hover:text-white'}`}
              >

                {/* ICON */}
                <div className="min-w-[32px] flex justify-center">
                  {item.icon}
                </div>

                {/* TEXT */}
                <span
                  className={`ml-3 text-sm transition-all duration-300 whitespace-nowrap 
                  ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}
                >
                  {item.name}
                </span>

                {/* 🔥 ACTIVE INDICATOR (GARIS SAMPING) */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full" />
                )}

              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-green-900">
          <button
            onClick={onLogout}
            className="w-full flex items-center p-3 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition"
          >
            <div className="min-w-[32px] flex justify-center">
              <LogOut size={20} />
            </div>

            <span className={`ml-3 text-sm font-bold ${isExpanded ? '' : 'hidden'}`}>
              Keluar
            </span>
          </button>
        </div>
      </div>

      {/* SPACER */}
      <div
        className={`hidden lg:block transition-all duration-300 
        ${isExpanded ? 'w-64' : 'w-20'}`}
      />
    </>
  );
};

export default Sidebar;