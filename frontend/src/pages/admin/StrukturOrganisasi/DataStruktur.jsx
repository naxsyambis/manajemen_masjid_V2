import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit, Trash2, AlertTriangle, X, Calendar, User, Search, RefreshCcw, AlertCircle, ChevronLeft, ChevronRight, Network, CheckCircle2, XCircle, Info, PenTool
} from 'lucide-react';

const AlertPopup = ({ alertData, onClose }) => {
// ... (Kode AlertPopup tetap sama)
  if (!alertData.show) return null;

  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';
  const isConfirm = alertData.type === 'confirm';

  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning || isConfirm ? AlertTriangle : Info;

  const iconClass = isSuccess ? 'bg-green-100 text-green-600' : isError ? 'bg-red-100 text-red-600' : isWarning || isConfirm ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600';
  const buttonClass = isConfirm ? 'bg-red-600 hover:bg-red-700 text-white' : isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : isError ? 'bg-red-600 hover:bg-red-700 text-white' : isWarning ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green' : 'bg-mu-green hover:bg-green-700 text-white';

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}><Icon size={42} strokeWidth={2.5} /></div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          {isConfirm ? (
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button type="button" onClick={onClose} className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">Batal</button>
              <button type="button" onClick={() => { if (alertData.onConfirm) alertData.onConfirm(); onClose(); }} className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || 'Hapus'}</button>
            </div>
          ) : (
            <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || 'Mengerti'}</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const DataStruktur = () => {
  const [struktur, setStruktur] = useState([]);
  const [filteredStruktur, setFilteredStruktur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStruktur, setSelectedStruktur] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => setAlertData({ ...alertData, show: false });

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      showPopup({ type: 'error', title: 'Sesi Berakhir', message: err.response.data.message || 'Sesi Anda telah berakhir.', confirmText: 'Login Ulang', onConfirm: () => { localStorage.removeItem('token'); window.location.href = '/login'; } });
      return true;
    }
    return false;
  };

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    return `http://localhost:3000/uploads/kepengurusan/${foto}`;
  };

  // TAMBAHAN URL TTD
  const getTtdUrl = (ttd) => {
    if (!ttd) return null;
    if (ttd.startsWith('http')) return ttd;
    return `http://localhost:3000/uploads/ttd/${ttd}`;
  };

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { fetchStruktur(); }, []);
  useEffect(() => {
    const filtered = struktur.filter((item) => item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredStruktur(filtered);
    setCurrentPage(1);
  }, [struktur, searchTerm]);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredStruktur.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStruktur.length / entriesPerPage);

  const fetchStruktur = async () => {
    try {
      setRefreshing(true); setError(null);
      if (!masjidId) { setError('Masjid ID tidak ditemukan. Silakan logout lalu login ulang.'); setStruktur([]); showPopup({ type: 'warning', title: 'Masjid ID Tidak Ada', message: 'Silakan logout lalu login ulang.' }); return; }
      const res = await axios.get('http://localhost:3000/takmir/struktur-organisasi', { params: { masjid_id: masjidId }, headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setStruktur(data);
    } catch (err) {
      if (handleAuthError(err)) return;
      const msg = err.response?.data?.message || 'Gagal memuat data struktur organisasi.';
      setError(msg); showPopup({ type: 'error', title: 'Gagal Memuat', message: msg });
    } finally { setLoading(false); setRefreshing(false); }
  };

  const openDeleteModal = (item) => { setSelectedStruktur(item); showPopup({ type: 'confirm', title: 'Hapus Data?', message: `Yakin ingin menghapus ${item.nama}? Data tidak bisa dikembalikan.`, confirmText: 'Hapus', onConfirm: () => handleDelete(item) }); };

  const handleDelete = async (item) => {
    if (!item) return; setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/takmir/struktur-organisasi/${item.struktur_id}`, { headers: { Authorization: `Bearer ${token}` } });
      showPopup({ type: 'success', title: 'Data Dihapus', message: 'Data struktur organisasi berhasil dihapus.' });
      fetchStruktur(); setSelectedStruktur(null);
    } catch (err) {
      if (handleAuthError(err)) return;
      showPopup({ type: 'error', title: 'Gagal Menghapus', message: err.response?.data?.message || 'Gagal menghapus data struktur organisasi.' });
    } finally { setDeleting(false); }
  };

  const formatTanggal = (tanggal) => { if (!tanggal) return '-'; return new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Data Struktur Organisasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="main-content p-8 h-full overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">Struktur <span className="text-mu-green">Organisasi</span></h1>
            <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest"><Calendar size={12} className="text-mu-green" /><span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span><span className="mx-2">•</span><span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span></div>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchStruktur} disabled={refreshing} className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"><RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Memuat...' : 'Refresh Data'}</button>
            <button onClick={() => navigate('/admin/struktur-organisasi/tambah')} className="flex items-center gap-2 bg-mu-green text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"><Plus size={14} />Tambah Struktur</button>
          </div>
        </div>

        {error && (<div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4"><AlertCircle size={24} className="text-red-500 flex-shrink-0" /><div><p className="text-red-700 font-medium">Error</p><p className="text-red-600 text-sm mt-1">{error}</p></div></div>)}

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div><h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Daftar Struktur</h3><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {filteredStruktur.length} Data</p></div>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl shadow-sm"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show:</span><select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-transparent text-sm font-bold text-mu-green focus:outline-none cursor-pointer">{[5, 10, 25, 50, 100].map((num) => (<option key={num} value={num}>{num}</option>))}</select></div>
            </div>
            <div className="relative w-full sm:w-64"><Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Cari nama/jabatan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm w-full" /></div>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-inner">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Foto</th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">TTD</th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Nama</th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Jabatan</th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">Periode</th>
                  <th className="px-8 py-6 text-center text-sm font-black text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.struktur_id} className={`border-t border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                        {item.foto ? (<img src={getFotoUrl(item.foto)} alt={item.nama} className="w-10 h-10 object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />) : (<User size={24} className="text-gray-400" />)}
                      </div>
                    </td>
                    
                    {/* BAGIAN TTD */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                        {item.ttd ? (<img src={getTtdUrl(item.ttd)} alt="TTD" className="w-10 h-10 object-cover rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />) : (<PenTool size={24} className="text-gray-400" />)}
                      </div>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">{item.nama}</div><div className="text-xs text-gray-500">ID: {item.struktur_id}</div></td>
                    <td className="px-8 py-6 whitespace-nowrap"><span className="text-sm text-gray-900">{item.jabatan}</span></td>
                    <td className="px-8 py-6 whitespace-nowrap"><div className="flex items-center space-x-2"><Calendar size={16} className="text-mu-green" /><span className="text-sm text-gray-900">{formatTanggal(item.periode_mulai)} - {formatTanggal(item.periode_selesai)}</span></div></td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => navigate(`/admin/struktur-organisasi/edit/${item.struktur_id}`)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm" title="Edit"><Edit size={18} /></button>
                        <button onClick={() => openDeleteModal(item)} disabled={deleting} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm disabled:opacity-50" title="Hapus"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStruktur.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 px-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredStruktur.length)} dari {filteredStruktur.length} data</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-3 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-mu-green disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"><ChevronLeft size={20} /></button>
                <div className="flex gap-1">{[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-mu-green text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'}`}>{i + 1}</button>))}</div>
                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-3 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-mu-green disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"><ChevronRight size={20} /></button>
              </div>
            </div>
          )}
          {filteredStruktur.length === 0 && (
            <div className="text-center py-16"><div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><Network size={48} className="text-gray-400" /></div><h3 className="text-xl font-semibold text-gray-600 mb-2">Data tidak ditemukan</h3><p className="text-gray-500">Coba kata kunci lain atau tambahkan data struktur organisasi.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataStruktur;