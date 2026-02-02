// frontend/src/pages/superadmin/masjid/EditMasjid.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Upload, Save, Image as ImageIcon, Phone, Calendar, RefreshCcw, AlertCircle } from 'lucide-react';

const EditMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    nama_masjid: '',
    alamat: '',
    no_hp: '',
    deskripsi: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMasjid();
  }, [id]);

  const fetchMasjid = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        nama_masjid: res.data.nama_masjid,
        alamat: res.data.alamat,
        no_hp: res.data.no_hp,
        deskripsi: res.data.deskripsi
      });
    } catch (err) {
      console.error('Error fetching masjid:', err);
      setError('Gagal memuat data masjid. Silakan coba lagi.');
      navigate('/superadmin/masjid');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = new FormData();
    data.append('nama_masjid', formData.nama_masjid);
    data.append('alamat', formData.alamat);
    data.append('no_hp', formData.no_hp);
    data.append('deskripsi', formData.deskripsi);
    if (file) data.append('logo_foto', file);

    try {
      await axios.put(`http://localhost:3000/superadmin/masjid/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Masjid berhasil diupdate');
      navigate('/superadmin/masjid');
    } catch (err) {
      console.error('Error updating masjid:', err);
      setError('Gagal mengupdate masjid. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRefresh = () => {
    fetchMasjid();
  };

  return (
    <div className="edit-masjid h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Edit <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Memuat...' : 'Refresh Data'}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {/* Form Edit Masjid Modern dan Elegan */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Edit Masjid</h2>
                <p className="text-gray-600 text-lg">Perbarui informasi masjid dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Logo Masjid</h3>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="block">
                          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg hover:shadow-xl">
                            {file ? (
                              <div className="space-y-6">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                            ) : formData.logo_foto ? (
                              <div className="space-y-6">
                                <img src={`http://localhost:3000${formData.logo_foto}`} alt="Current Logo" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-700">Logo Saat Ini</p>
                                  <p className="text-sm text-gray-500">Klik untuk ganti</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <Upload size={64} className="text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-lg font-semibold text-gray-700">Klik untuk upload logo</p>
                                  <p className="text-sm text-gray-500">PNG, JPG hingga 5MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                        <p className="text-sm text-gray-500">Upload foto logo masjid baru</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Kontak</h3>
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">No HP</label>
                        <div className="relative">
                          <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.no_hp}
                            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            placeholder="Masukkan nomor HP"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-500">Nomor yang bisa dihubungi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Masjid</h3>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Masjid</label>
                        <input
                          type="text"
                          value={formData.nama_masjid}
                          onChange={(e) => setFormData({ ...formData, nama_masjid: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan nama masjid"
                          required
                        />
                        <p className="text-sm text-gray-500">Isi dengan nama resmi masjid</p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Alamat</label>
                        <textarea
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm resize-none"
                          placeholder="Masukkan alamat lengkap"
                          rows="4"
                          required
                        />
                        <p className="text-sm text-gray-500">Sertakan nama jalan dan wilayah</p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Deskripsi</label>
                        <textarea
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm resize-none"
                          placeholder="Masukkan deskripsi masjid (opsional)"
                          rows="6"
                        />
                        <p className="text-sm text-gray-500">Berikan penjelasan singkat</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tombol Aksi dengan Efek Hover */}
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/masjid')}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-8 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={22} className="mr-3" />
                    {loading ? 'Menyimpan...' : 'Update Masjid'}
                  </button>
                </div>
              </form>
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

export default EditMasjid;