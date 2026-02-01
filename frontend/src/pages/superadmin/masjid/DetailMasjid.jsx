// frontend/src/pages/superadmin/masjid/DetailMasjid.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { MapPin, Phone, FileText, Image as ImageIcon, ArrowLeft, Edit, Trash2, AlertTriangle, X, Calendar, RefreshCcw, AlertCircle } from 'lucide-react';

const DetailMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [masjid, setMasjid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMasjid();
  }, [id]);

  const fetchMasjid = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasjid(res.data);
    } catch (err) {
      console.error('Error fetching masjid:', err);
      setError('Gagal memuat detail masjid. Silakan coba lagi.');
      navigate('/superadmin/masjid');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Masjid berhasil dihapus');
      navigate('/superadmin/masjid');
    } catch (err) {
      console.error('Error deleting masjid:', err);
      alert('Gagal menghapus masjid');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleRefresh = () => {
    fetchMasjid();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Detail Masjid...</p>
        </div>
      </div>
    );
  }

  if (!masjid) return null;

  return (
    <div className="detail-masjid h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Detail <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Detail Masjid */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Informasi Masjid</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Detail Lengkap Masjid {masjid.nama_masjid}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Kolom Kiri: Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                  {masjid.logo_foto ? (
                    <img src={`http://localhost:3000${masjid.logo_foto}`} alt="Logo" className="w-28 h-28 object-cover rounded-xl" />
                  ) : (
                    <ImageIcon size={64} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Kolom Kanan: Detail */}
              <div className="lg:col-span-2 space-y-6">
                {/* Nama Masjid */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Nama Masjid</h3>
                  <p className="text-gray-600">{masjid.nama_masjid}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {masjid.masjid_id}</p>
                </div>
                
                {/* Alamat */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <MapPin size={20} className="text-mu-green" />
                    Alamat Masjid
                  </h3>
                  <p className="text-gray-600">{masjid.alamat}</p>
                </div>
                
                {/* Kontak */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Phone size={20} className="text-mu-green" />
                    Kontak
                  </h3>
                  <p className="text-gray-600">{masjid.no_hp}</p>
                </div>
                
                {/* Deskripsi */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText size={20} className="text-mu-green" />
                    Deskripsi
                  </h3>
                  <p className="text-gray-600">{masjid.deskripsi || 'Tidak ada deskripsi yang tersedia untuk masjid ini.'}</p>
                </div>
              </div>
            </div>
            
            {/* Tombol Aksi */}
            <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
              <button
                onClick={() => navigate('/superadmin/masjid')}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center font-medium"
              >
                <ArrowLeft size={20} className="mr-2" />
                Kembali ke Daftar Masjid
              </button>
              <button
                onClick={() => navigate(`/superadmin/masjid/edit/${id}`)}
                className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center font-medium shadow-lg"
              >
                <Edit size={20} className="mr-2" />
                Edit Masjid
              </button>
              <button
                onClick={openDeleteModal}
                className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 flex items-center font-medium shadow-lg"
              >
                <Trash2 size={20} className="mr-2" />
                Hapus Masjid
              </button>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
            <div className="h-[1px] w-12 bg-gray-100"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-100"></div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus - Modern */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center">
              <AlertTriangle size={32} className="mr-4 animate-pulse" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus masjid berikut? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
              </p>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
                <h2 className="font-bold text-lg text-gray-800 mb-2">{masjid.nama_masjid}</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center"><MapPin size={16} className="mr-2" />{masjid.alamat}</p>
                  <p className="flex items-center"><Phone size={16} className="mr-2" />{masjid.no_hp}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center font-medium"
                >
                  <X size={20} className="mr-2" />
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Trash2 size={20} className="mr-2" />
                  {deleting ? 'Menghapus...' : 'Hapus Masjid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailMasjid;