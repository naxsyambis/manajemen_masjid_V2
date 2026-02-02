// frontend/src/pages/public/masjid/DeskripsiMasjid.jsx

import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const DeskripsiMasjid = ({ masjid }) => {
  return (
    <>
      {/* Header Masjid */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#006227] mb-4 tracking-tight leading-tight">
          {masjid.nama_masjid}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-gray-400" />
              <span>{masjid.alamat}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-gray-400" />
              <span>{masjid.no_hp}</span>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#006227] text-white text-sm font-semibold rounded-full shadow-md">
            Masjid
          </span>
        </div>
      </div>

      {/* Gambar Logo Masjid */}
      {masjid.logo_foto && (
        <div className="mb-8 flex justify-center">
          <img
            src={`http://localhost:3000${masjid.logo_foto}`}
            alt={masjid.nama_masjid}
            className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl shadow-lg"
            onError={(e) => { 
              e.target.src = 'https://picsum.photos/800/400?random=1'; // Ganti dengan placeholder yang lebih stabil
            }}
          />
        </div>
      )}

      {/* Isi Masjid */}
      <div className="prose prose-lg max-w-none text-[#1e293b] leading-relaxed mb-12">
        <div className="whitespace-pre-wrap">{masjid.deskripsi || 'Deskripsi masjid belum tersedia.'}</div>
      </div>
    </>
  );
};

export default DeskripsiMasjid;