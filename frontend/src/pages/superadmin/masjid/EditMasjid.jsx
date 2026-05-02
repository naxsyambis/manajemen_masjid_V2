// frontend/src/pages/superadmin/masjid/EditMasjid.jsx

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
  Info,
  Camera
} from 'lucide-react';

// --- Komponen AlertPopup (Sesuai Standar v3.0) ---[cite: 3, 5]
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

  const buttonClass = isConfirm ? 'bg-mu-green hover:bg-green-700 text-white' : 
                      isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : 
                      isError ? 'bg-red-600 hover:bg-red-700 text-white' : 
                      'bg-mu-yellow hover:bg-yellow-400 text-mu-green';

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
              <button onClick={onClose} className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Batal</button>
              <button onClick={handleConfirm} className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${buttonClass}`}>
                {alertData.confirmText || 'Ya, Update'}
              </button>
            </div>
          ) : (
            <button onClick={handleConfirm} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${buttonClass}`}>
              {alertData.confirmText || 'Mengerti'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });

  const [formData, setFormData] = useState({
    nama_masjid: '', alamat: '', no_hp: '', deskripsi: '', latitude: '', longitude: ''
  });

  const [existingLogo, setExistingLogo] = useState(null); 
  const [newFile, setNewFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 

  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = (data) => setAlertData({ ...data, show: true });
  const closePopup = () => setAlertData({ ...alertData, show: false });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMasjid();
  }, [id, token]);

  const fetchMasjid = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({
        nama_masjid: res.data.nama_masjid || '',
        alamat: res.data.alamat || '',
        no_hp: res.data.no_hp || '',
        deskripsi: res.data.deskripsi || '',
        latitude: res.data.latitude || '',
        longitude: res.data.longitude || ''
      });

      if (res.data.logo_foto) {
        setExistingLogo(res.data.logo_foto);
        setPreviewUrl(`http://localhost:3000${res.data.logo_foto}`);
      }
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal Memuat', message: 'Data masjid tidak ditemukan.', onConfirm: () => navigate('/superadmin/masjid') });
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showPopup({ type: 'warning', title: 'File Terlalu Besar', message: 'Maksimal ukuran file adalah 5MB.' });
        return;
      }
      if (newFile) URL.revokeObjectURL(previewUrl);
      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (newFile) URL.revokeObjectURL(previewUrl);
    setNewFile(null);
    setPreviewUrl(existingLogo ? `http://localhost:3000${existingLogo}` : null);
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const { nama_masjid, alamat, no_hp } = formData;
    if (!nama_masjid.trim()) {
      showPopup({ type: "warning", title: "Nama Masjid Kosong", message: "Nama masjid wajib diisi." });
      return false;
    }
    if (!alamat.trim()) {
      showPopup({ type: "warning", title: "Alamat Kosong", message: "Alamat lengkap masjid wajib diisi." });
      return false;
    }
    if (!no_hp.trim()) {
      showPopup({ type: "warning", title: "Nomor HP Kosong", message: "Nomor HP wajib diisi." });
      return false;
    }
    if (!no_hp.startsWith('08')) {
      showPopup({ type: "warning", title: "Format Tidak Valid", message: "Nomor HP harus dimulai dengan angka '08'." });
      return false;
    }
    if (no_hp.length < 10) {
      showPopup({ type: "warning", title: "Nomor Terlalu Pendek", message: "Nomor HP minimal terdiri dari 10 digit." });
      return false;
    }
    return true;
  };

  const handleConfirmUpdate = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    showPopup({
      type: 'confirm',
      title: 'Simpan Perubahan?',
      message: 'Apakah Anda yakin ingin memperbarui data masjid ini?',
      confirmText: 'Ya, Update',
      onConfirm: updateMasjid
    });
  };

  const updateMasjid = async () => {
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (newFile) data.append('logo_foto', newFile);

    try {
      await axios.put(`http://localhost:3000/superadmin/masjid/${id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      showPopup({ type: 'success', title: 'Berhasil', message: 'Data masjid berhasil diperbarui.', onConfirm: () => navigate('/superadmin/masjid') });
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal Update', message: 'Terjadi kesalahan saat menyimpan data.' });
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
          {/* Header identik dengan Tambah Masjid[cite: 1] */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Edit <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <button 
              onClick={fetchMasjid}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
          
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Edit Informasi Masjid</h2>
                <p className="text-gray-600 text-lg">Perbarui informasi masjid dengan akurat</p>
              </div>
              
              <form onSubmit={handleConfirmUpdate}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    {/* Style Input Foto identik dengan Tambah Masjid[cite: 1] */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Logo Masjid</h3>
                      <div className="space-y-4">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="logo-upload" />
                        <label htmlFor="logo-upload" className="block">
                          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg relative group">
                            {previewUrl ? (
                              <div className="space-y-6">
                                <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-800">{newFile ? newFile.name : "Logo Saat Ini"}</p>
                                  <p className="text-sm text-gray-500">Klik untuk mengganti gambar</p>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={(e) => { e.preventDefault(); handleRemoveImage(); }} 
                                  className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition z-10"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <Upload size={64} className="text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-700">Klik untuk upload logo</p>
                                  <p className="text-sm text-gray-500">PNG, JPG hingga 5MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {/* Kontak - Layout Field Identik[cite: 1] */}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Kontak</h3>
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">No HP (Wajib)</label>
                        <div className="relative">
                          <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formData.no_hp}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, ''); 
                              if (val.length <= 13) setFormData({ ...formData, no_hp: val });
                            }}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm font-medium"
                            placeholder="Contoh: 081234567890"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase italic mt-1">* Maksimal 13 angka, di awali dengan 08.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informasi Utama - Layout Kolom Kanan Identik[cite: 1] */}
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Utama</h3>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Masjid</label>
                        <input
                          type="text"
                          value={formData.nama_masjid}
                          onChange={(e) => setFormData({ ...formData, nama_masjid: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm font-medium"
                          placeholder="Masukkan nama resmi masjid"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Alamat Lengkap</label>
                        <textarea
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm resize-none font-medium"
                          placeholder="Sertakan nama jalan dan wilayah"
                          rows="3"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Latitude</label>
                          <input
                            type="number" step="any"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm font-medium"
                            placeholder="Contoh: -7.1234"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Longitude</label>
                          <input
                            type="number" step="any"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm font-medium"
                            placeholder="Contoh: 110.1234"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Deskripsi (Opsional)</label>
                        <textarea
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm resize-none font-medium"
                          placeholder="Penjelasan singkat mengenai masjid"
                          rows="4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tombol Aksi - Layout Identik[cite: 1] */}
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/masjid')}
                    className="flex items-center px-10 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl font-bold shadow-xl hover:from-gray-300 hover:to-gray-400 transition-all transform hover:-translate-y-1"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-10 py-4 bg-mu-green text-white rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={22} className="mr-3" />
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
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

export default EditMasjid;