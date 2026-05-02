import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; 
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Save, 
  RefreshCcw, 
  AlertCircle, 
  Youtube, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info,
  Camera,
  Upload
} from 'lucide-react';

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
                {alertData.confirmText || 'Ya, Lanjut'}
              </button>
            </div>
          ) : (
            <button onClick={handleConfirm} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || 'Mengerti'}</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
  return `http://localhost:3000/uploads/berita/${imagePath}`;
};

const EditBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });

  const [formData, setFormData] = useState({ judul: '', isi: '', youtube_url: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;
  const isPublished = status === "dipublikasi";

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
    fetchBerita();
  }, [id, token]);

  const isValidYoutubeUrl = (url) => {
    if (!url || !url.trim()) return true;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be");
  };

  const fetchBerita = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ judul: res.data.judul || '', isi: res.data.isi || '', youtube_url: res.data.youtube_url || '' });
      setStatus(res.data.status || '');
      setExistingImages(res.data.gambar_list || []);
      setNewFiles([]);
      setDeletedImageIds([]);
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal Memuat', message: 'Data berita tidak ditemukan.', onConfirm: () => navigate('/superadmin/berita') });
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    showPopup({
      type: 'confirm',
      title: 'Ubah Status?',
      message: `Apakah Anda yakin ingin mengubah status berita menjadi "${newStatus}"?`,
      confirmText: 'Ubah Status',
      onConfirm: () => updateStatus(newStatus)
    });
  };

  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(`http://localhost:3000/superadmin/berita/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(newStatus);
      showPopup({ type: 'success', title: 'Berhasil', message: `Status berhasil diubah ke ${newStatus}.` });
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal', message: 'Gagal memperbarui status berita.' });
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    if (existingImages.length + newFiles.length + selected.length > 5) {
      showPopup({ type: 'warning', title: 'Limit Gambar', message: 'Maksimal 5 gambar diperbolehkan.' });
      e.target.value = '';
      return;
    }
    setNewFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const handleRemoveExisting = (gambar_id) => {
    setExistingImages((prev) => prev.filter((img) => img.gambar_id !== gambar_id));
    setDeletedImageIds((prev) => prev.includes(gambar_id) ? prev : [...prev, gambar_id]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidYoutubeUrl(formData.youtube_url)) {
      showPopup({ type: 'warning', title: 'Link Tidak Valid', message: 'Gunakan link YouTube yang benar.' });
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('isi', formData.isi);
    data.append('youtube_url', formData.youtube_url || '');
    data.append('deletedImages', JSON.stringify(deletedImageIds));
    newFiles.forEach((file) => data.append('gambar', file));

    try {
      await axios.put(`http://localhost:3000/superadmin/berita/${id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      showPopup({ type: 'success', title: 'Berhasil', message: 'Berita berhasil diperbarui.', onConfirm: () => navigate('/superadmin/berita') });
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal Update', message: 'Terjadi kesalahan saat menyimpan data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-8 overflow-y-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit <span className="text-mu-green">Berita</span></h1>
              <div className="text-sm text-gray-500 mt-1 font-medium">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>
              <span className="text-xs px-3 py-1 bg-gray-200 rounded-full mt-2 inline-block font-bold">Status: {status || '-'}</span>
            </div>
            <button type="button" onClick={fetchBerita} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white shadow-sm hover:text-mu-green transition-all font-bold">
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <div>
              <h3 className="text-xl font-bold mb-4 border-b-2 border-mu-green pb-2">Gambar Berita</h3>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="gambar-upload" />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                
                {existingImages.map((img) => (
                  <div key={img.gambar_id} className="relative group aspect-square">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm relative">
                      <img 
                        src={getImageUrl(img.path_gambar)} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt="Berita" 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} 
                      />
                      <label 
                        htmlFor="gambar-upload" 
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-2 backdrop-blur-sm"
                      >
                        <Camera size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Ganti/Tambah</span>
                      </label>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExisting(img.gambar_id)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition z-10"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {newFiles.map((file, index) => (
                  <div key={index} className="relative group aspect-square">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-mu-green/30 shadow-sm relative">
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-mu-green/10 pointer-events-none" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveNewFile(index)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-md z-10"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {(existingImages.length + newFiles.length) < 5 && (
                  <label 
                    htmlFor="gambar-upload" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl aspect-square cursor-pointer hover:bg-mu-green/5 hover:border-mu-green transition-all group"
                  >
                    <div className="bg-gray-100 p-3 rounded-full group-hover:bg-mu-green/10 transition-colors">
                      <Upload size={24} className="text-gray-400 group-hover:text-mu-green transition-colors" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 group-hover:text-mu-green">Tambah Foto</span>
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-4 italic font-medium">Klik pada gambar atau tombol "+" untuk memperbarui koleksi gambar (Maks. 5 foto, @5MB).</p>
            </div>

            <div className="space-y-6 pt-4">
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Judul Berita</label>
                <input type="text" value={formData.judul} onChange={(e) => setFormData({ ...formData, judul: e.target.value })} className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white" required />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Isi Lengkap Berita</label>
                <textarea value={formData.isi} onChange={(e) => setFormData({ ...formData, isi: e.target.value })} rows="8" className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white resize-none" required />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2"><Youtube size={18} className="text-red-600" /> Link Video YouTube (Opsional)</label>
                <input type="text" value={formData.youtube_url} onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} className="w-full border border-gray-200 p-4 rounded-xl mt-2 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 focus:bg-white" placeholder="https://www.youtube.com/watch?v=xxxx" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                {!isPublished && (
                  <>
                    {(status === "draft" || status === "menunggu" || status === "ditolak") && (
                      <button type="button" onClick={() => handleStatusChange("disetujui")} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 hover:scale-105 transition-all">Setujui</button>
                    )}
                    {(status === "draft" || status === "menunggu" || status === "disetujui") && (
                      <button type="button" onClick={() => handleStatusChange("ditolak")} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 hover:scale-105 transition-all">Tolak</button>
                    )}
                    {status === "disetujui" && (
                      <button type="button" onClick={() => handleStatusChange("dipublikasi")} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 hover:scale-105 transition-all">Publikasi</button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button type="button" onClick={() => navigate('/superadmin/berita')} className="flex-1 md:flex-none px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 md:flex-none px-10 py-3 bg-mu-green text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-green-700 hover:scale-105 transition-all disabled:opacity-50 active:scale-95">
                  <Save size={20} /> {loading ? 'Menyimpan...' : 'Update Berita'}
                </button>
              </div>
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

export default EditBerita;