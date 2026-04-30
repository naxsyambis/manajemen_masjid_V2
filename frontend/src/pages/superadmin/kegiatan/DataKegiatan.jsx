// frontend/src/pages/superadmin/kegiatan/DataKegiatan.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Plus, Edit, Trash2, Eye, AlertTriangle, MapPin, 
  Search, Calendar, RefreshCcw, Image as ImageIcon, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const DataKegiatan = ({ user, onLogout }) => {
  // UI State[cite: 1, 6]
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Data State[cite: 6]
  const [kegiatans, setKegiatans] = useState([]);
  const [filteredKegiatans, setFilteredKegiatans] = useState([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [time, setTime] = useState(new Date());
  
  // Pagination State[cite: 1, 6]
  const [entriesPerPage, setEntriesPerPage] = useState(5); 
  const [currentPage, setCurrentPage] = useState(1);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // 1. Clock Effect[cite: 1]
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Data Function[cite: 6]
  const fetchKegiatans = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${BASE_URL}/superadmin/kegiatan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKegiatans(res.data.data || []);
    } catch (err) {
      console.error('Error fetching kegiatans:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKegiatans();
  }, [fetchKegiatans]);

  // 3. Search & Filter Effect[cite: 6]
  useEffect(() => {
    const filtered = kegiatans.filter(k =>
      k.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.lokasi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKegiatans(filtered);
    setCurrentPage(1);
  }, [kegiatans, searchTerm]);

  // 4. Pagination Logic[cite: 1]
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredKegiatans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKegiatans.length / entriesPerPage);

  const getPaginationNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // 5. Actions[cite: 6]
  const handleDelete = async () => {
    if (!selectedKegiatan) return;
    setDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/superadmin/kegiatan/${selectedKegiatan.kegiatan_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKegiatans();
      setShowDeleteModal(false);
    } catch (err) {
      alert('Gagal menghapus data.');
    } finally {
      setDeleting(false);
    }
  };

  // 6. Loading State[cite: 1]
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-mu-green uppercase tracking-widest">Memuat Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-kegiatan h-screen bg-gray-50 flex overflow-hidden">
      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout} 
        user={user} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-6 md:p-10 h-full overflow-y-auto space-y-8">
          
          {/* Header Section[cite: 1] */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">
                Data <span className="text-mu-green">Kegiatan</span>
              </h1>
              <div className="flex items-center gap-3 mt-3 text-gray-500 font-bold text-xs md:text-sm uppercase tracking-widest">
                <Calendar size={16} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-mu-green font-black ml-2">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={fetchKegiatans}
                disabled={refreshing}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-mu-green transition-all shadow-sm"
              >
                <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/superadmin/kegiatan/tambah')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                <Plus size={20} />
                Tambah Kegiatan
              </button>
            </div>
          </div>
          
          {/* Table Container[cite: 1] */}
          <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            
            {/* Toolbar[cite: 1] */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="hidden sm:block">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Daftar Kegiatan</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {filteredKegiatans.length}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 px-4 py-2.5 rounded-2xl">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Show:</span>
                  <select 
                    value={entriesPerPage}
                    onChange={(e) => {setEntriesPerPage(Number(e.target.value)); setCurrentPage(1);}}
                    className="bg-transparent text-sm font-bold text-mu-green focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 25, 50].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kegiatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 text-sm w-full font-medium"
                />
              </div>
            </div>
            
            {/* Table[cite: 1] */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Poster</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Nama Kegiatan</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Waktu</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Lokasi</th>
                    <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((k) => (
                      <tr key={k.kegiatan_id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-6 border-b border-gray-50">
                          <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-transparent group-hover:border-mu-green transition-all">
                            {k.poster ? (
                              <img src={`${BASE_URL}/uploads/kegiatan/${k.poster}`} alt="Poster" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={28} className="text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 border-b border-gray-50">
                          <div className="text-lg font-bold text-gray-800 group-hover:text-mu-green transition-colors max-w-[200px] truncate" title={k.nama_kegiatan}>{k.nama_kegiatan}</div>
                          <div className="text-xs text-gray-400 font-black uppercase tracking-tighter mt-1">ID: {k.kegiatan_id}</div>
                        </td>
                        <td className="px-6 py-6 border-b border-gray-50">
                          <div className="flex items-center gap-2 text-sm text-gray-800 font-black bg-gray-100/50 w-fit px-3 py-2 rounded-xl">
                            <Calendar size={14} className="text-mu-green flex-shrink-0" />
                            <span>{k.waktu_kegiatan ? new Date(k.waktu_kegiatan).toLocaleDateString('id-ID') : '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 border-b border-gray-50">
                          <div className="flex items-start gap-2 text-sm text-gray-600 max-w-[150px] truncate">
                            <MapPin size={16} className="text-mu-green flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{k.lokasi}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 border-b border-gray-50 text-center">
                          <div className="flex justify-center items-center gap-3">
                            <button 
                              onClick={() => navigate(`/superadmin/kegiatan/detail/${k.kegiatan_id}`)} 
                              className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Detail"
                            >
                              <Eye size={20} />
                            </button>
                            <button 
                              onClick={() => navigate(`/superadmin/kegiatan/edit/${k.kegiatan_id}`)} 
                              className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Edit"
                            >
                              <Edit size={20} />
                            </button>
                            <button 
                              onClick={() => { setSelectedKegiatan(k); setShowDeleteModal(true); }} 
                              className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Hapus"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-24 text-gray-400 text-sm font-black uppercase tracking-[0.2em]">Data tidak ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination[cite: 1] */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Menampilkan <span className="text-mu-green">{filteredKegiatans.length > 0 ? indexOfFirstItem + 1 : 0}</span> - <span className="text-mu-green">{Math.min(indexOfLastItem, filteredKegiatans.length)}</span> dari {filteredKegiatans.length} data
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"
                >
                  <ChevronLeft size={22} />
                </button>

                <div className="flex gap-2">
                  {getPaginationNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[45px] h-11 rounded-xl text-xs font-black transition-all ${
                        currentPage === page
                          ? 'bg-mu-green text-white shadow-lg shadow-green-100 scale-110'
                          : 'bg-white text-gray-400 border-2 border-gray-50 hover:border-mu-green'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal[cite: 1] */}
      {showDeleteModal && selectedKegiatan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="bg-red-500 p-10 flex justify-center text-white">
              <AlertTriangle size={64} className="animate-bounce" />
            </div>
            <div className="p-10 text-center">
              <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-4">Hapus Kegiatan?</h1>
              <p className="text-base text-gray-500 mb-8 leading-relaxed">Apakah Anda yakin ingin menghapus <strong>{selectedKegiatan.nama_kegiatan}</strong>? Data yang dihapus tidak bisa dikembalikan.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                  Batal
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-200 transition-all flex items-center justify-center">
                  {deleting ? <RefreshCcw size={18} className="animate-spin" /> : 'Ya, Hapus'}
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