// frontend/src/pages/superadmin/masjid/TambahMasjid.jsx

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Upload, 
  Save, 
  Phone, 
  Calendar, 
  RefreshCcw, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info 
} from 'lucide-react';

// --- Komponen AlertPopup (Standar Integrated Database System v3.0) ---[cite: 3]
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

const TambahMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    nama_masjid: '',
    alamat: '',
    no_hp: '',
    deskripsi: '',
    latitude: '',
    longitude: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // State untuk Alert[cite: 3]
  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showPopup = (data) => {
    setAlertData({ ...data, show: true });
  };

  const closePopup = () => {
    setAlertData({ ...alertData, show: false });
  };

  // Fungsi Validasi Kustom[cite: 1]
  const validateForm = () => {
    const { nama_masjid, alamat, no_hp } = formData;

    if (!nama_masjid.trim() || !alamat.trim() || !no_hp.trim()) {
      showPopup({
        type: "warning",
        title: "Data Tidak Lengkap",
        message: "Mohon isi Nama Masjid, Alamat, dan Nomor HP."
      });
      return false;
    }

    // Validasi Logika No HP: Harus mulai 08 dan panjang minimal 10[cite: 1]
    if (!no_hp.startsWith('08')) {
      showPopup({
        type: "warning",
        title: "Format Tidak Valid",
        message: "Nomor HP harus dimulai dengan angka '08'."
      });
      return false;
    }

    if (no_hp.length < 10) {
      showPopup({
        type: "warning",
        title: "Nomor Terlalu Pendek",
        message: "Nomor HP minimal terdiri dari 10 digit."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('logo_foto', file);

    try {
      await axios.post('http://localhost:3000/superadmin/masjid', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showPopup({
        type: "success",
        title: "Berhasil!",
        message: "Data masjid baru telah berhasil ditambahkan.",
        onConfirm: () => navigate('/superadmin/masjid')
      });
    } catch (err) {
      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: err.response?.data?.message || "Terjadi kesalahan saat menghubungkan ke server."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-masjid h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Tambah <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg"
            >
              <RefreshCcw size={14} />
              Refresh Halaman
            </button>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Tambah Masjid Baru</h2>
                <p className="text-gray-600 text-lg">Isi informasi masjid dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    {/* Upload Logo */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Logo Masjid</h3>
                      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="logo-upload" />
                      <label htmlFor="logo-upload" className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg">
                          {file ? (
                            <div className="space-y-4">
                              <img src={URL.createObjectURL(file)} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg" />
                              <p className="text-sm font-semibold">{file.name}</p>
                            </div>
                          ) : (
                            <div className="space-y-4 text-gray-400">
                              <Upload size={48} className="mx-auto" />
                              <p>Klik untuk upload logo (PNG/JPG max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                    
                    {/* Kontak */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Kontak</h3>
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">No HP (Wajib)</label>
                        <div className="relative">
                          <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            inputMode="numeric" // Membantu memunculkan numpad di mobile
                            value={formData.no_hp}
                            onChange={(e) => {
                              // Filter Otomatis: Hanya angka yang diperbolehkan[cite: 1]
                              const val = e.target.value.replace(/\D/g, ''); 
                              // Batasan otomatis maksimal 13 karakter[cite: 1]
                              if (val.length <= 13) {
                                setFormData({ ...formData, no_hp: val });
                              }
                            }}
                            className="w-full pl-12 pr-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50"
                            placeholder="Contoh: 081234567890"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase italic mt-1">
                          * Maksimal 13 angka, dimulai dengan 08 
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Utama</h3>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Masjid</label>
                        <input
                          type="text"
                          value={formData.nama_masjid}
                          onChange={(e) => setFormData({ ...formData, nama_masjid: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50"
                          placeholder="Masukkan nama resmi masjid"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Alamat Lengkap</label>
                        <textarea
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 resize-none"
                          placeholder="Sertakan nama jalan, RT/RW, dan kelurahan"
                          rows="3"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Latitude</label>
                          <input
                            type="number" step="any"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                            placeholder="-7.1234"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Longitude</label>
                          <input
                            type="number" step="any"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                            placeholder="110.1234"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Deskripsi (Opsional)</label>
                        <textarea
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 resize-none"
                          placeholder="Penjelasan singkat mengenai masjid"
                          rows="4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/masjid')}
                    className="px-10 py-4 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all font-bold shadow-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-10 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all font-bold shadow-lg disabled:opacity-50 active:scale-95"
                  >
                    <Save size={22} className="mr-3" />
                    {loading ? 'Menyimpan...' : 'Simpan Masjid'}
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

export default TambahMasjid;