// frontend/src/pages/superadmin/masjid/TambahMasjid.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Upload, Save, Image as ImageIcon, Phone } from 'lucide-react';

const TambahMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [formData, setFormData] = useState({
    nama_masjid: '',
    alamat: '',
    no_hp: '',
    deskripsi: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('nama_masjid', formData.nama_masjid);
    data.append('alamat', formData.alamat);
    data.append('no_hp', formData.no_hp);
    data.append('deskripsi', formData.deskripsi);
    if (file) data.append('logo_foto', file);

    try {
      await axios.post('http://localhost:3000/superadmin/masjid', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Masjid berhasil ditambahkan');
      navigate('/superadmin/masjid');
    } catch (err) {
      console.error('Error adding masjid:', err);
      alert('Gagal menambahkan masjid');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="super-admin-dashboard min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex"> {/* Ubah ke flex layout */}
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} /> {/* Pass setIsHovered dan isExpanded ke sidebar */}
      
      <div className="flex-1 flex flex-col"> {/* Main container untuk navbar dan content */}
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} /> {/* Navbar tetap di atas */}
        
        <div className="main-content p-6 min-h-screen overflow-y-auto"> {/* Content area */}
          <div className="max-w-6xl mx-auto">
            
            {/* Form Container - 1 Card dengan 2 Kolom */}
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Tambah Masjid Baru</h1>
                <p className="text-gray-600 text-lg">Isi informasi masjid dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* Kolom Kiri: Upload Logo dan No HP */}
                  <div className="space-y-8">
                    {/* Section Upload Logo */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Logo Masjid</h2>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="block">
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
                                  <p className="text-sm font-medium text-gray-700">Klik untuk upload logo</p>
                                  <p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                        <p className="text-xs text-gray-500">Upload foto logo masjid</p>
                      </div>
                    </div>
                    
                    {/* Section No HP */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Kontak</h2>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">No HP</label>
                        <div className="relative">
                          <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.no_hp}
                            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            placeholder="Masukkan nomor HP"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Nomor yang bisa dihubungi</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kolom Kanan: Nama, Alamat, Deskripsi */}
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Informasi Masjid</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nama Masjid</label>
                        <input
                          type="text"
                          value={formData.nama_masjid}
                          onChange={(e) => setFormData({ ...formData, nama_masjid: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan nama masjid"
                          required
                        />
                        <p className="text-xs text-gray-500">Isi dengan nama resmi masjid</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Alamat</label>
                        <textarea
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan alamat lengkap"
                          rows="3"
                          required
                        />
                        <p className="text-xs text-gray-500">Sertakan nama jalan dan wilayah</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Deskripsi</label>
                        <textarea
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan deskripsi masjid (opsional)"
                          rows="4"
                        />
                        <p className="text-xs text-gray-500">Berikan penjelasan singkat</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tombol Aksi - Di Bawah */}
                <div className="flex justify-end space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/masjid')}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-mu-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} className="mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan Masjid'}
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

export default TambahMasjid;