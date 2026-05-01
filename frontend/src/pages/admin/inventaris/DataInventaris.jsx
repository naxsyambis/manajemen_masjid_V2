import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  Search,
  Box,
  ArrowUpDown,
  Archive,
  X,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react';
import Button from '../../../components/Button';
import StatCard from '../../../components/StatCard';
import ModalInventaris from './ModalInventaris';

const primaryActionButton =
  '!h-14 !min-w-[230px] !inline-flex !items-center !justify-center !gap-2 !bg-mu-green !text-white !px-8 !py-4 !rounded-2xl !text-xs !font-black !uppercase !tracking-widest hover:!bg-green-700 !shadow-lg !shadow-green-100 !transition-all active:!scale-95 !border-none';

const pageHeaderIcon =
  'p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300';

const pageTitle =
  'text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none';

const pageSubtitle =
  'text-xs text-gray-400 font-bold uppercase tracking-[0.22em] ml-1 leading-relaxed';

const handleAuthError = (err, showPopup) => {
  if (err.response && err.response.status === 401) {
    const message = err.response.data.message || 'Sesi Anda telah berakhir';

    if (showPopup) {
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
    } else {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

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

  const buttonClass = isSuccess
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : isError
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : isWarning
        ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green'
        : isConfirm
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-mu-green hover:bg-green-700 text-white';

  return ReactDOM.createPortal(
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
                {alertData.confirmText || 'Ya'}
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

const DataInventaris = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('semua');

  const [alertData, setAlertData] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });

  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    nama_barang: '',
    jumlah: '1',
    kondisi: 'baik',
    keterangan: ''
  });

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

  const fetchInventaris = async () => {
    try {
      setLoading(true);

      const res = await axios.get('http://localhost:3000/takmir/inventaris', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setItems(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error('Gagal load database inventaris', err);

      showPopup({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Data inventaris tidak berhasil dimuat.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInventaris();
  }, [token]);

  const filteredItems = items.filter((item) => {
    const matchSearch = item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKondisi = filterKondisi === 'semua' || item.kondisi === filterKondisi;
    return matchSearch && matchKondisi;
  });

  const openTambah = () => {
    setIsEdit(false);
    setSelectedId(null);
    setForm({
      nama_barang: '',
      jumlah: '1',
      kondisi: 'baik',
      keterangan: ''
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setSelectedId(item.inventaris_id);
    setForm({
      nama_barang: item.nama_barang || '',
      jumlah: item.jumlah && Number(item.jumlah) > 0 ? String(item.jumlah) : '1',
      kondisi: item.kondisi || 'baik',
      keterangan: item.keterangan || ''
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const namaBarang = form.nama_barang.trim();
    const jumlahText = String(form.jumlah || '').trim();
    const jumlahNumber = Number(jumlahText);

    if (!namaBarang) {
      showPopup({
        type: 'warning',
        title: 'Nama Barang Kosong',
        message: 'Nama barang inventaris wajib diisi.'
      });
      return false;
    }

    if (namaBarang.length < 3) {
      showPopup({
        type: 'warning',
        title: 'Nama Terlalu Pendek',
        message: 'Nama barang minimal 3 karakter.'
      });
      return false;
    }

    if (!jumlahText) {
      showPopup({
        type: 'warning',
        title: 'Kuantitas Kosong',
        message: 'Kuantitas barang wajib diisi.'
      });
      return false;
    }

    if (!/^[0-9]+$/.test(jumlahText)) {
      showPopup({
        type: 'warning',
        title: 'Kuantitas Tidak Valid',
        message: 'Kuantitas hanya boleh angka.\nMinimal kuantitas adalah 1.'
      });
      return false;
    }

    if (!Number.isInteger(jumlahNumber) || jumlahNumber < 1) {
      showPopup({
        type: 'warning',
        title: 'Kuantitas Tidak Valid',
        message: 'Kuantitas minimal 1 dan tidak boleh 0 atau minus.'
      });
      return false;
    }

    if (!form.kondisi) {
      showPopup({
        type: 'warning',
        title: 'Kondisi Kosong',
        message: 'Kondisi barang wajib dipilih.'
      });
      return false;
    }

    if (!['baik', 'rusak', 'hilang'].includes(form.kondisi)) {
      showPopup({
        type: 'warning',
        title: 'Kondisi Tidak Valid',
        message: 'Kondisi barang harus baik, rusak, atau hilang.'
      });
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const jumlahNumber = Number(form.jumlah);

    const payload = {
      nama_barang: form.nama_barang.trim(),
      jumlah: jumlahNumber,
      kondisi: form.kondisi,
      keterangan: form.keterangan.trim()
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:3000/takmir/inventaris/${selectedId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showPopup({
          type: 'success',
          title: 'Data Diperbarui',
          message: 'Data inventaris berhasil diperbarui.'
        });
      } else {
        await axios.post('http://localhost:3000/takmir/inventaris', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showPopup({
          type: 'success',
          title: 'Data Tersimpan',
          message: 'Data inventaris berhasil ditambahkan.'
        });
      }

      setShowForm(false);
      fetchInventaris();
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error('Gagal simpan ke database', err);

      showPopup({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || 'Data inventaris gagal disimpan.'
      });
    }
  };

  const handleHapus = async (id) => {
    showPopup({
      type: 'confirm',
      title: 'Hapus Inventaris?',
      message: 'Data barang yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:3000/takmir/inventaris/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          showPopup({
            type: 'success',
            title: 'Data Dihapus',
            message: 'Data inventaris berhasil dihapus.'
          });

          fetchInventaris();
        } catch (err) {
          if (handleAuthError(err, showPopup)) return;

          console.error('Gagal hapus data inventaris', err);

          showPopup({
            type: 'error',
            title: 'Gagal Menghapus',
            message: err.response?.data?.message || 'Data inventaris gagal dihapus.'
          });
        }
      }
    });
  };

  // 🔥 LOGIKA MENGHITUNG TOTAL BARU (Diambil dari kolom .jumlah)
  const totalAset = items.reduce((sum, item) => sum + Number(item.jumlah || 0), 0);
  
  const totalLayak = items
    .filter(i => i.kondisi === 'baik')
    .reduce((sum, item) => sum + Number(item.jumlah || 0), 0);
    
  const totalPerbaikan = items
    .filter(i => i.kondisi !== 'baik') // Ini mencakup "rusak" dan "hilang"
    .reduce((sum, item) => sum + Number(item.jumlah || 0), 0);

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <ModalInventaris
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSave}
        form={form}
        setForm={setForm}
        isEdit={isEdit}
      />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={pageHeaderIcon}>
              <Package size={32} strokeWidth={2.5} />
            </div>

            <h2 className={pageTitle}>Inventaris</h2>
          </div>

          <p className={pageSubtitle}>
            Kelola data aset, jumlah barang, kondisi, dan keterangan inventaris masjid
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button onClick={openTambah} className={primaryActionButton}>
            <Plus size={20} />
            Tambah Barang
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-hover transition-all hover:scale-105">
          {/* Manggil variabel hasil hitungan reduce */}
          <StatCard
            title="Total Aset"
            value={totalAset}
            icon={<Box size={26} strokeWidth={2.5} />}
            colorClass="bg-blue-50/50 text-blue-600 border border-blue-100 shadow-sm"
          />
        </div>

        <div className="stat-card-hover transition-all hover:scale-105">
          {/* Manggil variabel hasil hitungan reduce */}
          <StatCard
            title="Kondisi Layak"
            value={totalLayak}
            icon={<CheckCircle2 size={26} strokeWidth={2.5} />}
            colorClass="bg-green-50/50 text-green-600 border border-green-100 shadow-sm"
          />
        </div>

        <div className="stat-card-hover transition-all hover:scale-105">
          {/* Manggil variabel hasil hitungan reduce */}
          <StatCard
            title="Perlu Perbaikan"
            value={totalPerbaikan}
            icon={<AlertCircle size={26} strokeWidth={2.5} />}
            colorClass="bg-red-50/50 text-red-600 border border-red-100 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="relative w-full md:w-96 group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-mu-green transition-colors"
            />
            <input
              type="text"
              placeholder="Cari aset masjid..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold text-gray-600 focus:ring-2 focus:ring-mu-green/20 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shrink-0 overflow-x-auto no-scrollbar">
            {['semua', 'baik', 'rusak', 'hilang'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterKondisi(k)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterKondisi === k
                    ? 'bg-white text-mu-green shadow-sm scale-105'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-800 border-b border-gray-100 bg-gray-50/20">
                <th className="p-8">
                  <div className="flex items-center gap-2">
                    <Archive size={14} />
                    Nama Barang
                  </div>
                </th>
                <th className="p-8">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={14} />
                    Kuantitas
                  </div>
                </th>
                <th className="p-8 text-center">Status Aset</th>
                <th className="p-8">Keterangan</th>
                <th className="p-8 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-32 text-center">
                    <div className="animate-bounce inline-block p-4 bg-green-50 rounded-full text-mu-green font-black tracking-widest uppercase italic">
                      Updating Database...
                    </div>
                  </td>
                </tr>
              ) : filteredItems.map((item) => (
                <tr
                  key={item.inventaris_id}
                  className="group hover:bg-mu-green/[0.03] transition-all duration-300 cursor-default"
                >
                  <td className="p-8">
                    {/* Karena dari database nyimpennya huruf kecil semua (mukenah), CSS capitalize ini bakal otomatis bikin awalnya gede jadi "Mukenah" */}
                    <span className="text-sm font-black text-gray-700 capitalize tracking-tighter group-hover:text-mu-green transition-colors">
                      {item.nama_barang}
                    </span>
                  </td>

                  <td className="p-8">
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-black text-gray-800 leading-none">
                        {item.jumlah}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                        Unit
                      </span>
                    </div>
                  </td>

                  <td className="p-8 text-center">
                    <span className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all group-hover:scale-105 shadow-sm ${
                      item.kondisi === 'baik'
                        ? 'bg-green-100/50 text-green-700'
                        : 'bg-red-100/50 text-red-700'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        item.kondisi === 'baik'
                          ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]'
                          : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                      }`}></span>
                      {item.kondisi}
                    </span>
                  </td>

                  <td className="p-8">
                    <div className="flex flex-col gap-1 max-w-[250px]">
                      <p className="text-[11px] text-gray-500 italic font-semibold leading-relaxed line-clamp-2">
                        {item.keterangan || 'Lokasi Belum Terdata'}
                      </p>
                    </div>
                  </td>

                  <td className="p-8 text-center">
                    <div className="flex justify-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="p-4 bg-white border border-gray-100 text-yellow-500 rounded-2xl shadow-sm hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all transform hover:-translate-y-1"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHapus(item.inventaris_id)}
                        className="p-4 bg-white border border-gray-100 text-red-500 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all transform hover:-translate-y-1"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center gap-6 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-gray-200 shadow-sm border border-gray-50 animate-pulse">
              <Archive size={48} />
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 font-black uppercase tracking-widest">
                Aset Tidak Ditemukan
              </p>
              <p className="text-[10px] text-gray-800 italic">
                Coba kata kunci lain atau periksa filter kondisi Anda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataInventaris;