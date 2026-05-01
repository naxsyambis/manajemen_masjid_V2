// frontend/src/pages/superadmin/berita/DetailBerita.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Calendar, User, ArrowLeft, Edit, Trash2, 
  AlertTriangle, RefreshCcw, FileText, 
  Youtube, ExternalLink, Clock, Fingerprint, 
  Tag, Image as ImageIcon
} from 'lucide-react';

// Sub-component untuk baris informasi yang konsisten[cite: 1]
const DetailRow = ({ icon, label, value, isLink = false, href = "#" }) => (
  <div className="flex items-center justify-between p-5 hover:bg-gray-50/80 transition-all border-b border-gray-100 last:border-0 group">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400 group-hover:text-mu-green group-hover:bg-mu-green/10 transition-all">
        {icon}
      </div>
      <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{label}</span>
    </div>
    {isLink && value !== "-" ? (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-sm font-bold text-mu-green hover:underline flex items-center gap-1"
      >
        {value} <ExternalLink size={14} />
      </a>
    ) : (
      <span className="text-sm font-bold text-gray-700">{value || "-"}</span>
    )}
  </div>
);

const DetailBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // Utility functions tetap dipertahankan namun diposisikan secara bersih[cite: 2]
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/800x400?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/uploads/berita/${imagePath}`;
  };

  const getYoutubeUrl = (youtubeUrl) => {
    if (!youtubeUrl) return null;
    const trimmedUrl = youtubeUrl.trim();
    if (!trimmedUrl) return null;
    return (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) 
      ? trimmedUrl : `https://${trimmedUrl}`;
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBerita = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBerita(res.data);
    } catch (err) {
      console.error('Error fetching berita:', err);
      navigate('/superadmin/berita');
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchBerita();
  }, [fetchBerita]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/superadmin/berita');
    } catch (err) {
      alert('Gagal menghapus berita');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-mu-green uppercase tracking-widest">Memuat Konten...</p>
        </div>
      </div>
    );
  }

  const youtubeUrl = getYoutubeUrl(berita?.youtube_url);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout} 
        user={user} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-6 md:p-10 h-full overflow-y-auto space-y-10">
          
          {/* Header & Navigasi[cite: 1] */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate('/superadmin/berita')} 
                className="group p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-mu-green hover:border-mu-green/20 transition-all shadow-sm"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">
                  Detail <span className="text-mu-green">Berita</span>
                </h1>
                <div className="flex items-center gap-3 mt-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                  <Fingerprint size={14} className="text-mu-green" />
                  <span>ID: {berita?.id_berita || id}</span>
                  <span className="text-gray-200">|</span>
                  <Clock size={14} className="text-mu-green" />
                  <span>{time.toLocaleTimeString('id-ID')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate(`/superadmin/berita/edit/${id}`)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                <Edit size={18} /> Edit Berita
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 border-2 border-red-100 px-8 py-4 rounded-2xl text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={18} /> Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Media & Meta Utama (Kiri)[cite: 1] */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="relative group overflow-hidden rounded-[2.5rem] aspect-video bg-gray-100 border-4 border-gray-50 shadow-inner">
                  <img 
                    src={getImageUrl(berita?.gambar)} 
                    alt={berita?.judul} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found'; }}
                  />
                  <div className="absolute inset-0 bg-mu-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="mt-8 space-y-2">
                  <DetailRow icon={<Tag size={18}/>} label="Status" value={berita?.status} />
                  <DetailRow 
                    icon={<Youtube size={18}/>} 
                    label="Youtube Link" 
                    value={youtubeUrl ? "Buka Video" : "-"} 
                    isLink={!!youtubeUrl} 
                    href={youtubeUrl} 
                  />
                </div>
              </div>
            </div>

            {/* Isi Konten (Kanan)[cite: 1] */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 h-full">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-gray-50 rounded-2xl text-mu-green shadow-inner"><FileText size={24}/></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Konten Publikasi</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Detail narasi dan isi berita</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-gray-800 leading-tight tracking-tight">
                    {berita?.judul}
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                      {berita?.isi}
                    </p>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Catatan Redaksi</p>
                  <p className="text-sm text-gray-500 text-center leading-relaxed italic">
                    "Seluruh konten yang dipublikasikan telah melalui tahap verifikasi admin super untuk memastikan akurasi informasi organisasi."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Modal[cite: 1] */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="bg-red-500 p-10 flex justify-center text-white">
              <AlertTriangle size={64} className="animate-bounce" />
            </div>
            <div className="p-10 text-center">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-4">Hapus Berita?</h2>
              <p className="text-base text-gray-500 mb-8 leading-relaxed">
                Menghapus berita <strong>{berita?.judul}</strong> akan menghilangkannya dari portal publikasi secara permanen.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={deleting} 
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-200 transition-all flex items-center justify-center"
                >
                  {deleting ? <RefreshCcw size={18} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailBerita;