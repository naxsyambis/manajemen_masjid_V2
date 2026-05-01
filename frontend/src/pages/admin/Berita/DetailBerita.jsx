import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import {
  CalendarDays,
  Image as ImageIcon,
  Newspaper,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Youtube,
  ExternalLink,
  Edit,
  Trash2,
  ArrowLeft,
  FileText
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

  const handleConfirm = () => {
    if (alertData.onConfirm) alertData.onConfirm();
    onClose();
  };

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
                onClick={handleConfirm}
                className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
              >
                {alertData.confirmText || "Hapus"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
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

const DetailBerita = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const [alertData, setAlertData] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null
  });

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
    setAlertData({
      show: false,
      type: "info",
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/800x400?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/uploads/berita/${imagePath}`;
  };

  const formatYoutubeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/takmir/berita/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setData(res.data);

      if (res.data.gambar) {
        setSelectedImage(res.data.gambar);
      } else if (res.data.gambar_list?.length) {
        setSelectedImage(res.data.gambar_list[0].path_gambar);
      }
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error(err);

      showPopup({
        type: "error",
        title: "Gagal Memuat",
        message: "Detail berita gagal dimuat.",
        onConfirm: () => navigate("/admin/berita")
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    showPopup({
      type: "confirm",
      title: "Hapus Berita?",
      message: "Data berita yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      onConfirm: handleDelete
    });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/takmir/berita/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      showPopup({
        type: "success",
        title: "Berita Dihapus",
        message: "Berita berhasil dihapus.",
        onConfirm: () => navigate("/admin/berita")
      });
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error(err);

      showPopup({
        type: "error",
        title: "Gagal Menghapus",
        message: err.response?.data?.message || "Berita gagal dihapus."
      });
    }
  };

  const renderStatus = (status) => {
    const map = {
      draft: "bg-gray-100 text-gray-600 border-gray-200",
      menunggu: "bg-yellow-100 text-yellow-700 border-yellow-200",
      disetujui: "bg-blue-100 text-blue-700 border-blue-200",
      ditolak: "bg-red-100 text-red-700 border-red-200",
      dipublikasi: "bg-green-100 text-green-700 border-green-200"
    };

    return (
      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${map[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
        {status || "-"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-mu-green uppercase tracking-widest">
            Memuat Detail Berita...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const allImages = [
    ...(data.gambar ? [data.gambar] : []),
    ...(data.gambar_list?.map((img) => img.path_gambar) || [])
  ];

  const uniqueImages = [...new Set(allImages)];
  const youtubeUrl = data.youtube_url ? formatYoutubeUrl(data.youtube_url) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Detail <span className="text-mu-green">Berita</span>
            </h1>

            <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <CalendarDays size={12} className="text-mu-green" />
              <span>
                {data.tanggal
                  ? new Date(data.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })
                  : "-"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/berita")}
            className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg"
          >
            <ArrowLeft size={14} />
            Kembali
          </button>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="p-10 lg:p-16">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-mu-green to-green-500 text-white rounded-2xl shadow-xl -rotate-3 mb-5">
                <Newspaper size={28} />
              </div>

              <h2 className="text-3xl lg:text-4xl font-black text-gray-800 leading-tight mb-4">
                {data.judul}
              </h2>

              <div className="flex justify-center items-center gap-3 flex-wrap">
                {renderStatus(data.status)}

                {youtubeUrl ? (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition"
                  >
                    <Youtube size={14} />
                    Video YouTube
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    YouTube: -
                  </span>
                )}
              </div>
            </div>

            <div className="mb-10">
              {selectedImage ? (
                <img
                  src={getImageUrl(selectedImage)}
                  alt={data.judul}
                  className="w-full h-80 lg:h-[500px] object-cover rounded-2xl shadow-xl bg-gray-100"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
                  }}
                />
              ) : (
                <div className="h-80 lg:h-[500px] flex items-center justify-center text-gray-300 bg-gray-50 rounded-2xl">
                  <ImageIcon size={80} />
                </div>
              )}
            </div>

            {uniqueImages.length > 1 && (
              <div className="flex gap-4 flex-wrap mb-10">
                {uniqueImages.map((img, index) => (
                  <img
                    key={index}
                    src={getImageUrl(img)}
                    alt={`Gambar ${index + 1}`}
                    onClick={() => setSelectedImage(img)}
                    className={`w-28 h-20 object-cover rounded-xl cursor-pointer border-2 transition ${
                      selectedImage === img
                        ? "border-mu-green ring-4 ring-mu-green/20"
                        : "border-gray-100 hover:border-mu-green"
                    }`}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6 lg:col-span-2">
                <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3 flex items-center gap-2">
                  <FileText size={24} className="text-mu-green" />
                  Isi Berita
                </h3>

                <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-justify text-base">
                  {data.isi}
                </div>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3 flex items-center gap-2">
                  <Youtube size={24} className="text-red-600" />
                  Link YouTube
                </h3>

                {youtubeUrl ? (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Youtube size={18} />
                    Buka Video YouTube
                    <ExternalLink size={16} />
                  </a>
                ) : (
                  <p className="text-gray-400 font-bold">-</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/berita")}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              >
                <ArrowLeft size={20} className="mr-2" />
                Kembali
              </button>

              <button
                type="button"
                onClick={() => navigate(`/admin/berita/edit/${id}`)}
                className="flex items-center px-8 py-4 bg-yellow-500 text-white rounded-2xl hover:bg-yellow-600 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              >
                <Edit size={20} className="mr-2" />
                Edit Berita
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center px-8 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
              >
                <Trash2 size={20} className="mr-2" />
                Hapus
              </button>
            </div>
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

export default DetailBerita;