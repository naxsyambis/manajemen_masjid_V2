import React, { useState, useEffect } from "react";
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
  Newspaper
} from "lucide-react";

const ListBerita = () => {
  const [beritas, setBeritas] = useState([]);
  const [filteredBeritas, setFilteredBeritas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 MODAL DELETE
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBeritas();
  }, []);

  const fetchBeritas = async () => {
    try {
      const res = await axios.get("http://localhost:3000/takmir/berita", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBeritas(res.data);
    } catch {
      alert("Gagal ambil data berita");
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

  // 🔥 STATUS PREMIUM
  const renderStatus = (status) => {
    const map = {
      draft: "bg-gray-100 text-gray-600",
      menunggu: "bg-yellow-100 text-yellow-700",
      disetujui: "bg-blue-100 text-blue-700",
      ditolak: "bg-red-100 text-red-700",
      dipublikasi: "bg-green-100 text-green-700"
    };

    return (
      <span className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${map[status]}`}>
        {status}
      </span>
    );
  };

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/takmir/berita/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowDeleteModal(false);
      fetchBeritas();
    } catch {
      alert("Gagal hapus");
    }
  };

  return (
    <div className="p-4 space-y-10 bg-[#fdfdfd] animate-fadeIn">

      {/* HEADER */}
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

        {/* 🔥 REFRESH */}
        <button
            onClick={fetchBeritas}
            className="flex items-center gap-2 px-4 py-3 border rounded-2xl hover:-translate-y-1 transition"
        >
            <RefreshCcw size={16} />
            <span className="font-semibold text-sm">Refresh</span>
        </button>

        {/* 🔥 TAMBAH BERITA */}
        <button
            onClick={() => navigate("/admin/berita/tambah")}
            className="flex items-center gap-2 px-5 py-3 bg-mu-green text-white rounded-2xl shadow-xl hover:-translate-y-1 transition"
        >
            <Plus size={16} />
            <span className="font-semibold text-sm">Tambah Berita</span>
        </button>

        </div>

      </div>

      {/* CARD */}
      <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden">

        {/* SEARCH */}
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

        {/* TABLE */}
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
              {filteredBeritas.map((b) => (
                <tr key={b.berita_id} className="group hover:bg-mu-green/[0.03] transition">

                  <td className="p-8 text-center">
                    {b.gambar ? (
                      <img src={`http://localhost:3000${b.gambar}`} className="w-16 h-16 rounded-xl object-cover mx-auto" />
                    ) : (
                      <ImageIcon />
                    )}
                  </td>

                  <td className="p-8 font-black max-w-[250px] truncate">
                    {b.judul}
                  </td>

                  <td className="p-8 text-center">
                    {renderStatus(b.status)}
                  </td>

                  <td className="p-8 text-center text-gray-500">
                    {new Date(b.tanggal).toLocaleDateString("id-ID")}
                  </td>

                  {/* 🔥 AKSI */}
                  <td className="p-8 text-center">
                    {(b.status === "disetujui" || b.status === "ditolak") ? (
                      <div className="flex justify-center gap-4 opacity-40 group-hover:opacity-100 transition">

                        <button onClick={() => navigate(`/admin/berita/detail/${b.berita_id}`)} className="p-3 rounded-xl hover:bg-blue-500 hover:text-white">
                          <Eye size={16} />
                        </button>

                        <button onClick={() => navigate(`/admin/berita/edit/${b.berita_id}`)} className="p-3 rounded-xl hover:bg-yellow-500 hover:text-white">
                          <Edit size={16} />
                        </button>

                        <button onClick={() => openDeleteModal(b.berita_id)} className="p-3 rounded-xl hover:bg-red-500 hover:text-white">
                          <Trash2 size={16} />
                        </button>

                      </div>
                    ) : "-"}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* 🔥 MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center space-y-6 w-[350px]">

            <h2 className="text-xl font-black">Hapus Berita?</h2>
            <p className="text-gray-400 text-sm">
              Data tidak bisa dikembalikan
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-3 bg-gray-200 rounded-xl"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-3 bg-red-600 text-white rounded-xl"
              >
                Iya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ListBerita;