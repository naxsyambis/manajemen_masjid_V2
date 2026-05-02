import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Save, User, Mail, Lock, Building, Calendar, 
  RefreshCcw, Search, ChevronDown, Eye, EyeOff, ArrowLeft,
  X, AlertTriangle, CheckCircle2, XCircle, Info 
} from 'lucide-react';

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";

  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;

  const iconClass = isSuccess ? "bg-green-100 text-green-600" : 
                    isError ? "bg-red-100 text-red-600" : 
                    isWarning ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600";

  const buttonClass = isSuccess ? "bg-green-600 hover:bg-green-700 text-white" : 
                      isError ? "bg-red-600 hover:bg-red-700 text-white" : 
                      isWarning ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green" : "bg-mu-green hover:bg-green-700 text-white";

  const handleConfirm = () => {
    if (alertData.onConfirm) alertData.onConfirm();
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
          <X size={20} />
        </button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}>
            <Icon size={42} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={handleConfirm} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
            {alertData.confirmText || "Mengerti"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const TambahTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    masjid_id: ''
  });

  const [masjids, setMasjids] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMasjidName, setSelectedMasjidName] = useState('');
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [time, setTime] = useState(new Date());
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = ({ type = "info", title = "Informasi", message = "", confirmText = "", onConfirm = null }) => {
    setAlertData({ show: true, type, title, message, confirmText, onConfirm });
  };

  const closePopup = () => {
    setAlertData({ ...alertData, show: false });
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMasjids();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    m.nama_masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectMasjid = (masjid) => {
    setFormData({ ...formData, masjid_id: masjid.masjid_id });
    setSelectedMasjidName(masjid.nama_masjid);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const validatePassword = (password) => {
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
    if (formData.confirmPassword && value !== formData.password) {
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
    if (!formData.masjid_id) {
      showPopup({ type: "warning", title: "Masjid Belum Dipilih", message: "Silakan pilih masjid terlebih dahulu sebelum menyimpan data." });
      return;
    }
    if (passwordError || confirmPasswordError) {
      showPopup({ type: "warning", title: "Kesalahan Password", message: "Pastikan password memenuhi kriteria dan konfirmasi password cocok." });
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/superadmin/takmir', {
        nama: formData.nama,
        email: formData.email,
        password: formData.password,
        masjid_id: formData.masjid_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showPopup({ type: "success", title: "Berhasil!", message: "Akun Takmir berhasil ditambahkan ke sistem.", onConfirm: () => navigate('/superadmin/takmir') });
    } catch (err) {
      showPopup({ type: "error", title: "Gagal Menyimpan", message: err.response?.data?.message || "Terjadi kesalahan saat menambahkan takmir." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-takmir h-screen bg-gray-50 flex overflow-hidden">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-8 h-full overflow-y-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button onClick={() => navigate('/superadmin/takmir')} className="flex items-center gap-2 text-mu-green font-bold text-xs uppercase tracking-widest mb-4 hover:gap-3 transition-all">
                <ArrowLeft size={16} /> Kembali ke Daftar
              </button>
              <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Tambah <span className="text-mu-green">Takmir</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                <Calendar size={12} className="text-mu-green" />
                <span>{time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-mu-green font-black ml-2">{time.toLocaleTimeString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 lg:p-16">
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Profil Takmir</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" placeholder="Contoh: Ahmad Subarjo" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Alamat Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" placeholder="takmir@example.com" required />
                      </div>
                    </div>

                    <div className="space-y-2" ref={dropdownRef}>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Pilih Masjid</label>
                      <div className="relative">
                        <div 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full pl-12 pr-10 py-4 bg-gray-50 border rounded-2xl cursor-pointer flex items-center justify-between transition-all ${isDropdownOpen ? 'border-mu-green ring-4 ring-mu-green/10 bg-white' : 'border-gray-200'}`}
                        >
                          <Building size={18} className={`absolute left-4 transition-colors ${isDropdownOpen ? 'text-mu-green' : 'text-gray-400'}`} />
                          <span className={selectedMasjidName ? 'text-gray-700 font-bold text-sm' : 'text-gray-400'}>
                            {selectedMasjidName || "Cari & Pilih Masjid..."}
                          </span>
                          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                              <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-mu-green" />
                                <input 
                                  autoFocus
                                  type="text" 
                                  placeholder="Ketik nama atau alamat..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-mu-green/20 focus:border-mu-green outline-none transition-all"
                                />
                              </div>
                            </div>
                            <div className="max-h-72 overflow-y-auto py-2 px-2 custom-scrollbar">
                              {filteredMasjids.length > 0 ? (
                                filteredMasjids.map((m) => (
                                  <div 
                                    key={m.masjid_id} 
                                    onClick={() => selectMasjid(m)}
                                    className="group px-5 py-4 hover:bg-mu-green/5 rounded-2xl cursor-pointer flex items-center justify-between transition-all"
                                  >
                                    <div className="flex flex-col pr-4">
                                      <span className="text-sm font-bold text-gray-700 group-hover:text-mu-green transition-colors line-clamp-1">
                                        {m.nama_masjid}
                                      </span>
                                      <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 line-clamp-1">
                                        {m.alamat}
                                      </span>
                                    </div>
                                    {formData.masjid_id === m.masjid_id && (
                                      <CheckCircle2 size={16} className="text-mu-green shrink-0" />
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                                  <div className="bg-gray-50 p-3 rounded-full mb-3">
                                    <Search size={24} className="text-gray-300" />
                                  </div>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Masjid tidak ditemukan
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Keamanan Akun</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={handlePasswordChange} className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-mu-green transition-colors">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {passwordError && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{passwordError}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Konfirmasi Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleConfirmPasswordChange} className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all outline-none" placeholder="••••••••" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-mu-green transition-colors">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {confirmPasswordError && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{confirmPasswordError}</p>}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={loading} className="group relative flex items-center gap-3 bg-mu-green text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-mu-green/20 hover:bg-mu-green/90 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                    <span>{loading ? 'Menyimpan...' : 'Simpan Data Takmir'}</span>
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

export default TambahTakmir;