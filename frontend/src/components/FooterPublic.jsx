// frontend/src/components/FooterPublic.jsx

import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'; // Import ikon dari lucide-react
import logoMu from '../assets/logo_mu.png'; // Import logo dari assets

const FooterPublic = () => {
  return (
    <footer className="bg-[#004a1e] text-white py-16 relative overflow-hidden">
      {/* Background Pattern atau Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-mu-yellow/10 via-transparent to-mu-yellow/5 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="footer-brand lg:col-span-1 text-center">
            <div className="brand-header flex flex-col items-center space-y-4 mb-6">
              <div className="w-12 h-12 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-50 p-1 transform group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={logoMu} // Menggunakan logo yang diimpor dari assets, mirip dengan navbar
                  alt="Logo Muhammadiyah" 
                  className="w-full h-full object-contain"
                  onError={(e) => { 
                    e.target.src = 'https://picsum.photos/48/48?random=1'; // Placeholder stabil sebagai fallback
                  }}
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold tracking-tight text-mu-yellow">Muhammadiyah</h3>
                <p className="text-sm text-white/90 font-medium">Manajemen Masjid</p>
              </div>
            </div>
            <p className="brand-desc text-gray-300 leading-relaxed mb-6 text-sm">
              Membangun umat melalui ketakwaan, pendidikan, dan kepedulian sosial di tengah masyarakat.
            </p>
            <div className="contact space-y-3 text-sm text-gray-300">
              <div className="flex items-center justify-center space-x-3 hover:text-mu-yellow transition-colors">
                <MapPin size={18} className="text-mu-yellow" />
                <span>Jl. Ahmad Dahlan No. 123, Yogyakarta</span>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:text-mu-yellow transition-colors">
                <Phone size={18} className="text-mu-yellow" />
                <span>+62 274 123 4567</span>
              </div>
              <div className="flex items-center justify-center space-x-3 hover:text-mu-yellow transition-colors">
                <Mail size={18} className="text-mu-yellow" />
                <span>info@alhikmah.or.id</span>
              </div>
            </div>
          </div>

          {/* Navigasi Utama (sesuai Navbar) */}
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">Navigasi Utama</h4>
            <ul className="space-y-3">
              <li>
                <span className="flex items-center justify-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group cursor-pointer">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Home</span>
                </span>
              </li>
              <li>
                <span className="flex items-center justify-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group cursor-pointer">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Masjid</span>
                </span>
              </li>
              <li>
                <span className="flex items-center justify-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group cursor-pointer">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Berita Ranting</span>
                </span>
              </li>
              <li>
                <span className="flex items-center justify-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group cursor-pointer">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Program Ranting</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="text-center">
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">Ikuti Kami</h4>
            <div className="flex justify-center space-x-4">
              <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300 cursor-pointer">
                <Facebook size={20} className="text-white hover:text-[#004a1e]" />
              </span>
              <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300 cursor-pointer">
                <Twitter size={20} className="text-white hover:text-[#004a1e]" />
              </span>
              <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300 cursor-pointer">
                <Instagram size={20} className="text-white hover:text-[#004a1e]" />
              </span>
              <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300 cursor-pointer">
                <Youtube size={20} className="text-white hover:text-[#004a1e]" />
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600/50 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm font-medium">
            © 2026 Masjid Al-Hikmah Muhammadiyah. All rights reserved. | 
            <span className="hover:text-mu-yellow transition-colors ml-2 cursor-pointer">Privacy Policy</span> | 
            <span className="hover:text-mu-yellow transition-colors ml-2 cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </div>
      
      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#004a1e] via-mu-yellow/20 to-[#004a1e]"></div>
    </footer>
  );
};

export default FooterPublic;