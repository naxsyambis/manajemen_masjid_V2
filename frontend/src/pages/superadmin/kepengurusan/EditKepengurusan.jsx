import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Wajib untuk Portal Alert[cite: 3, 7]
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Save, 
  User, 
  Calendar, 
  RefreshCcw, 
  AlertCircle, 
  Briefcase,
  Camera,
  Upload,
  // Icon tambahan untuk Alert[cite: 7, 9]
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

// --- Komponen AlertPopup (Sesuai source v3.0) ---[cite: 3, 7, 9]
const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';
  const isConfirm = alertData.type === 'confirm';

  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning || isConfirm ? AlertTriangle : Info;

  const iconClass = isSuccess ? 'bg-green-100 text-green-600' : 
                    isError ? 'bg-red-100 text-red-600' : 
                    isWarning || isConfirm ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600';

  const buttonClass = isConfirm ? 'bg-red-600 hover:bg-red-700 text-white' : 
                      isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 
                      isError ? 'bg-red-600 hover:bg-red-700 text-white' : 
                      isWarning ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green' : 'bg-mu-green hover:bg-green-700 text-white';

  const handleConfirm = () => {
    if (alertData.onConfirm) alertData.onConfirm();
    onClose();
  };

  return ReactDOM.createPortal(
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
          {isConfirm ? (
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button onClick={onClose} className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">Batal</button>
              <button onClick={handleConfirm} className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
                {alertData.confirmText || 'Hapus'}
              </button>
            </div>
          ) : (
            <button onClick={handleConfirm} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
              {alertData.confirmText || 'Mengerti'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // --- State Alert ---[cite: 3, 7, 9, 14]
  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: '',
    foto_pengurus: null
  });
  
  const [existingFoto, setExistingFoto] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // --- Helper Alert ---[cite: 3, 7, 9, 14]
  const showPopup = ({ type = 'info', title = 'Informasi', message = '', confirmText = '', onConfirm = null }) => {
    setAlertData({ show: true, type, title, message, confirmText, onConfirm });
  };

  const closePopup = () => {
    const callback = alertData.onConfirm;
    setAlertData({ ...alertData, show: false });
    if (callback && alertData.type !== 'confirm') setTimeout(callback, 100);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPengurus();
  }, [id, token]);

  const fetchPengurus = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${BASE_URL}/superadmin/kepengurusan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      setFormData({
        nama_lengkap: data.nama_lengkap ?? '',
        jabatan: data.jabatan ?? '',
        periode_mulai: data.periode_mulai ? data.periode_mulai.split('T')[0] : '',
        periode_selesai: data.periode_selesai ? data.periode_selesai.split('T')[0] : '',
        foto_pengurus: data.foto_pengurus ?? null
      });

      if (data.foto_pengurus) {
        setExistingFoto(data.foto_pengurus);
        setPreviewUrl(`${BASE_URL}${data.foto_pengurus}`);
      }
      setNewFile(null);
    } catch (err) {
      showPopup({
        type: 'error',
        title: 'Gagal Memuat',
        message: 'Data pengurus tidak ditemukan.',
        onConfirm: () => navigate('/superadmin/kepengurusan')
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        showPopup({ type: 'warning', title: 'File Terlalu Besar', message: 'Ukuran file maksimal 5MB.' });
        return;
      }
      if (newFile) URL.revokeObjectURL(previewUrl);
      setNewFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveImage = () => {
    if (newFile) URL.revokeObjectURL(previewUrl);
    setNewFile(null);
    if (existingFoto) {
      setPreviewUrl(`${BASE_URL}${existingFoto}`);
    } else {
      setPreviewUrl(null);
    }
    const fileInput = document.getElementById('foto-upload');
    if (fileInput) fileInput.value = '';
  };

  // --- Fungsi Validasi Form ---[cite: 3, 7, 14]
  const validateForm = () => {
    if (!formData.nama_lengkap.trim()) {
      showPopup({ type: 'warning', title: 'Nama Kosong', message: 'Nama lengkap pengurus wajib diisi.' });
      return false;
    }
    if (!formData.jabatan.trim()) {
      showPopup({ type: 'warning', title: 'Jabatan Kosong', message: 'Jabatan pengurus wajib diisi.' });
      return false;
    }
    if (!formData.periode_mulai || !formData.periode_selesai) {
      showPopup({ type: 'warning', title: 'Periode Kosong', message: 'Mohon lengkapi tanggal periode jabatan.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Jalankan validasi sebelum kirim[cite: 3, 7, 14]

    setLoading(true);
    const data = new FormData();
    data.append('nama_lengkap', formData.nama_lengkap);
    data.append('jabatan', formData.jabatan);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);
    if (newFile) data.append('foto_pengurus', newFile);

    try {
      await axios.put(`${BASE_URL}/superadmin/kepengurusan/${id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      showPopup({
        type: 'success',
        title: 'Berhasil!',
        message: 'Data pengurus telah diperbarui.',
        onConfirm: () => navigate('/superadmin/kepengurusan')
      });
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal Update', message: 'Terjadi kesalahan saat menyimpan data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex overflow-hidden animate-fadeIn">
      {/* Implementasi AlertPopup[cite: 3, 7, 9, 14] */}
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="p-8 overflow-y-auto space-y-8">
          {/* HEADER[cite: 13, 14] */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit <span className="text-mu-green">Pengurus</span></h1>
              <div className="text-sm text-gray-500 mt-1">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>
            </div>
            <button type="button" onClick={fetchPengurus} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-xl text-gray-600 hover:text-mu-green transition-all shadow-sm active:scale-95">
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          {/* CARD FORM[cite: 13, 14] */}
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-10">
            
            {/* FOTO SECTION DENGAN INTERACTIVE OVERLAY[cite: 13, 14] */}
            <div className="flex flex-col items-center lg:items-start gap-6">
              <h3 className="text-xl font-bold border-b-2 border-mu-green pb-2 text-gray-800">Foto Profil Pengurus</h3>
              
              <div className="relative group w-48 h-48">
                <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 relative">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt="Preview" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User size={64} />
                    </div>
                  )}

                  {/* OVERLAY INTERAKTIF SAAT HOVER[cite: 13] */}
                  <label 
                    htmlFor="foto-upload" 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2 backdrop-blur-sm"
                  >
                    <Camera size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Ganti Foto</span>
                  </label>
                </div>

                {/* TOMBOL BATAL PILIH FILE (X)[cite: 13, 14] */}
                {newFile && (
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all scale-0 group-hover:scale-100 z-10"
                  >
                    <X size={16} />
                  </button>
                )}
                
                {/* INDIKATOR VISUAL UPLOAD[cite: 13] */}
                <div className="absolute -bottom-2 -right-2 bg-mu-green text-white p-2 rounded-lg shadow-lg pointer-events-none border-2 border-white">
                  <Upload size={14} />
                </div>
              </div>

              <input 
                type="file" 
                id="foto-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <p className="text-xs text-gray-400 font-medium italic">Klik gambar untuk mengunggah foto baru (Maks. 5MB)</p>
            </div>

            {/* FORM DATA[cite: 13, 14] */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-mu-green" /> Nama Lengkap
                </label>
                <input 
                  type="text" 
                  value={formData.nama_lengkap} 
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })} 
                  className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase size={16} className="text-mu-green" /> Jabatan
                </label>
                <input 
                  type="text" 
                  value={formData.jabatan} 
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} 
                  className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-mu-green" /> Periode Mulai
                </label>
                <input 
                  type="date" 
                  value={formData.periode_mulai} 
                  onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })} 
                  className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green bg-gray-50 focus:bg-white transition-all" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-mu-green" /> Periode Selesai
                </label>
                <input 
                  type="date" 
                  value={formData.periode_selesai} 
                  onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })} 
                  className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green bg-gray-50 focus:bg-white transition-all" 
                />
              </div>
            </div>

            {/* ACTION BUTTONS[cite: 13, 14] */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => navigate('/superadmin/kepengurusan')} 
                className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-sm"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-10 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all disabled:opacity-50 active:scale-95"
              >
                <Save size={20} />
                {loading ? 'Menyimpan...' : 'Update Pengurus'}
              </button>
            </div>
          </form>

          {/* SYSTEM FOOTER BRANDING[cite: 13, 14] */}
          <div className="flex justify-center items-center gap-4 text-gray-300 py-4 opacity-50">
            <div className="h-[1px] w-12 bg-gray-200"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditKepengurusan;