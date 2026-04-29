import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, User, Mail, Lock, Building, Calendar, AlertCircle, RefreshCcw, CheckCircle, Search, ChevronDown, Eye, EyeOff, ArrowLeft } from 'lucide-react';

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
      // Set nama masjid awal untuk ditampilkan di dropdown
      setSelectedMasjidName(data.masjid?.nama_masjid || "Masjid terpilih");
    } catch (err) {
      setError('Gagal memuat data takmir.');
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
    if (!password) return ''; // Boleh kosong saat edit
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
      setSuccessMessage('Takmir berhasil diperbarui!');
      setTimeout(() => navigate('/superadmin/takmir'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengupdate takmir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-takmir h-screen bg-gray-50 flex overflow-hidden">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button 
                onClick={() => navigate('/superadmin/takmir')}
                className="flex items-center gap-2 text-mu-green font-bold text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all"
              >
                <ArrowLeft size={16} /> Kembali ke Daftar
              </button>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Edit <span className="text-mu-green">Takmir</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-mu-green font-black ml-2">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
          </div>

          {(successMessage || error) && (
            <div className={`rounded-2xl p-6 flex items-center gap-4 shadow-lg animate-in fade-in zoom-in duration-300 ${successMessage ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {successMessage ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
              <div>
                <p className={`font-bold ${successMessage ? 'text-green-700' : 'text-red-700'}`}>{successMessage ? 'Berhasil' : 'Error'}</p>
                <p className={`text-sm ${successMessage ? 'text-green-600' : 'text-red-600'}`}>{successMessage || error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 lg:p-16">
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Kolom Kiri: Profil */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Profil Takmir</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Alamat Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" required />
                      </div>
                    </div>

                    {/* Searchable Dropdown Masjid */}
                    <div className="space-y-2" ref={dropdownRef}>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pilih Masjid</label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full pl-12 pr-10 py-4 bg-gray-50 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${isDropdownOpen ? 'border-mu-green ring-4 ring-mu-green/10' : 'border-gray-200'}`}
                        >
                          <Building size={18} className="absolute left-4 text-gray-400" />
                          <span className={selectedMasjidName ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                            {selectedMasjidName || "Cari & Pilih Masjid..."}
                          </span>
                          <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                            <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                              <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                  autoFocus
                                  type="text" 
                                  placeholder="Ketik nama masjid..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:border-mu-green outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filteredMasjids.length > 0 ? (
                                filteredMasjids.map(m => (
                                  <div 
                                    key={m.masjid_id} 
                                    onClick={() => selectMasjid(m)}
                                    className="px-4 py-3 hover:bg-mu-green/5 cursor-pointer flex flex-col transition-colors border-b border-gray-50 last:border-0"
                                  >
                                    <span className="text-sm font-bold text-gray-700">{m.nama_masjid}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{m.alamat}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-8 text-center text-gray-400 text-xs italic">Masjid tidak ditemukan</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Keamanan */}
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Keamanan Akun</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ganti Password (Opsional)</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password} 
                          onChange={handlePasswordChange} 
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" 
                          placeholder="Kosongkan jika tidak ganti" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-mu-green transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordError && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{passwordError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={formData.confirmPassword} 
                          onChange={handleConfirmPasswordChange} 
                          className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" 
                          placeholder="Ulangi password baru" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-mu-green transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {confirmPasswordError && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{confirmPasswordError}</p>}
                    </div>
                  </div>
                </div>

                {/* Submit Button Section */}
                <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/superadmin/takmir')}
                    className="px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || passwordError || confirmPasswordError}
                    className="group relative flex items-center gap-3 bg-mu-green text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-mu-green/20 hover:bg-mu-green/90 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCcw size={20} className="animate-spin" />
                    ) : (
                      <Save size={20} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>{loading ? 'Menyimpan...' : 'Perbarui Data'}</span>
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