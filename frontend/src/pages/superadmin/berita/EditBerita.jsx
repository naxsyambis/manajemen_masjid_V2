// frontend/src/pages/superadmin/berita/EditBerita.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, AlertCircle, Youtube } from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads/')) return `http://localhost:3000${imagePath}`;
  return `http://localhost:3000/uploads/berita/${imagePath}`;
};

const EditBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    judul: '',
    isi: '',
    youtube_url: ''
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;
  const isPublished = status === "dipublikasi";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBerita();
  }, [id, token]);

  const isValidYoutubeUrl = (url) => {
    if (!url.trim()) return true;

    try {
      const parsed = new URL(url);
      return (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be")
      );
    } catch {
      return false;
    }
  };

  const fetchBerita = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const res = await axios.get(
        `http://localhost:3000/superadmin/berita/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFormData({
        judul: res.data.judul || '',
        isi: res.data.isi || '',
        youtube_url: res.data.youtube_url || ''
      });

      setStatus(res.data.status || '');
      setExistingImages(res.data.gambar_list || []);
      setNewFiles([]);
      setDeletedImageIds([]);

    } catch (err) {
      console.error(err);
      setError('Gagal memuat data berita.');
      navigate('/superadmin/berita');
    } finally {
      setRefreshing(false);
    }
  };

  // 🔥 UPDATE STATUS DINAMIS
  const updateStatus = async (newStatus) => {
    try {
      await axios.patch(
        `http://localhost:3000/superadmin/berita/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatus(newStatus);
      alert(`Status diubah ke ${newStatus} ✅`);

    } catch (err) {
      console.error(err);
      alert("Gagal update status");
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length === 0) return;

    const totalImages = existingImages.length + newFiles.length + selected.length;

    if (totalImages > 5) {
      alert('Maksimal 5 gambar.');
      e.target.value = '';
      return;
    }

    setNewFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const handleRemoveExisting = (gambar_id) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.gambar_id !== gambar_id)
    );

    setDeletedImageIds((prev) =>
      prev.includes(gambar_id) ? prev : [...prev, gambar_id]
    );
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidYoutubeUrl(formData.youtube_url)) {
      alert("Link YouTube tidak valid. Gunakan link dari youtube.com atau youtu.be");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('isi', formData.isi);
    data.append('youtube_url', formData.youtube_url.trim());
    data.append('deletedImages', JSON.stringify(deletedImageIds));

    newFiles.forEach((file) => {
      data.append('gambar', file);
    });

    try {
      await axios.put(
        `http://localhost:3000/superadmin/berita/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Berita berhasil diupdate');
      navigate('/superadmin/berita');

    } catch (err) {
      console.error(err);
      alert('Gagal update berita');
    } finally {
      setLoading(false);
    }
  };

  const totalImages = existingImages.length + newFiles.length;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      <SuperAdminSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onLogout={onLogout}
        user={user}
        setIsHovered={setIsHovered}
        isExpanded={isExpanded}
      />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-8 overflow-y-auto space-y-8">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Edit <span className="text-mu-green">Berita</span>
              </h1>

              <div className="text-sm text-gray-500 mt-1">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>

              <span className="text-xs px-3 py-1 bg-gray-200 rounded-full mt-2 inline-block">
                Status: {status || '-'}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchBerita}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border rounded-xl"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3">
              <AlertCircle className="text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow">

            {/* GAMBAR */}
            <div>
              <h3 className="text-xl font-bold mb-4">Gambar Berita</h3>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="gambar-upload"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* 🔥 BUG FIX: PERBAIKAN PEMANGGILAN URL GAMBAR LAMA */}
                {existingImages.map((img) => (
                  <div key={img.gambar_id} className="relative">
                    <img
                      src={getImageUrl(img.path_gambar)}
                      className="w-full h-32 object-cover rounded-xl"
                      alt="Gambar berita"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(img.gambar_id)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {newFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview Upload"
                      className="w-full h-32 object-cover rounded-xl"
                      alt="Preview gambar baru"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {totalImages < 5 && (
                  <label
                    htmlFor="gambar-upload"
                    className="flex items-center justify-center border-2 border-dashed rounded-xl h-32 cursor-pointer"
                  >
                    +
                  </label>
                )}

              </div>

              <p className="text-sm text-gray-500 mt-3">
                Upload foto gambar berita maksimal 5 gambar.
              </p>
            </div>

            {/* JUDUL */}
            <div>
              <label className="font-semibold">Judul</label>
              <input
                type="text"
                value={formData.judul}
                onChange={(e) =>
                  setFormData({ ...formData, judul: e.target.value })
                }
                className="w-full border p-3 rounded-xl mt-2"
                required
              />
            </div>

            {/* ISI */}
            <div>
              <label className="font-semibold">Isi</label>
              <textarea
                value={formData.isi}
                onChange={(e) =>
                  setFormData({ ...formData, isi: e.target.value })
                }
                rows="6"
                className="w-full border p-3 rounded-xl mt-2"
                required
              />
            </div>

            {/* YOUTUBE */}
            <div>
              <label className="font-semibold flex items-center gap-2">
                <Youtube size={18} className="text-red-600" />
                Link YouTube <span className="text-gray-400 text-sm font-normal">(Opsional)</span>
              </label>

              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) =>
                  setFormData({ ...formData, youtube_url: e.target.value })
                }
                className="w-full border p-3 rounded-xl mt-2"
                placeholder="Contoh: https://www.youtube.com/watch?v=xxxx"
              />

              <p className="text-sm text-gray-500 mt-2">
                Kosongkan jika berita tidak memiliki video YouTube.
              </p>
            </div>

            <div className="flex justify-between items-center gap-4">

              {/* 🔥 ACTION BUTTON */}
              <div className="flex gap-3">

                {!isPublished && (
                  <>
                    {/* ✅ SETUJUI */}
                    {(status === "draft" || status === "menunggu" || status === "ditolak") && (
                      <button
                        type="button"
                        onClick={() => updateStatus("disetujui")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:scale-105 transition"
                      >
                        Setujui
                      </button>
                    )}

                    {/* ✅ TOLAK */}
                    {(status === "draft" || status === "menunggu" || status === "disetujui") && (
                      <button
                        type="button"
                        onClick={() => updateStatus("ditolak")}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:scale-105 transition"
                      >
                        Tolak
                      </button>
                    )}
                    {/* ✅ TOLAK */}
                    {(status === "draft" || status === "menunggu" || status === "disetujui") && (
                      <button
                        type="button"
                        onClick={() => updateStatus("ditolak")}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:scale-105 transition"
                      >
                        Tolak
                      </button>
                    )}

                    {/* ✅ PUBLIKASI */}
                    {status === "disetujui" && (
                      <button
                        type="button"
                        onClick={() => updateStatus("dipublikasi")}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:scale-105 transition"
                      >
                        Publikasi
                      </button>
                    )}
                  </>
                )}

              </div>

              {/* 🔥 RIGHT BUTTON */}
              <div className="flex gap-4">

                <button
                  type="button"
                  onClick={() => navigate('/superadmin/berita')}
                  className="px-6 py-3 bg-gray-300 rounded-xl"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2 font-bold"
                >
                  <Save size={18} />
                  {loading ? 'Menyimpan...' : 'Update'}
                </button>

              </div>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBerita;