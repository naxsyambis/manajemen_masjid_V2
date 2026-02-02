// frontend/src/pages/public/masjid/TotalJamaah.jsx

import React from 'react';
import { Users } from 'lucide-react';

const TotalJamaah = ({ jamaah, totalPemasukan, totalPengeluaran, inventaris }) => {
  return (
    <div className="flex justify-center mb-12">
      {/* Total Jamaah */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-[2.5rem] border border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-500 text-white rounded-2xl group-hover:bg-blue-600 transition-colors">
            <Users size={32} />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Total Jamaah</p>
          <h3 className="text-5xl font-black text-blue-800 tracking-tight">
            {jamaah.length}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default TotalJamaah;