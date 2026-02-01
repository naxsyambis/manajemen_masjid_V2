// frontend/src/pages/superadmin/kepengurusan/TambahKepengurusan.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Upload, Save, User, Calendar } from 'lucide-react';

const TambahKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [formData, setFormData] = useState({
    nama_lengkap: '',  // Default string kosong untuk menghindari 
    jabatan: '',
    periode_mulai: '',
    periode_selesai: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi sederhana: pastikan semua field terisi
    if (!formData.nama_lengkap || !formData.jabatan || !formData.periode_mulai || !formData.periode_selesai) {
      alert('Harap isi semua field yang diperlukan.');
      return;
    }
    // Validasi file size (opsional, backend sudah ada limit 3MB)
    if (file && file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3MB.');
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append('nama_lengkap', formData.nama_lengkap);
    data.append('jabatan', formData.jabatan);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);
    if (file) data.append('foto_pengurus', file);

    try {
      await axios.post('http://localhost:3000/superadmin/kepengurusan', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pengurus berhasil ditambahkan');
      // Reset form setelah berhasil
      setFormData({
        nama_lengkap: '',
        jabatan: '',
        periode_mulai: '',
        periode_selesai: ''
      });
      setFile(null);
      navigate('/superadmin/kepengurusan');
    } catch (err) {
      console.error('Error adding pengurus:', err);
      alert('Gagal menambahkan pengurus. Periksa koneksi atau data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3MB.');
      return;
    }
    setFile(selectedFile);
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
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Tambah Pengurus Baru</h1>
                <p className="text-gray-600 text-lg">Isi informasi pengurus dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Foto Pengurus</h2>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="foto-upload"
                        />
                        <label htmlFor="foto-upload" className="block">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-mu-green transition-colors">
                            {file ? (
                              <div className="space-y-4">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Upload size={48} className="text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Klik untuk upload foto</p>
                                  <p className="text-xs text-gray-500">PNG, JPG hingga 3MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                        <p className="text-xs text-gray-500">Upload foto pengurus (opsional)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Informasi Pengurus</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nama Lengkap</label>
                        <div className="relative">
                          <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.nama_lengkap}  // Selalu string, tidak undefined
                            onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            placeholder="Masukkan nama lengkap"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Isi dengan nama resmi pengurus</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Jabatan</label>
                        <input
                          type="text"
                          value={formData.jabatan}  // Selalu string
                          onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan jabatan"
                          required
                        />
                        <p className="text-xs text-gray-500">Contoh: Ketua, Sekretaris, dll.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Periode Mulai</label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            value={formData.periode_mulai}  // Selalu string
                            onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Tanggal mulai periode jabatan</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Periode Selesai</label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            value={formData.periode_selesai}  // Selalu string
                            onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Tanggal selesai periode jabatan</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/kepengurusan')}
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
                    {loading ? 'Menyimpan...' : 'Simpan Pengurus'}
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

export default TambahKepengurusan;