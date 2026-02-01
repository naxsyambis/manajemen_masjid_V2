import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Plus, Edit, Trash2, Eye, AlertTriangle, X, DollarSign, Calendar, FileText, Search } from 'lucide-react';

const DataKeuangan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keuangans, setKeuangans] = useState([]);
  const [filteredKeuangans, setFilteredKeuangans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKeuangan, setSelectedKeuangan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMasjid, setSelectedMasjid] = useState('');
  const [masjids, setMasjids] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchMasjids();
  }, []);

  useEffect(() => {
    if (selectedMasjid) {
      fetchKeuangans();
    }
  }, [selectedMasjid]);

  useEffect(() => {
    // Filter keuangans berdasarkan search term
    const filtered = keuangans.filter(keuangan =>
      keuangan.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      keuangan.jumlah.toString().includes(searchTerm)
    );
    setFilteredKeuangans(filtered);
  }, [keuangans, searchTerm]);

  const fetchMasjids = async () => {
    try {
      const res = await axios.get('http://localhost:3000/superadmin/masjid', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasjids(res.data);
      if (res.data.length > 0) {
        setSelectedMasjid(res.data[0].masjid_id); // Default pilih masjid pertama
      }
    } catch (err) {
      console.error('Error fetching masjids:', err);
      alert('Gagal memuat data masjid');
    }
  };

  const fetchKeuangans = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${selectedMasjid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKeuangans(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching keuangans:', err);
      alert('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedKeuangan) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/keuangan/${selectedKeuangan.keuangan_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Data keuangan berhasil dihapus');
      fetchKeuangans();
      setShowDeleteModal(false);
      setSelectedKeuangan(null);
    } catch (err) {
      console.error('Error deleting keuangan:', err);
      alert('Gagal menghapus data keuangan');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (keuangan) => {
    setSelectedKeuangan(keuangan);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedKeuangan(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Data Keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} />
      <div className="hidden lg:block transition-all duration-300 ease-in-out shrink-0 pointer-events-none" style={{ width: isOpen ? '256px' : '80px' }} />
      
      <div className="main-content lg:ml-0 p-6 min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-800 mb-2">Data Keuangan</h1>
              <p className="text-gray-600">Kelola data keuangan masjid dengan mudah dan efisien</p>
            </div>
            <button
              onClick={() => navigate('/superadmin/keuangan/tambah')}
              className="mt-4 sm:mt-0 bg-yellow-500 text-black px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Plus size={24} />
              Tambah Data Keuangan
            </button>
          </div>
          
          {/* Filter Masjid */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Pilih Masjid</label>
            <select
              value={selectedMasjid}
              onChange={(e) => setSelectedMasjid(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green"
            >
              {masjids.map(masjid => (
                <option key={masjid.masjid_id} value={masjid.masjid_id}>{masjid.nama_masjid}</option>
              ))}
            </select>
          </div>
          
          {/* Tabel Modern dan Mewah */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-mu-green p-6 text-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold">Daftar Keuangan</h2>
                  <p className="text-green-100 mt-1">Total: {filteredKeuangans.length} data</p>
                </div>
                <div className="mt-4 sm:mt-0 relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari deskripsi atau jumlah..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-transparent w-full sm:w-64 text-black"
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori ID</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredKeuangans.map((keuangan, index) => (
                    <tr key={keuangan.keuangan_id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <DollarSign size={16} className="text-mu-green" />
                          <span className="text-sm font-semibold text-gray-900">Rp {parseFloat(keuangan.jumlah).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-mu-green" />
                          <span className="text-sm text-gray-900">{new Date(keuangan.tanggal).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-2">
                          <FileText size={16} className="text-mu-green mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-gray-900 max-w-xs truncate">{keuangan.deskripsi || 'Tidak ada deskripsi'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{keuangan.user_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{keuangan.kategori_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/superadmin/keuangan/detail/${keuangan.keuangan_id}`)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors shadow-sm"
                            title="Detail"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/superadmin/keuangan/edit/${keuangan.keuangan_id}`)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(keuangan)}
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
            
            {filteredKeuangans.length === 0 && searchTerm && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Search size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak ada data keuangan ditemukan</h3>
                <p className="text-gray-500">Coba kata kunci lain atau tambahkan data baru.</p>
              </div>
            )}
            
            {filteredKeuangans.length === 0 && !searchTerm && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <DollarSign size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada data keuangan</h3>
                <p className="text-gray-500">Tambahkan data keuangan pertama untuk masjid ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && selectedKeuangan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl flex items-center">
              <AlertTriangle size={32} className="mr-4 animate-pulse" />
              <h1 className="text-2xl font-bold">Konfirmasi Hapus</h1>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus data keuangan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-6 border border-gray-200">
                <h2 className="font-bold text-lg text-gray-800 mb-2">Rp {parseFloat(selectedKeuangan.jumlah).toLocaleString()}</h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Tanggal: {new Date(selectedKeuangan.tanggal).toLocaleDateString()}</p>
                  <p>Deskripsi: {selectedKeuangan.deskripsi}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center font-medium"
                >
                  <X size={20} className="mr-2" />
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Trash2 size={20} className="mr-2" />
                  {deleting ? 'Menghapus...' : 'Hapus Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKeuangan;