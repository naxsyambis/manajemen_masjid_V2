import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ModalCalenderRiwayat from './ModalCalenderRiwayat';
import {
  Calendar,
  FileDown,
  Pencil,
  Database,
  Clock,
  User,
  FileText,
  Tag,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCcw
} from 'lucide-react';

import Button from '../../../components/Button';
import { formatRupiah } from '../../../utils/formatCurrency';
import { formatTanggal } from '../../../utils/formatDate';
import { generateKwitansiPDF } from '../../../utils/generatePDFinvoice';
import { generateLaporanKeuanganPDF } from '../../../utils/generateLaporanKeuanganPDF';
import ModalRiwayat from './ModalRiwayat';

const primaryActionButton =
  '!h-14 !min-w-[230px] !inline-flex !items-center !justify-center !gap-2 !bg-mu-green !text-white !px-8 !py-4 !rounded-2xl !text-xs !font-black !uppercase !tracking-widest hover:!bg-green-700 !shadow-lg !shadow-green-100 !transition-all active:!scale-95 !border-none';

const secondaryActionButton =
  'h-14 min-w-[140px] inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

const pageHeaderIcon =
  'p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300';

const pageTitle =
  'text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none';

const pageSubtitle =
  'text-xs text-gray-400 font-bold uppercase tracking-[0.22em] ml-1 leading-relaxed flex items-center gap-2';

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

const Riwayat = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('semua');

  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

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

  const fetchData = async () => {
    try {
      setLoading(true);

      const resCat = await axios.get('http://localhost:3000/takmir/kategori-keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const resTrans = await axios.get('http://localhost:3000/takmir/keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const kategoriData = Array.isArray(resCat.data)
        ? resCat.data
        : Array.isArray(resCat.data.data)
          ? resCat.data.data
          : [];

      setCategories(kategoriData);

      const rawData = Array.isArray(resTrans.data)
        ? resTrans.data
        : Array.isArray(resTrans.data.data)
          ? resTrans.data.data
          : [];

      const data = [...rawData].reverse();

      setTransaksi(data);
      setFilteredTransaksi(data);

      if (data.length === 0) {
        showPopup({
          type: 'info',
          title: 'Belum Ada Transaksi',
          message: 'Data transaksi keuangan masih kosong.'
        });
      }
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error('Gagal ambil data riwayat', err);

      showPopup({
        type: 'error',
        title: 'Gagal Memuat Riwayat',
        message: 'Data riwayat transaksi gagal dimuat.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    let results = [...transaksi];

    if (filterType === 'masuk') {
      results = results.filter((item) => Number(item.jumlah) > 0);
    }

    if (filterType === 'keluar') {
      results = results.filter((item) => Number(item.jumlah) < 0);
    }

    if (tanggalAwal) {
      const start = new Date(`${tanggalAwal}T00:00:00`);

      results = results.filter((item) => {
        if (!item.tanggal) return false;

        const tanggalItem = new Date(item.tanggal);
        return tanggalItem >= start;
      });
    }

    if (tanggalAkhir) {
      const end = new Date(`${tanggalAkhir}T23:59:59`);

      results = results.filter((item) => {
        if (!item.tanggal) return false;

        const tanggalItem = new Date(item.tanggal);
        return tanggalItem <= end;
      });
    }

    setFilteredTransaksi(results);
  }, [transaksi, filterType, tanggalAwal, tanggalAkhir]);

  const handleResetTanggal = () => {
    setTanggalAwal('');
    setTanggalAkhir('');
  };

  const handleExportLaporan = (startDate, endDate) => {
    if (!startDate || !endDate) {
      showPopup({
        type: 'warning',
        title: 'Tanggal Belum Lengkap',
        message: 'Pilih tanggal awal dan tanggal akhir laporan.'
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showPopup({
        type: 'warning',
        title: 'Periode Tidak Valid',
        message: 'Tanggal awal tidak boleh lebih besar dari tanggal akhir.'
      });
      return;
    }

    const filtered = transaksi.filter((item) => {
      const tgl = new Date(item.tanggal);
      return tgl >= new Date(startDate) && tgl <= new Date(endDate);
    });

    if (filtered.length === 0) {
      showPopup({
        type: 'warning',
        title: 'Data Tidak Ada',
        message: 'Tidak ada transaksi pada periode tersebut.'
      });
      return;
    }

    try {
      generateLaporanKeuanganPDF(
        filtered,
        startDate,
        endDate,
        localStorage.getItem('namaMasjid') || 'MASJID MUHAMMADIYAH',
        'TAKMIR MASJID'
      );

      setShowExportModal(false);

      showPopup({
        type: 'success',
        title: 'Laporan Dibuat',
        message: 'Laporan keuangan periode berhasil dibuat.'
      });
    } catch (error) {
      console.error('Gagal export laporan:', error);

      showPopup({
        type: 'error',
        title: 'Gagal Export',
        message: 'Laporan keuangan gagal dibuat.'
      });
    }
  };

  const handleCetak = async (item) => {
    try {
      if (!item) {
        showPopup({
          type: 'warning',
          title: 'Data Tidak Valid',
          message: 'Transaksi yang dipilih tidak ditemukan.'
        });
        return;
      }

      const catName =
        categories.find((c) => c.kategori_id === item.kategori_id)?.nama_kategori ||
        'Umum';

      const savedTtd = localStorage.getItem('ttdImage');

      const donaturName =
        item.nama_donatur || (Number(item.jumlah) > 0 ? 'Hamba Allah' : 'Penerima');

      const cleanDeskripsi = item.deskripsi || '-';

      await generateKwitansiPDF(
        {
          id: `TX-${item.keuangan_id}`,
          tanggal: formatTanggal(item.tanggal),
          donatur: donaturName,
          kategori: catName,
          nominal: parseFloat(item.jumlah),
          keterangan: cleanDeskripsi,
          jenis: Number(item.jumlah) > 0 ? 'PEMASUKAN' : 'PENGELUARAN'
        },
        savedTtd
      );

      showPopup({
        type: 'success',
        title: 'Kwitansi Dibuat',
        message: 'Kwitansi transaksi berhasil dibuat.'
      });
    } catch (error) {
      console.error('Gagal cetak kwitansi:', error);

      showPopup({
        type: 'error',
        title: 'Gagal Cetak',
        message: 'Kwitansi transaksi gagal dibuat.'
      });
    }
  };

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={pageHeaderIcon}>
              <Database size={32} strokeWidth={2.5} />
            </div>

            <h2 className={pageTitle}>Riwayat Transaksi</h2>
          </div>

          <p className={pageSubtitle}>
            <Clock size={14} />
            Kelola riwayat pemasukan, pengeluaran, kwitansi, dan laporan periode
          </p>
        </div>

        <Button
          onClick={() => {
            if (transaksi.length === 0) {
              showPopup({
                type: 'warning',
                title: 'Data Kosong',
                message: 'Belum ada transaksi untuk diexport.'
              });
              return;
            }

            setShowExportModal(true);
          }}
          className={primaryActionButton}
        >
          <FileDown size={20} />
          Export Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm px-5 py-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-mu-green" />
              Tanggal Awal
            </label>

            <input
              type="date"
              value={tanggalAwal}
              onChange={(e) => setTanggalAwal(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm px-5 py-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-mu-green" />
              Tanggal Akhir
            </label>

            <input
              type="date"
              value={tanggalAkhir}
              onChange={(e) => setTanggalAkhir(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row xl:flex-col gap-4">
          <div className="flex bg-gray-100 p-1.5 rounded-[2rem] gap-2 border border-gray-200/50 flex-1">
            {['semua', 'masuk', 'keluar'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`flex-1 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === type
                    ? 'bg-white text-mu-green shadow-md'
                    : 'text-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleResetTanggal}
            className={secondaryActionButton}
          >
            <RefreshCcw size={18} />
            Reset
          </button>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
              Daftar Transaksi
            </h3>

            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              Total: {filteredTransaksi.length}
            </p>
          </div>

          {(tanggalAwal || tanggalAkhir) && (
            <div className="px-5 py-3 bg-mu-green/5 border border-mu-green/10 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-mu-green">
                Filter tanggal aktif
              </p>
              <p className="text-xs font-bold text-gray-500 mt-1">
                {tanggalAwal || 'Awal'} - {tanggalAkhir || 'Akhir'}
              </p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  No
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Tanggal
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Kategori
                </th>
                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Jenis
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Nama Donatur
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Arus Kas
                </th>
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Deskripsi
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
                    Memproses Data...
                  </td>
                </tr>
              ) : filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 shadow-sm border border-gray-50">
                        <Database size={40} />
                      </div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                        Data Tidak Ditemukan
                      </p>
                      <p className="text-gray-400 text-sm italic">
                        Coba ubah filter tanggal atau filter transaksi.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item, index) => {
                  const isMasuk = Number(item.jumlah) > 0;
                  const catName =
                    categories.find((c) => c.kategori_id === item.kategori_id)?.nama_kategori ||
                    'Umum';

                  const donaturDisplay =
                    item.nama_donatur || (isMasuk ? 'Hamba Allah' : 'Penerima');

                  const descDisplay = item.deskripsi || '-';

                  return (
                    <tr
                      key={item.keuangan_id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-6 border-b border-gray-50 text-center">
                        <span className="text-sm font-black text-gray-400">
                          {index + 1}
                        </span>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="text-sm font-bold text-gray-800 italic whitespace-nowrap">
                          {formatTanggal(item.tanggal)}
                        </div>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="inline-flex items-center gap-2 text-mu-green max-w-[180px]">
                          <Tag size={14} className="opacity-60 shrink-0" />
                          <span className="text-xs font-black uppercase tracking-widest truncate">
                            {catName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50 text-center">
                        <span
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                            isMasuk
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {isMasuk ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="flex items-center gap-3 max-w-[220px]">
                          <div className="w-10 h-10 rounded-2xl bg-mu-green text-white flex items-center justify-center shadow-lg shadow-green-100 shrink-0">
                            <User size={18} />
                          </div>
                          <span
                            className="text-sm font-black text-gray-800 uppercase tracking-tighter truncate group-hover:text-mu-green transition-colors"
                            title={donaturDisplay}
                          >
                            {donaturDisplay}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50">
                        <div
                          className={`text-lg font-black tracking-tight whitespace-nowrap ${
                            isMasuk ? 'text-mu-green' : 'text-red-600'
                          }`}
                        >
                          {formatRupiah(Math.abs(Number(item.jumlah)))}
                        </div>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50">
                        <p
                          className="text-sm text-gray-500 font-semibold italic leading-relaxed max-w-[260px] truncate"
                          title={descDisplay}
                        >
                          {descDisplay}
                        </p>
                      </td>

                      <td className="px-6 py-6 border-b border-gray-50 text-center">
                        <div className="flex justify-center items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCetak(item)}
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Cetak Kwitansi"
                          >
                            <FileText size={20} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTransaksi(item);
                              setShowEditModal(true);
                            }}
                            className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                            title="Edit Transaksi"
                          >
                            <Pencil size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalRiwayat
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          fetchData();
          showPopup({
            type: 'success',
            title: 'Data Diperbarui',
            message: 'Transaksi berhasil diperbarui.'
          });
        }}
        data={selectedTransaksi}
        categories={categories}
      />

      <ModalCalenderRiwayat
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportLaporan}
      />
    </div>
  );
};

export default Riwayat;