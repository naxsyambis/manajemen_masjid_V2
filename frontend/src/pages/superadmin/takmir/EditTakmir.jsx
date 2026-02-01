// frontend/src/pages/superadmin/takmir/EditTakmir.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, User, Mail, Building } from 'lucide-react';

const EditTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Tambahkan state untuk hover sidebar
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    masjid_id: ''
  });
  const [masjids, setMasjids] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered; // Hitung apakah sidebar expanded berdasarkan isOpen atau isHovered

  useEffect(() => {
    fetchTakmir();
    fetchMasjids();
  }, [id]);

  const fetchTakmir = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        nama: res.data.user?.nama || "",
        email: res.data.user?.email || "",
        masjid_id: res.data.masjid_id || ""
      });

    } catch (err) {
      console.error('Error fetching takmir:', err);
      alert('Gagal memuat data takmir');
      navigate('/superadmin/takmir');
    }
  };

  const fetchMasjids = async () => {
    try {
      const res = await axios.get('http://localhost:3000/superadmin/masjid', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMasjids(res.data);
    } catch (err) {
      console.error('Error fetching masjids:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/superadmin/takmir/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Takmir berhasil diupdate');
      navigate('/superadmin/takmir');
    } catch (err) {
      console.error('Error updating takmir:', err);
      alert('Gagal mengupdate takmir');
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-3">Edit Takmir</h1>
                <p className="text-gray-600 text-lg">Perbarui informasi takmir dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nama</label>
                      <div className="relative">
                        <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan nama takmir"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                      <div className="relative">
                        <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          placeholder="Masukkan email takmir"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Masjid</label>
                      <div className="relative">
                        <Building size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          value={formData.masjid_id}
                          onChange={(e) => setFormData({ ...formData, masjid_id: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-colors"
                          required
                        >
                          <option value="">Pilih Masjid</option>
                          {masjids.map(masjid => (
                            <option key={masjid.masjid_id} value={masjid.masjid_id}>{masjid.nama_masjid}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-10 mt-10 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/takmir')}
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
                    {loading ? 'Menyimpan...' : 'Update Takmir'}
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

export default EditTakmir;