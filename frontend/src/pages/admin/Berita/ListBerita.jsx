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
  Info,
  Youtube,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const primaryActionButton =
  "h-14 min-w-[210px] inline-flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryActionButton =
  "h-14 min-w-[150px] inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

const pageHeaderIcon =
  "p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300";

const pageTitle =
  "text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none";

const pageSubtitle =
  "text-xs text-gray-400 font-bold uppercase tracking-[0.22em] ml-1 leading-relaxed flex items-center gap-2";

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
            {alertData.title || "Informasi"}
          </h3>

          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">
            {alertData.message || "-"}
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
                {alertData.confirmText || "Lanjut"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMainButton}
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
  const [refreshing, setRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

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
    setAlertData({
      show: false,
      type: "info",
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null
    });
  };

  useEffect(() => {
    if (token) fetchBeritas();
  }, [token]);

  const fetchBeritas = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const keyword = searchTerm.toLowerCase();

    const filtered = beritas.filter((b) =>
      b.judul?.toLowerCase().includes(keyword) ||
      b.isi?.toLowerCase().includes(keyword) ||
      b.youtube_url?.toLowerCase().includes(keyword) ||
      b.status?.toLowerCase().includes(keyword)
    );

    setFilteredBeritas(filtered);
    setCurrentPage(1);
  }, [beritas, searchTerm]);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredBeritas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBeritas.length / entriesPerPage);

  const getPaginationNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads/")) return `http://localhost:3000${imagePath}`;
    return `http://localhost:3000/uploads/berita/${imagePath}`;
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
      <span
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
          map[status] || "bg-gray-100 text-gray-600 border-gray-200"
        }`}
      >
        {status || "-"}
      </span>
    );
  };

  const formatYoutubeLink = (link) => {
    if (!link) return "";

    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link;
    }

    return `https://${link}`;
  };

  const renderYoutube = (berita) => {
    const youtubeLink = berita.youtube_url || "";

    if (!youtubeLink) {
      return <span className="text-gray-300 font-black text-sm">-</span>;
    }

    return (
      <a
        href={formatYoutubeLink(youtubeLink)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
        title={youtubeLink}
      >
        <Youtube size={16} />
        <span>Video</span>
        <ExternalLink size={13} />
      </a>
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
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={pageHeaderIcon}>
              <Newspaper size={32} strokeWidth={2.5} />
            </div>

            <h2 className={pageTitle}>Berita</h2>
          </div>

          <p className={pageSubtitle}>
            <Calendar size={14} />
            Kelola data berita, gambar, video YouTube, status, dan publikasi masjid
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={fetchBeritas}
            disabled={refreshing}
            className={secondaryActionButton}
          >
            <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memuat..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/berita/tambah")}
            className={primaryActionButton}
          >
            <Plus size={20} />
            Tambah Berita
          </button>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 w-full md:w-auto">
            <div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">
                Daftar Berita
              </h3>

              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Total: {filteredBeritas.length}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 px-4 py-2.5 rounded-2xl w-fit">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Show:
              </span>

              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm font-bold text-mu-green focus:outline-none cursor-pointer"
              >
                {[5, 10, 25, 50].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors"
            />

            <input
              type="text"
              placeholder="Cari judul, isi, YouTube, atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold text-gray-700 focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all shadow-inner placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Gambar
                </th>

                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  Judul Berita
                </th>

                <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
                  YouTube
                </th>

                <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">
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
                    colSpan="5"
                    className="text-center py-24 text-gray-400 text-sm font-black uppercase tracking-[0.2em]"
                  >
                    Memuat Data Berita...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((berita) => (
                  <tr
                    key={berita.berita_id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-6 border-b border-gray-50">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-transparent group-hover:border-mu-green transition-all">
                        {berita.gambar ? (
                          <img
                            src={getImageUrl(berita.gambar)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const next = e.currentTarget.nextSibling;
                              if (next) next.style.display = "block";
                            }}
                          />
                        ) : null}

                        <ImageIcon
                          size={28}
                          className="text-gray-300"
                          style={{ display: berita.gambar ? "none" : "block" }}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      <div
                        className="text-lg font-bold text-gray-800 group-hover:text-mu-green transition-colors max-w-[340px] truncate"
                        title={berita.judul}
                      >
                        {berita.judul || "-"}
                      </div>

                      <div className="text-xs text-gray-400 font-black uppercase tracking-tighter mt-1">
                        {berita.tanggal
                          ? new Date(berita.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })
                          : "-"}
                      </div>
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      {renderYoutube(berita)}
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50">
                      {renderStatus(berita.status)}
                    </td>

                    <td className="px-6 py-6 border-b border-gray-50 text-center">
                      {berita.status === "disetujui" || berita.status === "ditolak" ? (
                        <div className="flex justify-center items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/berita/detail/${berita.berita_id}`)}
                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                            title="Lihat Detail"
                          >
                            <Eye size={20} />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/admin/berita/edit/${berita.berita_id}`)}
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit Berita"
                          >
                            <Edit size={20} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(berita.berita_id)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Hapus Berita"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 font-black">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-24">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 shadow-sm border border-gray-50">
                        <Newspaper size={40} />
                      </div>

                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">
                        Data Berita Tidak Ditemukan
                      </p>

                      <p className="text-gray-400 text-sm italic">
                        Coba ubah kata kunci pencarian atau refresh data.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Menampilkan{" "}
            <span className="text-mu-green">
              {filteredBeritas.length > 0 ? indexOfFirstItem + 1 : 0}
            </span>{" "}
            -{" "}
            <span className="text-mu-green">
              {Math.min(indexOfLastItem, filteredBeritas.length)}
            </span>{" "}
            dari {filteredBeritas.length} berita
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="flex gap-2">
              {getPaginationNumbers().map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[45px] h-11 rounded-xl text-xs font-black transition-all ${
                    currentPage === page
                      ? "bg-mu-green text-white shadow-lg shadow-green-100 scale-110"
                      : "bg-white text-gray-400 border-2 border-gray-50 hover:border-mu-green"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 text-gray-300 py-2">
        <div className="h-[1px] w-12 bg-gray-100" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">
          Integrated Database System v3.0
        </p>
        <div className="h-[1px] w-12 bg-gray-100" />
      </div>
    </div>
  );
};

export default ListBerita;