import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, FileDown, AlertCircle } from 'lucide-react';

const ModalCalenderRiwayat = ({ show, onClose, onExport }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!show) return null;

  const handleExportClick = () => {
    if (!startDate || !endDate) {
      alert("❌ Silakan pilih tanggal awal dan tanggal akhir!");
      return;
    }
    onExport(startDate, endDate);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
          z-index: 20;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>

      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" 
        onClick={onClose}
      ></div>

      <div className="relative z-[100000] bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-gray-100 animate-scaleIn">
        
        <div className="p-8 bg-mu-green text-white flex justify-between items-center relative overflow-hidden rounded-t-[2.5rem]">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Export Laporan</h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">Filter Periode Transaksi</p>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <X size={24} />
          </button>
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-mu-green rounded-full"></div>
                Mulai Dari
              </label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-gray-800 focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer relative z-10 bg-transparent"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-mu-green opacity-40 z-0" size={18} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                Sampai Dengan
              </label>
              <div className="relative">
                <input 
                  type="date"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-gray-800 focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer relative z-10 bg-transparent"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-mu-green opacity-40 z-0" size={18} />
              </div>
            </div>

          </div>

          <div className="bg-mu-green/[0.03] border border-mu-green/10 p-5 rounded-[1.5rem] flex items-start gap-4">
            <div className="p-2 bg-mu-green/10 rounded-lg text-mu-green">
              <AlertCircle size={20} />
            </div>
            <p className="text-[11px] text-gray-500 font-bold leading-relaxed italic">
              Laporan akan di-generate dalam format PDF berdasarkan rentang waktu yang Anda pilih di atas.
            </p>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleExportClick}
              className="flex-[2] py-5 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FileDown size={20} /> Download Laporan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ModalCalenderRiwayat;