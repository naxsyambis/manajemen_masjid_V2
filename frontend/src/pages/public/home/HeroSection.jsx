import React from 'react';

const HeroSection = () => {
  return (
    <section id="home" className="hero relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1600" 
          alt="Masjid" 
          className="w-full h-full object-cover filter brightness-50" 
        />
        {/* Overlay Redup */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto px-6 text-center z-10 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
          Selamat Datang di
          <span className="block text-mu-yellow mt-2 drop-shadow-lg">Website Manajemen Masjid</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
          Platform digital untuk mengelola masjid-masjid Muhammadiyah dengan lebih efisien dan terorganisir
        </p>
      </div>
      
      {/* Static White Wave */}
      <div className="wave absolute bottom-0 w-full">
        <svg viewBox="0 0 1440 150" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V150H0V120Z" fill="transparent" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;