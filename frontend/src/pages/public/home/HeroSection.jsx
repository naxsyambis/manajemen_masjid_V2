import React from 'react';

const HeroSection = () => {
  return (
    <section id="home" className="hero relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1600" alt="Masjid" className="w-full h-full object-cover" />
        <div className="backdrop"></div>
      </div>
      <div className="relative container mx-auto px-6 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
          Selamat Datang di
          <span className="block text-[#daf1de] mt-2">Website Manajemen Masjid</span>
        </h1>
        <p className="text-lg md:text-2xl text-[#daf1de]/90 mb-10 leading-relaxed">
          Platform digital untuk mengelola masjid-masjid Muhammadiyah dengan lebih efisien dan terorganisir
        </p>
      </div>
      <div className="wave">
        <svg viewBox="0 0 1440 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V150H0V120Z" fill="#daf1de" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;