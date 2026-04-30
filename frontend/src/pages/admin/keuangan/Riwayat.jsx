import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ModalCalenderRiwayat from './ModalCalenderRiwayat';
import { 
  Search,
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
  Info
} from 'lucide-react';

import Button from '../../../components/Button';
import { formatRupiah } from '../../../utils/formatCurrency';
import { formatTanggal } from '../../../utils/formatDate';
import { generateKwitansiPDF } from '../../../utils/generatePDFinvoice';
import { generateLaporanKeuanganPDF } from '../../../utils/generateLaporanKeuanganPDF';
import ModalRiwayat from './ModalRiwayat';

const handleAuthError = (err, showPopup) => { 
  if (err.response && err.response.status === 401) {
    const message = err.response.data.message || "Sesi Anda telah berakhir";

    if (showPopup) {
      showPopup({
        type: "error",
        title: "Sesi Berakhir",
        message,
        confirmText: "Login Ulang",
        onConfirm: () => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
    } else {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return true;
  }

  return false;
};

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";

  const Icon = isSuccess
    ? CheckCircle2
    : isError
      ? XCircle
      : isWarning
        ? AlertTriangle
        : Info;

  const iconClass = isSuccess
    ? "bg-green-100 text-green-600"
    : isError
      ? "bg-red-100 text-red-600"
      : isWarning
        ? "bg-yellow-100 text-yellow-600"
        : "bg-blue-100 text-blue-600";

  const buttonClass = isSuccess
    ? "bg-green-600 hover:bg-green-700 text-white"
    : isError
      ? "bg-red-600 hover:bg-red-700 text-white"
      : isWarning
        ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green"
        : "bg-mu-green hover:bg-green-700 text-white";

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

          <button
            type="button"
            onClick={onClose}
            className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
          >
            {alertData.confirmText || "Mengerti"}
          </button>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('semua');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const token = localStorage.getItem('token');

  const showPopup = ({
    type = "info",
    title = "Informasi",
    message = "",
    confirmText = "",
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
      type: "info",
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null
    });

    if (callback) {
      setTimeout(callback, 100);
    }
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
          type: "info",
          title: "Belum Ada Transaksi",
          message: "Data transaksi keuangan masih kosong."
        });
      }
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal ambil data riwayat", err);

      showPopup({
        type: "error",
        title: "Gagal Memuat Riwayat",
        message: "Data riwayat transaksi gagal dimuat."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    let results = transaksi.filter(item => {
      const deskripsi = item.deskripsi || '';
      const id = item.keuangan_id ? item.keuangan_id.toString() : '';

      return (
        deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.includes(searchTerm)
      );
    });

    if (filterType === 'masuk') {
      results = results.filter(item => Number(item.jumlah) > 0);
    }

    if (filterType === 'keluar') {
      results = results.filter(item => Number(item.jumlah) < 0);
    }

    setFilteredTransaksi(results);
  }, [searchTerm, filterType, transaksi]);

  const handleExportLaporan = (startDate, endDate) => {
    if (!startDate || !endDate) {
      showPopup({
        type: "warning",
        title: "Tanggal Belum Lengkap",
        message: "Pilih tanggal awal dan tanggal akhir laporan."
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showPopup({
        type: "warning",
        title: "Periode Tidak Valid",
        message: "Tanggal awal tidak boleh lebih besar dari tanggal akhir."
      });
      return;
    }

    const filtered = transaksi.filter(item => {
      const tgl = new Date(item.tanggal);
      return tgl >= new Date(startDate) && tgl <= new Date(endDate);
    });

    if (filtered.length === 0) {
      showPopup({
        type: "warning",
        title: "Data Tidak Ada",
        message: "Tidak ada transaksi pada periode tersebut."
      });
      return;
    }

    try {
      generateLaporanKeuanganPDF(
        filtered,
        startDate,
        endDate,
        localStorage.getItem("namaMasjid") || "MASJID MUHAMMADIYAH",
        "TAKMIR MASJID"
      );

      setShowExportModal(false);

      showPopup({
        type: "success",
        title: "Laporan Dibuat",
        message: "Laporan keuangan periode berhasil dibuat."
      });
    } catch (error) {
      console.error("Gagal export laporan:", error);

      showPopup({
        type: "error",
        title: "Gagal Export",
        message: "Laporan keuangan gagal dibuat."
      });
    }
  };

  const handleCetak = async (item) => {
    try {
      if (!item) {
        showPopup({
          type: "warning",
          title: "Data Tidak Valid",
          message: "Transaksi yang dipilih tidak ditemukan."
        });
        return;
      }

      const catName =
        categories.find(c => c.kategori_id === item.kategori_id)?.nama_kategori ||
        'Umum';

      const savedTtd = localStorage.getItem('ttdImage');

      let donaturName = item.jumlah > 0 ? "Hamba Allah" : "Penerima";
      let cleanDeskripsi = item.deskripsi || "-";

      if (item.deskripsi && item.deskripsi.includes(' - Donatur: ')) {
        const parts = item.deskripsi.split(' - Donatur: ');
        cleanDeskripsi = parts[0];
        donaturName = parts[1] || "Hamba Allah";
      }

      if (item.deskripsi && item.deskripsi.includes(' - Penerima: ')) {
        const parts = item.deskripsi.split(' - Penerima: ');
        cleanDeskripsi = parts[0];
        donaturName = parts[1] || "Penerima";
      }

      await generateKwitansiPDF({
        id: `TX-${item.keuangan_id}`,
        tanggal: formatTanggal(item.tanggal),
        donatur: donaturName,
        kategori: catName,
        nominal: parseFloat(item.jumlah),
        keterangan: cleanDeskripsi,
        jenis: item.jumlah > 0 ? 'PEMASUKAN' : 'PENGELUARAN'
      }, savedTtd);

      showPopup({
        type: "success",
        title: "Kwitansi Dibuat",
        message: "Kwitansi transaksi berhasil dibuat."
      });
    } catch (error) {
      console.error("Gagal cetak kwitansi:", error);

      showPopup({
        type: "error",
        title: "Gagal Cetak",
        message: "Kwitansi transaksi gagal dibuat."
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-mu-green">
            <Database size={28} className="animate-pulse" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-800">
              Riwayat Transaksi
            </h2>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
            <Clock size={14} /> Kelola dan cetak bukti kwitansi transaksi keuangan.
          </p>
        </div>

        <Button 
          onClick={() => {
            if (transaksi.length === 0) {
              showPopup({
                type: "warning",
                title: "Data Kosong",
                message: "Belum ada transaksi untuk diexport."
              });
              return;
            }

            setShowExportModal(true);
          }}
          className="flex items-center gap-2 bg-mu-green !text-white rounded-2xl shadow-xl shadow-green-100 hover:bg-green-800 transition-all border-none"
        >
          <FileDown size={18} /> Export Laporan Periode
        </Button>
      </div>

      {/* SEARCH & FILTER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Cari ID atau Deskripsi..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] outline-none shadow-sm font-medium text-sm focus:ring-2 focus:ring-mu-green/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-[2rem] gap-2 border border-gray-200/50">
          {['semua','masuk','keluar'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all
                ${filterType === type ? 'bg-white text-mu-green shadow-md' : 'text-gray-400'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-900 font-black">
                <th className="p-6 w-[60px] text-center">#</th>
                <th className="p-6 w-[150px]">Tanggal</th>
                <th className="p-6 w-[130px]">Kategori</th>
                <th className="p-6 w-[100px] text-center">Jenis</th>
                <th className="p-6 w-[160px]">Nama Donatur</th>
                <th className="p-6 w-[160px]">Arus Kas</th>
                <th className="p-6 w-[180px]">Deskripsi</th>
                <th className="p-6 w-[100px] text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 text-gray-700 font-bold">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center uppercase text-[10px] tracking-widest text-gray-400">
                    Memproses Data...
                  </td>
                </tr>
              ) : filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Database size={42} className="text-gray-200" />
                      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        Data Tidak Ditemukan
                      </p>
                      <p className="text-gray-400 text-xs italic">
                        Coba ubah kata kunci pencarian atau filter transaksi.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransaksi.map((item) => {
                const isMasuk = Number(item.jumlah) > 0;
                const catName = categories.find(c => c.kategori_id === item.kategori_id)?.nama_kategori || 'Umum';

                let donaturDisplay = isMasuk ? "Hamba Allah" : "Penerima";
                let descDisplay = item.deskripsi || "-";

                if (item.deskripsi && item.deskripsi.includes(' - Donatur: ')) {
                  const parts = item.deskripsi.split(' - Donatur: ');
                  descDisplay = parts[0];
                  donaturDisplay = parts[1] || "Hamba Allah";
                }

                if (item.deskripsi && item.deskripsi.includes(' - Penerima: ')) {
                  const parts = item.deskripsi.split(' - Penerima: ');
                  descDisplay = parts[0];
                  donaturDisplay = parts[1] || "Penerima";
                }

                return (
                  <tr key={item.keuangan_id} className="group hover:bg-mu-green/[0.02] transition-colors">
                    <td className="p-6 text-center text-[10px] font-mono text-gray-400">
                      #{item.keuangan_id}
                    </td>

                    <td className="p-6 italic text-sm">
                      {formatTanggal(item.tanggal)}
                    </td>

                    <td className="p-6">
                      <div className="flex items-center gap-2 text-mu-green">
                        <Tag size={12} className="opacity-50 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-tight truncate">
                          {catName}
                        </span>
                      </div>
                    </td>

                    <td className="p-6 text-center">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isMasuk
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : 'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {isMasuk ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>

                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-mu-green shrink-0">
                          <User size={12} />
                        </div>
                        <span className="text-xs font-black text-gray-800 uppercase truncate" title={donaturDisplay}>
                          {donaturDisplay}
                        </span>
                      </div>
                    </td>

                    <td className={`p-6 font-black text-base ${
                      isMasuk ? 'text-mu-green' : 'text-red-600'
                    }`}>
                      {formatRupiah(Math.abs(Number(item.jumlah)))}
                    </td>

                    <td className="p-6 text-xs italic text-gray-500">
                      <p className="truncate max-w-[150px]" title={descDisplay}>
                        {descDisplay || '-'}
                      </p>
                    </td>

                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleCetak(item)} 
                          className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl text-blue-600 transition-all shadow-sm"
                          title="Cetak Kwitansi"
                        >
                          <FileText size={16}/>
                        </button>

                        <button 
                          onClick={() => {
                            setSelectedTransaksi(item);
                            setShowEditModal(true);
                          }} 
                          className="p-2 bg-yellow-50 hover:bg-yellow-500 hover:text-white rounded-xl text-yellow-600 transition-all shadow-sm"
                          title="Edit Transaksi"
                        >
                          <Pencil size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            type: "success",
            title: "Data Diperbarui",
            message: "Transaksi berhasil diperbarui."
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