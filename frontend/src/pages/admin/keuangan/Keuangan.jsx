import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { 
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  User,
  Calendar,
  Save,
  Plus,
  Tag,
  FileText,
  Pencil,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import ModalKeuangan from './ModalKeuangan';

const handleAuthError = (err, showPopup) => {
  if (err.response && err.response.status === 401) {
    const message = err.response.data.message || "Sesi Anda telah berakhir";

    if (showPopup) {
      showPopup({
        type: "error",
        title: "Sesi Berakhir",
        message,
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

  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;

  const iconClass = isSuccess
    ? "bg-green-100 text-green-600"
    : isError
      ? "bg-red-100 text-red-600"
      : isWarning
        ? "bg-yellow-100 text-yellow-600"
        : "bg-blue-100 text-blue-600";

  const buttonClass = isSuccess
    ? "bg-green-600 hover:bg-green-700"
    : isError
      ? "bg-red-600 hover:bg-red-700"
      : isWarning
        ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green"
        : "bg-mu-green hover:bg-green-700";

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
            Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Keuangan = () => {
  const [formData, setFormData] = useState({
    jenis_transaksi: 'pemasukan',
    jumlah: '',
    deskripsi: '',
    donatur: '',
    tanggal: new Date().toISOString().split('T')[0],
    kategori_id: '' 
  });

  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null
  });

  const dropdownRef = useRef(null);
  const token = localStorage.getItem('token');

  const showPopup = ({
    type = "info",
    title = "Informasi",
    message = "",
    onConfirm = null
  }) => {
    setAlertData({
      show: true,
      type,
      title,
      message,
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
      onConfirm: null
    });

    if (callback) {
      setTimeout(callback, 100);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:3000/takmir/kategori-keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const kategoriData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCategories(kategoriData);

      if (kategoriData.length > 0 && !formData.kategori_id) {
        setFormData(prev => ({ ...prev, kategori_id: kategoriData[0].kategori_id }));
      }
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal mengambil kategori", err);

      showPopup({
        type: "error",
        title: "Gagal Memuat Kategori",
        message: "Kategori keuangan tidak berhasil dimuat."
      });
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [token]);

  const showNominalFormatAlert = () => {
    showPopup({
      type: "warning",
      title: "Format Nominal Salah",
      message: "Gunakan angka polos tanpa titik/koma.\nContoh benar: 500000"
    });
  };

  const validateNominal = (value) => {
    const nominalText = String(value || '').trim();

    if (!nominalText) {
      showPopup({
        type: "warning",
        title: "Nominal Kosong",
        message: "Nominal transaksi wajib diisi."
      });
      return false;
    }

    if (nominalText.includes('.') || nominalText.includes(',')) {
      showNominalFormatAlert();
      return false;
    }

    if (!/^[0-9]+$/.test(nominalText)) {
      showNominalFormatAlert();
      return false;
    }

    const nominalNumber = Number(nominalText);

    if (!Number.isInteger(nominalNumber)) {
      showNominalFormatAlert();
      return false;
    }

    if (nominalNumber <= 0) {
      showPopup({
        type: "warning",
        title: "Nominal Tidak Valid",
        message: "Nominal tidak boleh 0 atau minus."
      });
      return false;
    }

    if (nominalNumber < 500) {
      showPopup({
        type: "warning",
        title: "Nominal Terlalu Kecil",
        message: "Nominal transaksi minimal Rp 500."
      });
      return false;
    }

    return true;
  };

  const handleJumlahChange = (e) => {
    const value = e.target.value;

    if (value === '') {
      setFormData({ ...formData, jumlah: '' });
      return;
    }

    if (value.includes('.') || value.includes(',')) {
      showNominalFormatAlert();
      return;
    }

    if (!/^[0-9]+$/.test(value)) {
      showNominalFormatAlert();
      return;
    }

    setFormData({ ...formData, jumlah: value });
  };

  const handleJumlahBlur = () => {
    if (!formData.jumlah) return;
    validateNominal(formData.jumlah);
  };

  const selectedCategoryName =
    categories.find(c => c.kategori_id == formData.kategori_id)?.nama_kategori ||
    "Pilih Kategori";

  const handleSimpan = async (e) => {
    e.preventDefault();

    if (!validateNominal(formData.jumlah)) {
      return;
    }

    if (!formData.kategori_id) {
      showPopup({
        type: "warning",
        title: "Kategori Kosong",
        message: "Pilih kategori transaksi terlebih dahulu."
      });
      return;
    }

    if (!formData.tanggal) {
      showPopup({
        type: "warning",
        title: "Tanggal Kosong",
        message: "Tanggal transaksi wajib diisi."
      });
      return;
    }

    if (!formData.deskripsi.trim()) {
      showPopup({
        type: "warning",
        title: "Keterangan Kosong",
        message: "Keterangan transaksi wajib diisi."
      });
      return;
    }

    if (formData.jenis_transaksi === 'pengeluaran' && !formData.donatur.trim()) {
      showPopup({
        type: "warning",
        title: "Penerima Kosong",
        message: "Penerima wajib diisi untuk pengeluaran."
      });
      return;
    }

    const nominalCheck = Number(formData.jumlah);

    try {
      const nominalFinal =
        formData.jenis_transaksi === 'pengeluaran'
          ? -Math.abs(nominalCheck)
          : Math.abs(nominalCheck);

      const namaPihak =
        formData.jenis_transaksi === 'pemasukan'
          ? formData.donatur.trim() || 'Hamba Allah'
          : formData.donatur.trim();

      await axios.post('http://localhost:3000/takmir/keuangan', {
        jumlah: nominalFinal,
        tanggal: formData.tanggal,
        deskripsi: `${formData.deskripsi.trim()} - ${formData.jenis_transaksi === 'pemasukan' ? 'Donatur' : 'Penerima'}: ${namaPihak}`,
        kategori_id: parseInt(formData.kategori_id)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup({
        type: "success",
        title: "Transaksi Tersimpan",
        message: `Data ${formData.jenis_transaksi} berhasil disimpan.`
      });

      setFormData({
        ...formData,
        jumlah: '',
        deskripsi: '',
        donatur: ''
      });
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal menyimpan transaksi:", err);

      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: "Transaksi gagal disimpan ke database."
      });
    }
  };

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd] min-h-screen">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-all duration-300">
                <Wallet size={32} strokeWidth={2.5} />
             </div>
             <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Kas Masjid
             </h2>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] ml-1">
            Manajemen Arus Kas Digital
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <form onSubmit={handleSimpan} className="p-10 space-y-10">
          
          <div className="flex p-1.5 bg-gray-100 rounded-[2rem] gap-1.5 border border-gray-200/50">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, jenis_transaksi: 'pemasukan' })}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.6rem] font-bold uppercase text-xs transition-all ${
                formData.jenis_transaksi === 'pemasukan'
                  ? 'bg-white text-mu-green shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <ArrowDownCircle size={18} />
              Pemasukan
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, jenis_transaksi: 'pengeluaran' })}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.6rem] font-bold uppercase text-xs transition-all ${
                formData.jenis_transaksi === 'pengeluaran'
                  ? 'bg-white text-red-500 shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <ArrowUpCircle size={18} />
              Pengeluaran
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors">
                <Plus size={14} />
                Nominal (Rp)
              </label>

              <input 
                type="text"
                inputMode="numeric"
                value={formData.jumlah}
                className="w-full pl-6 pr-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-xl font-black shadow-inner"
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", ".", ",", " "].includes(e.key)) {
                    e.preventDefault();
                    showNominalFormatAlert();
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text');

                  if (!/^[0-9]+$/.test(pasted)) {
                    e.preventDefault();
                    showNominalFormatAlert();
                  }
                }}
                onChange={handleJumlahChange}
                onBlur={handleJumlahBlur}
                placeholder="Contoh: 500000"
                required 
              />

              <p className="text-[10px] font-bold text-gray-400 ml-2">
                Tulis angka polos tanpa titik/koma. Contoh: 500000, bukan 500.000.
              </p>
            </div>

            <div className="space-y-3 group relative" ref={dropdownRef}>
              <div className="flex justify-between items-center pr-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors">
                  <Tag size={14} />
                  Kategori
                </label>

                <div className="flex items-center gap-3">
                  {categories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.kategori_id) {
                          showPopup({
                            type: "warning",
                            title: "Pilih Kategori",
                            message: "Pilih kategori yang ingin diedit."
                          });
                          return;
                        }

                        setEditMode(true);
                        setShowModal(true);
                      }}
                      className="text-gray-400 hover:text-mu-green transition-colors flex items-center gap-1 text-[9px] font-black uppercase"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setShowModal(true);
                    }}
                    className="text-mu-green hover:underline text-[9px] font-black uppercase tracking-widest"
                  >
                    + Tambah Baru
                  </button>
                </div>
              </div>
              
              <div className="relative">
                {categories.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setShowModal(true);
                    }}
                    className="w-full px-6 py-5 bg-green-50 text-mu-green border-2 border-dashed border-mu-green/30 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-xs hover:bg-green-100 transition-all"
                  >
                    <Plus size={18} />
                    Tambah Kategori Baru
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold text-gray-600 shadow-inner flex justify-between items-center transition-all hover:bg-gray-100"
                    >
                      <span>{selectedCategoryName}</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-none shadow-2xl overflow-hidden animate-scaleIn origin-top">
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {categories.map((cat) => (
                            <div
                              key={cat.kategori_id}
                              onClick={() => {
                                setFormData({ ...formData, kategori_id: cat.kategori_id });
                                setIsDropdownOpen(false);
                              }}
                              className={`px-6 py-4 text-sm font-bold cursor-pointer transition-all border-b border-gray-50 last:border-none ${
                                formData.kategori_id == cat.kategori_id
                                  ? 'bg-mu-green text-white'
                                  : 'text-gray-600 hover:bg-green-50'
                              }`}
                            >
                              {cat.nama_kategori}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors">
                <User size={14} />
                {formData.jenis_transaksi === 'pemasukan' ? 'Donatur' : 'Penerima'}
              </label>

              <input
                type="text"
                value={formData.donatur}
                className="w-full px-6 py-5 bg-gray-50 rounded-3xl outline-none text-sm font-bold shadow-inner focus:bg-gray-100 transition-all"
                placeholder={formData.jenis_transaksi === 'pemasukan' ? 'Hamba Allah / Nama Donatur' : 'Toko / Penerima Dana'}
                onChange={(e) => setFormData({ ...formData, donatur: e.target.value })}
              />

              <p className="text-[10px] font-bold text-gray-400 ml-2">
                {formData.jenis_transaksi === 'pemasukan'
                  ? 'Boleh dikosongkan, otomatis menjadi Hamba Allah.'
                  : 'Wajib diisi untuk pengeluaran.'}
              </p>
            </div>

            <div className="space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors">
                <Calendar size={14} />
                Tanggal Transaksi
              </label>

              <div className="relative">
                <input 
                  type="date" 
                  value={formData.tanggal} 
                  className="w-full px-6 py-5 bg-gray-50 rounded-3xl outline-none text-sm font-bold shadow-inner focus:bg-gray-100 transition-all cursor-pointer appearance-none" 
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} 
                  required
                />
                <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 group">
              <label className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest ml-2 group-focus-within:text-mu-green transition-colors">
                <FileText size={14} />
                Keterangan Tambahan
              </label>

              <textarea
                className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl outline-none text-sm font-bold text-gray-600 shadow-inner resize-none h-24 focus:bg-gray-100 transition-all"
                value={formData.deskripsi}
                placeholder="Detail transaksi..."
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                required
              ></textarea>

              <p className="text-[10px] font-bold text-gray-400 ml-2">
                Jelaskan transaksi secara singkat dan jelas.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-5 bg-mu-green text-white rounded-[2rem] font-black uppercase shadow-xl hover:translate-y-[-4px] active:scale-95 transition-all"
            >
              <Save size={20} />
              Simpan Transaksi Ke Database
            </button>
          </div>
        </form>
      </div>

      <ModalKeuangan 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onSuccess={(newId) => {
          fetchCategories();
          if (newId) {
            setFormData(prev => ({ ...prev, kategori_id: newId }));
          }
        }}
        jenis={formData.jenis_transaksi}
        editData={editMode ? categories.find(c => c.kategori_id == formData.kategori_id) : null}
      />
    </div>
  );
};

export default Keuangan;