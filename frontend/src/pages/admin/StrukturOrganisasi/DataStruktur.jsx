import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Calendar,
  User,
  Search,
  RefreshCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Network,
  CheckCircle2,
  XCircle,
  Info,
  PenTool,
  Building2
} from 'lucide-react';

const primaryActionButton =
  'h-14 min-w-[210px] inline-flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

const secondaryActionButton =
  'h-14 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

const pageHeaderIcon =
  'p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300';

const pageTitle =
  'text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none';

const pageSubtitle =
  'text-xs text-gray-400 font-bold uppercase tracking-[0.22em] ml-1 leading-relaxed flex items-center gap-2';

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';
  const isConfirm = alertData.type === 'confirm';

  const Icon = isSuccess
    ? CheckCircle2
    : isError
      ? XCircle
      : isWarning || isConfirm
        ? AlertTriangle
        : Info;

  const iconClass = isSuccess
    ? 'bg-green-100 text-green-600'
    : isError
      ? 'bg-red-100 text-red-600'
      : isWarning || isConfirm
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-blue-100 text-blue-600';

  const buttonClass = isConfirm
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : isSuccess
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : isError
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : isWarning
          ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green'
          : 'bg-mu-green hover:bg-green-700 text-white';

  const handleMainButton = () => {
    const callback = alertData.onConfirm;
    onClose();

    if (callback) {
      setTimeout(callback, 120);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}
          >
            <Icon size={42} strokeWidth={2.5} />
          </div>

          <h3 className="text-2xl font-black text-gray-800 leading-tight">
            {alertData.title || 'Informasi'}
          </h3>

          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">
            {alertData.message || '-'}
          </p>

          {isConfirm ? (
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleMainButton}
                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
              >
                {alertData.confirmText || 'Lanjut'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMainButton}
              className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
            >
              {alertData.confirmText || 'Mengerti'}
            </button>
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
  const [refreshing, setRefreshing] = useState(false);

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [alertData, setAlertData] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const showPopup = ({
    type = 'info',
    title = 'Informasi',
    message = '',
    confirmText = '',
    onConfirm = null
  }) => {
    setAlertData({
      show: true,
      type,
      title,
      message,
      confirmText,
      onConfirm
    });
  };

  const closePopup = () => {
    setAlertData({
      show: false,
      type: 'info',
      title: '',
      message: '',
      confirmText: '',
      onConfirm: null
    });
  };

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      showPopup({
        type: 'error',
        title: 'Sesi Berakhir',
        message: err.response.data.message || 'Sesi Anda telah berakhir.',
        confirmText: 'Login Ulang',
        onConfirm: () => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      });

      return true;
    }

    return false;
  };

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads/')) return `http://localhost:3000${foto}`;
    return `http://localhost:3000/uploads/kepengurusan/${foto}`;
  };

  const getTtdUrl = (ttd) => {
    if (!ttd) return null;
    if (ttd.startsWith('http')) return ttd;
    if (ttd.startsWith('/uploads/')) return `http://localhost:3000${ttd}`;
    return `http://localhost:3000/uploads/ttd/${ttd}`;
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const fetchStruktur = async () => {
    try {
      setRefreshing(true);
      setError(null);

      if (!masjidId) {
        const msg = 'Masjid ID tidak ditemukan. Silakan logout lalu login ulang.';
        setError(msg);
        setStruktur([]);

        showPopup({
          type: 'warning',
          title: 'Masjid ID Tidak Ada',
          message: msg
        });

        return;
      }

      const res = await axios.get('http://localhost:3000/takmir/struktur-organisasi', {
        params: { masjid_id: masjidId },
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];

      setStruktur(data);
    } catch (err) {
      if (handleAuthError(err)) return;

      const msg = err.response?.data?.message || 'Gagal memuat data struktur organisasi.';
      setError(msg);

      showPopup({
        type: 'error',
        title: 'Gagal Memuat',
        message: msg
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchStruktur();
  }, [token]);

  useEffect(() => {
    const keyword = searchTerm.toLowerCase();

    const filtered = struktur.filter((item) => {
      const nama = item.nama || '';
      const jabatan = item.jabatan || '';

      return (
        nama.toLowerCase().includes(keyword) ||
        jabatan.toLowerCase().includes(keyword)
      );
    });

    setFilteredStruktur(filtered);
    setCurrentPage(1);
  }, [struktur, searchTerm]);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredStruktur.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStruktur.length / entriesPerPage);

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

  const openDeleteModal = (item) => {
    setSelectedStruktur(item);

    showPopup({
      type: 'confirm',
      title: 'Hapus Data?',
      message: `Yakin ingin menghapus ${item.nama}? Data tidak bisa dikembalikan.`,
      confirmText: 'Hapus',
      onConfirm: () => handleDelete(item)
    });
  };

  const handleDelete = async (item) => {
    if (!item) return;

    setDeleting(true);

    try {
      await axios.delete(`http://localhost:3000/takmir/struktur-organisasi/${item.struktur_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup({
        type: 'success',
        title: 'Data Dihapus',
        message: 'Data struktur organisasi berhasil dihapus.'
      });

      fetchStruktur();
      setSelectedStruktur(null);
    } catch (err) {
      if (handleAuthError(err)) return;

      showPopup({
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.response?.data?.message || 'Gagal menghapus data struktur organisasi.'
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={pageHeaderIcon}>
              <Building2 size={32} strokeWidth={2.5} />
            </div>

            <h2 className={pageTitle}>
              Struktur Organisasi
            </h2>
          </div>

          <p className={pageSubtitle}>
            <Calendar size={14} />
            Kelola data pengurus, jabatan, periode, foto, dan tanda tangan organisasi
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={fetchStruktur}
            disabled={refreshing}
            className={secondaryActionButton}
          >
            <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Memuat...' : 'Refresh'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/struktur-organisasi/tambah')}
            className={primaryActionButton}
          >
            <Plus size={20} />
            Tambah Struktur
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
          <AlertCircle size={24} className="text-red-500 shrink-0" />
          <div>
            <p className="text-red-700 font-black text-sm uppercase tracking-widest">
              Error
            </p>
            <p className="text-red-600 text-sm font-semibold mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 w-full md:w-auto">
            <div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                Daftar Struktur
              </h3>

              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Total: {filteredStruktur.length}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 px-4 py-2.5 rounded-2xl w-fit">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Show:
              </span>

              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm font-bold text-mu-green focus:outline-none cursor-pointer"
              >
                {[5, 10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors"
            />

            <input
              type="text"
              placeholder="Cari nama atau jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold text-gray-700 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all shadow-inner placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Foto
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  TTD
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Nama
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Jabatan
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Periode
                </th>
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-24 text-gray-400 text-sm font-black uppercase tracking-[0.2em]"
                  >
                    Memuat Data Struktur Organisasi...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr
                    key={item.struktur_id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-transparent group-hover:border-mu-green transition-all">
                        {item.foto ? (
                          <img
                            src={getFotoUrl(item.foto)}
                            alt={item.nama || 'Foto Pengurus'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <User size={28} className="text-gray-300" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-transparent group-hover:border-mu-green transition-all">
                        {item.ttd ? (
                          <img
                            src={getTtdUrl(item.ttd)}
                            alt="TTD"
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <PenTool size={28} className="text-gray-300" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div
                        className="text-lg font-bold text-gray-800 group-hover:text-mu-green transition-colors max-w-[280px] truncate"
                        title={item.nama}
                      >
                        {item.nama || '-'}
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <span
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border bg-green-50 text-mu-green border-green-100 inline-block max-w-[220px] truncate"
                        title={item.jabatan}
                      >
                        {item.jabatan || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="inline-flex items-center gap-2 text-gray-500">
                        <Calendar size={16} className="text-mu-green shrink-0" />

                        <span className="text-sm font-semibold italic whitespace-nowrap">
                          {formatTanggal(item.periode_mulai)} - {formatTanggal(item.periode_selesai)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      <div className="flex justify-center items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/struktur-organisasi/edit/${item.struktur_id}`)}
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="Edit Struktur"
                        >
                          <Edit size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          disabled={deleting}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hapus Struktur"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 shadow-sm border border-gray-50">
                        <Network size={40} />
                      </div>

                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                        Data Tidak Ditemukan
                      </p>

                      <p className="text-gray-400 text-sm italic">
                        Coba kata kunci lain atau tambahkan data struktur organisasi.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredStruktur.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Menampilkan{' '}
              <span className="text-mu-green">
                {filteredStruktur.length > 0 ? indexOfFirstItem + 1 : 0}
              </span>{' '}
              -{' '}
              <span className="text-mu-green">
                {Math.min(indexOfLastItem, filteredStruktur.length)}
              </span>{' '}
              dari {filteredStruktur.length} data
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"
              >
                <ChevronLeft size={22} />
              </button>

              <div className="flex gap-2">
                {getPaginationNumbers().map((page) => (
                  <button
                    type="button"
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
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-4 text-gray-300 py-2">
        <div className="h-[1px] w-12 bg-gray-100" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">
          Integrated Database System v3.0
        </p>
        <div className="h-[1px] w-12 bg-gray-100" />
      </div>
    </div>
  );
};

export default DataStruktur;