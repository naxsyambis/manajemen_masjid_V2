// frontend/src/pages/superadmin/riwayat/Riwayat.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  History, Calendar, User, FileText, RefreshCcw, 
  Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Riwayat = ({ user, onLogout }) => {
  // UI State[cite: 1, 7]
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data State[cite: 7]
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State[cite: 1, 7]
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // 1. Clock Effect[cite: 1]
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Data Function[cite: 7]
  const fetchAuditLogs = useCallback(async () => {
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
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Gagal memuat data riwayat.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // 3. Search & Filter Effect[cite: 7]
  useEffect(() => {
    const filtered = auditLogs.filter(log => 
      log.nama_tabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.User?.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, auditLogs]);

  // 4. Pagination Logic[cite: 1, 7]
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create': return 'text-green-600 bg-green-50';
      case 'update': return 'text-blue-600 bg-blue-50';
      case 'delete': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'create': return <Plus size={16} />;
      case 'update': return <Edit size={16} />;
      case 'delete': return <Trash2 size={16} />;
      default: return <History size={16} />;
    }
  };

  // 6. Loading State[cite: 1]
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-mu-green uppercase tracking-widest">Memuat Riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="riwayat h-screen bg-gray-50 flex overflow-hidden">
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
                Riwayat <span className="text-mu-green">Aktivitas</span>
              </h1>
              <div className="flex items-center gap-3 mt-3 text-gray-500 font-bold text-xs md:text-sm uppercase tracking-widest">
                <Calendar size={16} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-mu-green font-black ml-2">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <button 
              onClick={fetchAuditLogs}
              disabled={refreshing}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-mu-green transition-all shadow-sm"
            >
              <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          
          {/* Table Container[cite: 1, 7] */}
          <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            
            {/* Toolbar[cite: 1] */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="hidden sm:block">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Log Aktivitas</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {filteredLogs.length}</p>
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
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                
                <input
                  type="text"
                  placeholder="Cari user, tabel, atau aksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 
                            border border-gray-300 
                            rounded-2xl 
                            bg-white text-gray-700 text-sm font-medium w-full
                            
                            shadow-sm
                            placeholder-gray-400
                            
                            focus:outline-none 
                            focus:ring-2 focus:ring-mu-green/20 
                            focus:border-mu-green
                            
                            hover:border-gray-400
                            transition-all duration-200"
                />
</div>
            </div>

            {/* Content List[cite: 7] */}
            <div className="space-y-4">
              {currentItems.length > 0 ? (
                currentItems.map((log) => (
                  <div key={log.log_id || Math.random()} className="group bg-gray-50/50 p-6 rounded-3xl border border-gray-50 hover:bg-white hover:border-mu-green/20 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${getActionColor(log.action)} shadow-sm`}>
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-800 group-hover:text-mu-green transition-colors uppercase tracking-tight">
                              {log.nama_tabel || 'System'} - <span className="font-black">{log.action}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-1">
                          <div className="flex items-center gap-3">
                            <User size={16} className="text-mu-green" />
                            <div className="text-sm">
                              <span className="font-bold text-gray-700">{log.User?.nama}</span>
                              <span className="text-xs text-gray-400 font-bold uppercase ml-2 px-2 py-0.5 bg-gray-100 rounded-lg">
                                {log.User?.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${getActionColor(log.action)}`}>
                          {log.action}
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(log.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-gray-400 text-sm font-black uppercase tracking-[0.2em]">Log tidak ditemukan</div>
              )}
            </div>

            {/* Pagination[cite: 1] */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Menampilkan <span className="text-mu-green">{filteredLogs.length > 0 ? indexOfFirstItem + 1 : 0}</span> - <span className="text-mu-green">{Math.min(indexOfLastItem, filteredLogs.length)}</span> dari {filteredLogs.length} data
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
    </div>
  );
};

export default Riwayat;