import React from 'react';
import ReactDOM from 'react-dom';
import { X, Save, User, Phone, MapPin, Shield, Info, Users, AlertCircle } from 'lucide-react';

const ModalJamaah = ({ show, onClose, onSubmit, form, setForm, isEdit }) => {
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
              {isEdit ? "Update Data" : "Registrasi Jamaah"}
            </h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">
              Manajemen Database Umat Masjid
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
                <User size={12} className="text-mu-green" /> Nama Lengkap
              </label>
              <input
                required
                placeholder="Masukkan nama lengkap jamaah"
                value={form.nama}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, nama: e.target.value})}
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Phone size={12} className="text-mu-green" /> No. HP / WhatsApp
              </label>
              <input
                required
                placeholder="08xxxxxxxxxx"
                value={form.no_hp}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, no_hp: e.target.value})}
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Shield size={12} className="text-mu-green" /> Peran / Jabatan
              </label>
              <input
                placeholder="Contoh: Tokoh Masyarakat"
                value={form.peran}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-mu-green shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, peran: e.target.value})}
              />
            </div>

            {}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <MapPin size={12} className="text-mu-green" /> Alamat Lengkap
              </label>
              <textarea
                placeholder="Masukkan alamat tinggal atau RT/RW"
                value={form.alamat}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner h-20 resize-none focus:ring-2 focus:ring-mu-green/20 transition-all"
                onChange={e => setForm({...form, alamat: e.target.value})}
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Users size={12} className="text-mu-green" /> Jenis Kelamin
              </label>
              <select
                value={form.jenis_kelamin}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner appearance-none focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                onChange={e => setForm({...form, jenis_kelamin: e.target.value})}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Info size={12} className="text-mu-green" /> Status Jamaah
              </label>
              <select
                value={form.status}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner appearance-none focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                onChange={e => setForm({...form, status: e.target.value})}
              >
                <option value="aktif">Aktif</option>
                <option value="tidak aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          {}
          <div className="bg-mu-green/[0.03] border border-mu-green/10 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-mu-green shrink-0" size={18} />
            <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic">
              Data jamaah bersifat rahasia dan hanya digunakan untuk kepentingan dakwah serta pelayanan umat di lingkungan masjid.
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
              <Save size={18} /> {isEdit ? "Update Data" : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ModalJamaah;