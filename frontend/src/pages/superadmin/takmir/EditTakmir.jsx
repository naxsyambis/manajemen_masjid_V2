// frontend/src/pages/superadmin/takmir/EditTakmir.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, User, Mail, Lock, Building, AlertCircle, RefreshCcw, CheckCircle, Search, ChevronDown, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const EditTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    masjid_id: ''
  });

  // State untuk Searchable Dropdown
  const [masjids, setMasjids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMasjidName, setSelectedMasjidName] = useState('');
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id]);

  const fetchTakmir = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setFormData({
        nama: data.user?.nama || "",
        email: data.user?.email || "",
        password: '',
        confirmPassword: '',
        masjid_id: data.masjid_id || ""
      });
      setSelectedMasjidName(data.masjid?.nama_masjid || "Masjid terpilih");
    } catch (err) {
      setError('Gagal memuat data takmir.');
    } finally {
      setRefreshing(false);
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

  const filteredMasjids = masjids.filter(m =>
    m.nama_masjid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectMasjid = (masjid) => {
    setFormData({ ...formData, masjid_id: masjid.masjid_id });
    setSelectedMasjidName(masjid.nama_masjid);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const validatePassword = (password) => {
    if (!password) return '';
    const minLength = 8;
    if (password.length < minLength) return 'Minimal 8 karakter.';
    if (!/[A-Z]/.test(password)) return 'Butuh satu huruf besar.';
    if (!/\d/.test(password)) return 'Butuh satu angka.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Butuh karakter khusus.';
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setPasswordError(validatePassword(value));
    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setConfirmPasswordError('Password tidak cocok.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, confirmPassword: value });
    setConfirmPasswordError(value !== formData.password ? 'Password tidak cocok.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSend = { ...formData };
    if (!formData.password) {
      delete dataToSend.password;
      delete dataToSend.confirmPassword;
    }

    try {
      await axios.put(`http://localhost:3000/superadmin/takmir/${id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Takmir berhasil diperbarui! ✅');
      setTimeout(() => navigate('/superadmin/takmir'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengupdate takmir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex overflow-hidden">
      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout} 
        user={user} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="p-8 overflow-y-auto space-y-8">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Edit <span className="text-mu-green">Takmir</span>
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>
            </div>

            <button
              type="button"
              onClick={fetchTakmir}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white shadow-sm hover:bg-gray-50 transition"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          {(successMessage || error) && (
            <div className={`p-4 rounded-xl flex gap-3 border shadow-sm animate-in fade-in duration-300 ${successMessage ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {successMessage ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
              <p className={successMessage ? 'text-green-600' : 'text-red-600'}>{successMessage || error}</p>
            </div>
          )}

          {/* CARD FORM */}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Kolom Kiri: Profil */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b pb-2">Profil Takmir</h3>
                
                <div>
                  <label className="font-semibold flex items-center gap-2">
                    <User size={16} className="text-gray-400" /> Nama Lengkap
                  </label>
                  <input 
                    type="text" 
                    value={formData.nama} 
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
                    className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all" 
                    required 
                  />
                </div>

                <div>
                  <label className="font-semibold flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> Alamat Email
                  </label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all" 
                    required 
                  />
                </div>

                {/* Dropdown Masjid */}
                <div ref={dropdownRef}>
                  <label className="font-semibold flex items-center gap-2">
                    <Building size={16} className="text-gray-400" /> Penempatan Masjid
                  </label>
                  <div className="relative">
                    <div 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full border p-3 rounded-xl mt-2 cursor-pointer flex items-center justify-between bg-white"
                    >
                      <span className={selectedMasjidName ? 'text-gray-700' : 'text-gray-400'}>
                        {selectedMasjidName || "Pilih Masjid..."}
                      </span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border rounded-xl shadow-xl overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                              autoFocus
                              type="text" 
                              placeholder="Cari masjid..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:border-mu-green outline-none"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredMasjids.length > 0 ? (
                            filteredMasjids.map(m => (
                              <div 
                                key={m.masjid_id} 
                                onClick={() => selectMasjid(m)}
                                className="px-4 py-3 hover:bg-mu-green/5 cursor-pointer border-b last:border-0 transition-colors"
                              >
                                <p className="text-sm font-bold text-gray-700">{m.nama_masjid}</p>
                                <p className="text-[10px] text-gray-400 uppercase">{m.alamat}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-400 text-xs italic">Masjid tidak ditemukan</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Keamanan */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b pb-2">Keamanan Akun</h3>
                
                <div>
                  <label className="font-semibold flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" /> Ganti Password (Opsional)
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={handlePasswordChange} 
                      className="w-full border p-3 rounded-xl mt-2 pr-12 outline-none focus:border-mu-green transition-all" 
                      placeholder="Kosongkan jika tidak ganti" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[60%] -translate-y-1/2 text-gray-400 hover:text-mu-green"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{passwordError}</p>}
                </div>

                <div>
                  <label className="font-semibold flex items-center gap-2">
                    <Lock size={16} className="text-gray-400" /> Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={formData.confirmPassword} 
                      onChange={handleConfirmPasswordChange} 
                      className="w-full border p-3 rounded-xl mt-2 pr-12 outline-none focus:border-mu-green transition-all" 
                      placeholder="Ulangi password baru" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-[60%] -translate-y-1/2 text-gray-400 hover:text-mu-green"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPasswordError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{confirmPasswordError}</p>}
                </div>
              </div>
            </div>

            {/* BUTTON SECTION */}
            <div className="flex justify-between items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/superadmin/takmir')}
                className="flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-gray-600 transition-all"
              >
                <ArrowLeft size={16} /> Batal
              </button>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || passwordError || confirmPasswordError}
                  className="px-8 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                  {loading ? 'Menyimpan...' : 'Update Takmir'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTakmir;