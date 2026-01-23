import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, Save, DollarSign, Tag, Calendar, User, FileText, AlertCircle } from 'lucide-react';

const ModalRiwayat = ({ show, onClose, onSuccess, data, categories }) => {
  const [form, setForm] = useState({
    jumlah: '',
    kategori_id: '',
    donatur: '',
    deskripsi: '',
    tanggal: ''
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (data && show) {
      let donaturName = "";
      let cleanDeskripsi = data.deskripsi;

      if (data.deskripsi.includes(' - Donatur: ')) {
        const parts = data.deskripsi.split(' - Donatur: ');
        cleanDeskripsi = parts[0];
        donaturName = parts[1];
      }

      setForm({
        jumlah: Math.abs(data.jumlah),
        kategori_id: data.kategori_id,
        donatur: donaturName,
        deskripsi: cleanDeskripsi,
        tanggal: data.tanggal.split('T')[0]
      });
    }
  }, [data, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nominalFinal = data.jumlah < 0 ? -Math.abs(form.jumlah) : Math.abs(form.jumlah);
      
      const payload = {
        jumlah: nominalFinal,
        kategori_id: parseInt(form.kategori_id),
        tanggal: form.tanggal,
        deskripsi: form.donatur ? `${form.deskripsi} - Donatur: ${form.donatur}` : form.deskripsi
      };

      await axios.put(`http://localhost:3000/takmir/keuangan/${data.keuangan_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Transaksi berhasil diperbarui!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("❌ Gagal memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn" 
        onClick={onClose}
      ></div>

      <div className="relative z-[100000] bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn mx-auto my-auto">
        
        <div className="p-8 bg-mu-green text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Edit Transaksi</h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">ID Transaksi: #{data?.keuangan_id}</p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all">
            <X size={24} />
          </button>
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[80vh] no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <DollarSign size={12} className="text-mu-green" /> Nominal (Rp)
              </label>
              <input 
                type="number"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                value={form.jumlah}
                onChange={(e) => setForm({...form, jumlah: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-mu-green" /> Kategori
              </label>
              <select 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner appearance-none focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                value={form.kategori_id}
                onChange={(e) => setForm({...form, kategori_id: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat.kategori_id} value={cat.kategori_id}>{cat.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <User size={12} className="text-mu-green" /> Donatur / Penerima
              </label>
              <input 
                type="text"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                value={form.donatur}
                onChange={(e) => setForm({...form, donatur: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-mu-green" /> Tanggal
              </label>
              <input 
                type="date"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                value={form.tanggal}
                onChange={(e) => setForm({...form, tanggal: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <FileText size={12} className="text-mu-green" /> Deskripsi
              </label>
              <textarea 
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner h-24 resize-none focus:ring-2 focus:ring-mu-green/20 transition-all"
                value={form.deskripsi}
                onChange={(e) => setForm({...form, deskripsi: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-yellow-600 shrink-0" size={18} />
            <p className="text-[10px] text-yellow-800 font-bold leading-relaxed italic">
              Perhatian: Perubahan data akan langsung mempengaruhi laporan arus kas. Pastikan data sudah valid.
            </p>
          </div>

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
              disabled={loading}
              className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-100 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : <><Save size={18} /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ModalRiwayat;