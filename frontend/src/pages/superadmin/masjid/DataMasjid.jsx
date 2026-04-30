// frontend/src/pages/superadmin/masjid/DataMasjid.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Plus, Edit, Trash2, Eye, AlertTriangle, MapPin, 
  Phone, Navigation, Image as ImageIcon, Search, 
  Calendar, RefreshCcw, ChevronLeft, ChevronRight 
} from 'lucide-react';

const DataMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [masjids, setMasjids] = useState([]);
  const [filteredMasjids, setFilteredMasjids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMasjid, setSelectedMasjid] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const [entriesPerPage, setEntriesPerPage] = useState(5); 
  const [currentPage, setCurrentPage] = useState(1);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Data Effect
  useEffect(() => {
    fetchMasjids();
  }, []);

  // Search & Filter Effect
  useEffect(() => {
    const filtered = masjids.filter(masjid =>
      masjid.nama_masjid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      masjid.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMasjids(filtered);
    setCurrentPage(1);
  }, [masjids, searchTerm]);

  // Pagination Logic
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredMasjids.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMasjids.length / entriesPerPage);

  const fetchMasjids = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get('http://localhost:3000/superadmin/masjid', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasjids(res.data);
    } catch (err) {
      console.error('Error fetching masjids:', err);
      setError('Gagal memuat data masjid.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMasjid) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/masjid/${selectedMasjid.masjid_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMasjids();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting masjid:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (masjid) => {
    setSelectedMasjid(masjid);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedMasjid(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-mu-green uppercase tracking-widest">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-masjid h-screen bg-gray-50 flex overflow-hidden">
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
        
        <div className="main-content p-4 md:p-8 h-full overflow-y-auto space-y-6 md:space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">
                Data <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-mu-green font-black">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={fetchMasjids}
                disabled={refreshing}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-gray-100 px-4 py-3 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:text-mu-green transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/superadmin/masjid/tambah')}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-mu-green text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-md transition-all active:scale-95"
              >
                <Plus size={14} />
                Tambah
              </button>
            </div>
          </div>
          
          {/* Table Container */}
          <div className="bg-white p-4 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="hidden sm:block">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Daftar</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total: {filteredMasjids.length}</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Show:</span>
                  <select 
                    value={entriesPerPage}
                    onChange={(e) => {setEntriesPerPage(Number(e.target.value)); setCurrentPage(1);}}
                    className="bg-transparent text-xs font-bold text-mu-green focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 25].map(num => <option key={num} value={num}>{num}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari masjid atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl focus:ring-2 focus:ring-mu-green/20 focus:border-mu-green transition-all bg-gray-50 text-sm w-full"
                />
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 bg-gray-50 z-10 px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Logo</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Info Masjid</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Lokasi & Kontak</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Koordinat</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((masjid) => (
                    <tr key={masjid.masjid_id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="sticky left-0 bg-white group-hover:bg-gray-50 z-10 px-4 py-4 border-b border-gray-50">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full overflow-hidden shadow-inner flex items-center justify-center border border-gray-200">
                          {masjid.logo_foto ? (
                            <img src={`http://localhost:3000${masjid.logo_foto}`} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-50">
                        <div className="text-sm font-bold text-gray-800">{masjid.nama_masjid}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: {masjid.masjid_id}</div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-50">
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <MapPin size={12} className="text-mu-green flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{masjid.alamat}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                          <Phone size={12} className="text-mu-green flex-shrink-0" />
                          <span>{masjid.no_hp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                            <Navigation size={10} className="text-mu-green" />
                            <span>Lat: {masjid.latitude}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold">
                            <Navigation size={10} className="text-mu-green" />
                            <span>Lng: {masjid.longitude}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-gray-50 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => navigate(`/superadmin/masjid/detail/${masjid.masjid_id}`)} 
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => navigate(`/superadmin/masjid/edit/${masjid.masjid_id}`)} 
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(masjid)} 
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredMasjids.length)} dari {filteredMasjids.length} data
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-50 text-gray-400 disabled:opacity-30 hover:text-mu-green transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`min-w-[32px] h-8 rounded-lg text-[10px] font-bold transition-all ${currentPage === i + 1 ? 'bg-mu-green text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-50 text-gray-400 disabled:opacity-30 hover:text-mu-green transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-gray-300 py-4">
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedMasjid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-500 p-6 flex justify-center text-white">
              <AlertTriangle size={48} className="animate-bounce" />
            </div>
            <div className="p-6 text-center">
              <h1 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-2">Hapus Data?</h1>
              <p className="text-sm text-gray-500 mb-6">Yakin ingin menghapus <strong>{selectedMasjid.nama_masjid}</strong>? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={closeDeleteModal} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
                  Batal
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center">
                  {deleting ? <RefreshCcw size={14} className="animate-spin" /> : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMasjid;