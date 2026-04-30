import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Image as ImageIcon, Newspaper } from "lucide-react";

const DetailBerita = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔥 DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const token = localStorage.getItem("token");

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
      }

    } catch (err) {
      console.error(err);
      alert("Gagal ambil detail berita");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/takmir/berita/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Berita berhasil dihapus");
      navigate("/admin/berita");

    } catch (err) {
      console.error(err);
      alert("Gagal hapus berita");
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
      <span className={`px-4 py-1 rounded-lg text-xs font-bold uppercase ${map[status]}`}>
        {status}
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

  // 🔥 GABUNG + UNIQUE
  const allImages = [
    ...(data.gambar ? [data.gambar] : []),
    ...(data.gambar_list?.map((img) => img.path_gambar) || [])
  ];

  const uniqueImages = [...new Set(allImages)];

  return (
    <div className="p-6 bg-[#fdfdfd]">

      {/* HEADER */}
      <div className="flex items-end gap-4 border-b pb-6 mb-8">
        <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-xl text-white">
          <Newspaper size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-tight">
            {data.judul}
          </h1>

          <div className="flex items-center gap-3 mt-2">
            {renderStatus(data.status)}

            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <CalendarDays size={14} />
              {new Date(data.tanggal).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow border p-6 space-y-6">

      {/* 🔥 GAMBAR UTAMA */}
        {selectedImage ? (
          <div className="flex justify-center">
            <img
              src={`http://localhost:3000/uploads/berita/${selectedImage}`}
              className="max-h-[400px] w-auto object-contain rounded-xl shadow-lg"
              onError={(e) => e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'}
            />
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-300">
            <ImageIcon size={60} />
          </div>
        )}

        {/* 🔥 GALLERY */}
        {uniqueImages.length > 1 && (
          <div className="flex gap-3 flex-wrap mt-6">

            {uniqueImages.map((img, index) => (
              <img
                key={index}
                src={`http://localhost:3000/uploads/berita/${img}`}
                onClick={() => setSelectedImage(img)}
                className={`w-24 h-16 object-cover rounded-lg cursor-pointer border transition
                  ${selectedImage === img
                    ? "border-mu-green ring-2 ring-mu-green"
                    : "border-gray-200"}
                `}
                onError={(e) => e.target.style.display = 'none'}
              />
            ))}

          </div>
        )}

        {/* 🔥 ISI */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Isi Berita</h2>

          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
            {data.isi}
          </p>
        </div>

        {/* 🔥 ACTION BUTTON */}
        <div className="flex justify-end gap-3 pt-4 border-t">

          <button
            onClick={() => navigate(`/admin/berita/edit/${id}`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:scale-105 transition"
          >
            Edit
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:scale-105 transition"
          >
            Hapus
          </button>

        </div>

      </div>

      {/* 🔥 MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center space-y-4 w-[300px]">

            <h2 className="font-bold text-lg">Hapus Berita?</h2>
            <p className="text-sm text-gray-500">
              Data tidak bisa dikembalikan
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DetailBerita;