// frontend/src/pages/admin/StrukturOrganisasi/DataStruktur.jsx

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
  Network
} from 'lucide-react';

const DataStruktur = () => {
  const [struktur, setStruktur] = useState([]);
  const [filteredStruktur, setFilteredStruktur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStruktur, setSelectedStruktur] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads')) return `http://localhost:3000${foto}`;
    return `http://localhost:3000/uploads/kepengurusan/${foto}`;
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStruktur();
  }, []);

  useEffect(() => {
    const filtered = struktur.filter((item) =>
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStruktur(filtered);
    setCurrentPage(1);
  }, [struktur, searchTerm]);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredStruktur.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStruktur.length / entriesPerPage);

  const fetchStruktur = async () => {
    try {
      setRefreshing(true);
      setError(null);

      if (!masjidId) {
        setError('Masjid ID tidak ditemukan. Silakan logout lalu login ulang.');
        setStruktur([]);
        return;
      }

      const res = await axios.get('http://localhost:3000/takmir/struktur-organisasi', {
        params: {
          masjid_id: masjidId
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setStruktur(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error('Error fetching struktur organisasi:', err);
      setError(err.response?.data?.message || 'Gagal memuat data struktur organisasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedStruktur(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedStruktur(null);
  };

  const handleDelete = async () => {
    if (!selectedStruktur) return;

    setDeleting(true);

    try {
      await axios.delete(
        `http://localhost:3000/takmir/struktur-organisasi/${selectedStruktur.struktur_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Data struktur organisasi berhasil dihapus');
      fetchStruktur();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting struktur organisasi:', err);
      alert(err.response?.data?.message || 'Gagal menghapus data struktur organisasi');
    } finally {
      setDeleting(false);
    }
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">
            Memuat Data Struktur Organisasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
      <div className="main-content p-8 h-full overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Struktur <span className="text-mu-green">Organisasi</span>
            </h1>

            <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <Calendar size={12} className="text-mu-green" />
              <span>
                {time.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="mx-2">•</span>
              <span className="text-mu-green">
                {time.toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={fetchStruktur}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>

            <button
              onClick={() => navigate('/admin/struktur-organisasi/tambah')}
              className="flex items-center gap-2 bg-mu-green text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus size={14} />
              Tambah Struktur
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

        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                  Daftar Struktur
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Total: {filteredStruktur.length} Data
                </p>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
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

            <div className="relative w-full sm:w-64">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Cari nama/jabatan..."
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
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                    Periode
                  </th>
                  <th className="px-8 py-6 text-center text-sm font-black text-gray-700 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentItems.map((item, index) => (
                  <tr
                    key={item.struktur_id}
                    className={`border-t border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                            {item.foto ? (
                            <img
                                src={`http://localhost:3000/uploads/kepengurusan/${item.foto}`}
                                alt={item.nama}
                                className="w-10 h-10 object-cover rounded-full"
                            />
                            ) : (
                            <User size={24} className="text-gray-400" />
                            )}
                        </div>
                        </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.nama}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {item.struktur_id}
                      </div>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.jabatan}
                      </span>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-mu-green" />
                        <span className="text-sm text-gray-900">
                          {formatTanggal(item.periode_mulai)} - {formatTanggal(item.periode_selesai)}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/struktur-organisasi/edit/${item.struktur_id}`)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => openDeleteModal(item)}
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

          {filteredStruktur.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 px-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredStruktur.length)} dari {filteredStruktur.length} data
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-mu-green disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                        currentPage === i + 1
                          ? 'bg-mu-green text-white shadow-lg'
                          : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border border-gray-100 bg-white text-gray-500 hover:text-mu-green disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {filteredStruktur.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Network size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Data tidak ditemukan
              </h3>
              <p className="text-gray-500">
                Coba kata kunci lain atau tambahkan data struktur organisasi.
              </p>
            </div>
          )}
        </div>
      </div>

        {/* Modal Hapus */}
        {showDeleteModal && selectedStruktur &&
        createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex items-center">
                <AlertTriangle size={32} className="mr-4 animate-pulse" />
                <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
                </div>

                <div className="p-6">
                <p className="text-gray-700 mb-6 leading-relaxed">
                    Apakah Anda yakin ingin menghapus data struktur organisasi{' '}
                    <strong>{selectedStruktur.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex justify-end space-x-4">
                    <button
                    onClick={closeDeleteModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium flex items-center"
                    >
                    <X size={20} className="mr-2" />
                    Batal
                    </button>

                    <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 transition-all font-medium flex items-center disabled:opacity-50"
                    >
                    <Trash2 size={20} className="mr-2" />
                    {deleting ? 'Menghapus...' : 'Hapus Data'}
                    </button>
                </div>
                </div>
            </div>
            </div>,
            document.body
        )
        }
    </div>
  );
};

export default DataStruktur;