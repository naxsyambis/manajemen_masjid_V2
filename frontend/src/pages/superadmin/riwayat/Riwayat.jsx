// frontend/src/pages/superadmin/riwayat/Riwayat.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { History, Calendar, User, FileText, RefreshCcw, AlertCircle, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Riwayat = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]); // State untuk hasil pencarian[cite: 7]
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // State untuk Pencarian, Filter Baris, dan Pagination[cite: 7]
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get('http://localhost:3000/superadmin/audit-log', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const processedLogs = res.data.data.map(log => ({
        ...log,
        User: log.User || { nama: 'System', role: 'System', email: 'system@mu.com' }
      }));
      
      setAuditLogs(processedLogs);
      setFilteredLogs(processedLogs); // Inisialisasi filter[cite: 7]
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      let errorMessage = 'Gagal memuat data riwayat.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (err.response.status === 500) {
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [token]);

  // Handler untuk Pencarian Real-time[cite: 7]
  useEffect(() => {
    const filtered = auditLogs.filter(log => 
      log.nama_tabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.User?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset ke halaman pertama saat mencari[cite: 7]
  }, [searchTerm, auditLogs]);

  // Kalkulasi Pagination[cite: 7]
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'create': return <Plus size={16} className="text-green-600" />;
      case 'update': return <Edit size={16} className="text-blue-600" />;
      case 'delete': return <Trash2 size={16} className="text-red-600" />;
      default: return <History size={16} className="text-gray-600" />;
    }
  };

  const handleRefresh = () => fetchAuditLogs();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="riwayat h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Riwayat <span className="text-mu-green">Aktivitas</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
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
          
          {/* Controls: Search & Filter[cite: 7] */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Log Aktivitas Sistem</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Total: {filteredLogs.length} Entri Ditemukan
                  </p>
                </div>

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
              
              <div className="relative w-full sm:w-80">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari User, Tabel, atau Aksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm w-full"
                />
              </div>
            </div>

            {/* List Logs[cite: 7] */}
            <div className="space-y-4">
              {currentItems.length > 0 ? (
                currentItems.map((log) => (
                  <div key={log.log_id || Math.random()} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-mu-green/10 rounded-xl">
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800 uppercase tracking-wider">
                              {log.nama_tabel || 'Unknown'} - {log.action || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              Record ID: {log.record_id || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{log.User?.nama || 'System'}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase ml-1">({log.User?.role || 'System'})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">{log.ip_address || 'N/A'}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getActionColor(log.action)} flex items-center gap-1`}>
                        {getActionIcon(log.action)}
                        {log.action || 'Unknown'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <History size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Data tidak ditemukan</p>
                </div>
              )}
            </div>

            {/* Pagination Controls[cite: 7] */}
            {filteredLogs.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLogs.length)} dari {filteredLogs.length} entri
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
          </div>
          
          <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
            <div className="h-[1px] w-12 bg-gray-100"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Database System v3.0</p>
            <div className="h-[1px] w-12 bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riwayat;