// src/pages/public/home/Home.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Tambahkan untuk handling state scrollTo
// import '../../styles.css'; // Hapus sementara jika file tidak ada—aktifkan lagi jika styles.css ada di src/styles.css
import NavbarPublic from '/src/components/NavbarPublic'; // Path absolut untuk menghindari error import
import FooterPublic from '/src/components/FooterPublic'; // Path absolut untuk menghindari error import
import HeroSection from './HeroSection'; // Import dari folder yang sama (pages/public/home/)
import SearchMasjidSection from './SearchMasjidSection'; // Import dari folder yang sama
import JadwalSholatSection from './JadwalSholatSection'; // Import dari folder yang sama
import BeritaSection from './BeritaSection'; // Import dari folder yang sama
import ProgramSection from './ProgramSection'; // Import dari folder yang sama
import KegiatanSection from './KegiatanSection'; // Import dari folder yang sama

const Home = () => {
  const location = useLocation(); // Untuk mendapatkan state dari navigate

  // useEffect untuk handle scroll ke section berdasarkan state scrollTo
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' }); // Scroll smooth ke section
      }
    }
  }, [location.state]); // Jalankan setiap kali state berubah

  return (
    <div className="font-sans overflow-x-hidden">
      <NavbarPublic />
      <main className="site-bg">
        <section id="home"> {/* Tambahkan ID untuk HeroSection */}
          <HeroSection />
        </section>
        <section id="masjid"> {/* Tambahkan ID untuk SearchMasjidSection */}
          <SearchMasjidSection />
        </section>
        <section id="jadwal"> {/* Tambahkan ID untuk JadwalSholatSection */}
          <JadwalSholatSection />
        </section>
        <section id="berita"> {/* Tambahkan ID untuk BeritaSection */}
          <BeritaSection />
        </section>
        <section id="program"> {/* Tambahkan ID untuk ProgramSection */}
          <ProgramSection />
        </section>
        <section id="kegiatan"> {/* Tambahkan ID untuk KegiatanSection */}
          <KegiatanSection />
        </section>
      </main>
      <FooterPublic />
    </div>
  );
};

export default Home;