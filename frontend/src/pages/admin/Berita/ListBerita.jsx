import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Search,
  RefreshCcw,
  Newspaper,
  X,
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

const ListBerita = () => {
  const [beritas, setBeritas] = useState([]);
  const [filteredBeritas, setFilteredBeritas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    fetchBeritas();
  }, []);

  const fetchBeritas = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:3000/takmir/berita", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataAsli = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];

      setBeritas(dataAsli);

      if (dataAsli.length === 0) {
        showPopup({
          type: "info",
          title: "Belum Ada Berita",
          message: "Data berita masih kosong."
        });
      }
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal ambil data berita:", err);

      showPopup({
        type: "error",
        title: "Gagal Memuat",
        message: "Data berita gagal dimuat."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = beritas.filter((b) =>
      b.judul?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredBeritas(filtered);
  }, [beritas, searchTerm]);

  const renderStatus = (status) => {
    const map = {
      draft: "bg-gray-100 text-gray-600",
      menunggu: "bg-yellow-100 text-yellow-700",
      disetujui: "bg-blue-100 text-blue-700",
      ditolak: "bg-red-100 text-red-700",
      dipublikasi: "bg-green-100 text-green-700"
    };

    return (
      <span className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${map[status] || "bg-gray-100 text-gray-600"}`}>
        {status || "-"}
      </span>
    );
  };

  const openDeleteModal = (id) => {
    showPopup({
      type: "confirm",
      title: "Hapus Berita?",
      message: "Data berita yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/takmir/berita/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showPopup({
        type: "success",
        title: "Berita Dihapus",
        message: "Berita berhasil dihapus."
      });

      fetchBeritas();
    } catch (err) {
      if (handleAuthError(err, showPopup)) return;

      console.error("Gagal hapus berita:", err);

      showPopup({
        type: "error",
        title: "Gagal Menghapus",
        message: err.response?.data?.message || "Berita gagal dihapus."
      });
    }
  };

  return (
    <div className="p-4 space-y-10 bg-[#fdfdfd] animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex justify-between items-end border-b pb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl text-white -rotate-3">
            <Newspaper size={28} />
          </div>

          <h2 className="text-4xl font-black tracking-tighter uppercase">
            Berita
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchBeritas}
            className="flex items-center gap-2 px-4 py-3 border rounded-2xl hover:-translate-y-1 transition"
          >
            <RefreshCcw size={16} />
            <span className="font-semibold text-sm">Refresh</span>
          </button>

          <button
            onClick={() => navigate("/admin/berita/tambah")}
            className="flex items-center gap-2 px-5 py-3 bg-mu-green text-white rounded-2xl shadow-xl hover:-translate-y-1 transition"
          >
            <Plus size={16} />
            <span className="font-semibold text-sm">Tambah Berita</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center">
          <h3 className="font-black text-lg">Daftar Berita</h3>

          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl shadow-inner outline-none font-bold"
              placeholder="Cari berita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest bg-gray-50 text-center">
                <th className="p-8">Gambar</th>
                <th className="p-8">Judul</th>
                <th className="p-8">Status</th>
                <th className="p-8">Tanggal</th>
                <th className="p-8">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400 font-black uppercase tracking-widest">
                    Memuat Data...
                  </td>
                </tr>
              ) : filteredBeritas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400 font-black uppercase tracking-widest">
                    Data berita tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredBeritas.map((b) => (
                  <tr key={b.berita_id} className="group hover:bg-mu-green/[0.03] transition">
                    <td className="p-8 text-center">
                      {b.gambar ? (
                        <img
                          src={`http://localhost:3000/uploads/berita/${b.gambar}`}
                          className="w-16 h-16 rounded-xl object-cover mx-auto"
                          alt="Thumbnail"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex justify-center text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </td>

                    <td className="p-8 font-black max-w-[250px] truncate">
                      {b.judul}
                    </td>

                    <td className="p-8 text-center">
                      {renderStatus(b.status)}
                    </td>

                    <td className="p-8 text-center text-gray-500">
                      {b.tanggal ? new Date(b.tanggal).toLocaleDateString("id-ID") : "-"}
                    </td>

                    <td className="p-8 text-center">
                      {(b.status === "disetujui" || b.status === "ditolak") ? (
                        <div className="flex justify-center gap-4 opacity-40 group-hover:opacity-100 transition">
                          <button
                            onClick={() => navigate(`/admin/berita/detail/${b.berita_id}`)}
                            className="p-3 rounded-xl hover:bg-blue-500 hover:text-white"
                            title="Detail"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/berita/edit/${b.berita_id}`)}
                            className="p-3 rounded-xl hover:bg-yellow-500 hover:text-white"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => openDeleteModal(b.berita_id)}
                            className="p-3 rounded-xl hover:bg-red-500 hover:text-white"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : "-"}
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

export default ListBerita;