import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, Calendar, Upload, Type, Clock, FileText, Tag, CheckCircle2, XCircle, AlertTriangle, Info, X, Pencil, Plus, ChevronDown, ArrowLeft } from 'lucide-react';
import ModalKategoriProgram from './ModalKategoriProgram';

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

const EditProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({ nama_program: '', jadwal_rutin: '', deskripsi: '', kategori_id: '' });
  const [kategoriList, setKategoriList] = useState([]);
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [gambarLama, setGambarLama] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const closePopup = () => { const callback = alertData.onConfirm; setAlertData({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null }); if (callback) setTimeout(callback, 100); };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchKategori = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/kategori-program`, { headers: { Authorization: `Bearer ${token}` } });
      setKategoriList(res.data?.data || []);
    } catch (err) {
      setKategoriList([]);
    }
  };

  const fetchProgram = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      setFormData({ nama_program: data?.nama_program || '', jadwal_rutin: data?.jadwal_rutin || '', deskripsi: data?.deskripsi || '', kategori_id: data?.kategori_id || '' });
      setGambarLama(data?.gambar || null);
    } catch (err) {
      showPopup({ type: "error", title: "Gagal Memuat", message: "Data program tidak ditemukan." });
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
    if (file.size > 3 * 1024 * 1024) { showPopup({ type: "warning", title: "Terlalu Besar", message: "Maksimal 3MB" }); return; }
    
    if (gambar) URL.revokeObjectURL(preview); 

    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (gambar) URL.revokeObjectURL(preview);
    
    setGambar(null);
    setPreview(null);

    const fileInput = document.getElementById('gambar-upload');
    if (fileInput) fileInput.value = '';
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

      await axios.put(`${BASE_URL}/superadmin/program/${id}`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      showPopup({ type: "success", title: "Berhasil", message: "Program berhasil diupdate! ✅", onConfirm: () => navigate('/superadmin/program') });
    } catch (err) {
      showPopup({ type: "error", title: "Gagal Update", message: err.response?.data?.message || "Gagal update program" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex overflow-hidden">
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
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Calendar size={14}/> {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </p>
            </div>
            <button 
              type="button"
              onClick={fetchProgram} 
              className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white shadow-sm hover:bg-gray-50 transition active:scale-95"
            >
              <RefreshCcw size={14}/> Refresh
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Gambar Program</h3>
              <input 
                type="file" 
                id="gambar-upload"
                hidden 
                accept="image/*" 
                onChange={(e)=>handleImage(e.target.files[0])}
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(preview || gambarLama) && (
                  <div className="relative group">
                    <img 
                      src={preview || `${BASE_URL}/uploads/program/${gambarLama}`} 
                      className="w-full h-40 object-cover rounded-xl border shadow-sm"
                      alt="Preview"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                    />
                    {preview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {!gambar && (
                  <label
                    htmlFor="gambar-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-40 cursor-pointer hover:bg-green-50 hover:border-mu-green transition-all group"
                  >
                    <Plus size={24} className="text-gray-400 group-hover:text-mu-green transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-gray-400 group-hover:text-mu-green">Ganti Foto</span>
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="font-semibold flex items-center gap-2 text-gray-700">
                    <Type size={16} /> Nama Program
                  </label>
                  <input 
                    value={formData.nama_program} 
                    onChange={(e)=>setFormData({...formData,nama_program:e.target.value})} 
                    className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="font-semibold flex items-center gap-2 text-gray-700">
                    <Clock size={16} /> Jadwal Rutin
                  </label>
                  <input 
                    value={formData.jadwal_rutin} 
                    onChange={(e)=>setFormData({...formData,jadwal_rutin:e.target.value})} 
                    className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-6" ref={dropdownRef}>
                <div className="flex justify-between items-end">
                  <label className="font-semibold flex items-center gap-2 text-gray-700">
                    <Tag size={16} /> Kategori Program
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
                    className="w-full border p-3 rounded-xl mt-2 flex justify-between items-center bg-white shadow-sm hover:bg-gray-50 transition-all outline-none"
                  >
                    <span className={formData.kategori_id ? "text-gray-800" : "text-gray-400"}>{selectedCategoryName}</span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fadeIn">
                      {kategoriList.map((cat) => (
                        <div
                          key={cat.kategori_id}
                          onClick={() => { setFormData({ ...formData, kategori_id: cat.kategori_id }); setIsDropdownOpen(false); }}
                          className={`px-6 py-3 text-sm font-bold cursor-pointer transition-colors border-b border-gray-50 last:border-none ${
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

            <div>
              <label className="font-semibold flex items-center gap-2 text-gray-700">
                <FileText size={16} /> Deskripsi Program
              </label>
              <textarea 
                rows={5} 
                value={formData.deskripsi} 
                onChange={(e)=>setFormData({...formData,deskripsi:e.target.value})} 
                className="w-full border p-4 rounded-xl mt-2 outline-none focus:border-mu-green transition-all shadow-sm resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/superadmin/program')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold transition hover:bg-gray-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Batal
              </button>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-3 bg-mu-green text-white rounded-xl flex items-center gap-3 font-bold shadow-lg hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={18}/> {loading ? "Menyimpan..." : "Update Program"}
              </button>
            </div>
          </form>
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