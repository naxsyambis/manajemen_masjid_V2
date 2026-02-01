// frontend/src/pages/superadmin/kepengurusan/DetailKepengurusan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Calendar, User, ArrowLeft, Edit, Trash2, AlertTriangle, X } from 'lucide-react';

const DetailKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [pengurus, setPengurus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchPengurus();
  }, [id]);

  const fetchPengurus = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/kepengurusan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPengurus(res.data);
    } catch (err) {
      console.error('Error fetching pengurus:', err);
      alert('Gagal memuat detail pengurus');
      navigate('/superadmin/kepengurusan');
    } finally {
      setLoading(false);
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
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-mu-green p-10 text-white">
                <h1 className="text-4xl font-bold text-center">{pengurus.nama_lengkap}</h1>
                <p className="text-green-100 text-lg text-center mt-2">ID Pengurus: {pengurus.pengurus_id}</p>
              </div>
              
              <div className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="flex justify-center lg:justify-start">
                    <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                      {pengurus.foto_pengurus ? (
                        <img src={`http://localhost:3000${pengurus.foto_pengurus}`} alt="Foto" className="w-28 h-28 object-cover rounded-xl" />
                      ) : (
                        <User size={64} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Jabatan</h3>
                      <p className="text-gray-600">{pengurus.jabatan}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Periode Jabatan</h3>
                      <p className="text-gray-600">
                        {new Date(pengurus.periode_mulai).toLocaleDateString()} - {new Date(pengurus.periode_selesai).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/superadmin/kepengurusan')}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center font-medium"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Kembali ke Daftar Kepengurusan
                  </button>
                  <button
                    onClick={() => navigate(`/superadmin/kepengurusan/edit/${id}`)}
                    className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-colors flex items-center font-medium"
                  >
                    <Edit size={20} className="mr-2" />
                    Edit Pengurus
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center font-medium"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Hapus Pengurus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl mx-4 transform animate-scale-in overflow-hidden">
            <div className="bg-red-500 text-white p-6 flex items-center">
              <AlertTriangle size={32} className="mr-4" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus Pengurus</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin ingin menghapus pengurus berikut? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="font-semibold text-lg text-gray-800">{pengurus.nama_lengkap}</h2>
                <p className="text-gray-600 mt-1">Jabatan: {pengurus.jabatan}</p>
                <p className="text-gray-600">Periode: {new Date(pengurus.periode_mulai).toLocaleDateString()} - {new Date(pengurus.periode_selesai).toLocaleDateString()}</p>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center"
                >
                  <X size={20} className="mr-2" />
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center disabled:opacity-50"
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