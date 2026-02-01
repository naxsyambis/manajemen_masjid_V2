import React from 'react';
import '../../styles.css'; // Import CSS global dari src/styles.css (path diperbaiki: naik tiga level dari pages/public/home/ ke src/)
import NavbarPublic from './../components/NavbarPublic'; // Path diperbaiki: naik tiga level ke src/components/
import FooterPublic from '../../components/FooterPublic'; // Path diperbaiki: naik tiga level ke src/components/
import HeroSection from './HeroSection'; // Import dari folder yang sama (pages/public/home/)
import SearchMasjidSection from './SearchMasjidSection'; // Import dari folder yang sama
import JadwalSholatSection from './JadwalSholatSection'; // Import dari folder yang sama
import BeritaSection from './BeritaSection'; // Import dari folder yang sama
import ProgramSection from './ProgramSection'; // Import dari folder yang sama
import KegiatanSection from './KegiatanSection'; // Import dari folder yang sama

const Home = () => {
  return (
    <div className="font-sans">
      <NavbarPublic />
      <main className="site-bg">
        <HeroSection />
        <SearchMasjidSection />
        <JadwalSholatSection />
        <BeritaSection />
        <ProgramSection />
        <KegiatanSection />
      </main>
      <FooterPublic />
    </div>
  );
};

export default Home;