import React from 'react';

const HeroSection = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      
      {/* Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1600" 
          alt="Masjid" 
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight tracking-tight">
          Selamat Datang di
          <span className="block text-mu-yellow mt-3">
            Masjid Muhammadiyah Pundong
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-white/80 leading-relaxed">
          Sistem informasi untuk mendukung pengelolaan masjid secara modern, transparan, dan terintegrasi.
        </p>

      </div>

      {/* Wave */}
      <div className="absolute bottom-0 w-full">
        <svg viewBox="0 0 1440 150" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V150H0V120Z" fill="transparent" />
        </svg>
      </div>

    </section>
  );
};

export default HeroSection;