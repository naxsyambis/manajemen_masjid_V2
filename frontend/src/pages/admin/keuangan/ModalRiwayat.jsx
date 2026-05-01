import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
  X,
  Save,
  DollarSign,
  Tag,
  Calendar,
  User,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

const handleAuthError = (err, showPopup) => {
  if (err.response && err.response.status === 401) {
    const message = err.response.data.message || 'Sesi Anda telah berakhir';

    showPopup({
      type: 'error',
      title: 'Sesi Berakhir',
      message,
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

  const handleMainButton = () => {
    const callback = alertData.onConfirm;
    onClose();

    if (callback) {
      setTimeout(callback, 120);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}
          >
            <Icon size={42} strokeWidth={2.5} />
          </div>

          <h3 className="text-2xl font-black text-gray-800 leading-tight">
            {alertData.title || 'Informasi'}
          </h3>

          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">
            {alertData.message || '-'}
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
                onClick={handleMainButton}
                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
              >
                {alertData.confirmText || 'Lanjut'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMainButton}
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

const ModalRiwayat = ({ show, onClose, onSuccess, data, categories = [] }) => {
  const [form, setForm] = useState({
    jumlah: '',
    kategori_id: '',
    donatur: '',
    deskripsi: '',
    tanggal: ''
  });

  const [loading, setLoading] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });

  const token = localStorage.getItem('token');

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
    setAlertData({
      show: false,
      type: 'info',
      title: '',
      message: '',
      confirmText: '',
      onConfirm: null
    });
  };

  useEffect(() => {
    if (data && show) {
      setForm({
        jumlah: Math.abs(Number(data.jumlah || 0)),
        kategori_id: data.kategori_id || '',
        donatur: data.nama_donatur || '',
        deskripsi: data.deskripsi || '',
        tanggal: data.tanggal ? data.tanggal.split('T')[0] : ''
      });
    }
  }, [data, show]);

  const validateForm = () => {
    const jumlahNumber = Number(form.jumlah);

    if (!form.jumlah) {
      showPopup({
        type: 'warning',
        title: 'Nominal Kosong',
        message: 'Nominal transaksi wajib diisi.'
      });
      return false;
    }

    if (Number.isNaN(jumlahNumber) || jumlahNumber <= 0) {
      showPopup({
        type: 'warning',
        title: 'Nominal Tidak Valid',
        message: 'Nominal transaksi harus lebih dari 0.'
      });
      return false;
    }

    if (!form.kategori_id) {
      showPopup({
        type: 'warning',
        title: 'Kategori Kosong',
        message: 'Kategori transaksi wajib dipilih.'
      });
      return false;
    }

    if (!form.tanggal) {
      showPopup({
        type: 'warning',
        title: 'Tanggal Kosong',
        message: 'Tanggal transaksi wajib diisi.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!data?.keuangan_id) {
      showPopup({
        type: 'error',
        title: 'Data Tidak Valid',
        message: 'ID transaksi tidak ditemukan.'
      });
      return;
    }

    setLoading(true);

    try {
      const nominalFinal =
        Number(data.jumlah) < 0
          ? -Math.abs(Number(form.jumlah))
          : Math.abs(Number(form.jumlah));

      const payload = {
        jumlah: nominalFinal,
        kategori_id: parseInt(form.kategori_id, 10),
        tanggal: form.tanggal,
        deskripsi: form.deskripsi.trim(),
        nama_donatur: form.donatur.trim()
      };

      await axios.put(
        `http://localhost:3000/takmir/keuangan/${data.keuangan_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showPopup({
        type: 'success',
        title: 'Transaksi Diperbarui',
        message: 'Data transaksi berhasil diperbarui.',
        onConfirm: () => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }
      });
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error('Gagal memperbarui transaksi:', err);

      showPopup({
        type: 'error',
        title: 'Gagal Memperbarui',
        message: err.response?.data?.message || 'Data transaksi gagal diperbarui.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative z-[100000] bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 animate-scaleIn mx-auto">
        <div className="p-8 bg-mu-green text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
              Edit Transaksi
            </h3>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">
              ID Transaksi: #{data?.keuangan_id || '-'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <X size={24} />
          </button>

          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto max-h-[80vh] no-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <DollarSign size={12} className="text-mu-green" />
                Nominal (Rp)
              </label>

              <input
                type="number"
                min="1"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                value={form.jumlah}
                onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-mu-green" />
                Kategori
              </label>

              <select
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner appearance-none focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                value={form.kategori_id}
                onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.kategori_id} value={cat.kategori_id}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <User size={12} className="text-mu-green" />
                Donatur / Penerima
              </label>

              <input
                type="text"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all"
                value={form.donatur}
                onChange={(e) => setForm({ ...form, donatur: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <Calendar size={12} className="text-mu-green" />
                Tanggal
              </label>

              <input
                type="date"
                required
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner focus:ring-2 focus:ring-mu-green/20 transition-all cursor-pointer"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                <FileText size={12} className="text-mu-green" />
                Deskripsi
              </label>

              <textarea
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-gray-800 shadow-inner h-24 resize-none focus:ring-2 focus:ring-mu-green/20 transition-all"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-yellow-600 shrink-0" size={18} />
            <p className="text-[10px] text-yellow-800 font-bold leading-relaxed italic">
              Perhatian: Perubahan data akan langsung mempengaruhi laporan arus kas.
              Pastikan data sudah valid.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase text-xs hover:bg-gray-50 transition-all"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-green-100 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save size={18} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ModalRiwayat;