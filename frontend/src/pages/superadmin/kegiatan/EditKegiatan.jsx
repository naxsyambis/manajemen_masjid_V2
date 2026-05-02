import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; 
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
  Camera,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

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

const EditKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [alertData, setAlertData] = useState({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null });

  const [formData, setFormData] = useState({ nama_kegiatan: '', waktu_kegiatan: '', lokasi: '', deskripsi: '' });
  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [oldPoster, setOldPoster] = useState(null);

  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = ({ type = "info", title = "Informasi", message = "", confirmText = "", onConfirm = null }) => {
    setAlertData({ show: true, type, title, message, confirmText, onConfirm });
  };

  const closePopup = () => { setAlertData({ ...alertData, show: false }); };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchData(); }, [id, token]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${BASE_URL}/superadmin/kegiatan/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data;
      setFormData({
        nama_kegiatan: data.nama_kegiatan || '',
        waktu_kegiatan: data.waktu_kegiatan ? new Date(data.waktu_kegiatan).toISOString().slice(0, 16) : '',
        lokasi: data.lokasi || '',
        deskripsi: data.deskripsi || ''
      });
      setOldPoster(data.poster);
    } catch (err) {
      showPopup({ type: "error", title: "Gagal Memuat", message: "Data tidak ditemukan.", onConfirm: () => navigate('/superadmin/kegiatan') });
    } finally { setRefreshing(false); }
  };

  const handleImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showPopup({ type: "warning", title: "Terlalu Besar", message: "Maksimal poster 5MB." });
    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemovePoster = () => {
    setPoster(null);
    setPreview(null);
    document.getElementById('poster-upload').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kegiatan.trim() || !formData.waktu_kegiatan || !formData.lokasi.trim()) {
      return showPopup({ type: "warning", title: "Data Belum Lengkap", message: "Mohon isi semua field wajib." });
    }

    setLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => form.append(key, formData[key]));
      if (poster) form.append("poster", poster);

      await axios.put(`${BASE_URL}/superadmin/kegiatan/${id}`, form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      showPopup({ type: "success", title: "Berhasil!", message: "Kegiatan diperbarui.", onConfirm: () => navigate('/superadmin/kegiatan') });
    } catch (err) { showPopup({ type: "error", title: "Gagal", message: "Terjadi kesalahan sistem." }); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        <div className="p-8 overflow-y-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Edit <span className="text-mu-green">Kegiatan</span></h1>
              <div className="text-sm text-gray-500 mt-1 font-medium">{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {time.toLocaleTimeString('id-ID')}</div>
              <span className="text-xs px-3 py-1 bg-mu-green/10 text-mu-green font-bold rounded-full mt-2 inline-block">ID: {id}</span>
            </div>
            <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 border bg-white rounded-xl shadow-sm hover:text-mu-green transition-all"><RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Memuat...' : 'Refresh'}</button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 lg:p-12 rounded-3xl shadow-sm border border-gray-100 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* PHOTO SECTION DENGAN OVERLAY[cite: 13, 15] */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-mu-green pb-2">Poster Kegiatan</h3>
                <div className="relative group w-full aspect-[3/4] max-h-[500px]">
                  <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50 relative">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : oldPoster ? (
                      <img src={`${BASE_URL}/uploads/kegiatan/${oldPoster}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Old Poster" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x600?text=Poster+Not+Found'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={64} /></div>
                    )}

                    <label htmlFor="poster-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2 backdrop-blur-sm">
                      <Camera size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Ganti Poster</span>
                    </label>
                  </div>

                  {poster && (
                    <button type="button" onClick={handleRemovePoster} className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-all scale-0 group-hover:scale-100 z-10"><X size={16} /></button>
                  )}
                  
                  <div className="absolute -bottom-2 -right-2 bg-mu-green text-white p-2 rounded-lg shadow-lg border-2 border-white"><Upload size={14} /></div>
                </div>
                <input id="poster-upload" type="file" hidden accept="image/*" onChange={(e) => handleImage(e.target.files[0])} />
                <p className="text-xs text-gray-400 font-medium italic text-center">Klik poster untuk mengganti (Maks. 5MB)</p>
              </div>

              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-800 border-b-2 border-mu-green pb-2">Detail Informasi</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Type size={16} className="text-mu-green" /> Nama Kegiatan</label>
                    <input value={formData.nama_kegiatan} onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl mt-2 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16} className="text-mu-green" /> Waktu Pelaksanaan</label>
                    <input type="datetime-local" value={formData.waktu_kegiatan} onChange={(e) => setFormData({ ...formData, waktu_kegiatan: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl mt-2 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin size={16} className="text-mu-green" /> Lokasi</label>
                    <input value={formData.lokasi} onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl mt-2 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FileText size={16} className="text-mu-green" /> Deskripsi</label>
                    <textarea rows="6" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="w-full border border-gray-200 p-3 rounded-xl mt-2 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none bg-gray-50 focus:bg-white resize-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-8 border-t border-gray-100">
              <button type="button" onClick={() => navigate('/superadmin/kegiatan')} className="w-full sm:w-auto px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-sm">Batal</button>
              <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-3 bg-mu-green text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all disabled:opacity-50 active:scale-95"><Save size={20} /> {loading ? 'Menyimpan...' : 'Update Kegiatan'}</button>
            </div>
          </form>

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

export default EditKegiatan;