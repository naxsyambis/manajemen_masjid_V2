// frontend/src/pages/superadmin/masjid/DetailMasjid.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { MapPin, Phone, FileText, Image as ImageIcon, ArrowLeft, Edit, Trash2, AlertTriangle, X } from 'lucide-react';

const DetailMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [masjid, setMasjid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchMasjid();
  }, [id]);

  const fetchMasjid = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasjid(res.data);
    } catch (err) {
      console.error('Error fetching masjid:', err);
      alert('Gagal memuat detail masjid');
      navigate('/superadmin/masjid');
    } finally {
      setLoading(false);
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
                <h1 className="text-4xl font-bold text-center">{masjid.nama_masjid}</h1>
                <p className="text-green-100 text-lg text-center mt-2">ID Masjid: {masjid.masjid_id}</p>
              </div>
              
              {/* Body */}
              <div className="p-10">
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
                    {/* Alamat */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Alamat Masjid</h3>
                      <p className="text-gray-600">{masjid.alamat}</p>
                    </div>
                    
                    {/* Kontak */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Kontak</h3>
                      <p className="text-gray-600">{masjid.no_hp}</p>
                    </div>
                    
                    {/* Deskripsi */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Deskripsi</h3>
                      <p className="text-gray-600">{masjid.deskripsi || 'Tidak ada deskripsi yang tersedia untuk masjid ini.'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Tombol Aksi */}
                <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/superadmin/masjid')}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center font-medium"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Kembali ke Daftar Masjid
                  </button>
                  <button
                    onClick={() => navigate(`/superadmin/masjid/edit/${id}`)}
                    className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-colors flex items-center font-medium"
                  >
                    <Edit size={20} className="mr-2" />
                    Edit Masjid
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center font-medium"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Hapus Masjid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus - Menggunakan Styling dari HapusMasjid */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl mx-4 transform animate-scale-in overflow-hidden">
            <div className="bg-red-500 text-white p-6 flex items-center">
              <AlertTriangle size={32} className="mr-4" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus Masjid</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Apakah Anda yakin ingin menghapus masjid berikut? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 className="font-semibold text-lg text-gray-800">{masjid.nama_masjid}</h2>
                <p className="text-gray-600 mt-1">{masjid.alamat}</p>
                <p className="text-gray-600">{masjid.no_hp}</p>
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