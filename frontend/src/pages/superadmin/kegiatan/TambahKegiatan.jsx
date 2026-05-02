import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom"; // Tambahkan ini untuk Portal Alert
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Save, 
  RefreshCcw, 
  Calendar, 
  AlertCircle, 
  MapPin, 
  FileText, 
  Type,
  Image as ImageIcon,
  // Icon tambahan untuk Alert
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

// --- Komponen AlertPopup (Sesuai source CreateBerita.jsx) ---[cite: 3]
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
          <X size={20} />
        </button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}>
            <Icon size={42} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
            {alertData.confirmText || "Mengerti"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TambahKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // --- State Alert ---[cite: 3]
  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    waktu_kegiatan: '',
    lokasi: '',
    deskripsi: ''
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [masjidList, setMasjidList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // --- Fungsi Helper Alert ---[cite: 3]
  const showPopup = ({ type = "info", title = "Informasi", message = "", confirmText = "", onConfirm = null }) => {
    setAlertData({ show: true, type, title, message, confirmText, onConfirm });
  };

  const closePopup = () => {
    const callback = alertData.onConfirm;
    setAlertData({ ...alertData, show: false });
    if (callback) setTimeout(callback, 100);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios.get(`${BASE_URL}/superadmin/masjid`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMasjidList(res.data || []))
    .catch(() => setMasjidList([]));
  }, [token]);

  const today = new Date().toISOString().slice(0, 16);

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showPopup({
        type: "warning",
        title: "Ukuran Terlalu Besar",
        message: "Ukuran poster maksimal 5MB."
      });
      return;
    }
    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi menggunakan Alert[cite: 3]
    if (!formData.nama_kegiatan || !formData.waktu_kegiatan || !formData.lokasi) {
      showPopup({
        type: "warning",
        title: "Data Tidak Lengkap",
        message: "Nama kegiatan, waktu, dan lokasi masjid wajib diisi."
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("nama_kegiatan", formData.nama_kegiatan);
      form.append("waktu_kegiatan", formData.waktu_kegiatan);
      form.append("lokasi", formData.lokasi);
      form.append("deskripsi", formData.deskripsi);
      if (poster) form.append("poster", poster);

      await axios.post(`${BASE_URL}/superadmin/kegiatan`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Sukses menggunakan Alert[cite: 3]
      showPopup({
        type: "success",
        title: "Berhasil!",
        message: "Data kegiatan telah berhasil ditambahkan ke sistem.",
        onConfirm: () => navigate('/superadmin/kegiatan')
      });

    } catch (err) {
      console.error(err);
      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: err.response?.data?.message || "Terjadi kesalahan saat menyimpan kegiatan."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-kegiatan h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      {/* Komponen Alert diletakkan di sini */}
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout} 
        user={user} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Tambah <span className="text-mu-green">Kegiatan</span>
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

          {/* Form Card */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Informasi Kegiatan Baru</h2>
                <p className="text-gray-600 text-lg">Lengkapi detail kegiatan dakwah dan sosial</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Bagian Input Form tetap sama sesuai struktur[cite: 4] */}
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Poster Kegiatan</h3>
                      <div className="space-y-4">
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl min-h-[400px] cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all overflow-hidden group relative">
                          {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center p-6">
                              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4 group-hover:text-mu-green transition-colors" />
                              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Klik untuk Upload Poster</p>
                              <p className="text-xs text-gray-400 mt-2 italic">Format: JPG, PNG (Maks. 5MB)</p>
                            </div>
                          )}
                          <input type="file" hidden accept="image/*" onChange={(e) => handleImage(e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Detail Acara</h3>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><Type size={16} className="text-mu-green" /> Nama Kegiatan</label>
                        <input
                          type="text"
                          value={formData.nama_kegiatan}
                          onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                          placeholder="Contoh: Kajian Rutin Malam Jumat"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><Calendar size={16} className="text-mu-green" /> Waktu Pelaksanaan</label>
                        <input
                          type="datetime-local"
                          min={today}
                          value={formData.waktu_kegiatan}
                          onChange={(e) => setFormData({ ...formData, waktu_kegiatan: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><MapPin size={16} className="text-mu-green" /> Lokasi Masjid</label>
                        <select
                          value={formData.lokasi}
                          onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 shadow-sm appearance-none"
                        >
                          <option value="">Pilih Lokasi Masjid</option>
                          {masjidList.map(m => (
                            <option key={m.masjid_id} value={m.nama_masjid}>{m.nama_masjid}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><FileText size={16} className="text-mu-green" /> Deskripsi</label>
                        <textarea
                          rows="5"
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm resize-none"
                          placeholder="Tuliskan detail agenda kegiatan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/kegiatan')}
                    className="flex items-center px-10 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-10 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 disabled:opacity-50"
                  >
                    <Save size={22} className="mr-3" />
                    {loading ? 'Menyimpan...' : 'Simpan Kegiatan'}
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

export default TambahKegiatan;