import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, Calendar, Upload, Type, Clock, FileText, Tag, CheckCircle2, XCircle, AlertTriangle, Info, X, Pencil, Plus, ChevronDown } from 'lucide-react';
import ModalKategoriProgram from './ModalKategoriProgram'; // IMPORT MODAL

const BASE_URL = "http://localhost:3000";

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;
  const iconClass = isSuccess ? "bg-green-100 text-green-600" : isError ? "bg-red-100 text-red-600" : isWarning ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600";
  const buttonClass = isSuccess ? "bg-green-600 hover:bg-green-700 text-white" : isError ? "bg-red-600 hover:bg-red-700 text-white" : isWarning ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green" : "bg-mu-green hover:bg-green-700 text-white";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}><Icon size={42} strokeWidth={2.5} /></div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || "Mengerti"}</button>
        </div>
      </div>
    </div>, document.body
  );
};

const TambahProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({ nama_program: '', jadwal_rutin: '', deskripsi: '', kategori_id: '' });
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alertData, setAlertData] = useState({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null });

  // STATE UNTUK MODAL KATEGORI & DROPDOWN
  const [showModalKategori, setShowModalKategori] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => { const callback = alertData.onConfirm; setAlertData({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null }); if (callback) setTimeout(callback, 100); };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/kategori-program`, { headers: { Authorization: `Bearer ${token}` } });
      const dataCat = res.data?.data || [];
      setKategoriList(dataCat);
      
      // Auto select jika kategori tersedia tapi belum terpilih
      if (dataCat.length > 0 && !formData.kategori_id) {
        setFormData(prev => ({ ...prev, kategori_id: dataCat[0].kategori_id }));
      }
    } catch (err) {
      setKategoriList([]);
    }
  };

  useEffect(() => {
    fetchKategori();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showPopup({ type: "warning", title: "Ukuran Terlalu Besar", message: "Ukuran gambar maksimal 3MB." });
      return;
    }
    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const selectedCategoryName = kategoriList.find(c => c.kategori_id == formData.kategori_id)?.nama_kategori || "Pilih Kategori";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_program || !formData.jadwal_rutin) {
      return showPopup({ type: "warning", title: "Data Tidak Lengkap", message: "Nama dan Jadwal wajib diisi." });
    }
    if (!formData.kategori_id) {
        return showPopup({ type: "warning", title: "Kategori Kosong", message: "Pilih kategori program terlebih dahulu." });
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("nama_program", formData.nama_program);
      form.append("jadwal_rutin", formData.jadwal_rutin);
      form.append("deskripsi", formData.deskripsi);
      form.append("kategori_id", formData.kategori_id);
      if (gambar) form.append("gambar", gambar);

      await axios.post(`${BASE_URL}/superadmin/program`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      
      showPopup({ type: "success", title: "Program Tersimpan", message: "Data program berhasil ditambahkan.", onConfirm: () => navigate('/superadmin/program') });
    } catch (err) {
      showPopup({ type: "error", title: "Gagal Menyimpan", message: err.response?.data?.message || "Gagal menambah program." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#fdfdfd] flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-4 md:p-8 space-y-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-gray-800">
                Tambah <span className="text-mu-green">Program</span>
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar size={12}/> {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-white px-5 py-3 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all flex gap-2 active:scale-95">
              <RefreshCcw size={14}/> Refresh
            </button>
          </div>

          {/* FORM */}
          <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                
                <div className="space-y-3 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><Type size={14} /> Nama Program</label>
                  <input value={formData.nama_program} onChange={(e)=>setFormData({...formData,nama_program:e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold shadow-inner focus:bg-gray-100 transition-all" placeholder="Misal: Kajian Subuh" />
                </div>

                <div className="space-y-3 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><Clock size={14} /> Jadwal Rutin</label>
                  <input value={formData.jadwal_rutin} onChange={(e)=>setFormData({...formData,jadwal_rutin:e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold shadow-inner focus:bg-gray-100 transition-all" placeholder="Misal: Setiap Ahad Ba'da Subuh" />
                </div>

                {/* KATEGORI DROPDOWN (SAMA SEPERTI KEUANGAN) */}
                <div className="space-y-3 group relative" ref={dropdownRef}>
                  <div className="flex justify-between items-center pr-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors">
                      <Tag size={14} /> Kategori Program
                    </label>

                    <div className="flex items-center gap-3">
                      {kategoriList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!formData.kategori_id) {
                              showPopup({ type: "warning", title: "Pilih Kategori", message: "Pilih kategori yang ingin diedit." });
                              return;
                            }
                            setEditMode(true);
                            setShowModalKategori(true);
                          }}
                          className="text-gray-400 hover:text-mu-green transition-colors flex items-center gap-1 text-[9px] font-black uppercase"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setShowModalKategori(true);
                        }}
                        className="text-mu-green hover:underline text-[9px] font-black uppercase tracking-widest"
                      >
                        + Tambah Baru
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    {kategoriList.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setShowModalKategori(true);
                        }}
                        className="w-full px-6 py-5 bg-green-50 text-mu-green border-2 border-dashed border-mu-green/30 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-xs hover:bg-green-100 transition-all"
                      >
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
                              {kategoriList.map((cat) => (
                                <div
                                  key={cat.kategori_id}
                                  onClick={() => {
                                    setFormData({ ...formData, kategori_id: cat.kategori_id });
                                    setIsDropdownOpen(false);
                                  }}
                                  className={`px-6 py-4 text-sm font-bold cursor-pointer transition-all border-b border-gray-50 last:border-none ${
                                    formData.kategori_id == cat.kategori_id
                                      ? 'bg-mu-green text-white'
                                      : 'text-gray-600 hover:bg-green-50'
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
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><Upload size={14} /> Upload Gambar</label>
                  <label className="w-full border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer p-6 bg-gray-50 hover:bg-green-50 hover:border-mu-green transition-all overflow-hidden h-full min-h-[120px]">
                    {preview ? <img src={preview} className="max-h-32 w-auto object-contain rounded-xl shadow-sm"/> : <div className="flex flex-col items-center text-gray-400"><Upload className="mb-2" size={24}/><p className="font-bold text-xs uppercase tracking-widest">Klik Upload Gambar</p><p className="text-[9px] mt-1">PNG / JPG (max 3MB)</p></div>}
                    <input type="file" hidden accept="image/*" onChange={(e)=>handleImage(e.target.files[0])}/>
                  </label>
                </div>

                <div className="md:col-span-2 space-y-3 group">
                  <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors"><FileText size={14} /> Deskripsi Program</label>
                  <textarea rows={5} value={formData.deskripsi} onChange={(e)=>setFormData({...formData,deskripsi:e.target.value})} className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold text-gray-600 shadow-inner resize-none focus:bg-gray-100 transition-all" placeholder="Tuliskan detail program..."/>
                </div>

              </div>

              <div className="pt-6">
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 py-5 bg-mu-green text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:translate-y-[-4px] active:scale-95 transition-all">
                  <Save size={18}/> {loading ? "Menyimpan..." : "Simpan Program Ke Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ModalKategoriProgram 
        show={showModalKategori} 
        onClose={() => setShowModalKategori(false)} 
        onSuccess={(newId) => {
          fetchKategori();
          if (newId) {
            setFormData(prev => ({ ...prev, kategori_id: newId }));
          }
        }}
        editData={editMode ? kategoriList.find(c => c.kategori_id == formData.kategori_id) : null}
      />
    </div>
  );
};

export default TambahProgram;