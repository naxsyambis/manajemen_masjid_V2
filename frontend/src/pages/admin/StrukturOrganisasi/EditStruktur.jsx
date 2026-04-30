// frontend/src/pages/admin/StrukturOrganisasi/EditStruktur.jsx

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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
  Info
} from 'lucide-react';

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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

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

const EditStruktur = () => {
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: '',
    foto: null
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const showPopup = ({
    type = 'info',
    title = 'Informasi',
    message = '',
    confirmText = '',
    onConfirm = null
  }) => {
    setAlertData({
      show: true,
      type,
      title,
      message,
      confirmText,
      onConfirm
    });
  };

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

    if (callback) {
      setTimeout(callback, 100);
    }
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

  const getFotoUrl = (foto) => {
    if (!foto) return null;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads')) return `http://localhost:3000${foto}`;
    return `http://localhost:3000/uploads/struktur-organisasi/${foto}`;
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStruktur();
  }, [id]);

  const fetchStruktur = async () => {
    try {
      setRefreshing(true);
      setError(null);

      if (!masjidId) {
        showPopup({
          type: 'warning',
          title: 'Masjid ID Tidak Ada',
          message: 'Silakan logout lalu login ulang.',
          onConfirm: () => navigate('/admin/struktur-organisasi')
        });
        return;
      }

      const res = await axios.get('http://localhost:3000/takmir/struktur-organisasi', {
        params: {
          masjid_id: masjidId
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const selected = data.find((item) => String(item.struktur_id) === String(id));

      if (!selected) {
        showPopup({
          type: 'warning',
          title: 'Data Tidak Ditemukan',
          message: 'Data struktur organisasi tidak ditemukan.',
          onConfirm: () => navigate('/admin/struktur-organisasi')
        });
        return;
      }

      setFormData({
        nama: selected.nama ?? '',
        jabatan: selected.jabatan ?? '',
        periode_mulai: selected.periode_mulai ?? '',
        periode_selesai: selected.periode_selesai ?? '',
        foto: selected.foto ?? null
      });
    } catch (err) {
      if (handleAuthError(err)) return;

      console.error('Error fetching struktur organisasi:', err);

      const msg = err.response?.data?.message || 'Gagal memuat data struktur organisasi.';
      setError(msg);

      showPopup({
        type: 'error',
        title: 'Gagal Memuat',
        message: msg
      });
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  const handleFileChange = (e) => {
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

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
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
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);

    if (file) {
      data.append('foto', file);
    }

    try {
      await axios.put(`http://localhost:3000/takmir/struktur-organisasi/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      showPopup({
        type: 'success',
        title: 'Data Diupdate',
        message: 'Data struktur organisasi berhasil diupdate.',
        onConfirm: () => navigate('/admin/struktur-organisasi')
      });
    } catch (err) {
      if (handleAuthError(err)) return;

      console.error('Error updating struktur organisasi:', err);

      const msg = err.response?.data?.message || 'Gagal mengupdate data struktur organisasi.';
      setError(msg);

      showPopup({
        type: 'error',
        title: 'Gagal Update',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-bold text-mu-green uppercase tracking-wider">
            Memuat Data Struktur Organisasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="main-content p-8 h-full overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Edit <span className="text-mu-green">Struktur</span>
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
              onClick={fetchStruktur}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
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
                Edit Struktur Organisasi
              </h2>
              <p className="text-gray-600 text-lg">
                Perbarui informasi struktur organisasi masjid.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">
                      Foto
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
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
                                  {file?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(file?.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ) : formData.foto ? (
                            <div className="space-y-6">
                              <img
                                src={getFotoUrl(formData.foto)}
                                alt="Foto Saat Ini"
                                className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg"
                              />
                              <div>
                                <p className="text-lg font-semibold text-gray-700">
                                  Foto Saat Ini
                                </p>
                                <p className="text-sm text-gray-500">
                                  Klik untuk mengganti foto
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
                        Upload foto baru jika ingin mengganti foto lama.
                      </p>
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
                      <div className="relative">
                        <Calendar
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          value={formData.periode_mulai}
                          onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Periode Selesai
                      </label>
                      <div className="relative">
                        <Calendar
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          value={formData.periode_selesai}
                          onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                        />
                      </div>
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
                  {loading ? 'Menyimpan...' : 'Update Struktur'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
          <div className="h-[1px] w-12 bg-gray-100"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">
            Integrated Database System v3.0
          </p>
          <div className="h-[1px] w-12 bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
};

export default EditStruktur;