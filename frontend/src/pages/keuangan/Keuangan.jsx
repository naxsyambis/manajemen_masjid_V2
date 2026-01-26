import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Wallet, ArrowDownCircle, ArrowUpCircle, User, 
  Calendar, Save, Plus, Tag, FileText, 
  Pencil, ChevronDown 
} from 'lucide-react';
import ModalKeuangan from './ModalKeuangan';

const handleAuthError = (err) => { //friska
  if (err.response && err.response.status === 401) {
    alert(err.response.data.message || "Sesi Anda telah berakhir");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }
  return false;
};

const Keuangan = () => {
  const [formData, setFormData] = useState({
    jenis_transaksi: 'pemasukan',
    jumlah: '',
    deskripsi: '',
    donatur: '',
    tanggal: new Date().toISOString().split('T')[0],
    kategori_id: '' 
  });

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/takmir/kategori-keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
      if (res.data.length > 0 && !formData.kategori_id) {
        setFormData(prev => ({ ...prev, kategori_id: res.data[0].kategori_id }));
      }
    } catch (err) {
      if (handleAuthError(err)) return;
      console.error("Gagal mengambil kategori");
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  const handleJumlahChange = (e) => {
    const value = e.target.value;
    if (value === '' || parseFloat(value) >= 0) {
      setFormData({ ...formData, jumlah: value });
    }
  };

  const handleJumlahBlur = () => {
    const val = parseFloat(formData.jumlah);
    if (formData.jumlah !== '' && val < 500) {
      alert("⚠️ Nominal otomatis disesuaikan ke minimal Rp 500");
      setFormData({ ...formData, jumlah: '500' });
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    const nominalCheck = parseFloat(formData.jumlah);
    
    if (!formData.jumlah || nominalCheck < 500) {
      alert("❌ Nominal transaksi tidak boleh di bawah Rp 500!");
      return;
    }

    if (!formData.kategori_id) {
      alert("❌ Pilih kategori terlebih dahulu!");
      return;
    }

    try {
      const nominalFinal = formData.jenis_transaksi === 'pengeluaran' ? -Math.abs(nominalCheck) : Math.abs(nominalCheck);
      await axios.post('http://localhost:3000/takmir/keuangan', {
        jumlah: nominalFinal,
        tanggal: formData.tanggal,
        deskripsi: formData.donatur ? `${formData.deskripsi} - Donatur: ${formData.donatur}` : formData.deskripsi,
        kategori_id: parseInt(formData.kategori_id)
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert(`✅ Data ${formData.jenis_transaksi.toUpperCase()} Berhasil Disimpan ke Database!`);
      setFormData({ ...formData, jumlah: '', deskripsi: '', donatur: '' });
    } catch (err) {
      if (handleAuthError(err)) return;
      alert("Gagal menyimpan data ke database.");
    }
  };

  const selectedCategoryName = categories.find(c => c.kategori_id == formData.kategori_id)?.nama_kategori || "Pilih Kategori";

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd] min-h-screen">
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-all duration-300">
                <Wallet size={32} strokeWidth={2.5} />
             </div>
             <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">Kas Masjid</h2>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] ml-1">Manajemen Arus Kas Digital</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <form onSubmit={handleSimpan} className="p-10 space-y-10">
          
          <div className="flex p-1.5 bg-gray-100 rounded-[2rem] gap-1.5 border border-gray-200/50">
            <button type="button" onClick={() => setFormData({...formData, jenis_transaksi: 'pemasukan'})}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.6rem] font-bold uppercase text-xs transition-all ${formData.jenis_transaksi === 'pemasukan' ? 'bg-white text-mu-green shadow-sm' : 'text-gray-400'}`}>
              <ArrowDownCircle size={18} /> Pemasukan
            </button>
            <button type="button" onClick={() => setFormData({...formData, jenis_transaksi: 'pengeluaran'})}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.6rem] font-bold uppercase text-xs transition-all ${formData.jenis_transaksi === 'pengeluaran' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>
              <ArrowUpCircle size={18} /> Pengeluaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><Plus size={14} /> Nominal (Rp)</label>
              <input 
                type="number" 
                value={formData.jumlah} 
                className="w-full pl-6 pr-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-xl font-black shadow-inner" 
                onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                onChange={handleJumlahChange}
                onBlur={handleJumlahBlur}
                placeholder="Minimal 500" 
                required 
              />
            </div>

            <div className="space-y-3 group relative" ref={dropdownRef}>
              <div className="flex justify-between items-center pr-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><Tag size={14} /> Kategori</label>
                <div className="flex items-center gap-3">
                  {categories.length > 0 && (
                    <button type="button" onClick={() => { setEditMode(true); setShowModal(true); }} className="text-gray-400 hover:text-mu-green transition-colors flex items-center gap-1 text-[9px] font-black uppercase"><Pencil size={12} /> Edit</button>
                  )}
                  <button type="button" onClick={() => { setEditMode(false); setShowModal(true); }} className="text-mu-green hover:underline text-[9px] font-black uppercase tracking-widest">+ Tambah Baru</button>
                </div>
              </div>
              
              <div className="relative">
                {categories.length === 0 ? (
                  <button type="button" onClick={() => { setEditMode(false); setShowModal(true); }} className="w-full px-6 py-5 bg-green-50 text-mu-green border-2 border-dashed border-mu-green/30 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-xs hover:bg-green-100 transition-all">
                    <Plus size={18} /> Tambah Kategori Baru
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold text-gray-600 shadow-inner flex justify-between items-center transition-all hover:bg-gray-100"
                    >
                      <span>{selectedCategoryName}</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-none shadow-2xl overflow-hidden animate-scaleIn origin-top">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {categories.map((cat) => (
                            <div
                              key={cat.kategori_id}
                              onClick={() => {
                                setFormData({ ...formData, kategori_id: cat.kategori_id });
                                setIsDropdownOpen(false);
                              }}
                              className={`px-6 py-4 text-sm font-bold cursor-pointer transition-all border-b border-gray-50 last:border-none ${
                                formData.kategori_id == cat.kategori_id ? 'bg-mu-green text-white' : 'text-gray-600 hover:bg-green-50'
                              }`}
                            >
                              {cat.nama_kategori}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><User size={14} /> Donatur / Penerima</label>
              <input type="text" value={formData.donatur} className="w-full px-6 py-5 bg-gray-50 rounded-3xl outline-none text-sm font-bold shadow-inner focus:bg-gray-100 transition-all" placeholder="Hamba Allah / Toko" onChange={(e) => setFormData({...formData, donatur: e.target.value})} />
            </div>

            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><Calendar size={14} /> Tanggal Transaksi</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={formData.tanggal} 
                  className="w-full px-6 py-5 bg-gray-50 rounded-3xl outline-none text-sm font-bold shadow-inner focus:bg-gray-100 transition-all cursor-pointer appearance-none" 
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                />
                <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><FileText size={14} /> Keterangan Tambahan</label>
              <textarea className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold text-gray-600 shadow-inner resize-none h-24 focus:bg-gray-100 transition-all" value={formData.deskripsi} placeholder="Detail transaksi..." onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}></textarea>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" className="w-full flex items-center justify-center gap-3 py-5 bg-mu-green text-white rounded-[2rem] font-black uppercase shadow-xl hover:translate-y-[-4px] active:scale-95 transition-all">
              <Save size={20} /> Simpan Transaksi Ke Database
            </button>
          </div>
        </form>
      </div>

      <ModalKeuangan 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={(newId) => {
          fetchCategories();
          setFormData(prev => ({ ...prev, kategori_id: newId }));
        }}
        jenis={formData.jenis_transaksi}
        editData={editMode ? categories.find(c => c.kategori_id == formData.kategori_id) : null}
      />
    </div>
  );
};

export default Keuangan;