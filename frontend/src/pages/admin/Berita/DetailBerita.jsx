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
  ExternalLink
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
                {alertData.confirmText || "Hapus"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
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

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:3000${path}`;
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
      draft: "bg-gray-100 text-gray-600",
      menunggu: "bg-yellow-100 text-yellow-700",
      disetujui: "bg-blue-100 text-blue-700",
      ditolak: "bg-red-100 text-red-700",
      dipublikasi: "bg-green-100 text-green-700"
    };

    return (
      <span className={`px-4 py-1 rounded-lg text-xs font-bold uppercase ${map[status] || "bg-gray-100 text-gray-600"}`}>
        {status || "-"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-bounce text-mu-green font-black">
          Loading...
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
  const youtubeUrl = data.youtube_url || "";

  return (
    <div className="p-6 bg-[#fdfdfd]">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex items-end gap-4 border-b pb-6 mb-8">
        <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-xl text-white">
          <Newspaper size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {data.judul}
          </h1>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {renderStatus(data.status)}

            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <CalendarDays size={14} />
              {data.tanggal ? new Date(data.tanggal).toLocaleDateString("id-ID") : "-"}
            </div>

            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition"
              >
                <Youtube size={14} />
                Video YouTube
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border p-6 space-y-6">
        {selectedImage ? (
          <div className="flex justify-center">
            <img
              src={getImageUrl(selectedImage)}
              alt={data.judul}
              className="max-h-[400px] w-auto object-contain rounded-xl shadow-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
              }}
            />
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-300">
            <ImageIcon size={60} />
          </div>
        )}

        {uniqueImages.length > 1 && (
          <div className="flex gap-3 flex-wrap mt-6">
            {uniqueImages.map((img, index) => (
              <img
                key={index}
                src={getImageUrl(img)}
                alt={`Gambar ${index + 1}`}
                onClick={() => setSelectedImage(img)}
                className={`w-24 h-16 object-cover rounded-lg cursor-pointer border transition ${
                  selectedImage === img
                    ? "border-mu-green ring-2 ring-mu-green"
                    : "border-gray-200"
                }`}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-bold">Isi Berita</h2>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
            {data.isi}
          </p>
        </div>

        <div className="space-y-3 border-t pt-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Youtube size={20} className="text-red-600" />
            Link YouTube
          </h2>

          {youtubeUrl ? (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition break-all"
            >
              <Youtube size={18} />
              Buka Video YouTube
              <ExternalLink size={16} />
            </a>
          ) : (
            <p className="text-gray-400 font-bold">-</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(`/admin/berita/edit/${id}`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:scale-105 transition"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:scale-105 transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailBerita;