import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

const bulanIndonesia = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
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

  const Icon = isSuccess
    ? CheckCircle2
    : isError
      ? XCircle
      : isWarning
        ? AlertTriangle
        : Info;

  const iconClass = isSuccess
    ? 'bg-green-100 text-green-600'
    : isError
      ? 'bg-red-100 text-red-600'
      : isWarning
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-blue-100 text-blue-600';

  const buttonClass = isSuccess
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : isError
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : isWarning
        ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green'
        : 'bg-mu-green hover:bg-green-700 text-white';

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}>
            <Icon size={42} strokeWidth={2.5} />
          </div>

          <h3 className="text-2xl font-black text-gray-800 leading-tight">
            {alertData.title}
          </h3>

          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">
            {alertData.message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
          >
            {alertData.confirmText || 'Mengerti'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CustomCalendarInput = ({
  label,
  value,
  onChange,
  minDate = '',
  maxDate = ''
}) => {
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
      calendarDays.push({
        date: new Date(activeYear, activeMonth - 1, prevMonthLastDate - i),
        isCurrentMonth: false
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push({
        date: new Date(activeYear, activeMonth, day),
        isCurrentMonth: true
      });
    }

    while (calendarDays.length < 42) {
      const nextDay = calendarDays.length - (startDayIndex + daysInMonth) + 1;

      calendarDays.push({
        date: new Date(activeYear, activeMonth + 1, nextDay),
        isCurrentMonth: false
      });
    }

    return calendarDays;
  }, [activeMonth, activeYear]);

  const todayKey = formatDateKey(new Date());

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear((prev) => prev - 1);
    } else {
      setActiveMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear((prev) => prev + 1);
    } else {
      setActiveMonth((prev) => prev + 1);
    }
  };

  const isDisabledDate = (dateKey) => {
    if (minDate && new Date(dateKey) < new Date(minDate)) return true;
    if (maxDate && new Date(dateKey) > new Date(maxDate)) return true;

    return false;
  };

  const handlePickDate = (dateKey) => {
    if (isDisabledDate(dateKey)) return;

    onChange(dateKey);
    setShowCalendar(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowCalendar(true)}
        className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm text-left"
      >
        <span className={value ? 'text-gray-700' : 'text-gray-400'}>
          {value ? formatTanggalIndo(value) : 'Pilih tanggal'}
        </span>
      </button>

      <Calendar
        size={20}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      />

      {showCalendar &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setShowCalendar(false)}
            />

            <div className="relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
              <div className="p-6 bg-mu-green text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                    {label}
                  </h3>
                  <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">
                    Pilih tanggal periode
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>

                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-mu-green hover:text-white transition-all active:scale-95 flex items-center justify-center"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <div className="text-center">
                    <h4 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                      {bulanIndonesia[activeMonth]}
                    </h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                      {activeYear}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-11 h-11 rounded-xl bg-gray-50 text-gray-500 hover:bg-mu-green hover:text-white transition-all active:scale-95 flex items-center justify-center"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {hariIndonesia.map((day) => (
                    <div
                      key={day}
                      className="h-9 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((item, index) => {
                    const dateKey = formatDateKey(item.date);
                    const isSelected = value === dateKey;
                    const isToday = todayKey === dateKey;
                    const disabled = isDisabledDate(dateKey);

                    return (
                      <button
                        key={`${dateKey}-${index}`}
                        type="button"
                        disabled={disabled}
                        onClick={() => handlePickDate(dateKey)}
                        className={`h-11 rounded-xl text-xs font-black transition-all active:scale-90 ${
                          disabled
                            ? 'bg-gray-50 text-gray-200 cursor-not-allowed'
                            : isSelected
                              ? 'bg-mu-green text-white shadow-lg shadow-green-100 scale-105'
                              : isToday
                                ? 'bg-green-50 text-mu-green border border-mu-green/20'
                                : item.isCurrentMonth
                                  ? 'text-gray-700 hover:bg-gray-50 hover:text-mu-green'
                                  : 'text-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {item.date.getDate()}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 bg-mu-green/[0.03] border border-mu-green/10 p-4 rounded-2xl">
                  <p className="text-[10px] text-mu-green font-black uppercase tracking-widest">
                    Tanggal Terpilih
                  </p>
                  <p className="text-sm text-gray-700 font-bold mt-1">
                    {formatTanggalIndo(value)}
                  </p>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setShowCalendar(false);
                    }}
                    className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Kosongkan
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCalendar(false)}
                    className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const TambahStruktur = () => {
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: ''
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileTtd, setFileTtd] = useState(null);
  const [previewTtdUrl, setPreviewTtdUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const [alertData, setAlertData] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const showPopup = (config) => setAlertData({ ...config, show: true });

  const closePopup = () => {
    const callback = alertData.onConfirm;

    setAlertData({
      show: false,
      type: 'info',
      title: '',
      message: '',
      confirmText: '',
      onConfirm: null
    });

    if (callback) setTimeout(callback, 100);
  };

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      showPopup({
        type: 'error',
        title: 'Sesi Berakhir',
        message: err.response.data.message || 'Sesi Anda telah berakhir.',
        confirmText: 'Login Ulang',
        onConfirm: () => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      });

      return true;
    }

    return false;
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      showPopup({
        type: 'warning',
        title: 'File Tidak Valid',
        message: 'File harus berupa gambar.'
      });

      e.target.value = '';
      return;
    }

    if (selectedFile.size > 3 * 1024 * 1024) {
      showPopup({
        type: 'warning',
        title: 'Ukuran Terlalu Besar',
        message: 'Ukuran file maksimal 3MB.'
      });

      e.target.value = '';
      return;
    }

    if (type === 'foto') {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (type === 'ttd') {
      setFileTtd(selectedFile);
      setPreviewTtdUrl(URL.createObjectURL(selectedFile));
    }
  };

  const validateForm = () => {
    if (!formData.nama.trim()) {
      showPopup({
        type: 'warning',
        title: 'Nama Kosong',
        message: 'Nama wajib diisi.'
      });

      return false;
    }

    if (formData.nama.trim().length < 3) {
      showPopup({
        type: 'warning',
        title: 'Nama Terlalu Pendek',
        message: 'Nama minimal 3 karakter.'
      });

      return false;
    }

    if (!formData.jabatan.trim()) {
      showPopup({
        type: 'warning',
        title: 'Jabatan Kosong',
        message: 'Jabatan wajib diisi.'
      });

      return false;
    }

    if (!masjidId) {
      showPopup({
        type: 'warning',
        title: 'Masjid ID Tidak Ada',
        message: 'Silakan logout lalu login ulang.'
      });

      return false;
    }

    if (
      formData.periode_mulai &&
      formData.periode_selesai &&
      new Date(formData.periode_mulai) > new Date(formData.periode_selesai)
    ) {
      showPopup({
        type: 'warning',
        title: 'Periode Tidak Valid',
        message: 'Periode mulai tidak boleh lebih besar dari periode selesai.'
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

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
        message: 'Data struktur organisasi berhasil ditambahkan.',
        onConfirm: () => navigate('/admin/struktur-organisasi')
      });

      setFormData({
        nama: '',
        jabatan: '',
        periode_mulai: '',
        periode_selesai: ''
      });

      setFile(null);
      setPreviewUrl(null);
      setFileTtd(null);
      setPreviewTtdUrl(null);
    } catch (err) {
      if (handleAuthError(err)) return;

      const msg = err.response?.data?.message || 'Gagal menambahkan data struktur organisasi.';

      setError(msg);

      showPopup({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tambah-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="main-content p-8 h-full overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Tambah <span className="text-mu-green">Struktur</span>
            </h1>

            <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <Calendar size={12} className="text-mu-green" />
              <span>
                {time.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="mx-2">•</span>
              <span className="text-mu-green">
                {time.toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg"
            >
              <RefreshCcw size={14} />
              Refresh Halaman
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="p-10 lg:p-16">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">
                Tambah Struktur Organisasi
              </h2>

              <p className="text-gray-600 text-lg">
                Isi informasi pengurus struktur organisasi masjid dengan lengkap.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">
                      Foto Pengurus
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'foto')}
                        className="hidden"
                        id="foto-upload"
                      />

                      <label htmlFor="foto-upload" className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg hover:shadow-xl">
                          {previewUrl ? (
                            <div className="space-y-6">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg"
                              />

                              <div>
                                <p className="text-lg font-semibold text-gray-800">
                                  {file.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <Upload size={64} className="text-gray-400 mx-auto" />

                              <div>
                                <p className="text-lg font-semibold text-gray-700">
                                  Klik untuk upload foto
                                </p>

                                <p className="text-sm text-gray-500">
                                  PNG, JPG hingga 3MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      <p className="text-sm text-gray-500">
                        Upload foto anggota struktur organisasi, opsional.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">
                      Tanda Tangan (TTD)
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'ttd')}
                        className="hidden"
                        id="ttd-upload"
                      />

                      <label htmlFor="ttd-upload" className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg hover:shadow-xl">
                          {previewTtdUrl ? (
                            <div className="space-y-6">
                              <img
                                src={previewTtdUrl}
                                alt="Preview TTD"
                                className="w-32 h-32 object-contain rounded-xl mx-auto shadow-lg bg-white"
                              />

                              <div>
                                <p className="text-lg font-semibold text-gray-800">
                                  {fileTtd.name}
                                </p>

                                <p className="text-sm text-gray-500">
                                  {(fileTtd.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <PenTool size={64} className="text-gray-400 mx-auto" />

                              <div>
                                <p className="text-lg font-semibold text-gray-700">
                                  Klik untuk upload TTD
                                </p>

                                <p className="text-sm text-gray-500">
                                  Background transparan (PNG) lebih disarankan, opsional.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">
                      Informasi Struktur
                    </h3>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Nama
                      </label>

                      <div className="relative">
                        <User
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="text"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan nama"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Jabatan
                      </label>

                      <input
                        type="text"
                        value={formData.jabatan}
                        onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                        className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                        placeholder="Contoh: Ketua DKM, Sekretaris, Bendahara"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Periode Mulai
                      </label>

                      <CustomCalendarInput
                        label="Periode Mulai"
                        value={formData.periode_mulai}
                        maxDate={formData.periode_selesai}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            periode_mulai: date
                          })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Periode Selesai
                      </label>

                      <CustomCalendarInput
                        label="Periode Selesai"
                        value={formData.periode_selesai}
                        minDate={formData.periode_mulai}
                        onChange={(date) =>
                          setFormData({
                            ...formData,
                            periode_selesai: date
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/struktur-organisasi')}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-8 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={22} className="mr-3" />
                  {loading ? 'Menyimpan...' : 'Simpan Struktur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahStruktur;