// frontend/src/pages/admin/StrukturOrganisasi/HapusStruktur.jsx

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Trash2,
  X,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';
  const isConfirm = alertData.type === 'confirm';

  const Icon = isSuccess
    ? CheckCircle2
    : isError
      ? XCircle
      : isWarning || isConfirm
        ? AlertTriangle
        : Info;

  const iconClass = isSuccess
    ? 'bg-green-100 text-green-600'
    : isError
      ? 'bg-red-100 text-red-600'
      : isWarning || isConfirm
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-blue-100 text-blue-600';

  const buttonClass = isConfirm
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : isSuccess
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

          {isConfirm ? (
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  if (alertData.onConfirm) alertData.onConfirm();
                  onClose();
                }}
                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
              >
                {alertData.confirmText || 'Hapus'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
            >
              {alertData.confirmText || 'Mengerti'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const HapusStruktur = () => {
  const [struktur, setStruktur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
    fetchStruktur();
  }, [id]);

  const fetchStruktur = async () => {
    try {
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

      setStruktur(selected);
    } catch (err) {
      if (handleAuthError(err)) return;

      console.error('Error fetching struktur organisasi:', err);

      showPopup({
        type: 'error',
        title: 'Gagal Memuat',
        message: err.response?.data?.message || 'Gagal memuat data struktur organisasi.',
        onConfirm: () => navigate('/admin/struktur-organisasi')
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showPopup({
      type: 'confirm',
      title: 'Hapus Struktur?',
      message: `Yakin ingin menghapus ${struktur?.nama}? Data tidak bisa dikembalikan.`,
      confirmText: 'Hapus',
      onConfirm: handleDelete
    });
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await axios.delete(`http://localhost:3000/takmir/struktur-organisasi/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      showPopup({
        type: 'success',
        title: 'Data Dihapus',
        message: 'Data struktur organisasi berhasil dihapus.',
        onConfirm: () => navigate('/admin/struktur-organisasi')
      });
    } catch (err) {
      if (handleAuthError(err)) return;

      console.error('Error deleting struktur organisasi:', err);

      showPopup({
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.response?.data?.message || 'Gagal menghapus data struktur organisasi.'
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
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

  if (!struktur) return null;

  return (
    <div className="hapus-struktur min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="main-content p-8 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-10 text-white">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    {struktur.foto ? (
                      <img
                        src={getFotoUrl(struktur.foto)}
                        alt="Foto"
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ) : (
                      <User size={40} className="text-white/80" />
                    )}
                  </div>

                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {struktur.nama}
                    </h1>
                    <p className="text-red-100 text-lg">
                      ID Struktur: {struktur.struktur_id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <AlertTriangle size={48} className="text-white animate-pulse" />
                  <div>
                    <h2 className="text-2xl font-bold">Konfirmasi Hapus</h2>
                    <p className="text-red-100">
                      Tindakan ini tidak dapat dibatalkan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600 animate-pulse" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-red-800">
                  Peringatan Penting
                </h3>
                <p className="text-red-600">
                  Menghapus data ini akan menghilangkan informasi struktur organisasi secara permanen.
                </p>
              </div>
            </div>

            <p className="text-red-700 leading-relaxed">
              Pastikan Anda benar-benar ingin menghapus data struktur organisasi ini.
              Semua informasi, foto, dan data lainnya akan hilang dan tidak dapat dikembalikan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <User size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Jabatan
                </h3>
              </div>

              <p className="text-gray-600">
                {struktur.jabatan}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Periode Jabatan
                </h3>
              </div>

              <p className="text-gray-600">
                {formatTanggal(struktur.periode_mulai)} - {formatTanggal(struktur.periode_selesai)}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-10 mt-10 border-t border-gray-200">
            <button
              onClick={() => navigate('/admin/struktur-organisasi')}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center font-medium shadow-lg"
            >
              <X size={20} className="mr-2" />
              Batal
            </button>

            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Trash2 size={20} className="mr-2" />
              {deleting ? 'Menghapus...' : 'Hapus Struktur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HapusStruktur;