import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import {
  Save,
  Image as ImageIcon,
  Calendar,
  RefreshCcw,
  Youtube,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

// --- Komponen AlertPopup (Sesuai source v3.0) ---[cite: 3, 7, 9]
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
          <button type="button" onClick={handleConfirm} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
            {alertData.confirmText || "Mengerti"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TambahBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // --- State Alert ---[cite: 3, 7]
  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    youtube_url: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  // --- Fungsi Helper Alert ---[cite: 3, 7]
  const showPopup = ({ type = "info", title = "Informasi", message = "", confirmText = "", onConfirm = null }) => {
    setAlertData({ show: true, type, title, message, confirmText, onConfirm });
  };

  const closePopup = () => {
    setAlertData({ ...alertData, show: false });
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isValidYoutubeUrl = (url) => {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be");
    } catch {
      return false;
    }
  };

  // --- Fungsi Validasi Form (DIKEMBALIKAN) ---[cite: 3, 7]
  const validateForm = () => {
    if (!formData.judul.trim()) {
      showPopup({ type: "warning", title: "Judul Kosong", message: "Judul berita wajib diisi." });
      return false;
    }
    if (!formData.isi.trim()) {
      showPopup({ type: "warning", title: "Isi Kosong", message: "Isi berita wajib diisi." });
      return false;
    }
    if (!isValidYoutubeUrl(formData.youtube_url)) {
      showPopup({ type: "warning", title: "Link Tidak Valid", message: "Gunakan link YouTube yang valid (youtube.com/youtu.be)." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Jalankan validasi sebelum kirim data[cite: 3, 7]
    if (!validateForm()) return;

    setLoading(true);

    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('isi', formData.isi);
    data.append('youtube_url', formData.youtube_url.trim());
    files.forEach((file) => { data.append('gambar', file); });

    try {
      await axios.post('http://localhost:3000/superadmin/berita', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showPopup({
        type: "success",
        title: "Berhasil!",
        message: "Berita berhasil ditambahkan ke sistem.",
        onConfirm: () => navigate('/superadmin/berita')
      });
    } catch (err) {
      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan. Pastikan file gambar di bawah 5MB."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    // Validasi ukuran file[cite: 3, 7]
    if (selected.some(file => file.size > 5 * 1024 * 1024)) {
      showPopup({ type: "warning", title: "File Terlalu Besar", message: "Maksimal ukuran gambar adalah 5MB." });
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="tambah-berita h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Tambah <span className="text-mu-green">Berita</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95"
              >
                <RefreshCcw size={14} />
                Refresh Halaman
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Tambah Berita Baru</h2>
                <p className="text-gray-600 text-lg">Lengkapi informasi berita berikut</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Gambar Berita</h3>
                      <div className="space-y-4">
                        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" id="gambar-upload" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {files.map((file, index) => (
                            <div key={index} className="relative group">
                              <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-32 object-cover rounded-xl shadow-md" />
                              <button type="button" onClick={() => handleRemoveFile(index)} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">✕</button>
                            </div>
                          ))}
                          <label htmlFor="gambar-upload" className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl h-32 cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition">+</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Berita</h3>
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Judul Berita</label>
                        <input
                          type="text"
                          value={formData.judul}
                          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50"
                          placeholder="Masukkan judul berita"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Isi Berita</label>
                        <textarea
                          value={formData.isi}
                          onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 resize-none"
                          placeholder="Masukkan isi berita"
                          rows="8"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><Youtube size={18} className="text-red-600" /> Link YouTube (Opsional)</label>
                        <input
                          type="url"
                          value={formData.youtube_url}
                          onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50"
                          placeholder="https://www.youtube.com/watch?v=xxxx"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/berita')}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl font-semibold shadow-xl hover:scale-105 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-8 py-4 bg-mu-green text-white rounded-2xl font-semibold shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                  >
                    <Save size={22} className="mr-3" />
                    {loading ? 'Menyimpan...' : 'Simpan Berita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
            <div className="h-[1px] w-12 bg-gray-100"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahBerita;