import React from 'react';
import ReactDOM from 'react-dom';
import { X, Save, Package, Hash, Info, MapPin, AlertCircle } from 'lucide-react';

const ModalInventaris = ({ show, onClose, onSubmit, form, setForm, isEdit }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn" 
        onClick={onClose}
      ></div>

      {}
      <div className="relative z-[100000] bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn mx-auto my-auto">
        
        {}
        <div className="p-8 bg-mu-green text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
              {isEdit ? "Update Barang" : "Tambah Inventaris"}
            </h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">
              Manajemen Aset & Inventaris Masjid
            </p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90">
            <X size={24} />
          </button>
          {}
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {}
        <form onSubmit={onSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Package size={12} className="text-mu-green" /> Nama Barang
              </label>
              <input
                required
                placeholder="Contoh: Karpet Sajadah Turki"
                value={form.nama_barang}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, nama_barang: e.target.value})}
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Hash size={12} className="text-mu-green" /> Jumlah
              </label>
              <input
                required
                type="number"
                placeholder="0"
                value={form.jumlah}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, jumlah: e.target.value})}
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Info size={12} className="text-mu-green" /> Kondisi
              </label>
              <select
                value={form.kondisi}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner appearance-none focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                onChange={e => setForm({...form, kondisi: e.target.value})}
              >
                <option value="baik">Kondisi Baik</option>
                <option value="rusak">Rusak / Perlu Perbaikan</option>
                <option value="hilang">Hilang / Tidak Ditemukan</option>
              </select>
            </div>

            {}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-mu-green" /> Keterangan / Lokasi
              </label>
              <textarea
                placeholder="Contoh: Disimpan di Gudang Lantai 2"
                value={form.keterangan}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner h-24 resize-none focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, keterangan: e.target.value})}
              />
            </div>
          </div>

          {}
          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-yellow-600 shrink-0" size={18} />
            <p className="text-[10px] text-yellow-800 font-bold leading-relaxed italic">
              Pencatatan inventaris yang akurat sangat penting untuk audit aset masjid. Pastikan jumlah dan lokasi barang diperbarui secara berkala.
            </p>
          </div>

          {}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase text-xs hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-100 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> {isEdit ? "Update Aset" : "Simpan Aset"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ModalInventaris;