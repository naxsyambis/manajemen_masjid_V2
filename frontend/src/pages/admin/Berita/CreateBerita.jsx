import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  X,
  Save,
  FileText,
  ImagePlus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";

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

const CreateBerita = () => {
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const [images, setImages] = useState([null, null, null, null, null]);
  const [preview, setPreview] = useState([null, null, null, null, null]);

  const [loading, setLoading] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  const handleChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showPopup({
        type: "warning",
        title: "File Tidak Valid",
        message: "File harus berupa gambar."
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showPopup({
        type: "warning",
        title: "Ukuran Terlalu Besar",
        message: "Ukuran gambar maksimal 5MB."
      });
      e.target.value = "";
      return;
    }

    const newImages = [...images];
    const newPreview = [...preview];

    if (newPreview[index]) {
      URL.revokeObjectURL(newPreview[index]);
    }

    newImages[index] = file;
    newPreview[index] = URL.createObjectURL(file);

    setImages(newImages);
    setPreview(newPreview);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreview = [...preview];

    if (newPreview[index]) {
      URL.revokeObjectURL(newPreview[index]);
    }

    newImages[index] = null;
    newPreview[index] = null;

    setImages(newImages);
    setPreview(newPreview);
  };

  const validateForm = () => {
    if (!judul.trim()) {
      showPopup({
        type: "warning",
        title: "Judul Kosong",
        message: "Judul berita wajib diisi."
      });
      return false;
    }

    if (judul.trim().length < 5) {
      showPopup({
        type: "warning",
        title: "Judul Terlalu Pendek",
        message: "Judul minimal 5 karakter."
      });
      return false;
    }

    if (!isi.trim()) {
      showPopup({
        type: "warning",
        title: "Isi Kosong",
        message: "Isi berita wajib diisi."
      });
      return false;
    }

    if (isi.trim().length < 10) {
      showPopup({
        type: "warning",
        title: "Isi Terlalu Pendek",
        message: "Isi berita minimal 10 karakter."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("judul", judul.trim());
      formData.append("isi", isi.trim());

      images.forEach((img) => {
        if (img) formData.append("gambar", img);
      });

      await axios.post("http://localhost:3000/takmir/berita", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showPopup({
        type: "success",
        title: "Berita Tersimpan",
        message: "Berita berhasil ditambahkan.",
        onConfirm: () => navigate("/admin/berita")
      });

    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal tambah berita:", err);

      showPopup({
        type: "error",
        title: "Gagal Menyimpan",
        message: err.response?.data?.message || "Berita gagal ditambahkan."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-10 bg-[#fdfdfd] animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 text-white rounded-2xl shadow-xl -rotate-3">
          <FileText size={26} />
        </div>

        <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">
          Tambah Berita
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[3rem] shadow-2xl border p-10 space-y-10"
      >
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Judul
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full mt-2 px-4 py-4 bg-gray-50 rounded-2xl shadow-inner outline-none font-bold"
            placeholder="Masukkan judul berita"
          />
        </div>

        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Isi
          </label>
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            rows={6}
            className="w-full mt-2 px-4 py-4 bg-gray-50 rounded-2xl shadow-inner outline-none font-bold"
            placeholder="Masukkan isi berita"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Gambar (Max 5)
          </label>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {preview.map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Foto {i + 1}
                </p>

                <label className="block rounded-2xl border-2 border-dashed p-4 cursor-pointer hover:bg-gray-50 transition">
                  {item ? (
                    <div className="relative group">
                      <img
                        src={item}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-28 object-cover rounded-xl shadow"
                      />

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          removeImage(i);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-gray-300">
                      <ImagePlus size={22} />
                      <span className="text-[10px] mt-1 font-bold">
                        Upload
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleChange(e, i)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-mu-green text-white rounded-2xl shadow-xl hover:-translate-y-1 transition font-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBerita;