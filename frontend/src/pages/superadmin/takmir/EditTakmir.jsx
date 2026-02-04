// frontend/src/pages/superadmin/takmir/EditTakmir.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, User, Mail, Lock, Building, Calendar, AlertCircle, RefreshCcw, CheckCircle } from 'lucide-react';

const EditTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '', // Tambahan untuk konfirmasi password
    masjid_id: ''
  });
  const [masjids, setMasjids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(''); // State untuk error password
  const [confirmPasswordError, setConfirmPasswordError] = useState(''); // State untuk error konfirmasi password
  const [successMessage, setSuccessMessage] = useState(''); // State untuk notifikasi sukses
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTakmir();
    fetchMasjids();
  }, [id]);

  const fetchTakmir = async () => {
    try {
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        nama: res.data.user?.nama || "",
        email: res.data.user?.email || "",
        password: '', // Password tidak diambil dari response untuk keamanan
        confirmPassword: '', // Kosongkan konfirmasi
        masjid_id: res.data.masjid_id || ""
      });
    } catch (err) {
      console.error('Error fetching takmir:', err);
      setError('Gagal memuat data takmir. Silakan coba lagi.');
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

  // Fungsi validasi password dengan constraint lebih ketat
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password harus minimal 8 karakter.';
    }
    if (!hasUpperCase) {
      return 'Password harus mengandung setidaknya satu huruf besar.';
    }
    if (!hasLowerCase) {
      return 'Password harus mengandung setidaknya satu huruf kecil.';
    }
    if (!hasNumbers) {
      return 'Password harus mengandung setidaknya satu angka.';
    }
    if (!hasSpecialChar) {
      return 'Password harus mengandung setidaknya satu karakter khusus (!@#$%^&*).';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    const error = validatePassword(value);
    setPasswordError(error);
    // Validasi konfirmasi jika sudah diisi
    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setConfirmPasswordError('Password dan konfirmasi password tidak cocok.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, confirmPassword: value });
    if (value !== formData.password) {
      setConfirmPasswordError('Password dan konfirmasi password tidak cocok.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    // Validasi password jika diisi
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (passwordValidation) {
        setError(passwordValidation);
        setLoading(false);
        return;
      }
      // Validasi konfirmasi password
      if (formData.password !== formData.confirmPassword) {
        setError('Password dan konfirmasi password tidak cocok.');
        setLoading(false);
        return;
      }
    }

    // Jika password kosong, hapus dari formData agar tidak dikirim
    const dataToSend = { ...formData };
    if (!formData.password) {
      delete dataToSend.password;
      delete dataToSend.confirmPassword;
    }

    try {
      await axios.put(`http://localhost:3000/superadmin/takmir/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Takmir berhasil diupdate!');
      setPasswordError('');
      setConfirmPasswordError('');
      // Auto navigate setelah beberapa detik
      setTimeout(() => {
        navigate('/superadmin/takmir');
      }, 2000);
    } catch (err) {
      console.error('Error updating takmir:', err);
      setError('Gagal mengupdate takmir. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="edit-takmir h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex animate-fadeIn">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Edit <span className="text-mu-green">Takmir</span>
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
                className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg"
              >
                <RefreshCcw size={14} />
                Refresh Halaman
              </button>
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
              <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-700 font-medium">Berhasil</p>
                <p className="text-green-600 text-sm mt-1">{successMessage}</p>
              </div>
            </div>
          )}
          
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
          
          {/* Form Edit Takmir Modern dan Elegan */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="p-10 lg:p-16">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Edit Takmir</h2>
                <p className="text-gray-600 text-lg">Perbarui informasi takmir dengan lengkap dan akurat</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Takmir</h3>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Nama</label>
                        <div className="relative">
                          <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            placeholder="Masukkan nama takmir"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-500">Isi dengan nama lengkap takmir</p>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Email</label>
                        <div className="relative">
                          <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            placeholder="Masukkan email takmir"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-500">Email yang valid untuk komunikasi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Detail Takmir</h3>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            value={formData.password}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            placeholder="Masukkan password baru (opsional)"
                          />
                        </div>
                        <p className="text-sm text-gray-500">Biarkan kosong jika tidak ingin mengubah password. Jika diisi, minimal 8 karakter dengan huruf besar, kecil, angka, dan karakter khusus</p>
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Konfirmasi Password</label>
                        <div className="relative">
                          <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            placeholder="Konfirmasi password baru (opsional)"
                          />
                        </div>
                        <p className="text-sm text-gray-500">Ulangi password untuk konfirmasi jika mengubah password</p>
                        {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Masjid</label>
                        <div className="relative">
                          <Building size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <select
                            value={formData.masjid_id}
                            onChange={(e) => setFormData({ ...formData, masjid_id: e.target.value })}
                            className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                            required
                          >
                            <option value="">Pilih Masjid</option>
                            {masjids.map(masjid => (
                              <option key={masjid.masjid_id} value={masjid.masjid_id}>{masjid.nama_masjid}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-sm text-gray-500">Pilih masjid yang dikelola takmir</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tombol Aksi dengan Efek Hover */}
                <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/takmir')}
                    className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || passwordError || confirmPasswordError}
                    className="flex items-center px-8 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={22} className="mr-3" />
                    {loading ? 'Menyimpan...' : 'Update Takmir'}
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

export default EditTakmir;