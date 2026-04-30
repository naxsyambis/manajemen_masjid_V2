// frontend/src/pages/superadmin/berita/DetailBerita.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { ArrowLeft, Edit, Trash2, AlertTriangle, X, Calendar, User, RefreshCcw, AlertCircle, FileText } from 'lucide-react';

// 🔥 FUNGSI PINTAR UNTUK MENGATASI PATH GAMBAR
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/800x400?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
  return `http://localhost:3000/uploads/berita/${imagePath}`;
};

const DetailBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    fetchBerita();
  }, [id]);

  const fetchBerita = async () => {
    try {
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBerita(res.data);
    } catch (err) {
      console.error('Error fetching berita:', err);
      setError('Gagal memuat detail berita. Silakan coba lagi.');
      navigate('/superadmin/berita');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="animate-spin w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!berita) return null;

  return (
    <div className="detail-berita h-screen bg-gray-50 flex">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="p-8 h-full overflow-y-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">
              Detail <span className="text-mu-green">Berita</span>
            </h1>
          </div>
          
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="mb-6 text-center">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-800 leading-tight mb-4">{berita.judul}</h2>
              <div className="flex justify-center items-center gap-4 text-gray-600">
                <span className="text-sm bg-gray-100 px-4 py-2 rounded-xl font-bold uppercase tracking-widest">{berita.status}</span>
              </div>
            </div>
            
            {/* GAMBAR UTAMA BERITA */}
            <div className="mb-8">
              <img 
                src={getImageUrl(berita.gambar)} 
                alt={berita.judul} 
                className="w-full h-80 lg:h-[500px] object-cover rounded-2xl shadow-xl bg-gray-100" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found'; }}
              />
            </div>
            
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-mu-green" /> Isi Berita
              </h3>
              <div className="text-gray-600 prose prose-xl max-w-none whitespace-pre-wrap leading-relaxed text-justify">
                {berita.isi}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
              <button onClick={() => navigate('/superadmin/berita')} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold">
                Kembali
              </button>
              <button onClick={() => navigate(`/superadmin/berita/edit/${id}`)} className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-all font-bold">
                Edit Berita
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">Yakin ingin menghapus berita ini secara permanen?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-xl font-bold">Batal</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailBerita;