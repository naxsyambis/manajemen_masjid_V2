// frontend/src/pages/superadmin/kegiatan/DataKegiatan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Plus, Edit, Trash2, Eye, AlertTriangle, X, MapPin, Calendar, FileText, Search, RefreshCcw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const DataKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [kegiatans, setKegiatans] = useState([]);
  const [filteredKegiatans, setFilteredKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // State baru untuk Pagination dan Filter Baris[cite: 6]
  const [entriesPerPage, setEntriesPerPage] = useState(5); 
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchKegiatans();
  }, []);

  useEffect(() => {
    // Fungsi pencarian responsif saat mengetik[cite: 6]
    const filtered = kegiatans.filter(kegiatan =>
      kegiatan.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kegiatan.lokasi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKegiatans(filtered);
    setCurrentPage(1); // Reset ke halaman pertama saat mencari[cite: 6]
  }, [kegiatans, searchTerm]);

  // Kalkulasi data untuk pagination[cite: 6]
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredKegiatans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKegiatans.length / entriesPerPage);

  const fetchKegiatans = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get('http://localhost:3000/superadmin/kegiatan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKegiatans(res.data);
    } catch (err) {
      console.error('Error fetching kegiatans:', err);
      setError('Gagal memuat data kegiatan. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedKegiatan) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/kegiatan/${selectedKegiatan.kegiatan_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Kegiatan berhasil dihapus');
      fetchKegiatans();
      setShowDeleteModal(false);
      setSelectedKegiatan(null);
    } catch (err) {
      console.error('Error deleting kegiatan:', err);
      alert('Gagal menghapus kegiatan');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedKegiatan(null);
  };

  const handleRefresh = () => {
    fetchKegiatans();
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

  return (
    <div className="data-kegiatan h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Data <span className="text-mu-green">Kegiatan</span>
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
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Memuat...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => navigate('/superadmin/kegiatan/tambah')}
                className="flex items-center gap-2 bg-mu-green text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus size={14} />
                Tambah Kegiatan
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Tabel Modern */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Daftar Kegiatan</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Total: {filteredKegiatans.length} Kegiatan
                  </p>
                </div>

                {/* Filter Jumlah Baris[cite: 6] */}
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show:</span>
                  <select 
                    value={entriesPerPage}
                    onChange={(e) => {
                      setEntriesPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-sm font-bold text-mu-green focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 25, 50, 100].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Input Search yang bisa diketik[cite: 6] */}
              <div className="relative w-full sm:w-64">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kegiatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm w-full"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-2xl shadow-inner">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Nama Kegiatan</th>
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Waktu</th>
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Lokasi</th>
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-8 py-6 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((kegiatan, index) => (
                    <tr key={kegiatan.kegiatan_id} className={`border-t border-gray-100 hover:bg-gray-50/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 max-w-[150px] truncate" title={kegiatan.nama_kegiatan}>{kegiatan.nama_kegiatan}</div>
                        <div className="text-xs text-gray-500">ID: {kegiatan.kegiatan_id}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-mu-green" />
                          <span className="text-sm text-gray-900">{new Date(kegiatan.waktu_kegiatan).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} className="text-mu-green" />
                          <span className="text-sm text-gray-900 max-w-[150px] truncate" title={kegiatan.lokasi}>{kegiatan.lokasi}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-start space-x-2">
                          <FileText size={16} className="text-mu-green mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-900 max-w-[150px] truncate" title={kegiatan.deskripsi || 'Tidak ada deskripsi'}>{kegiatan.deskripsi || 'Tidak ada deskripsi'}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => navigate(`/superadmin/kegiatan/detail/${kegiatan.kegiatan_id}`)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors shadow-sm" title="Detail"><Eye size={18} /></button>
                          <button onClick={() => navigate(`/superadmin/kegiatan/edit/${kegiatan.kegiatan_id}`)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm" title="Edit"><Edit size={18} /></button>
                          <button onClick={() => openDeleteModal(kegiatan)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm" title="Hapus"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls[cite: 6] */}
            {filteredKegiatans.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredKegiatans.length)} dari {filteredKegiatans.length} data
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-mu-green disabled:opacity-30 shadow-sm transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-mu-green text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-mu-green disabled:opacity-30 shadow-sm transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
            
            {filteredKegiatans.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Search size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Data tidak ditemukan</h3>
              </div>
            )}
          </div>
          
          <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
            <div className="h-[1px] w-12 bg-gray-100"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-100"></div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus[cite: 6] */}
      {showDeleteModal && selectedKegiatan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center">
              <AlertTriangle size={32} className="mr-4" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">Hapus kegiatan <strong>{selectedKegiatan.nama_kegiatan}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-4">
                <button onClick={closeDeleteModal} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium flex items-center">
                  <X size={20} className="mr-2" /> Batal
                </button>
                <button onClick={handleDelete} disabled={deleting} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 transition-all font-medium flex items-center disabled:opacity-50 shadow-lg">
                  <Trash2 size={20} className="mr-2" /> {deleting ? 'Menghapus...' : 'Hapus Kegiatan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKegiatan;