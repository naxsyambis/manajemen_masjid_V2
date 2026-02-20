import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, Calendar, RefreshCcw, AlertCircle } from 'lucide-react';

const EditBerita = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    judul: '',
    isi: ''
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchBerita();
  }, [id, token]);

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
        judul: res.data.judul,
        isi: res.data.isi
      });

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

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveExisting = (gambar_id) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.gambar_id !== gambar_id)
    );
    setDeletedImageIds((prev) => [...prev, gambar_id]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('judul', formData.judul);
    data.append('isi', formData.isi);
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
            </div>

            <button
              onClick={fetchBerita}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border rounded-xl"
            >
              <RefreshCcw size={14} />
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

                {existingImages.map((img) => (
                  <div key={img.gambar_id} className="relative">
                    <img
                      src={`http://localhost:3000${img.path_gambar}`}
                      className="w-full h-32 object-cover rounded-xl"
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
                      className="w-full h-32 object-cover rounded-xl"
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

                <label
                  htmlFor="gambar-upload"
                  className="flex items-center justify-center border-2 border-dashed rounded-xl h-32 cursor-pointer"
                >
                  +
                </label>

              </div>
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

            <div className="flex justify-end gap-4">
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
                className="px-6 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Menyimpan...' : 'Update'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBerita;