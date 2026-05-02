import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const GrafikKeuangan = ({ masjidId, namaMasjid }) => {

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

const getExportUrl = () => {
  if (!masjidId || !startDate || !endDate) return '';

  const BASE_URL = "https://masjidmupundong.com";

  return `${BASE_URL}/laporan-keuangan/verifikasi-pdf?masjid_id=${masjidId}&nama_masjid=${encodeURIComponent(namaMasjid || "Masjid")}&startDate=${startDate}&endDate=${endDate}`;
};

  const exportUrl = getExportUrl();

  return (
    <div className="mb-12">

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider">
          <div className="w-10 h-10 bg-gradient-to-br from-[#006227] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          Laporan Keuangan
        </h3>
      </div>

      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 p-10 rounded-3xl border border-gray-200 shadow-xl">

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Calendar size={16} />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                max={today} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006227]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Calendar size={16} />
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                max={today} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006227]"
              />
            </div>
          </div>
          <div className="text-center">

            {exportUrl ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white rounded-2xl shadow-lg">
                    <QRCodeCanvas
                      value={exportUrl}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#006227"
                      level="H"
                    />
                  </div>
                </div>

                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  Scan untuk Download
                </h4>

                <p className="text-gray-600 mb-6">
                  Scan QR ini untuk mengunduh laporan keuangan.
                </p>
                <a
                  href={exportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e]"
                >
                  Download Langsung
                </a>
              </>
            ) : (
              <p className="text-gray-500">
                Silakan pilih tanggal terlebih dahulu untuk generate QR.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrafikKeuangan;