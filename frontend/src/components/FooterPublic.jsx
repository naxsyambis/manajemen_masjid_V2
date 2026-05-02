import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import logoMu from '../assets/logo_mu.png';
import logoUmy from '../assets/umy.png';

const FooterPublic = () => {
  const navigate = useNavigate();

  const handleSectionLink = (section) => {
    navigate('/', { state: { scrollTo: section } });
  };

  const handlePageLink = (path) => {
    navigate(path);
  };

const handleMasjidRedirect = () => {
  navigate('/masjid');
};

  return (
    <footer className="bg-[#004a1e] text-white py-20">
      <div className="container mx-auto px-6">

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ===================== */}
          {/* 🔥 LOGO */}
          {/* ===================== */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl p-1">
                <img src={logoMu} alt="logo" className="w-full h-full object-contain"/>
              </div>

                              {/* LOGO UMY */}
  <div className="w-12 h-12 bg-white/90 rounded-xl p-1 shadow-sm flex items-center justify-center">
    <img
      src={logoUmy}
      alt="logo UMY"
      className="w-full h-full object-contain"
    />
  </div>

              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  Muhammadiyah
                </h3>
                <p className="text-sm text-white/80">
                  Manajemen Masjid
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Membangun umat melalui ketakwaan, pendidikan, dan kepedulian sosial di tengah masyarakat.
            </p>

            {/* SOSMED */}
            <div className="flex gap-3">

              {/* FACEBOOK */}
              <a
                href="https://www.facebook.com/share/1KW2pRYEDP/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition"
              >
                <Facebook size={18}/>
              </a>

              {/* INSTAGRAM */}
              <a
                href="https://www.instagram.com/masjid_ahmaddahlanpundong?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition"
              >
                <Instagram size={18}/>
              </a>

              {/* YOUTUBE (opsional, kalau mau tetap ada) */}
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-black transition cursor-pointer">
                <Youtube size={18}/>
              </div>

            </div>
          </div>

          {/* ===================== */}
          {/* 🔥 NAVIGASI */}
          {/* ===================== */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-400">
              Navigasi
            </h4>

            <div className="space-y-3 text-sm text-gray-300">
              <p onClick={() => handleSectionLink('home')} className="cursor-pointer hover:text-yellow-400">Beranda</p>
              <p onClick={() => handlePageLink('/masjid')} className="cursor-pointer hover:text-yellow-400">Masjid</p>
              <p onClick={() => handleSectionLink('berita')} className="cursor-pointer hover:text-yellow-400">Berita Ranting</p>
              <p onClick={() => handleSectionLink('program')} className="cursor-pointer hover:text-yellow-400">Program Ranting</p>
              <p onClick={() => handleSectionLink('kegiatan')} className="cursor-pointer hover:text-yellow-400">Kegiatan</p>
              <p onClick={() => handlePageLink('/kepengurusan')} className="cursor-pointer hover:text-yellow-400">Kepengurusan</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-400">
              Layanan
            </h4>

            <div className="space-y-3 text-sm text-gray-300">

              <p
                onClick={() => handleSectionLink('jadwal')}
                className="hover:text-yellow-400 cursor-pointer"
              >
                Jadwal Sholat
              </p>

              <p onClick={handleMasjidRedirect} className="hover:text-yellow-400 cursor-pointer">
                Info Keuangan
              </p>

                        
              <p onClick={handleMasjidRedirect} className="hover:text-yellow-400 cursor-pointer">
                Data Jamaah
              </p>

              <p onClick={handleMasjidRedirect} className="hover:text-yellow-400 cursor-pointer">
                Inventaris Masjid
              </p>

              <p
                onClick={() => handlePageLink('/login')}
                className="hover:text-yellow-400 cursor-pointer"
              >
                Login Takmir
              </p>

            </div>
          </div>

          {/* ===================== */}
          {/* 🔥 KONTAK */}
          {/* ===================== */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-yellow-400">
              Kontak
            </h4>

            <div className="space-y-4 text-sm text-gray-300">

              <a
                href="https://maps.app.goo.gl/snHyyjwGEoeP5mCD6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-yellow-400 transition"
              >
                <MapPin size={18}/>
                <span>
                  Jl. Parangtritis No.RT.02, Sawahan, Srihardono,
                  Kec. Pundong, Bantul, Yogyakarta 55771
                </span>
              </a>

              <a
  href="https://wa.me/6285641692104"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-3 hover:text-yellow-400 transition"
>
  <Phone size={18}/> 085641692104
</a>

            </div>

            {/* BUTTON */}
            <button
              onClick={() => navigate('/masjid')}
              className="mt-6 px-5 py-2 border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition text-sm"
            >
              Lihat Semua Masjid →
            </button>
          </div>

        </div>

        {/* ===================== */}
        {/* 🔥 FOOTER BAWAH */}
        {/* ===================== */}
        <div className="border-t border-white/20 mt-14 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">

          <p>
            © 2026 Muhammadiyah Pundong. Hak cipta dilindungi.
          </p>

          <div className="flex gap-6 mt-3 md:mt-0">
            <span className="hover:text-yellow-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-yellow-400 cursor-pointer">Terms of Service</span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default FooterPublic;