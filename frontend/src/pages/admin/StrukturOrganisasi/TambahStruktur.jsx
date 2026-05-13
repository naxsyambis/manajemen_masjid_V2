import React, { useState, useEffect, useMemo, useRef } from 'react'; // Gabungkan import di sini
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
  Eraser
} from 'lucide-react';

// Konstanta Kalender
const bulanIndonesia = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const hariIndonesia = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Helper Functions
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
  if (!date) return 'Pilih tanggal';
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
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}><Icon size={42} strokeWidth={2.5} /></div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || 'Mengerti'}</button>
        </div>
      </div>
    </div>, document.body
  );
};

const CustomCalendarInput = ({ label, value, onChange, minDate = '', maxDate = '' }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const initialDate = value ? parseDateKey(value) : new Date();
  const [activeMonth, setActiveMonth] = useState(initialDate.getMonth());
  const [activeYear, setActiveYear] = useState(initialDate.getFullYear());

  const days = useMemo(() => {
    const firstDay = new Date(activeYear, activeMonth, 1);
    const lastDay = new Date(activeYear, activeMonth + 1, 0);
    const startDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthLastDate = new Date(activeYear, activeMonth, 0).getDate();
    const calendarDays = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      calendarDays.push({ date: new Date(activeYear, activeMonth, -i), isCurrentMonth: false });
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

  const handlePrevMonth = () => activeMonth === 0 ? (setActiveMonth(11), setActiveYear(v => v - 1)) : setActiveMonth(v => v - 1);
  const handleNextMonth = () => activeMonth === 11 ? (setActiveMonth(0), setActiveYear(v => v + 1)) : setActiveMonth(v => v + 1);

  return (
    <div className="relative">
      <button type="button" onClick={() => setShowCalendar(true)} className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl bg-gray-50 font-bold text-gray-700 text-left outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all">
        {value ? formatTanggalIndo(value) : 'Pilih Tanggal'}
      </button>
      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mu-green" />
      
      {showCalendar && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowCalendar(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 bg-mu-green text-white">
              <h4 className="text-2xl font-black uppercase tracking-tighter">{label}</h4>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <button type="button" onClick={handlePrevMonth} className="p-2 bg-gray-50 rounded-xl hover:bg-mu-green hover:text-white transition-all"><ChevronLeft /></button>
                <div className="text-center">
                  <p className="font-black text-gray-800 uppercase">{bulanIndonesia[activeMonth]}</p>
                  <p className="text-[10px] font-bold text-gray-400">{activeYear}</p>
                </div>
                <button type="button" onClick={handleNextMonth} className="p-2 bg-gray-50 rounded-xl hover:bg-mu-green hover:text-white transition-all"><ChevronRight /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {hariIndonesia.map(h => <div key={h} className="text-[10px] font-black text-gray-300 uppercase">{h}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  const key = formatDateKey(d.date);
                  const isSelected = value === key;
                  const isDisabled = (minDate && key < minDate) || (maxDate && key > maxDate);
                  return (
                    <button key={i} type="button" disabled={isDisabled} onClick={() => { onChange(key); setShowCalendar(false); }}
                      className={`h-10 rounded-xl text-xs font-bold transition-all ${isDisabled ? 'opacity-20 cursor-not-allowed' : isSelected ? 'bg-mu-green text-white' : d.isCurrentMonth ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200'}`}>
                      {d.date.getDate()}
                    </button>
                  );
                })}
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
  const [ttdMode, setTtdMode] = useState('upload');
  const [fileTtd, setFileTtd] = useState(null);
  const [previewTtdUrl, setPreviewTtdUrl] = useState(null);
  const sigPad = useRef(null);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => {
    const cb = alertData.onConfirm;
    setAlertData({ ...alertData, show: false });
    if (cb) setTimeout(cb, 100);
  };

  const handleFileChange = (e, type) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return showPopup({ type: 'warning', title: 'Terlalu Besar', message: 'Maksimal 3MB' });

    const url = URL.createObjectURL(f);
    if (type === 'foto') { setFile(f); setPreviewUrl(url); }
    else { setFileTtd(f); setPreviewTtdUrl(url); }
  };

  const handleCanvasEnd = () => {
    const canvas = sigPad.current.getCanvas();
    canvas.toBlob((blob) => {
      setFileTtd(new File([blob], "ttd.png", { type: "image/png" }));
      setPreviewTtdUrl(canvas.toDataURL());
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) return showPopup({ type: 'warning', title: 'Data Kurang', message: 'Nama dan Jabatan wajib diisi' });

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('masjid_id', masjidId);
    if (file) data.append('foto', file);
    if (fileTtd) data.append('ttd', fileTtd);

    try {
      await axios.post('http://localhost:3000/takmir/struktur-organisasi', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showPopup({ type: 'success', title: 'Berhasil', message: 'Data tersimpan', onConfirm: () => navigate('/admin/struktur-organisasi') });
    } catch (err) {
      showPopup({ type: 'error', title: 'Gagal', message: err.response?.data?.message || 'Terjadi kesalahan' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase">Tambah <span className="text-mu-green">Struktur</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{time.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              {/* Foto Section */}
              <div className="space-y-4">
                <h3 className="font-black uppercase border-l-4 border-mu-green pl-4">Foto Pengurus</h3>
                <label className="block border-2 border-dashed border-gray-200 rounded-[2rem] p-10 text-center cursor-pointer hover:bg-gray-50 transition-all">
                  <input type="file" className="hidden" onChange={e => handleFileChange(e, 'foto')} />
                  {previewUrl ? <img src={previewUrl} className="w-40 h-40 object-cover rounded-3xl mx-auto shadow-xl" /> : <Upload className="mx-auto text-gray-300" size={40} />}
                </label>
              </div>

              {/* TTD Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black uppercase border-l-4 border-mu-green pl-4">Tanda Tangan</h3>
                  <div className="flex bg-gray-100 p-1 rounded-xl text-[10px] font-bold uppercase">
                    <button type="button" onClick={() => setTtdMode('upload')} className={`px-4 py-2 rounded-lg ${ttdMode === 'upload' ? 'bg-white text-mu-green' : 'text-gray-400'}`}>Upload</button>
                    <button type="button" onClick={() => setTtdMode('canvas')} className={`px-4 py-2 rounded-lg ${ttdMode === 'canvas' ? 'bg-white text-mu-green' : 'text-gray-400'}`}>Canvas</button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 h-[220px] flex items-center justify-center">
                  {ttdMode === 'upload' ? (
                    <label className="w-full h-full flex items-center justify-center cursor-pointer">
                      <input type="file" className="hidden" onChange={e => handleFileChange(e, 'ttd')} />
                      {previewTtdUrl ? <img src={previewTtdUrl} className="max-h-full object-contain" /> : <p className="text-[10px] font-bold text-gray-400 uppercase">Klik untuk upload TTD</p>}
                    </label>
                  ) : (
                    <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden border border-gray-200">
                      <SignaturePad ref={sigPad} onEnd={handleCanvasEnd} canvasProps={{ className: "w-full h-full" }} />
                      <button type="button" onClick={() => sigPad.current.clear()} className="absolute top-2 right-2 p-2 bg-red-50 text-red-500 rounded-lg"><Eraser size={16} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="font-black uppercase border-l-4 border-mu-green pl-4">Detail Informasi</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Nama Lengkap</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-mu-green font-bold" placeholder="Masukkan Nama" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Jabatan Struktural</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-mu-green font-bold" placeholder="Masukkan Jabatan" value={formData.jabatan} onChange={e => setFormData({...formData, jabatan: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Periode Mulai</label>
                    <CustomCalendarInput label="Mulai" value={formData.periode_mulai} maxDate={formData.periode_selesai} onChange={v => setFormData({...formData, periode_mulai: v})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Periode Selesai</label>
                    <CustomCalendarInput label="Selesai" value={formData.periode_selesai} minDate={formData.periode_mulai} onChange={v => setFormData({...formData, periode_selesai: v})} />
                  </div>
                </div>
              </div>
              <div className="pt-10 flex gap-4">
                <button type="button" onClick={() => navigate('/admin/struktur-organisasi')} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-[10px] text-gray-400">Batal</button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-green-100 disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Struktur'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TambahStruktur;