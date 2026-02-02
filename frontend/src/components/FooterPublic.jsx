import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'; // Import ikon dari lucide-react

const FooterPublic = () => {
  return (
    <footer className="bg-[#004a1e] text-white py-16 relative overflow-hidden">
      {/* Background Pattern atau Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-mu-yellow/10 via-transparent to-mu-yellow/5 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="footer-brand lg:col-span-1">
            <div className="brand-header flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <span className="text-[#004a1e] text-3xl">🕌</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Muhammadiyah</h3>
                <p className="text-sm text-mu-yellow/80 font-medium">Masjid Al-Hikmah</p>
              </div>
            </div>
            <p className="brand-desc text-gray-300 leading-relaxed mb-6 text-sm">
              Membangun umat melalui ketakwaan, pendidikan, dan kepedulian sosial di tengah masyarakat.
            </p>
            <div className="contact space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-3 hover:text-mu-yellow transition-colors">
                <MapPin size={18} className="text-mu-yellow" />
                <span>Jl. Ahmad Dahlan No. 123, Yogyakarta</span>
              </div>
              <div className="flex items-center space-x-3 hover:text-mu-yellow transition-colors">
                <Phone size={18} className="text-mu-yellow" />
                <span>+62 274 123 4567</span>
              </div>
              <div className="flex items-center space-x-3 hover:text-mu-yellow transition-colors">
                <Mail size={18} className="text-mu-yellow" />
                <span>info@alhikmah.or.id</span>
              </div>
            </div>
          </div>

          {/* Tentang Kami */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">Tentang Kami</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/profil" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Profil Masjid</span>
                </Link>
              </li>
              <li>
                <Link to="/sejarah" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Sejarah</span>
                </Link>
              </li>
              <li>
                <Link to="/visi-misi" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Visi & Misi</span>
                </Link>
              </li>
              <li>
                <Link to="/struktur" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Struktur Organisasi</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Program */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">Program</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/kajian" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Kajian Rutin</span>
                </Link>
              </li>
              <li>
                <Link to="/tpa-tpq" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>TPA & TPQ</span>
                </Link>
              </li>
              <li>
                <Link to="/santunan" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Santunan Sosial</span>
                </Link>
              </li>
              <li>
                <Link to="/tahfidz" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Tahfidz Quran</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan & Social Media */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-mu-yellow">Layanan</h4>
            <ul className="space-y-3 mb-8">
              <li>
                <Link to="/wakaf" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Wakaf</span>
                </Link>
              </li>
              <li>
                <Link to="/zakat" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Zakat</span>
                </Link>
              </li>
              <li>
                <Link to="/infaq" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Infaq & Sedekah</span>
                </Link>
              </li>
              <li>
                <Link to="/konsultasi" className="flex items-center space-x-3 text-gray-300 hover:text-mu-yellow hover:translate-x-1 transition-all duration-300 group">
                  <span className="w-2 h-2 bg-mu-yellow rounded-full group-hover:bg-white transition-colors"></span>
                  <span>Konsultasi Syariah</span>
                </Link>
              </li>
            </ul>
            {/* Social Media */}
            <div>
              <h5 className="text-lg font-medium mb-4 text-mu-yellow">Ikuti Kami</h5>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300">
                  <Facebook size={20} className="text-white hover:text-[#004a1e]" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300">
                  <Twitter size={20} className="text-white hover:text-[#004a1e]" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300">
                  <Instagram size={20} className="text-white hover:text-[#004a1e]" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-mu-yellow hover:scale-110 transition-all duration-300">
                  <Youtube size={20} className="text-white hover:text-[#004a1e]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-600/50 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm font-medium">
            © 2026 Masjid Al-Hikmah Muhammadiyah. All rights reserved. | 
            <Link to="/privacy" className="hover:text-mu-yellow transition-colors ml-2">Privacy Policy</Link> | 
            <Link to="/terms" className="hover:text-mu-yellow transition-colors ml-2">Terms of Service</Link>
          </p>
        </div>
      </div>
      
      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#004a1e] via-mu-yellow/20 to-[#004a1e]"></div>
    </footer>
  );
};

export default FooterPublic;