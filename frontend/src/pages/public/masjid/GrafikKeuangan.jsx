// frontend/src/pages/public/masjid/GrafikKeuangan.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const GrafikKeuangan = ({ chartData }) => {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-wider">
        <div className="w-10 h-10 bg-gradient-to-br from-[#006227] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <TrendingUp size={24} className="text-white" />
        </div>
        Grafik Keuangan
      </h3>
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 rounded-3xl border border-gray-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={12} 
                fontWeight="bold" 
                tick={{ fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickMargin={15}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12} 
                fontWeight="bold" 
                tick={{ fill: '#6b7280' }} 
                tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                domain={[0, 'auto']}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase">{payload[0].payload.month}</p>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-[8px] font-bold text-green-600 uppercase">Pemasukan</p>
                            <p className="text-sm font-black text-green-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payload[0].value)}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-red-500 uppercase">Pengeluaran</p>
                            <p className="text-sm font-black text-red-500">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payload[1].value)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="pemasukan" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
                name="Pemasukan"
              />
              <Bar 
                dataKey="pengeluaran" 
                fill="#ef4444" 
                radius={[6, 6, 0, 0]} 
                barSize={20} 
                name="Pengeluaran"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <TrendingUp size={48} className="text-gray-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Data Keuangan Belum Tersedia</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Belum ada data keuangan yang tercatat untuk masjid ini. Data akan muncul setelah ada transaksi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrafikKeuangan;