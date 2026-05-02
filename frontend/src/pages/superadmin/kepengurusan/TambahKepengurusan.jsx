import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Upload, Save, User, Calendar, RefreshCcw, 
  X, AlertTriangle, CheckCircle2, XCircle, Info 
} from 'lucide-react';

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

const TambahKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: ''
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_lengkap || !formData.jabatan || !formData.periode_mulai || !formData.periode_selesai) {
      showPopup({ 
        type: "warning", 
        title: "Data Tidak Lengkap", 
        message: "Harap isi semua field yang diperlukan." 
      });
      return;
    }
    
    if (file && file.size > 3 * 1024 * 1024) {
      showPopup({ 
        type: "warning", 
        title: "File Terlalu Besar", 
        message: "Ukuran file foto maksimal adalah 3MB." 
      });
      return;
    }

    setLoading(true);
    setError(null);
    const data = new FormData();
    data.append('nama_lengkap', formData.nama_lengkap);
    data.append('jabatan', formData.jabatan);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);
    if (file) data.append('foto_pengurus', file);

    try {
      await axios.post('http://localhost:3000/superadmin/kepengurusan', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showPopup({
        type: "success",
        title: "Berhasil!",
        message: "Data pengurus telah berhasil ditambahkan ke sistem.",
        onConfirm: () => navigate('/superadmin/kepengurusan')
      });

      setFormData({
        nama_lengkap: '',
        jabatan: '',
        periode_mulai: '',
        periode_selesai: ''
      });
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error adding pengurus:', err);
      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menambahkan pengurus. Silakan coba lagi."
      });
      setError('Gagal menambahkan pengurus.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      showPopup({ 
        type: "warning", 
        title: "File Terlalu Besar", 
        message: "Ukuran file foto maksimal adalah 5MB." 
      });
      return;
    }
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="tambah-kepengurusan h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Tambah <span className="text-mu-green">Pengurus</span>
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
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg"
              >
                <RefreshCcw size={14} />
                Refresh Halaman
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Tambah Pengurus Baru</h2>
                <p className="text-gray-600 text-lg">Isi informasi pengurus dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Foto Pengurus</h3>
                      <div className="space-y-4">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="foto-upload" />
                        <label htmlFor="foto-upload" className="block">
                          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg hover:shadow-xl">
                            {previewUrl ? (
                              <div className="space-y-6">
                                <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <Upload size={64} className="text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-700">Klik untuk upload foto</p>
                                  <p className="text-sm text-gray-500">PNG, JPG hingga 3MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Pengurus</h3>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Lengkap</label>
                        <div className="relative">
                          <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.nama_lengkap}
                            onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Jabatan</label>
                        <input
                          type="text"
                          value={formData.jabatan}
                          onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan jabatan"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Periode Mulai</label>
                          <input
                            type="date"
                            value={formData.periode_mulai}
                            onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 shadow-sm"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Periode Selesai</label>
                          <input
                            type="date"
                            value={formData.periode_selesai}
                            onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })}
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/kepengurusan')}
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
                    {loading ? 'Menyimpan...' : 'Simpan Pengurus'}
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

export default TambahKepengurusan;