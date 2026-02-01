import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { AlertTriangle, Trash2, X, MapPin, Calendar, FileText } from 'lucide-react';

const HapusKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [kegiatan, setKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchKegiatan();
  }, [id]);

  const fetchKegiatan = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKegiatan(res.data);
    } catch (err) {
      console.error('Error fetching kegiatan:', err);
      alert('Gagal memuat data kegiatan');
      navigate('/superadmin/kegiatan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Kegiatan berhasil dihapus');
      navigate('/superadmin/kegiatan');
    } catch (err) {
      console.error('Error deleting kegiatan:', err);
      alert('Gagal menghapus kegiatan');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Data Kegiatan...</p>
        </div>
      </div>
    );
  }

  if (!kegiatan) return null;

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} />
      <div className="hidden lg:block transition-all duration-300 ease-in-out shrink-0 pointer-events-none" style={{ width: isOpen ? '256px' : '80px' }} />
      
      <div className="main-content lg:ml-0 p-6 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-10 text-white">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Calendar size={40} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{kegiatan.nama_kegiatan}</h1>
                    <p className="text-red-100 text-lg">ID Kegiatan: {kegiatan.kegiatan_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <AlertTriangle size={48} className="text-white animate-pulse" />
                  <div>
                    <h2 className="text-2xl font-bold">Konfirmasi Hapus</h2>
                    <p className="text-red-100">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-800">Peringatan Penting</h3>
                <p className="text-red-600">Menghapus kegiatan akan menghilangkan semua data terkait secara permanen.</p>
              </div>
            </div>
            <p className="text-red-700 leading-relaxed">
              Pastikan Anda benar-benar ingin menghapus kegiatan ini. Semua informasi akan hilang selamanya dan tidak dapat dikembalikan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Waktu Kegiatan</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{new Date(kegiatan.waktu_kegiatan).toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <MapPin size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Lokasi</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{kegiatan.lokasi}</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Deskripsi</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{kegiatan.deskripsi || 'Tidak ada deskripsi yang tersedia untuk kegiatan ini.'}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
            <button
              onClick={() => navigate(`/superadmin/kegiatan/detail/${id}`)}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center font-medium shadow-lg"
            >
              <X size={20} className="mr-2" />
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Trash2 size={20} className="mr-2" />
              {deleting ? 'Menghapus...' : 'Hapus Kegiatan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HapusKegiatan;