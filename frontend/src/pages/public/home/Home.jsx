// src/pages/public/home/Home.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavbarPublic from '/src/components/NavbarPublic';
import FooterPublic from '/src/components/FooterPublic';
import HeroSection from './HeroSection';
import JadwalSholatSection from './JadwalSholatSection';
import BeritaSection from './BeritaSection';
import ProgramSection from './ProgramSection';
import KegiatanSection from './KegiatanSection';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.state]);

  return (
    <div className="font-sans min-h-screen bg-gray-50 overflow-x-hidden">

      {/* NAVBAR */}
      <NavbarPublic />

      {/* CONTENT */}
      <main className="w-full overflow-x-hidden">

        <section id="home" className="w-full overflow-hidden">
          <HeroSection />
        </section>

        <section id="jadwal" className="w-full overflow-hidden">
          <JadwalSholatSection />
        </section>

        <section id="berita" className="w-full overflow-hidden">
          <BeritaSection />
        </section>

        <section id="program" className="w-full overflow-hidden">
          <ProgramSection />
        </section>

        <section id="kegiatan" className="w-full overflow-hidden">
          <KegiatanSection />
        </section>

      </main>

      {/* FOOTER */}
      <FooterPublic />
    </div>
  );
};

export default Home;