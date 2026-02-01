// frontend/src/pages/superadmin/berita/DetailBerita.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { ArrowLeft, Edit, Trash2, AlertTriangle, X, Calendar, User } from 'lucide-react';

const DetailBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchBerita();
  }, [id]);

  const fetchBerita = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBerita(res.data);
    } catch (err) {
      console.error('Error fetching berita:', err);
      alert('Gagal memuat detail berita');
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
      alert('Berita berhasil dihapus');
      navigate('/superadmin/berita');
    } catch (err) {
      console.error('Error deleting berita:', err);
      alert('Gagal menghapus berita');
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
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Detail Berita...</p>
        </div>
      </div>
    );
  }

  if (!berita) return null;

  // Fungsi untuk merender isi berita dengan mempertahankan paragraf
  const renderIsiBerita = (isi) => {
    if (!isi) return <p>Tidak ada isi yang tersedia untuk berita ini.</p>;
    
    // Split berdasarkan newline untuk membuat paragraf terpisah
    const paragraphs = isi.split('\n').filter(p => p.trim() !== '');
    
    return paragraphs.map((paragraph, index) => (
      <p key={index} className={`text-lg lg:text-xl text-gray-700 leading-relaxed mb-6 ${index === 0 ? 'first-letter:text-4xl first-letter:font-bold first-letter:text-mu-green first-letter:mr-2 first-letter:float-left' : ''}`}>
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <div className="max-w-4xl mx-auto">
            
            {/* Artikel Layout seperti CNN/Detik */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              {/* Header Artikel */}
              <header className="bg-mu-green text-white p-8 lg:p-12">
                <div className="text-center">
                  <h1 className="text-3xl lg:text-5xl font-black leading-tight mb-4">{berita.judul}</h1>
                  <div className="flex items-center justify-center space-x-4 text-green-100">
                    <div className="flex items-center space-x-2">
                      <Calendar size={18} />
                      <span className="text-sm lg:text-base">{new Date(berita.tanggal).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User size={18} />
                      <span className="text-sm lg:text-base">ID Berita: {berita.berita_id}</span>
                    </div>
                  </div>
                </div>
              </header>
              
              {/* Gambar Utama */}
              {berita.gambar && (
                <div className="px-8 lg:px-12 py-8">
                  <img 
                    src={`http://localhost:3000${berita.gambar}`} 
                    alt={berita.judul} 
                    className="w-full h-64 lg:h-96 object-cover rounded-xl shadow-lg" 
                  />
                </div>
              )}
              
              {/* Isi Berita */}
              <div className="px-8 lg:px-12 pb-12">
                <div className="prose prose-lg max-w-none">
                  {renderIsiBerita(berita.isi)}
                </div>
                
                {/* Garis Pemisah - Jarak Dikurangi */}
                <hr className="my-8 border-gray-300" />
                
                {/* Tombol Aksi - Dirapikan */}
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => navigate('/superadmin/berita')}
                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Kembali ke Daftar Berita
                  </button>
                  <button
                    onClick={() => navigate(`/superadmin/berita/edit/${id}`)}
                    className="flex items-center px-6 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Edit size={20} className="mr-2" />
                    Edit Berita
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="flex items-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Hapus Berita
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center">
              <AlertTriangle size={32} className="mr-4 animate-pulse" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus berita berikut? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
              </p>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
                <h2 className="font-bold text-lg text-gray-800 mb-2">{berita.judul}</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center"><Calendar size={16} className="mr-2" />{new Date(berita.tanggal).toLocaleDateString('id-ID')}</p>
                  <p className="flex items-center"><User size={16} className="mr-2" />ID: {berita.berita_id}</p>
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
                  {deleting ? 'Menghapus...' : 'Hapus Berita'}
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