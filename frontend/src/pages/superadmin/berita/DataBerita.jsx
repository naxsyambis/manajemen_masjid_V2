// frontend/src/pages/superadmin/berita/DataBerita.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Plus, Edit, Trash2, Eye, AlertTriangle, X, FileText, Image as ImageIcon, Search, Calendar, RefreshCcw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const DataBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [beritas, setBeritas] = useState([]);
  const [filteredBeritas, setFilteredBeritas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // State Baru untuk Pagination dan Filter Baris[cite: 5]
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
    fetchBeritas();
  }, []);

  useEffect(() => {
    // Fungsi search yang berjalan saat searchTerm diketik[cite: 5]
    const filtered = beritas.filter(berita =>
      berita.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      berita.isi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBeritas(filtered);
    setCurrentPage(1); // Reset ke halaman pertama saat melakukan pencarian[cite: 5]
  }, [beritas, searchTerm]);

  // Kalkulasi data untuk pagination[cite: 5]
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredBeritas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBeritas.length / entriesPerPage);

  const fetchBeritas = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get('http://localhost:3000/superadmin/berita', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBeritas(res.data);
    } catch (err) {
      console.error('Error fetching beritas:', err);
      setError('Gagal memuat data berita. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBerita) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/berita/${selectedBerita.berita_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Berita berhasil dihapus');
      fetchBeritas();
      setShowDeleteModal(false);
      setSelectedBerita(null);
    } catch (err) {
      console.error('Error deleting berita:', err);
      alert('Gagal menghapus berita');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (berita) => {
    setSelectedBerita(berita);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedBerita(null);
  };

  const handleRefresh = () => {
    fetchBeritas();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Data Berita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-berita h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Data <span className="text-mu-green">Berita</span>
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
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Memuat...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => navigate('/superadmin/berita/tambah')}
                className="flex items-center gap-2 bg-mu-green text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus size={14} />
                Tambah Berita
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
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Daftar Berita</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Total: {filteredBeritas.length} Berita
                  </p>
                </div>

                {/* Dropdown Filter Baris Data[cite: 5] */}
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
              
              {/* Input Search yang Bisa Diketik[cite: 5] */}
              <div className="relative w-full sm:w-64">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berita..."
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
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Gambar</th>
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Judul</th>
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Isi</th>
                    <th className="px-8 py-6 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((berita, index) => (
                    <tr key={berita.berita_id} className={`border-t border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                          {berita.gambar ? (
                            <img src={`http://localhost:3000${berita.gambar}`} alt="Gambar" className="w-10 h-10 object-cover rounded-full" />
                          ) : (
                            <ImageIcon size={24} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 max-w-[150px] truncate" title={berita.judul}>{berita.judul}</div>
                        <div className="text-xs text-gray-500">ID: {berita.berita_id}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-mu-green" />
                          <span className="text-sm text-gray-900">{new Date(berita.tanggal).toLocaleDateString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-start space-x-2">
                          <FileText size={16} className="text-mu-green mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-900 max-w-[150px] truncate" title={berita.isi || 'Tidak ada isi'}>{berita.isi || 'Tidak ada isi'}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => navigate(`/superadmin/berita/detail/${berita.berita_id}`)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors shadow-sm" title="Detail"><Eye size={18} /></button>
                          <button onClick={() => navigate(`/superadmin/berita/edit/${berita.berita_id}`)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm" title="Edit"><Edit size={18} /></button>
                          <button onClick={() => openDeleteModal(berita)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm" title="Hapus"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kontrol Navigasi Halaman (Pagination)[cite: 5] */}
            {filteredBeritas.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredBeritas.length)} dari {filteredBeritas.length} data
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
            
            {filteredBeritas.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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

      {/* Modal Konfirmasi Hapus[cite: 5] */}
      {showDeleteModal && selectedBerita && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center">
              <AlertTriangle size={32} className="mr-4" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">Hapus berita <strong>{selectedBerita.judul}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex justify-end space-x-4">
                <button onClick={closeDeleteModal} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium flex items-center">
                  <X size={20} className="mr-2" /> Batal
                </button>
                <button onClick={handleDelete} disabled={deleting} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 transition-all font-medium flex items-center shadow-lg disabled:opacity-50">
                  <Trash2 size={20} className="mr-2" /> {deleting ? 'Menghapus...' : 'Hapus Berita'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataBerita;