import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import {
  Upload,
  Save,
  User,
  Calendar,
  RefreshCcw,
  AlertCircle,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eraser
} from 'lucide-react';

const bulanIndonesia = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const hariIndonesia = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const formatDateKey = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatTanggalIndo = (dateKey) => {
  if (!dateKey) return 'Pilih tanggal';
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';

  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;
  const iconClass = isSuccess ? 'bg-green-100 text-green-600' : isError ? 'bg-red-100 text-red-600' : isWarning ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600';
  const buttonClass = isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : isError ? 'bg-red-600 hover:bg-red-700 text-white' : isWarning ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green' : 'bg-mu-green hover:bg-green-700 text-white';

  return createPortal(
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
          <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>
            {alertData.confirmText || 'Mengerti'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CustomCalendarInput = ({ label, value, onChange, minDate = '', maxDate = '' }) => {
  const selectedDate = value ? parseDateKey(value) : new Date();
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeMonth, setActiveMonth] = useState(selectedDate.getMonth());
  const [activeYear, setActiveYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    if (value) {
      const date = parseDateKey(value);
      setActiveMonth(date.getMonth());
      setActiveYear(date.getFullYear());
    }
  }, [value]);

  const days = useMemo(() => {
    const firstDay = new Date(activeYear, activeMonth, 1);
    const lastDay = new Date(activeYear, activeMonth + 1, 0);
    const startDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthLastDate = new Date(activeYear, activeMonth, 0).getDate();
    const calendarDays = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      calendarDays.push({ date: new Date(activeYear, activeMonth - 1, prevMonthLastDate - i), isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({ date: new Date(activeYear, activeMonth, day), isCurrentMonth: true });
    }
    while (calendarDays.length < 42) {
      const nextDay = calendarDays.length - (startDayIndex + daysInMonth) + 1;
      calendarDays.push({ date: new Date(activeYear, activeMonth + 1, nextDay), isCurrentMonth: false });
    }
    return calendarDays;
  }, [activeMonth, activeYear]);

  const todayKey = formatDateKey(new Date());
  const handlePrevMonth = () => activeMonth === 0 ? (setActiveMonth(11), setActiveYear(y => y - 1)) : setActiveMonth(m => m - 1);
  const handleNextMonth = () => activeMonth === 11 ? (setActiveMonth(0), setActiveYear(y => y + 1)) : setActiveMonth(m => m + 1);
  const isDisabledDate = (dateKey) => (minDate && new Date(dateKey) < new Date(minDate)) || (maxDate && new Date(dateKey) > new Date(maxDate));
  const handlePickDate = (dateKey) => { if (!isDisabledDate(dateKey)) { onChange(dateKey); setShowCalendar(false); } };

  return (
    <div className="relative">
      <button type="button" onClick={() => setShowCalendar(true)} className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm text-left">
        <span className={value ? 'text-gray-700' : 'text-gray-400'}>{value ? formatTanggalIndo(value) : 'Pilih tanggal'}</span>
      </button>
      <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      {showCalendar && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowCalendar(false)} />
          <div className="relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
            <div className="p-6 bg-mu-green text-white flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{label}</h3>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">Pilih tanggal periode</p>
              </div>
              <button type="button" onClick={() => setShowCalendar(false)} className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button type="button" onClick={handlePrevMonth} className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-mu-green hover:text-white transition-all flex items-center justify-center"><ChevronLeft size={22} /></button>
                <div className="text-center">
                  <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{bulanIndonesia[activeMonth]}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{activeYear}</p>
                </div>
                <button type="button" onClick={handleNextMonth} className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-mu-green hover:text-white transition-all flex items-center justify-center"><ChevronRight size={22} /></button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {hariIndonesia.map(day => <div key={day} className="h-9 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {days.map((item, index) => {
                  const dateKey = formatDateKey(item.date);
                  const isSelected = value === dateKey;
                  const isToday = todayKey === dateKey;
                  const disabled = isDisabledDate(dateKey);
                  return (
                    <button key={index} type="button" disabled={disabled} onClick={() => handlePickDate(dateKey)}
                      className={`h-11 rounded-xl text-xs font-black transition-all ${disabled ? 'text-gray-200 cursor-not-allowed' : isSelected ? 'bg-mu-green text-white scale-105' : isToday ? 'bg-green-50 text-mu-green border border-mu-green/20' : item.isCurrentMonth ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-200'}`}>
                      {item.date.getDate()}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => { onChange(''); setShowCalendar(false); }} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Kosongkan</button>
                <button type="button" onClick={() => setShowCalendar(false)} className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100">Selesai</button>
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

const TambahStruktur = () => {
  const [formData, setFormData] = useState({ nama: '', jabatan: '', periode_mulai: '', periode_selesai: '' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // TTD Logic
  const [ttdMode, setTtdMode] = useState('upload'); // 'upload' | 'canvas'
  const [fileTtd, setFileTtd] = useState(null);
  const [previewTtdUrl, setPreviewTtdUrl] = useState(null);
  const sigPad = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => {
    const callback = alertData.onConfirm;
    setAlertData({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });
    if (callback) setTimeout(callback, 100);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      showPopup({ type: 'warning', title: 'File Tidak Valid', message: 'File harus berupa gambar.' });
      return;
    }
    if (selectedFile.size > 3 * 1024 * 1024) {
      showPopup({ type: 'warning', title: 'Ukuran Terlalu Besar', message: 'Ukuran file maksimal 3MB.' });
      return;
    }

    if (type === 'foto') {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (type === 'ttd') {
      setFileTtd(selectedFile);
      setPreviewTtdUrl(URL.createObjectURL(selectedFile));
      setTtdMode('upload');
    }
  };

  const clearCanvas = () => {
    sigPad.current?.clear();
    setFileTtd(null);
    setPreviewTtdUrl(null);
  };

  const handleCanvasEnd = () => {
    if (sigPad.current.isEmpty()) return;
    
    const canvas = sigPad.current.getCanvas();
    canvas.toBlob((blob) => {
      const file = new File([blob], `ttd_canvas_${Date.now()}.png`, { type: "image/png" });
      setFileTtd(file);

      setPreviewTtdUrl(canvas.toDataURL("image/png"));
    });
  };

  const validateForm = () => {
    if (!formData.nama.trim()) { showPopup({ type: 'warning', title: 'Nama Kosong', message: 'Nama wajib diisi.' }); return false; }
    if (!formData.jabatan.trim()) { showPopup({ type: 'warning', title: 'Jabatan Kosong', message: 'Jabatan wajib diisi.' }); return false; }
    if (!masjidId) { showPopup({ type: 'warning', title: 'Masjid ID Tidak Ada', message: 'Silakan logout lalu login ulang.' }); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();
    data.append('nama', formData.nama.trim());
    data.append('jabatan', formData.jabatan.trim());
    data.append('masjid_id', masjidId);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);

    if (file) data.append('foto', file);
    if (fileTtd) data.append('ttd', fileTtd);

    try {
      await axios.post('http://localhost:3000/takmir/struktur-organisasi', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showPopup({
        type: 'success',
        title: 'Data Tersimpan',
        message: 'Struktur organisasi berhasil ditambahkan.',
        onConfirm: () => navigate('/admin/struktur-organisasi')
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan data.';
      showPopup({ type: 'error', title: 'Gagal Menyimpan', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn p-8">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">Tambah <span className="text-mu-green">Struktur</span></h1>
            <p className="mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} className="text-mu-green" /> {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • <span className="text-mu-green">{time.toLocaleTimeString('id-ID')}</span>
            </p>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green shadow-sm active:scale-95 transition-all">
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden p-10 lg:p-16">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-4 border-mu-green pl-4">Foto Pengurus</h3>
                  <label className="block group cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 text-center group-hover:border-mu-green group-hover:bg-mu-green/[0.02] transition-all relative overflow-hidden">
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'foto')} className="hidden" />
                      {previewUrl ? (
                        <div className="relative inline-block">
                          <img src={previewUrl} alt="Preview" className="w-40 h-40 object-cover rounded-3xl shadow-2xl border-4 border-white" />
                          <div className="absolute -right-2 -top-2 bg-mu-green text-white p-2 rounded-xl shadow-lg"><Upload size={16}/></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300 group-hover:scale-110 transition-transform"><Upload size={32}/></div>
                          <p className="text-sm font-bold text-gray-500">Klik untuk upload foto pengurus</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-4 border-mu-green pl-4">Tanda Tangan</h3>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button type="button" onClick={() => setTtdMode('upload')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${ttdMode === 'upload' ? 'bg-white text-mu-green shadow-sm' : 'text-gray-400'}`}>Upload</button>
                      <button type="button" onClick={() => setTtdMode('canvas')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${ttdMode === 'canvas' ? 'bg-white text-mu-green shadow-sm' : 'text-gray-400'}`}>Canvas</button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
                    {ttdMode === 'upload' ? (
                      <label className="block cursor-pointer">
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ttd')} className="hidden" />
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-[200px] flex flex-col items-center justify-center gap-4 hover:border-mu-green transition-all">
                          {previewTtdUrl ? (
                              <img src={previewTtdUrl} alt="TTD" className="max-h-[160px] object-contain p-4" />
                          ) : (
                            <>
                              <Upload size={32} className="text-gray-300" />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center px-4">Upload gambar TTD (PNG Transparan disarankan)</p>
                            </>
                          )}
                        </div>
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden relative">
                          <SignaturePad 
                            ref={sigPad} 
                            onEnd={handleCanvasEnd}
                            canvasProps={{ className: "w-full h-[200px] cursor-crosshair" }} 
                          />
                          <button type="button" onClick={clearCanvas} className="absolute top-4 right-4 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <Eraser size={18} />
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center italic font-bold uppercase tracking-widest">Silakan coret canvas di atas untuk tanda tangan</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight border-l-4 border-mu-green pl-4">Detail Pengurus</h3>
                
                <div className="grid gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><User size={14} className="text-mu-green"/> Nama Lengkap</label>
                    <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green outline-none font-bold text-gray-700" placeholder="Contoh: Haji Ahmad" required />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><PenTool size={14} className="text-mu-green"/> Jabatan Struktural</label>
                    <input type="text" value={formData.jabatan} onChange={e => setFormData({...formData, jabatan: e.target.value})} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green outline-none font-bold text-gray-700" placeholder="Contoh: Ketua Takmir" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode Mulai</label>
                      <CustomCalendarInput label="Periode Mulai" value={formData.periode_mulai} maxDate={formData.periode_selesai} onChange={date => setFormData({...formData, periode_mulai: date})} />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode Selesai</label>
                      <CustomCalendarInput label="Periode Selesai" value={formData.periode_selesai} minDate={formData.periode_mulai} onChange={date => setFormData({...formData, periode_selesai: date})} />
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button type="button" onClick={() => navigate('/admin/struktur-organisasi')} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-200 active:scale-95 transition-all">Batal</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {loading ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                    {loading ? 'Menyimpan...' : 'Simpan Struktur'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TambahStruktur;