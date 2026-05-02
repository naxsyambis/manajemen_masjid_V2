import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Save, 
  RefreshCcw, 
  Calendar, 
  Upload, 
  Type, 
  Clock, 
  FileText, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Pencil, 
  Plus, 
  ChevronDown, 
  ArrowLeft,
  Camera
} from 'lucide-react';
import ModalKategoriProgram from './ModalKategoriProgram';

const BASE_URL = "http://localhost:3000";

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;
  
  const iconClass = isSuccess ? "bg-green-100 text-green-600" : 
                    isError ? "bg-red-100 text-red-600" : 
                    isWarning ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600";
                    
  const buttonClass = isSuccess ? "bg-green-600 hover:bg-green-700 text-white" : 
                      isError ? "bg-red-600 hover:bg-red-700 text-white" : 
                      isWarning ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green" : "bg-mu-green hover:bg-green-700 text-white";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
          <X size={20} />
        </button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}>
            <Icon size={42} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
            {alertData.confirmText || "Mengerti"}
          </button>
        </div>
      </div>
    </div>, document.body
  );
};

const EditProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({ nama_program: '', jadwal_rutin: '', deskripsi: '', kategori_id: '' });
  const [kategoriList, setKategoriList] = useState([]);
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [gambarLama, setGambarLama] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alertData, setAlertData] = useState({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null });

  const [showModalKategori, setShowModalKategori] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => { 
    const callback = alertData.onConfirm; 
    setAlertData({ ...alertData, show: false }); 
    if (callback) setTimeout(callback, 100); 
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/kategori-program`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setKategoriList(res.data?.data || []);
    } catch (err) {
      setKategoriList([]);
    }
  };

  const fetchProgram = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = res.data;
      setFormData({ 
        nama_program: data?.nama_program || '', 
        jadwal_rutin: data?.jadwal_rutin || '', 
        deskripsi: data?.deskripsi || '', 
        kategori_id: data?.kategori_id || '' 
      });
      setGambarLama(data?.gambar || null);
    } catch (err) {
      showPopup({ 
        type: "error", 
        title: "Gagal Memuat", 
        message: "Data program tidak ditemukan.",
        onConfirm: () => navigate('/superadmin/program')
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgram();
    fetchKategori();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id, token]);

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { 
      showPopup({ type: "warning", title: "File Terlalu Besar", message: "Ukuran file maksimal 3MB." }); 
      return; 
    }
    
    if (preview) URL.revokeObjectURL(preview); 
    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setGambar(null);
    setPreview(null);
    const fileInput = document.getElementById('gambar-upload');
    if (fileInput) fileInput.value = '';
  };

  const selectedCategoryName = kategoriList.find(c => c.kategori_id == formData.kategori_id)?.nama_kategori || "Pilih Kategori";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_program.trim() || !formData.jadwal_rutin.trim()) {
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

      await axios.put(`${BASE_URL}/superadmin/program/${id}`, form, { 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
      });
      showPopup({ 
        type: "success", 
        title: "Berhasil!", 
        message: "Data program telah diperbarui.", 
        onConfirm: () => navigate('/superadmin/program') 
      });
    } catch (err) {
      showPopup({ type: "error", title: "Gagal Update", message: err.response?.data?.message || "Terjadi kesalahan saat menyimpan data." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex overflow-hidden animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Edit <span className="text-mu-green">Program</span>
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>
            </div>
            <button 
              type="button"
              onClick={fetchProgram} 
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-600 hover:text-mu-green transition-all shadow-sm active:scale-95"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''}/> 
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-10">
            
            {/* SEKSI INPUT GAMBAR - STYLE EDITKEPENGURUSAN */}
            <div className="flex flex-col items-center lg:items-start gap-6">
              <h3 className="text-xl font-bold border-b-2 border-mu-green pb-2 text-gray-800">Gambar Program</h3>
              
              <div className="relative group w-48 h-48">
                <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 relative">
                  {preview || gambarLama ? (
                    <img 
                      src={preview || `${BASE_URL}/uploads/program/${gambarLama}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="Preview" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Plus size={64} />
                    </div>
                  )}

                  <label 
                    htmlFor="gambar-upload" 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2 backdrop-blur-sm"
                  >
                    <Camera size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto</span>
                  </label>
                </div>

                {gambar && (
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all scale-0 group-hover:scale-100 z-10"
                  >
                    <X size={16} />
                  </button>
                )}
                
                <div className="absolute -bottom-2 -right-2 bg-mu-green text-white p-2 rounded-lg shadow-lg pointer-events-none border-2 border-white">
                  <Upload size={14} />
                </div>
              </div>

              <input 
                type="file" 
                id="gambar-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImage(e.target.files[0])} 
              />
              <p className="text-xs text-gray-400 font-medium italic">Klik gambar untuk mengunggah foto baru (Maks. 3MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Type size={16} className="text-mu-green" /> Nama Program
                  </label>
                  <input 
                    value={formData.nama_program} 
                    onChange={(e)=>setFormData({...formData,nama_program:e.target.value})} 
                    className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white" 
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-mu-green" /> Jadwal Rutin
                  </label>
                  <input 
                    value={formData.jadwal_rutin} 
                    onChange={(e)=>setFormData({...formData,jadwal_rutin:e.target.value})} 
                    className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white" 
                  />
                </div>
              </div>

              <div className="space-y-6" ref={dropdownRef}>
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={16} className="text-mu-green" /> Kategori Program
                  </label>
                  <div className="flex gap-3">
                    {kategoriList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!formData.kategori_id) return showPopup({ type: "warning", title: "Pilih Kategori", message: "Pilih kategori yang ingin diedit." });
                          setEditMode(true);
                          setShowModalKategori(true);
                        }}
                        className="text-gray-400 hover:text-mu-green transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setEditMode(false); setShowModalKategori(true); }}
                      className="text-mu-green hover:underline text-[10px] font-bold uppercase tracking-widest"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full border border-gray-200 p-4 rounded-xl mt-2 flex justify-between items-center bg-gray-50 hover:bg-white transition-all outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green"
                  >
                    <span className={formData.kategori_id ? "text-gray-800 font-bold" : "text-gray-400 font-medium"}>{selectedCategoryName}</span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-scaleIn">
                      {kategoriList.map((cat) => (
                        <div
                          key={cat.kategori_id}
                          onClick={() => { setFormData({ ...formData, kategori_id: cat.kategori_id }); setIsDropdownOpen(false); }}
                          className={`px-6 py-4 text-sm font-bold cursor-pointer transition-colors border-b border-gray-50 last:border-none ${
                            formData.kategori_id == cat.kategori_id ? 'bg-mu-green text-white' : 'hover:bg-green-50 text-gray-600'
                          }`}
                        >
                          {cat.nama_kategori}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-mu-green" /> Deskripsi Program
              </label>
              <textarea 
                rows={5} 
                value={formData.deskripsi} 
                onChange={(e)=>setFormData({...formData,deskripsi:e.target.value})} 
                className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/superadmin/program')}
                className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-sm flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Batal
              </button>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="px-10 py-3 bg-mu-green text-white rounded-xl flex items-center gap-3 font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={20}/> {loading ? "Menyimpan..." : "Update Program"}
              </button>
            </div>
          </form>

          <div className="flex justify-center items-center gap-4 text-gray-300 py-4 opacity-50">
            <div className="h-[1px] w-12 bg-gray-200"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-200"></div>
          </div>
        </div>
      </div>

      <ModalKategoriProgram 
        show={showModalKategori} 
        onClose={() => setShowModalKategori(false)} 
        onSuccess={(newId) => {
          fetchKategori();
          if (newId) setFormData(prev => ({ ...prev, kategori_id: newId }));
        }}
        editData={editMode ? kategoriList.find(c => c.kategori_id == formData.kategori_id) : null}
      />
    </div>
  );
};

export default EditProgram;