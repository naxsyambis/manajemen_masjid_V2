// frontend/src/pages/superadmin/program/EditProgram.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, Calendar } from 'lucide-react';

const EditProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [formData, setFormData] = useState({
    nama_program: '',
    jadwal_rutin: '',
    deskripsi: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/program/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        nama_program: res.data.nama_program,
        jadwal_rutin: res.data.jadwal_rutin,
        deskripsi: res.data.deskripsi
      });
    } catch (err) {
      console.error('Error fetching program:', err);
      alert('Gagal memuat data program');
      navigate('/superadmin/program');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/superadmin/program/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Program berhasil diupdate');
      navigate('/superadmin/program');
    } catch (err) {
      console.error('Error updating program:', err);
      alert('Gagal mengupdate program');
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
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Edit Program</h1>
                <p className="text-gray-600 text-lg">Perbarui informasi program dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Informasi Program</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nama Program</label>
                        <input
                          type="text"
                          value={formData.nama_program}
                          onChange={(e) => setFormData({ ...formData, nama_program: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan nama program"
                          required
                        />
                        <p className="text-xs text-gray-500">Isi dengan nama resmi program</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Jadwal Rutin</label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.jadwal_rutin}
                            onChange={(e) => setFormData({ ...formData, jadwal_rutin: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                            placeholder="Masukkan jadwal rutin (e.g., Setiap Jumat)"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">Jadwal rutin pelaksanaan program</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Deskripsi</h2>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Deskripsi</label>
                        <textarea
                          value={formData.deskripsi}
                          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan deskripsi program (opsional)"
                          rows="6"
                        />
                        <p className="text-xs text-gray-500">Berikan penjelasan singkat tentang program</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/program')}
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
                    {loading ? 'Menyimpan...' : 'Update Program'}
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

export default EditProgram;