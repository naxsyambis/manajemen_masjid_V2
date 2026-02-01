// frontend/src/pages/superadmin/berita/EditBerita.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Upload, Save, Image as ImageIcon, FileText, Calendar } from 'lucide-react';

const EditBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    gambar: null // Tambahkan untuk preview gambar saat ini
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchBerita();
  }, [id]);

  const fetchBerita = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        judul: res.data.judul,
        isi: res.data.isi,
        gambar: res.data.gambar // Untuk preview gambar saat ini
      });
    } catch (err) {
      console.error('Error fetching berita:', err);
      alert('Gagal memuat data berita');
      navigate('/superadmin/berita');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('isi', formData.isi);
    if (file) data.append('gambar', file);

    try {
      await axios.put(`http://localhost:3000/superadmin/berita/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Berita berhasil diupdate');
      navigate('/superadmin/berita');
    } catch (err) {
      console.error('Error updating berita:', err);
      alert('Gagal mengupdate berita');
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
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Edit Berita</h1>
                <p className="text-gray-600 text-lg">Perbarui informasi berita dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Gambar Berita</h2>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="gambar-upload"
                        />
                        <label htmlFor="gambar-upload" className="block">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-mu-green transition-colors">
                            {file ? (
                              <div className="space-y-4">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                            ) : formData.gambar ? (
                              <div className="space-y-4">
                                <img src={`http://localhost:3000${formData.gambar}`} alt="Current Gambar" className="w-24 h-24 object-cover rounded-lg mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Gambar Saat Ini</p>
                                  <p className="text-xs text-gray-500">Klik untuk ganti</p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <Upload size={48} className="text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Klik untuk upload gambar</p>
                                  <p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                        <p className="text-xs text-gray-500">Upload foto gambar berita baru</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Informasi Berita</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Judul Berita</label>
                        <input
                          type="text"
                          value={formData.judul}
                          onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan judul berita"
                          required
                        />
                        <p className="text-xs text-gray-500">Isi dengan judul resmi berita</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Isi Berita</label>
                        <textarea
                          value={formData.isi}
                          onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan isi berita"
                          rows="6"
                          required
                        />
                        <p className="text-xs text-gray-500">Berikan isi berita lengkap</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/berita')}
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
                    {loading ? 'Menyimpan...' : 'Update Berita'}
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

export default EditBerita;