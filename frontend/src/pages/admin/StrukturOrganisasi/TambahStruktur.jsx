// frontend/src/pages/admin/StrukturOrganisasi/TambahStruktur.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Save,
  User,
  Calendar,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

const TambahStruktur = () => {
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: ''
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3MB.');
      return;
    }

    setFile(selectedFile);

    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.jabatan) {
      alert('Nama dan jabatan wajib diisi.');
      return;
    }

    if (!masjidId) {
      alert('Masjid ID tidak ditemukan. Silakan logout lalu login ulang.');
      return;
    }

    if (file && file.size > 3 * 1024 * 1024) {
      alert('Ukuran file maksimal 3MB.');
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('jabatan', formData.jabatan);
    data.append('masjid_id', masjidId);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);

    if (file) {
      data.append('foto', file);
    }

    try {
      await axios.post('http://localhost:3000/takmir/struktur-organisasi', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('Data struktur organisasi berhasil ditambahkan');

      setFormData({
        nama: '',
        jabatan: '',
        periode_mulai: '',
        periode_selesai: ''
      });

      setFile(null);
      setPreviewUrl(null);

      navigate('/admin/struktur-organisasi');
    } catch (err) {
      console.error('Error adding struktur organisasi:', err);
      setError(err.response?.data?.message || 'Gagal menambahkan data struktur organisasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="tambah-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
      <div className="main-content p-8 h-full overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
              Tambah <span className="text-mu-green">Struktur</span>
            </h1>

            <div className="flex items-center gap-2 mt-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
              <Calendar size={12} className="text-mu-green" />
              <span>
                {time.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="mx-2">•</span>
              <span className="text-mu-green">
                {time.toLocaleTimeString('id-ID')}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all shadow-sm active:scale-95 hover:shadow-lg"
            >
              <RefreshCcw size={14} />
              Refresh Halaman
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="p-10 lg:p-16">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">
                Tambah Struktur Organisasi
              </h2>
              <p className="text-gray-600 text-lg">
                Isi informasi pengurus struktur organisasi masjid dengan lengkap.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">
                      Foto
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="foto-upload"
                      />

                      <label htmlFor="foto-upload" className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center cursor-pointer hover:border-mu-green hover:bg-mu-green/5 transition-all duration-300 shadow-lg hover:shadow-xl">
                          {previewUrl ? (
                            <div className="space-y-6">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-xl mx-auto shadow-lg"
                              />
                              <div>
                                <p className="text-lg font-semibold text-gray-800">
                                  {file.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <Upload size={64} className="text-gray-400 mx-auto" />
                              <div>
                                <p className="text-lg font-semibold text-gray-700">
                                  Klik untuk upload foto
                                </p>
                                <p className="text-sm text-gray-500">
                                  PNG, JPG hingga 3MB
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>

                      <p className="text-sm text-gray-500">
                        Upload foto anggota struktur organisasi, opsional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">
                      Informasi Struktur
                    </h3>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Nama
                      </label>
                      <div className="relative">
                        <User
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          value={formData.nama}
                          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                          placeholder="Masukkan nama"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        value={formData.jabatan}
                        onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                        className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                        placeholder="Contoh: Ketua DKM, Sekretaris, Bendahara"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Periode Mulai
                      </label>
                      <div className="relative">
                        <Calendar
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          value={formData.periode_mulai}
                          onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Periode Selesai
                      </label>
                      <div className="relative">
                        <Calendar
                          size={20}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          value={formData.periode_selesai}
                          onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-mu-green/20 focus:border-mu-green transition-all duration-300 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 pt-12 mt-12 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/admin/struktur-organisasi')}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-2xl hover:from-gray-300 hover:to-gray-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-8 py-4 bg-mu-green text-white rounded-2xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={22} className="mr-3" />
                  {loading ? 'Menyimpan...' : 'Simpan Struktur'}
                </button>
              </div>
            </form>
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

export default TambahStruktur;