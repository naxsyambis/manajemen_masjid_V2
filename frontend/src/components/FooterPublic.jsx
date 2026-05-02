// frontend/src/components/FooterPublic.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import logoMu from '../assets/logo_mu.png';

const FooterPublic = () => {
  const navigate = useNavigate();

  const handleSectionLink = (section) => {
    navigate('/', { state: { scrollTo: section } });
  };

  const handlePageLink = (path) => {
    navigate(path);
  };

  return (
    <footer className="bg-[#004a1e] text-white py-16 relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-t from-mu-yellow/10 via-transparent to-mu-yellow/5 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">

          {/* BRAND */}
          <div className="text-center">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl p-1">
                <img src={logoMu} alt="logo" className="w-full h-full object-contain"/>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-mu-yellow">Muhammadiyah</h3>
                <p className="text-sm text-white/90">Manajemen Masjid</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-6">
              Membangun umat melalui ketakwaan, pendidikan, dan kepedulian sosial di tengah masyarakat.
            </p>

            {/* 🔥 CONTACT UPDATED */}
            <div className="space-y-3 text-sm text-gray-300">

              {/* 🔥 ALAMAT CLICKABLE */}
              <a
                href="https://maps.app.goo.gl/snHyyjwGEoeP5mCD6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center gap-2 hover:text-mu-yellow transition cursor-pointer"
              >
                <MapPin size={18}/>
                <span className="text-center max-w-xs">
                  Jl. Parangtritis No.RT.02, Sawahan, Srihardono, Kec. Pundong,
                  Kabupaten Bantul, Daerah Istimewa Yogyakarta 55771
                </span>
              </a>

              <div className="flex justify-center gap-2">
                <Phone size={18}/> +62 274 123 4567
              </div>

            </div>
          </div>

          {/* NAVIGASI */}
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">
              Navigasi Utama
            </h4>

            <ul className="space-y-3">

              <li onClick={() => handleSectionLink('home')} className="cursor-pointer hover:text-mu-yellow">
                Home
              </li>

              <li onClick={() => handlePageLink('/masjid')} className="cursor-pointer hover:text-mu-yellow">
                Masjid
              </li>

              <li onClick={() => handleSectionLink('berita')} className="cursor-pointer hover:text-mu-yellow">
                Berita Ranting
              </li>

              <li onClick={() => handleSectionLink('program')} className="cursor-pointer hover:text-mu-yellow">
                Program Ranting
              </li>

              <li onClick={() => handleSectionLink('kegiatan')} className="cursor-pointer hover:text-mu-yellow">
                Kegiatan
              </li>

              <li onClick={() => handlePageLink('/kepengurusan')} className="cursor-pointer hover:text-mu-yellow">
                Kepengurusan Ranting
              </li>

            </ul>
          </div>

          {/* SOSIAL */}
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">
              Ikuti Kami
            </h4>

            <div className="flex justify-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow transition">
                <Facebook size={20}/>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow transition">
                <Twitter size={20}/>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow transition">
                <Instagram size={20}/>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow transition">
                <Youtube size={20}/>
              </div>
            </div>
          </div>

        </div>

        {/* 🔥 FOOTER BAWAH */}
        <div className="border-t border-gray-600/50 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} Masjid Muhammadiyah Pundong. All rights reserved. |
            <span className="ml-2 hover:text-mu-yellow cursor-pointer">Privacy Policy</span> |
            <span className="ml-2 hover:text-mu-yellow cursor-pointer">Terms of Service</span>
          </p>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#004a1e] via-mu-yellow/20 to-[#004a1e]"></div>
    </footer>
  );
};

export default FooterPublic;