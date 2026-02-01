// frontend/src/pages/superadmin/takmir/DataTakmir.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Plus, Edit, Trash2, Eye, AlertTriangle, X, Search } from 'lucide-react';

const DataTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [takmirs, setTakmirs] = useState([]);
  const [filteredTakmirs, setFilteredTakmirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTakmir, setSelectedTakmir] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchTakmirs();
  }, []);

  useEffect(() => {
    // Filter takmirs berdasarkan search term dengan pengecekan null/
    const filtered = takmirs.filter(takmir =>
      (takmir.nama && typeof takmir.nama === 'string' && takmir.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (takmir.email && typeof takmir.email === 'string' && takmir.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (takmir.nama_masjid && typeof takmir.nama_masjid === 'string' && takmir.nama_masjid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (takmir.id && takmir.id.toString().includes(searchTerm)) // Fallback ID
    );
    setFilteredTakmirs(filtered);
  }, [takmirs, searchTerm]);

const fetchTakmirs = async () => {
  try {
    const res = await axios.get('http://localhost:3000/superadmin/takmir', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const formatted = res.data.map(t => ({
      id: t.id,
      nama: t.user?.nama || "-",
      email: t.user?.email || "-",
      nama_masjid: t.masjid?.nama_masjid || "-"
    }));


    setTakmirs(formatted);

  } catch (err) {
    console.error('Error fetching takmirs:', err);
    alert('Gagal memuat data takmir');
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async () => {
    if (!selectedTakmir) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/takmir/${selectedTakmir.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Takmir berhasil dihapus');
      fetchTakmirs();
      setShowDeleteModal(false);
      setSelectedTakmir(null);
    } catch (err) {
      console.error('Error deleting takmir:', err);
      alert('Gagal menghapus takmir');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (takmir) => {
    setSelectedTakmir(takmir);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTakmir(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Data Takmir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-4xl font-black text-gray-800 mb-2">Data Takmir</h1>
                <p className="text-gray-600">Kelola informasi takmir dengan mudah dan efisien</p>
              </div>
              <button
                onClick={() => navigate('/superadmin/takmir/tambah')}
                className="mt-4 sm:mt-0 bg-yellow-500 text-black px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus size={24} />
                Tambah Takmir Baru
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-mu-green p-6 text-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Daftar Takmir</h2>
                    <p className="text-green-100 mt-1">Total: {filteredTakmirs.length} takmir</p>
                  </div>
                  <div className="mt-4 sm:mt-0 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari takmir..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-transparent w-full sm:w-64 text-black"
                    />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Masjid</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTakmirs.map((takmir, index) => (
                      <tr key={takmir.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{takmir.nama}</div>
                          <div className="text-xs text-gray-500">ID: {takmir.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{takmir.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{takmir.nama_masjid}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => navigate(`/superadmin/takmir/detail/${takmir.id}`)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors shadow-sm"
                              title="Detail"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => navigate(`/superadmin/takmir/edit/${takmir.id}`)}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(takmir)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTakmirs.length === 0 && searchTerm && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Search size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada takmir ditemukan</h3>
                  <p className="text-gray-500">Coba kata kunci lain atau tambahkan takmir baru.</p>
                </div>
              )}
              
              {filteredTakmirs.length === 0 && !searchTerm && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Search size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada data takmir</h3>
                  <p className="text-gray-500">Tambahkan takmir pertama Anda untuk memulai.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && selectedTakmir && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center">
              <AlertTriangle size={32} className="mr-4 animate-pulse" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus takmir berikut? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
              </p>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
                <h2 className="font-bold text-lg text-gray-800 mb-2">{selectedTakmir.nama}</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Email: {selectedTakmir.email}</p>
                  <p>Masjid: {selectedTakmir.nama_masjid}</p>
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

export default DataTakmir;