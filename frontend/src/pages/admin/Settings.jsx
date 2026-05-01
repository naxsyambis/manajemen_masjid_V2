import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {
  User,
  MapPin,
  ShieldCheck,
  PenTool,
  Trash2,
  Mail,
  Building,
  MessageCircle,
  HelpCircle,
  CreditCard,
  Plus,
  Pencil,
  Save,
  X,
  Landmark,
  Hash,
  BadgeCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

const MAX_REKENING_DIGIT = 20;
const MAX_BANK_REKENING = 3;

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";
  const isConfirm = alertData.type === "confirm";

  const Icon = isSuccess
    ? CheckCircle2
    : isError
      ? XCircle
      : isWarning || isConfirm
        ? AlertTriangle
        : Info;

  const iconClass = isSuccess
    ? "bg-green-100 text-green-600"
    : isError
      ? "bg-red-100 text-red-600"
      : isWarning || isConfirm
        ? "bg-yellow-100 text-yellow-600"
        : "bg-blue-100 text-blue-600";

  const buttonClass = isConfirm
    ? "bg-red-600 hover:bg-red-700 text-white"
    : isSuccess
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
                {alertData.confirmText || "Ya"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (alertData.onConfirm) alertData.onConfirm();
                onClose();
              }}
              className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
            >
              {alertData.confirmText || "Mengerti"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const handleAuthError = (err, showPopup) => {
  if (err.response && err.response.status === 401) {
    const message = err.response.data.message || "Sesi Anda telah berakhir";

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

    return true;
  }

  return false;
};

const Settings = () => {
  const [profile, setProfile] = useState({ nama: '', email: '' });
  const [masjid, setMasjid] = useState({ nama_masjid: '', alamat: '' });
  const [previewTtd, setPreviewTtd] = useState(null);

  const [masjidId, setMasjidId] = useState(null);
  const [rekeningList, setRekeningList] = useState([]);
  const [loadingRekening, setLoadingRekening] = useState(false);
  const [showRekeningForm, setShowRekeningForm] = useState(false);
  const [isEditRekening, setIsEditRekening] = useState(false);
  const [selectedRekeningId, setSelectedRekeningId] = useState(null);
  const [rekeningForm, setRekeningForm] = useState({
    nama_bank: '',
    no_rekening: '',
    atas_nama: ''
  });

  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const token = localStorage.getItem('token');

  const adminWA = "6281234567890";
  const pesanWA = encodeURIComponent(`Halo Admin SIM Masjid, saya Takmir ${masjid.nama_masjid || ""} ingin bertanya...`);

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
    setAlertData({
      show: false,
      type: "info",
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null
    });
  };

  const fetchRekening = async (idMasjid) => {
    if (!token || !idMasjid) return;

    try {
      setLoadingRekening(true);

      const res = await axios.get('http://localhost:3000/takmir/rekening-masjid', {
        params: {
          masjid_id: idMasjid
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];

      setRekeningList(data);
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal mengambil data rekening:", err);

      showPopup({
        type: "error",
        title: "Gagal Memuat",
        message: "Data rekening masjid gagal dimuat."
      });
    } finally {
      setLoadingRekening(false);
    }
  };

  const fetchSemuaData = async () => {
    if (!token) return;

    try {
      const resUser = await axios.get('http://localhost:3000/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile({
        nama: resUser.data.nama || '',
        email: resUser.data.email || ''
      });

      if (resUser.data.foto_tanda_tangan) {
        setPreviewTtd(
          `http://localhost:3000${resUser.data.foto_tanda_tangan}?t=${Date.now()}`
        );

        localStorage.setItem('ttdImage', resUser.data.foto_tanda_tangan);
      } else {
        setPreviewTtd(null);
        localStorage.removeItem('ttdImage');
      }

      const idMasjid = resUser.data.masjid_id;

      if (idMasjid) {
        setMasjidId(idMasjid);
        localStorage.setItem('masjid_id', idMasjid);

        const resMasjid = await axios.get(`http://localhost:3000/public/masjid/${idMasjid}`);
        const dataDb = resMasjid.data.masjid || {};

        setMasjid({
          nama_masjid: dataDb.nama_masjid || '',
          alamat: dataDb.alamat || ''
        });

        if (dataDb.nama_masjid) {
          localStorage.setItem('namaMasjid', dataDb.nama_masjid);
        }

        fetchRekening(idMasjid);
      }
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal sinkron data database:", err);

      showPopup({
        type: "error",
        title: "Gagal Memuat",
        message: "Data pengaturan gagal dimuat."
      });
    }
  };

  useEffect(() => {
    fetchSemuaData();
  }, []);

  const handleSaveTtd = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showPopup({
        type: "warning",
        title: "File Tidak Valid",
        message: "File tanda tangan harus berupa gambar."
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showPopup({
        type: "warning",
        title: "Ukuran Terlalu Besar",
        message: "Ukuran tanda tangan maksimal 5MB."
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ttd", file);

      const res = await axios.put(
        "http://localhost:3000/auth/profile/ttd",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setPreviewTtd(`http://localhost:3000${res.data.path}?t=${Date.now()}`);
      localStorage.setItem('ttdImage', res.data.path);

      showPopup({
        type: "success",
        title: "Tanda Tangan Disimpan",
        message: "Tanda tangan berhasil diupload."
      });
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error(err);

      showPopup({
        type: "error",
        title: "Gagal Upload",
        message: err.response?.data?.message || "Gagal upload tanda tangan."
      });
    }
  };

  const handleDeleteTtd = async () => {
    showPopup({
      type: "confirm",
      title: "Hapus Tanda Tangan?",
      message: "Berkas tanda tangan akan dihapus dari akun Anda.",
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          await axios.delete(
            "http://localhost:3000/auth/profile/ttd",
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          setPreviewTtd(null);
          localStorage.removeItem('ttdImage');

          showPopup({
            type: "success",
            title: "Tanda Tangan Dihapus",
            message: "Tanda tangan berhasil dihapus."
          });
        } catch (err) {
          if (handleAuthError(err, showPopup)) return;

          showPopup({
            type: "error",
            title: "Gagal Menghapus",
            message: err.response?.data?.message || "Gagal menghapus tanda tangan."
          });
        }
      }
    });
  };

  const openTambahRekening = () => {
    if (rekeningList.length >= MAX_BANK_REKENING) {
      showPopup({
        type: "warning",
        title: "Batas Rekening Tercapai",
        message: `Maksimal rekening/bank yang bisa ditambahkan adalah ${MAX_BANK_REKENING}.`
      });
      return;
    }

    setIsEditRekening(false);
    setSelectedRekeningId(null);
    setRekeningForm({
      nama_bank: '',
      no_rekening: '',
      atas_nama: ''
    });
    setShowRekeningForm(true);
  };

  const openEditRekening = (rekening) => {
    setIsEditRekening(true);
    setSelectedRekeningId(rekening.rekening_id);
    setRekeningForm({
      nama_bank: rekening.nama_bank || '',
      no_rekening: rekening.no_rekening || '',
      atas_nama: rekening.atas_nama || ''
    });
    setShowRekeningForm(true);
  };

  const closeRekeningForm = () => {
    setShowRekeningForm(false);
    setIsEditRekening(false);
    setSelectedRekeningId(null);
    setRekeningForm({
      nama_bank: '',
      no_rekening: '',
      atas_nama: ''
    });
  };

  const handleChangeNoRekening = (e) => {
    const onlyNumber = e.target.value.replace(/[^0-9]/g, '');
    const limitedNumber = onlyNumber.slice(0, MAX_REKENING_DIGIT);

    setRekeningForm({
      ...rekeningForm,
      no_rekening: limitedNumber
    });
  };

  const handleSaveRekening = async (e) => {
    e.preventDefault();

    const idMasjid = masjidId || localStorage.getItem('masjid_id');

    if (!idMasjid) {
      showPopup({
        type: "warning",
        title: "Masjid ID Tidak Ada",
        message: "Masjid ID tidak ditemukan. Silakan logout lalu login ulang."
      });
      return;
    }

    if (!isEditRekening && rekeningList.length >= MAX_BANK_REKENING) {
      showPopup({
        type: "warning",
        title: "Batas Rekening Tercapai",
        message: `Maksimal rekening/bank yang bisa ditambahkan adalah ${MAX_BANK_REKENING}.`
      });
      return;
    }

    if (!rekeningForm.nama_bank.trim()) {
      showPopup({
        type: "warning",
        title: "Nama Bank Kosong",
        message: "Nama bank wajib diisi."
      });
      return;
    }

    if (!rekeningForm.no_rekening.trim()) {
      showPopup({
        type: "warning",
        title: "Nomor Rekening Kosong",
        message: "Nomor rekening wajib diisi."
      });
      return;
    }

    if (!/^[0-9]+$/.test(rekeningForm.no_rekening)) {
      showPopup({
        type: "warning",
        title: "Nomor Rekening Tidak Valid",
        message: "Nomor rekening hanya boleh berisi angka."
      });
      return;
    }

    if (rekeningForm.no_rekening.length > MAX_REKENING_DIGIT) {
      showPopup({
        type: "warning",
        title: "Nomor Rekening Terlalu Panjang",
        message: `Nomor rekening maksimal ${MAX_REKENING_DIGIT} digit.`
      });
      return;
    }

    if (!rekeningForm.atas_nama.trim()) {
      showPopup({
        type: "warning",
        title: "Atas Nama Kosong",
        message: "Atas nama wajib diisi."
      });
      return;
    }

    try {
      if (isEditRekening) {
        await axios.put(
          `http://localhost:3000/takmir/rekening-masjid/${selectedRekeningId}`,
          {
            nama_bank: rekeningForm.nama_bank.trim(),
            no_rekening: rekeningForm.no_rekening.trim(),
            atas_nama: rekeningForm.atas_nama.trim()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        showPopup({
          type: "success",
          title: "Rekening Diupdate",
          message: "Rekening berhasil diperbarui."
        });
      } else {
        await axios.post(
          "http://localhost:3000/takmir/rekening-masjid",
          {
            masjid_id: idMasjid,
            nama_bank: rekeningForm.nama_bank.trim(),
            no_rekening: rekeningForm.no_rekening.trim(),
            atas_nama: rekeningForm.atas_nama.trim()
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        showPopup({
          type: "success",
          title: "Rekening Ditambahkan",
          message: "Rekening berhasil ditambahkan."
        });
      }

      closeRekeningForm();
      fetchRekening(idMasjid);
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal menyimpan rekening:", err);

      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: err.response?.data?.message || "Gagal menyimpan rekening."
      });
    }
  };

  const handleDeleteRekening = async (rekeningId) => {
    const idMasjid = masjidId || localStorage.getItem('masjid_id');

    showPopup({
      type: "confirm",
      title: "Hapus Rekening?",
      message: "Data rekening yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      onConfirm: async () => {
        try {
          await axios.delete(
            `http://localhost:3000/takmir/rekening-masjid/${rekeningId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          showPopup({
            type: "success",
            title: "Rekening Dihapus",
            message: "Rekening berhasil dihapus."
          });

          fetchRekening(idMasjid);
        } catch (err) {
          if (handleAuthError(err, showPopup)) return;

          console.error("Gagal menghapus rekening:", err);

          showPopup({
            type: "error",
            title: "Gagal Menghapus",
            message: err.response?.data?.message || "Gagal menghapus rekening."
          });
        }
      }
    });
  };

  const isBankLimitReached = rekeningList.length >= MAX_BANK_REKENING;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn p-4 pb-20">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-3xl border border-gray-100 group">
            <div className="w-16 h-16 bg-mu-green text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-green-100 transition-transform group-hover:scale-105">
              {profile.nama ? profile.nama.charAt(0) : '?'}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">
                Takmir Aktif
              </span>
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-xl truncate">
                {profile.nama || "..."}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-3xl border border-gray-100 group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-mu-green shadow-sm border border-gray-100 transition-transform group-hover:scale-105">
              <Mail size={28} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">
                Kontak Login
              </span>
              <p className="text-sm text-gray-500 font-mono italic truncate">
                {profile.email || "..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex-1 group transition-all hover:shadow-md">
            <div className="p-10 space-y-8 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 text-mu-green/40">
                <Building size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Informasi Lokasi
                </span>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-mu-green rounded-full opacity-20"></div>
                <div className="bg-mu-green/[0.03] p-8 rounded-[2rem] border border-mu-green/5 space-y-2">
                  <label className="text-[10px] font-black text-mu-green/40 uppercase tracking-widest block">
                    Nama Masjid Resmi
                  </label>
                  <p className="text-4xl font-black text-mu-green uppercase leading-none tracking-tighter">
                    {masjid.nama_masjid || "Syncing..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 px-4">
                <div className="w-14 h-14 bg-mu-yellow/10 rounded-2xl flex items-center justify-center text-mu-green shadow-inner shrink-0 ring-4 ring-mu-yellow/5">
                  <MapPin size={28} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block">
                    Alamat Operasional
                  </label>
                  <p className="text-base text-gray-500 font-semibold italic leading-relaxed">
                    {masjid.alamat || "Data tidak ditemukan."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-mu-green">
                <CreditCard size={22} />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-gray-800">
                    Rekening Masjid
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Kelola rekening donasi dan transaksi masjid
                  </p>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">
                    {rekeningList.length}/{MAX_BANK_REKENING} rekening tersimpan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openTambahRekening}
                disabled={isBankLimitReached}
                className="bg-mu-green text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Tambah Rekening
              </button>
            </div>

            {showRekeningForm && (
              <form onSubmit={handleSaveRekening} className="p-8 bg-gray-50/50 border-b border-gray-100 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Landmark size={13} className="text-mu-green" />
                      Nama Bank
                    </label>
                    <input
                      type="text"
                      value={rekeningForm.nama_bank}
                      onChange={(e) => setRekeningForm({ ...rekeningForm, nama_bank: e.target.value })}
                      placeholder="Contoh: BSI"
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green text-sm font-bold text-gray-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Hash size={13} className="text-mu-green" />
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={MAX_REKENING_DIGIT}
                      value={rekeningForm.no_rekening}
                      onChange={handleChangeNoRekening}
                      placeholder="Contoh: 1234567890"
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green text-sm font-bold text-gray-700"
                      required
                    />
                    <p className="text-[9px] font-bold text-gray-400">
                      {rekeningForm.no_rekening.length}/{MAX_REKENING_DIGIT} digit
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <BadgeCheck size={13} className="text-mu-green" />
                      Atas Nama
                    </label>
                    <input
                      type="text"
                      value={rekeningForm.atas_nama}
                      onChange={(e) => setRekeningForm({ ...rekeningForm, atas_nama: e.target.value })}
                      placeholder="Contoh: Masjid Al Ikhlas"
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green text-sm font-bold text-gray-700"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeRekeningForm}
                    className="px-6 py-3 rounded-2xl bg-white border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-all"
                  >
                    <X size={15} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-mu-green text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg"
                  >
                    <Save size={15} />
                    {isEditRekening ? "Update Rekening" : "Simpan Rekening"}
                  </button>
                </div>
              </form>
            )}

            <div className="p-8 space-y-4">
              {loadingRekening ? (
                <div className="py-10 text-center text-[10px] font-black text-mu-green uppercase tracking-widest">
                  Memuat rekening...
                </div>
              ) : rekeningList.length > 0 ? (
                rekeningList.map((rekening) => (
                  <div
                    key={rekening.rekening_id}
                    className="p-5 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-mu-green/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white text-mu-green flex items-center justify-center border border-gray-100 shadow-sm">
                        <CreditCard size={24} />
                      </div>

                      <div>
                        <p className="text-xs font-black text-mu-green uppercase tracking-widest">
                          {rekening.nama_bank}
                        </p>
                        <h4 className="text-xl font-black text-gray-800 tracking-tight">
                          {rekening.no_rekening}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          A/N {rekening.atas_nama}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 md:opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEditRekening(rekening)}
                        className="p-3 rounded-2xl bg-white border border-gray-100 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                        title="Edit Rekening"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRekening(rekening.rekening_id)}
                        className="p-3 rounded-2xl bg-white border border-gray-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Hapus Rekening"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-gray-200 shadow-sm mb-4">
                    <CreditCard size={36} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Belum ada rekening masjid
                  </p>
                  <p className="text-[9px] text-gray-400 italic mt-1">
                    Klik tombol tambah rekening untuk mulai mengisi data.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-mu-green to-green-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6 relative overflow-hidden group transition-all hover:scale-[1.01]">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <HelpCircle size={22} className="text-mu-yellow" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                  Pusat Bantuan
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black leading-tight">
                  Butuh Bantuan Teknis?
                </h4>
                <p className="text-[9px] opacity-70 font-medium italic">
                  Hubungi Pengurus Ranting melalui WhatsApp resmi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/${adminWA}?text=${pesanWA}`, '_blank')}
                className="w-full bg-white text-mu-green py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-mu-yellow hover:text-mu-green transition-all shadow-lg active:scale-95"
              >
                <MessageCircle size={18} /> Chat Admin WA
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <ShieldCheck size={180} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-mu-green">
                <PenTool size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Upload Tanda Tangan
                </span>
              </div>
              {previewTtd && (
                <button
                  type="button"
                  onClick={handleDeleteTtd}
                  className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="relative group aspect-square max-w-full mx-auto w-full border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center bg-gray-50/30 overflow-hidden mb-8 transition-colors hover:bg-gray-50/50">
                {previewTtd ? (
                  <img
                    src={previewTtd}
                    alt="TTD"
                    className="max-h-[85%] object-contain animate-fadeIn drop-shadow-xl"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto text-gray-200 ring-8 ring-gray-50">
                      <PenTool size={40} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Belum ada TTD
                      </p>
                      <p className="text-[8px] text-gray-400 italic">
                        Klik tombol di bawah untuk unggah
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <label className="block w-full bg-mu-yellow text-mu-green py-5 rounded-2xl text-xs font-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-50 cursor-pointer text-center uppercase tracking-widest active:scale-[0.98]">
              {previewTtd ? "Ganti Berkas TTD" : "Unggah Berkas TTD"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleSaveTtd(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;