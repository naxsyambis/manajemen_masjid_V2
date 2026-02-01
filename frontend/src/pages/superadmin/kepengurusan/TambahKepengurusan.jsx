// frontend/src/pages/superadmin/kepengurusan/TambahKepengurusan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Upload, Save, User, Calendar, RefreshCcw, AlertCircle } from 'lucide-react';

const TambahKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_lengkap || !formData.jabatan || !formData.periode_mulai || !formData.periode_selesai) {
      alert('Harap isi semua field yang diperlukan.');
      return;
    }
    if (file && file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3MB.');
      return;
    }
    setLoading(true);
    setError(null);
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
      setError('Gagal menambahkan pengurus. Silakan coba lagi.');
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
    <div className="tambah-kepengurusan h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Tambah <span className="text-mu-green">Pengurus</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
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
          
          {/* Form Container */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Form Tambah Pengurus</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Isi informasi pengurus dengan lengkap dan akurat
                </p>
              </div>
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
                          value={formData.nama_lengkap}
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
                        value={formData.jabatan}
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
                          value={formData.periode_mulai}
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
                          value={formData.periode_selesai}
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
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-mu-green text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Save size={20} className="mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan Pengurus'}
                </button>
              </div>
            </form>
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

export default TambahKepengurusan;