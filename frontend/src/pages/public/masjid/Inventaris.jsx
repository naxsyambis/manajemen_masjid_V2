// frontend/src/pages/public/masjid/Inventaris.jsx

import React from 'react';
import { Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const Inventaris = ({ inventaris }) => {
  const getKondisiIcon = (kondisi) => {
    switch (kondisi) {
      case 'baik':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rusak':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertTriangle size={16} className="text-yellow-600" />;
    }
  };

  const getKondisiColor = (kondisi) => {
    switch (kondisi) {
      case 'baik':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rusak':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-wider">
        <div className="w-10 h-10 bg-gradient-to-br from-[#006227] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Package size={24} className="text-white" />
        </div>
        Inventaris Masjid
      </h3>
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {inventaris.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full bg-white rounded-2xl overflow-hidden">
              <thead className="bg-gradient-to-r from-[#006227] to-emerald-600 text-white">
                <tr>
                  <th className="px-8 py-6 text-left font-bold uppercase tracking-wider">Nama Barang</th>
                  <th className="px-8 py-6 text-center font-bold uppercase tracking-wider">Jumlah</th>
                  <th className="px-8 py-6 text-center font-bold uppercase tracking-wider">Kondisi</th>
                  <th className="px-8 py-6 text-left font-bold uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {inventaris.map((item, index) => (
                  <tr 
                    key={item.inventaris_id} 
                    className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-8 py-6 font-semibold text-gray-900">{item.nama_barang}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 rounded-full font-bold shadow-sm">
                        {item.jumlah}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border shadow-sm ${getKondisiColor(item.kondisi)}`}>
                        {getKondisiIcon(item.kondisi)}
                        <span className="ml-2">
                          {item.kondisi === 'baik' ? 'Baik' : 
                           item.kondisi === 'rusak' ? 'Rusak' : 
                           'Hilang'}
                        </span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-700 leading-relaxed">{item.keterangan || 'Tidak ada keterangan'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Package size={48} className="text-gray-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Inventaris Kosong</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Belum ada data inventaris yang tercatat untuk masjid ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventaris;