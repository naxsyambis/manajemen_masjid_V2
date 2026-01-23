import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import LogoMu from '../assets/logo_mu.png'; 

const Navbar = ({ setIsOpen }) => {
  const [namaMasjid, setNamaMasjid] = useState("SIM MASJID");

  useEffect(() => {
    const savedMasjid = localStorage.getItem('namaMasjid');
    if (savedMasjid) setNamaMasjid(savedMasjid);
  }, []);

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 transition-all">
      
      {}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 text-mu-green hover:bg-green-50 rounded-xl transition-colors focus:outline-none"
        >
          <Menu size={28} />
        </button>

        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-50 p-1 transform group-hover:scale-110 transition-transform duration-300">
            <img 
              src={LogoMu} 
              alt="Logo Muhammadiyah" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-mu-green font-black text-sm md:text-xl uppercase tracking-tighter leading-none truncate max-w-[180px] md:max-w-md">
              {namaMasjid}
            </h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 bg-mu-yellow rounded-full"></span>
              Pusat Takmir Digital
            </p>
          </div>
        </div>
      </div>
      
      {}
      <div></div>

    </header>
  );
};

export default Navbar;