// frontend/src/pages/superadmin/masjid/EditMasjid.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, AlertCircle, Phone, MapPin, AlignLeft, Globe } from 'lucide-react';

const EditMasjid = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    nama_masjid: '',
    alamat: '',
    no_hp: '',
    deskripsi: '',
    latitude: '',
    longitude: ''
  });

  const [existingLogo, setExistingLogo] = useState(null); 
  const [newFile, setNewFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 

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
    fetchMasjid();
  }, [id, token]);

  const fetchMasjid = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const res = await axios.get(
        `http://localhost:3000/superadmin/masjid/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFormData({
        nama_masjid: res.data.nama_masjid || '',
        alamat: res.data.alamat || '',
        no_hp: res.data.no_hp || '',
        deskripsi: res.data.deskripsi || '',
        latitude: res.data.latitude || '',
        longitude: res.data.longitude || ''
      });

      if (res.data.logo_foto) {
        setExistingLogo(res.data.logo_foto);
        setPreviewUrl(`http://localhost:3000${res.data.logo_foto}`);
      }
      
      setNewFile(null);

    } catch (err) {
      console.error(err);
      setError('Gagal memuat data masjid.');
      navigate('/superadmin/masjid');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Revoke URL lama jika user ganti-ganti file biar gak berat memory
      if (newFile) URL.revokeObjectURL(previewUrl);

      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🔥 FIX: Ini fungsi yang menyamakan logika dengan handleRemoveNewFile di EditBerita
  const handleRemoveImage = () => {
    if (newFile) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setNewFile(null);

    // Balikin ke logo lama kalau ada
    if (existingLogo) {
      setPreviewUrl(`http://localhost:3000${existingLogo}`);
    } else {
      setPreviewUrl(null);
    }

    // Penting: Reset input file value biar bisa upload file yang sama lagi
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('nama_masjid', formData.nama_masjid);
    data.append('alamat', formData.alamat);
    data.append('no_hp', formData.no_hp);
    data.append('deskripsi', formData.deskripsi);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    
    if (newFile) {
      data.append('logo_foto', newFile);
    }

    try {
      await axios.put(
        `http://localhost:3000/superadmin/masjid/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Data Masjid berhasil diupdate');
      navigate('/superadmin/masjid');

    } catch (err) {
      console.error(err);
      alert('Gagal update data masjid');
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
                Edit <span className="text-mu-green">Masjid</span>
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>
            </div>

            <button
              type="button"
              onClick={fetchMasjid}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white shadow-sm hover:bg-gray-50 transition"
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

          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow">

            {/* LOGO SECTION */}
            <div>
              <h3 className="text-xl font-bold mb-4">Logo Masjid</h3>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* PRATINJAU GAMBAR */}
                {previewUrl && (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      className="w-full h-32 object-cover rounded-xl border shadow-sm"
                      alt="Logo masjid"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                    />
                    
                    {/* 🔥 FIX: onClick diarahkan ke handleRemoveImage yang sudah dibuat di atas */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* TOMBOL TAMBAH (+) - Muncul jika tidak ada file baru yang sedang dipilih */}
                {!newFile && (
                   <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center border-2 border-dashed rounded-xl h-32 cursor-pointer hover:bg-gray-50 transition group"
                  >
                    <span className="text-2xl text-gray-400 group-hover:text-mu-green group-hover:scale-110 transition">+</span>
                  </label>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-3">
                Klik tombol ✕ untuk mereset pilihan, atau tanda + untuk mengganti logo.
              </p>
            </div>

            {/* INPUT FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Nama Masjid</label>
                <input
                  type="text"
                  value={formData.nama_masjid}
                  onChange={(e) => setFormData({ ...formData, nama_masjid: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-2"
                  required
                />
              </div>

              <div>
                <label className="font-semibold flex items-center gap-2">
                   No. HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold">Alamat</label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                rows="3"
                className="w-full border p-3 rounded-xl mt-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
              <div>
                <label className="font-semibold">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-2"
                />
              </div>

              <div>
                <label className="font-semibold">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full border p-3 rounded-xl mt-2"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center gap-4 pt-4">
              <div className="flex gap-3"></div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/superadmin/masjid')}
                  className="px-6 py-3 bg-gray-300 rounded-xl font-semibold transition hover:bg-gray-400"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2 font-bold hover:scale-105 transition shadow-lg"
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

export default EditMasjid;