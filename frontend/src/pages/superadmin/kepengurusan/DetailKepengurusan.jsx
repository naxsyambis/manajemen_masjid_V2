// frontend/src/pages/superadmin/kepengurusan/DetailKepengurusan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Calendar, User, ArrowLeft, Edit, Trash2, AlertTriangle, X, RefreshCcw, AlertCircle } from 'lucide-react';

const DetailKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pengurus, setPengurus] = useState(null);
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
    fetchPengurus();
  }, [id]);

  const fetchPengurus = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/kepengurusan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPengurus(res.data);
    } catch (err) {
      console.error('Error fetching pengurus:', err);
      setError('Gagal memuat detail pengurus. Silakan coba lagi.');
      navigate('/superadmin/kepengurusan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/kepengurusan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pengurus berhasil dihapus');
      navigate('/superadmin/kepengurusan');
    } catch (err) {
      console.error('Error deleting pengurus:', err);
      alert('Gagal menghapus pengurus');
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
    fetchPengurus();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Detail Pengurus...</p>
        </div>
      </div>
    );
  }

  if (!pengurus) return null;

  return (
    <div className="detail-kepengurusan h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Detail <span className="text-mu-green">Pengurus</span>
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
                disabled={refreshing}
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Memuat...' : 'Refresh Data'}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Detail Pengurus Modern dan Elegan */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Detail Pengurus</h2>
                <p className="text-gray-600 text-lg">Informasi lengkap tentang pengurus yang dipilih</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Foto Pengurus</h3>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                        {pengurus.foto_pengurus ? (
                          <img src={`http://localhost:3000${pengurus.foto_pengurus}`} alt="Foto" className="w-44 h-44 object-cover rounded-xl" />
                        ) : (
                          <User size={64} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Pengurus</h3>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Lengkap</label>
                      <p className="text-gray-600 text-lg">{pengurus.nama_lengkap}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {pengurus.pengurus_id}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Jabatan</label>
                      <p className="text-gray-600">{pengurus.jabatan}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Periode Jabatan</label>
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-mu-green" />
                        <p className="text-gray-600">
                          {new Date(pengurus.periode_mulai).toLocaleDateString()} - {new Date(pengurus.periode_selesai).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tombol Aksi dengan Efek Hover */}
              <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                <button
                  onClick={() => navigate('/superadmin/kepengurusan')}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <ArrowLeft size={22} className="mr-3" />
                  Kembali ke Daftar Kepengurusan
                </button>
                <button
                  onClick={() => navigate(`/superadmin/kepengurusan/edit/${id}`)}
                  className="flex items-center px-8 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <Edit size={22} className="mr-3" />
                  Edit Pengurus
                </button>
                <button
                  onClick={openDeleteModal}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <Trash2 size={22} className="mr-3" />
                  Hapus Pengurus
                </button>
              </div>
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
                Apakah Anda yakin ingin menghapus pengurus berikut? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
              </p>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
                <h2 className="font-bold text-lg text-gray-800 mb-2">{pengurus.nama_lengkap}</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Jabatan: {pengurus.jabatan}</p>
                  <p>Periode: {new Date(pengurus.periode_mulai).toLocaleDateString()} - {new Date(pengurus.periode_selesai).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <X size={20} className="mr-2" />
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} className="mr-2" />
                  {deleting ? 'Menghapus...' : 'Hapus Pengurus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailKepengurusan;