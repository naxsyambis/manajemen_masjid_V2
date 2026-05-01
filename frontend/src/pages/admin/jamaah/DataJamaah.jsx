import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  UserCheck,
  UserMinus,
  Pencil,
  Trash2,
  VenetianMask,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import Button from '../../../components/Button';
import StatCard from '../../../components/StatCard';
import ModalJamaah from './ModalJamaah';

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
                {alertData.confirmText || 'Ya, Lanjut'}
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

const DataJamaah = () => {
  const [jamaah, setJamaah] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  const [alertData, setAlertData] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null
  });

  const [form, setForm] = useState({
    nama: '',
    alamat: '',
    no_hp: '',
    jenis_kelamin: 'Laki-laki',
    peran: '',
    status: 'aktif'
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

  const fetchJamaah = async () => {
    try {
      setLoading(true);

      const res = await axios.get('http://localhost:3000/takmir/jamaah', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataJamaah = Array.isArray(res.data) ? res.data : res.data.data || [];
      setJamaah(dataJamaah);
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error('Gagal ambil data jamaah', err);

      showPopup({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Data jamaah tidak berhasil dimuat.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJamaah();
  }, [token]);

  const filteredJamaah = jamaah.filter((j) => {
    const nama = j.nama || '';
    const alamat = j.alamat || '';
    const noHp = j.no_hp || '';
    const peran = j.peran || '';

    const keyword = searchTerm.toLowerCase();

    const matchSearch =
      nama.toLowerCase().includes(keyword) ||
      alamat.toLowerCase().includes(keyword) ||
      noHp.toLowerCase().includes(keyword) ||
      peran.toLowerCase().includes(keyword);

    const matchStatus = filterStatus === 'semua' || j.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const openTambah = () => {
    setIsEdit(false);
    setSelected(null);
    setForm({
      nama: '',
      alamat: '',
      no_hp: '',
      jenis_kelamin: 'Laki-laki',
      peran: '',
      status: 'aktif'
    });
    setShowForm(true);
  };

  const handleEdit = (j) => {
    setIsEdit(true);
    setSelected(j);
    setForm({
      nama: j.nama || '',
      alamat: j.alamat || '',
      no_hp: j.no_hp || '',
      jenis_kelamin: j.jenis_kelamin || 'Laki-laki',
      peran: j.peran || '',
      status: j.status || 'aktif'
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const nama = form.nama.trim();
    const alamat = form.alamat.trim();
    const noHp = form.no_hp.trim();
    const peran = form.peran.trim();

    if (!nama) {
      showPopup({
        type: 'warning',
        title: 'Nama Kosong',
        message: 'Nama lengkap jamaah wajib diisi.'
      });
      return false;
    }

    if (nama.length < 3) {
      showPopup({
        type: 'warning',
        title: 'Nama Terlalu Pendek',
        message: 'Nama jamaah minimal 3 karakter.'
      });
      return false;
    }

    if (!alamat) {
      showPopup({
        type: 'warning',
        title: 'Alamat Kosong',
        message: 'Alamat jamaah wajib diisi.'
      });
      return false;
    }

    if (!noHp) {
      showPopup({
        type: 'warning',
        title: 'Nomor HP Kosong',
        message: 'Nomor HP jamaah wajib diisi.'
      });
      return false;
    }

    if (!/^[0-9]+$/.test(noHp)) {
      showPopup({
        type: 'warning',
        title: 'Nomor HP Tidak Valid',
        message: 'Nomor HP hanya boleh berisi angka.\nContoh: 081234567890'
      });
      return false;
    }

    if (!noHp.startsWith('08')) {
      showPopup({
        type: 'warning',
        title: 'Nomor HP Tidak Valid',
        message: 'Nomor HP harus diawali dengan 08.'
      });
      return false;
    }

    if (noHp.length < 10 || noHp.length > 15) {
      showPopup({
        type: 'warning',
        title: 'Nomor HP Tidak Valid',
        message: 'Nomor HP harus 10 sampai 15 digit.'
      });
      return false;
    }

    if (!form.jenis_kelamin) {
      showPopup({
        type: 'warning',
        title: 'Gender Kosong',
        message: 'Jenis kelamin jamaah wajib dipilih.'
      });
      return false;
    }

    if (!peran) {
      showPopup({
        type: 'warning',
        title: 'Peran Kosong',
        message: 'Peran jamaah wajib diisi.\nContoh: jamaah, imam, muadzin, marbot.'
      });
      return false;
    }

    if (!form.status) {
      showPopup({
        type: 'warning',
        title: 'Status Kosong',
        message: 'Status jamaah wajib dipilih.'
      });
      return false;
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      nama: form.nama.trim(),
      alamat: form.alamat.trim(),
      no_hp: form.no_hp.trim(),
      jenis_kelamin: form.jenis_kelamin,
      peran: form.peran.trim(),
      status: form.status
    };

    try {
      if (isEdit) {
        await axios.put(`http://localhost:3000/takmir/jamaah/${selected.jamaah_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showPopup({
          type: 'success',
          title: 'Data Diperbarui',
          message: 'Data jamaah berhasil diperbarui.'
        });
      } else {
        await axios.post('http://localhost:3000/takmir/jamaah', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        showPopup({
          type: 'success',
          title: 'Data Tersimpan',
          message: 'Data jamaah berhasil ditambahkan.'
        });
      }

      setShowForm(false);
      fetchJamaah();
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error('Gagal menyimpan data jamaah', err);

      showPopup({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.response?.data?.message || 'Data jamaah gagal disimpan.'
      });
    }
  };

  const handleHapus = async (id) => {
    showPopup({
      type: 'confirm',
      title: 'Hapus Data Jamaah?',
      message: 'Data yang dihapus tidak dapat dikembalikan.',
      confirmText: 'Hapus',
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:3000/takmir/jamaah/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          showPopup({
            type: 'success',
            title: 'Data Dihapus',
            message: 'Data jamaah berhasil dihapus.'
          });

          fetchJamaah();
        } catch (err) {
          if (handleAuthError(err, showPopup)) return;

          console.error('Gagal hapus data jamaah', err);

          showPopup({
            type: 'error',
            title: 'Gagal Menghapus',
            message: err.response?.data?.message || 'Data jamaah gagal dihapus.'
          });
        }
      }
    });
  };

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <ModalJamaah
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
              <Users size={32} strokeWidth={2.5} />
            </div>

            <h2 className={pageTitle}>Jamaah</h2>
          </div>

          <p className={pageSubtitle}>
            Kelola data jamaah, kontak, alamat, peran, dan status keaktifan
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button onClick={openTambah} className={primaryActionButton}>
            <UserPlus size={20} />
            Tambah Jamaah
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Jamaah"
          value={jamaah.length}
          icon={<Users size={26} strokeWidth={2.5} />}
          colorClass="bg-blue-50/50 text-blue-600 border border-blue-100 shadow-sm"
        />

        <StatCard
          title="Jamaah Aktif"
          value={jamaah.filter((j) => j.status === 'aktif').length}
          icon={<UserCheck size={26} strokeWidth={2.5} />}
          colorClass="bg-green-50/50 text-green-600 border border-green-100 shadow-sm"
        />

        <StatCard
          title="Tidak Aktif"
          value={jamaah.filter((j) => j.status !== 'aktif').length}
          icon={<UserMinus size={26} strokeWidth={2.5} />}
          colorClass="bg-gray-50/50 text-gray-400 border border-gray-100 shadow-sm"
        />
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
              Daftar Jamaah
            </h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Total: {filteredJamaah.length}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-96 group">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors"
              />
              <input
                type="text"
                placeholder="Cari nama, alamat, no HP, atau peran..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl outline-none text-sm font-medium text-gray-700 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shrink-0 overflow-x-auto no-scrollbar">
              {['semua', 'aktif', 'tidak aktif'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filterStatus === s
                      ? 'bg-white text-mu-green shadow-sm scale-105'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  No
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Nama Lengkap
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Alamat
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  No HP
                </th>
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Gender
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Peran
                </th>
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Status
                </th>
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-24 text-gray-400 text-sm font-black uppercase tracking-[0.2em]"
                  >
                    Memuat Data...
                  </td>
                </tr>
              ) : filteredJamaah.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 shadow-sm border border-gray-50">
                        <VenetianMask size={40} />
                      </div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                        Data Tidak Ditemukan
                      </p>
                      <p className="text-gray-400 text-sm italic">
                        Coba periksa kembali kata kunci atau filter Anda.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJamaah.map((j, index) => (
                  <tr
                    key={j.jamaah_id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      <span className="text-sm font-black text-gray-400">
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="flex items-center gap-3 max-w-[260px]">
                        <div className="w-10 h-10 rounded-2xl bg-mu-green text-white flex items-center justify-center shadow-lg shadow-green-100 shrink-0 font-black text-base">
                          {j.nama?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span
                          className="text-sm font-black text-gray-800 uppercase tracking-tighter truncate group-hover:text-mu-green transition-colors"
                          title={j.nama}
                        >
                          {j.nama}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="flex items-center gap-2 max-w-[260px]">
                        <MapPin size={16} className="text-mu-green shrink-0" />
                        <span
                          className="text-sm text-gray-500 font-semibold italic leading-relaxed truncate"
                          title={j.alamat || '-'}
                        >
                          {j.alamat || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="inline-flex items-center gap-2 text-gray-800">
                        <Phone size={16} className="text-mu-green shrink-0" />
                        <span className="text-sm font-bold font-mono whitespace-nowrap">
                          {j.no_hp || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border bg-gray-100 text-gray-600 border-gray-200">
                        {j.jenis_kelamin || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <span
                        className="text-sm font-black text-mu-green uppercase tracking-tighter truncate block max-w-[160px]"
                        title={j.peran || 'jamaah'}
                      >
                        {j.peran || 'jamaah'}
                      </span>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      <span
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-sm border ${
                          j.status === 'aktif'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            j.status === 'aktif' ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        ></span>
                        {j.status || '-'}
                      </span>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      <div className="flex justify-center items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleEdit(j)}
                          className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                          title="Edit Jamaah"
                        >
                          <Pencil size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleHapus(j.jamaah_id)}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="Hapus Jamaah"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataJamaah;