// frontend/src/pages/superadmin/takmir/DetailTakmir.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { User, Mail, Building, ArrowLeft, Edit, Trash2, AlertTriangle, X } from 'lucide-react';

const DetailTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [takmir, setTakmir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchTakmir();
  }, [id]);

  const fetchTakmir = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTakmir(res.data);
    } catch (err) {
      console.error('Error fetching takmir:', err);
      alert('Gagal memuat detail takmir');
      navigate('/superadmin/takmir');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Takmir berhasil dihapus');
      navigate('/superadmin/takmir');
    } catch (err) {
      console.error('Error deleting takmir:', err);
      alert('Gagal menghapus takmir');
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
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Detail Takmir...</p>
        </div>
      </div>
    );
  }

  if (!takmir) return null;

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <div className="max-w-6xl mx-auto">
            
            {/* Single Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-mu-green p-10 text-white">
                <h1 className="text-4xl font-bold text-center">{takmir.nama}</h1>
                <p className="text-green-100 text-lg text-center mt-2">ID Takmir: {takmir.id}</p>
              </div>
              
              {/* Body */}
              <div className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Kolom Kiri: Avatar */}
                  <div className="flex justify-center lg:justify-start">
                    <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <User size={64} className="text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Kolom Kanan: Detail */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Nama */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Nama Takmir</h3>
                      <p className="text-gray-600">{takmir.nama}</p>
                    </div>
                    
                    {/* Email */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Email</h3>
                      <p className="text-gray-600">{takmir.email}</p>
                    </div>
                    
                    {/* Masjid */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Masjid</h3>
                      <p className="text-gray-600">{takmir.nama_masjid}</p>
                    </div>
                  </div>
                </div>
                
                {/* Tombol Aksi */}
                <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/superadmin/takmir')}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center font-medium"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Kembali ke Daftar Takmir
                  </button>
                  <button
                    onClick={() => navigate(`/superadmin/takmir/edit/${id}`)}
                    className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-colors flex items-center font-medium"
                  >
                    <Edit size={20} className="mr-2" />
                    Edit Takmir
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center font-medium"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Hapus Takmir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl mx-4 transform animate-scale-in overflow-hidden">
            <div className="bg-red-500 text-white p-6 flex items-center">
              <AlertTriangle size={32} className="mr-4" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus Takmir</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin ingin menghapus takmir berikut? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="font-semibold text-lg text-gray-800">{takmir.nama}</h2>
                <p className="text-gray-600 mt-1">{takmir.email}</p>
                <p className="text-gray-600">{takmir.nama_masjid}</p>
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
                  {deleting ? 'Menghapus...' : 'Hapus Takmir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailTakmir;