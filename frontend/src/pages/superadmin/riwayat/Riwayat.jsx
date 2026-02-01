// frontend/src/pages/superadmin/riwayat/Riwayat.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { History, Calendar, User, FileText, RefreshCcw, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';

const Riwayat = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
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
      
      // Process data to ensure User object exists
      const processedLogs = res.data.data.map(log => ({
        ...log,
        User: log.User || { nama: 'System', role: 'System', email: 'system@mu.com' }
      }));
      
      setAuditLogs(processedLogs);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return <Plus size={16} className="text-green-600" />;
      case 'update':
        return <Edit size={16} className="text-blue-600" />;
      case 'delete':
        return <Trash2 size={16} className="text-red-600" />;
      default:
        return <History size={16} className="text-gray-600" />;
    }
  };

  const handleRefresh = () => {
    fetchAuditLogs();
  };

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
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Audit Logs */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Log Aktivitas Sistem</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Riwayat Perubahan Data Terakhir ({auditLogs.length} Entri)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
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
                            <span className="text-[10px] text-gray-400 font-bold uppercase">({log.User?.role || 'System'})</span>
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
                  <p className="text-gray-500 text-lg font-medium">Tidak ada riwayat aktivitas</p>
                  <p className="text-gray-400 text-sm mt-1">Riwayat aktivitas akan muncul di sini setelah ada perubahan data</p>
                </div>
              )}
            </div>
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