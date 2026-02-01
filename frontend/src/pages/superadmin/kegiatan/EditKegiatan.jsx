// frontend/src/pages/superadmin/kegiatan/EditKegiatan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, Calendar, MapPin } from 'lucide-react';

const EditKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    waktu_kegiatan: '',
    lokasi: '',
    deskripsi: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchKegiatan();
  }, [id]);

  const fetchKegiatan = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        nama_kegiatan: res.data.nama_kegiatan,
        waktu_kegiatan: res.data.waktu_kegiatan ? new Date(res.data.waktu_kegiatan).toISOString().slice(0, 16) : '',
        lokasi: res.data.lokasi,
        deskripsi: res.data.deskripsi
      });
    } catch (err) {
      console.error('Error fetching kegiatan:', err);
      alert('Gagal memuat data kegiatan');
      navigate('/superadmin/kegiatan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/superadmin/kegiatan/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Kegiatan berhasil diupdate');
      navigate('/superadmin/kegiatan');
    } catch (err) {
      console.error('Error updating kegiatan:', err);
      alert('Gagal mengupdate kegiatan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Edit Kegiatan</h1>
                <p className="text-gray-600 text-lg">Perbarui informasi kegiatan dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Informasi Kegiatan</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nama Kegiatan</label>
                        <input
                          type="text"
                          value={formData.nama_kegiatan}
                          onChange={(e) => setFormData({ ...formData, nama_kegiatan: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan nama kegiatan"
                          required
                        />
                        <p className="text-xs text-gray-500">Isi dengan nama resmi kegiatan</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Waktu Kegiatan</label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="datetime-local"
                            value={formData.waktu_kegiatan}
                            onChange={(e) => setFormData({ ...formData, waktu_kegiatan: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Pilih tanggal dan waktu kegiatan</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Detail Kegiatan</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Lokasi</label>
                        <div className="relative">
                          <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.lokasi}
                            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            placeholder="Masukkan lokasi kegiatan"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Sertakan nama tempat atau alamat</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Deskripsi</label>
                        <textarea
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan deskripsi kegiatan (opsional)"
                          rows="4"
                        />
                        <p className="text-xs text-gray-500">Berikan penjelasan singkat tentang kegiatan</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/kegiatan')}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-colors flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} className="mr-2" />
                    {loading ? 'Menyimpan...' : 'Update Kegiatan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditKegiatan;