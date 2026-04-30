import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, Calendar } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const TambahProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    nama_program: '',
    jadwal_rutin: '',
    deskripsi: '',
    kategori_id: ''
  });

  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [kategoriList, setKategoriList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // ⏱️ realtime
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 FETCH KATEGORI (FIX BACKEND)
  useEffect(() => {
    axios.get(`${BASE_URL}/superadmin/kategori-program`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setKategoriList(res.data?.data || []);
    })
    .catch(() => setKategoriList([]));
  }, []);

  // 🔥 HANDLE IMAGE
  const handleImage = (file) => {
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Maksimal 3MB");
      return;
    }

    setGambar(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_program || !formData.jadwal_rutin) {
      return alert("Nama & Jadwal wajib diisi");
    }

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();

      form.append("nama_program", formData.nama_program);
      form.append("jadwal_rutin", formData.jadwal_rutin);
      form.append("deskripsi", formData.deskripsi);
      form.append("kategori_id", formData.kategori_id || "");

      if (gambar) form.append("gambar", gambar);

      await axios.post(`${BASE_URL}/superadmin/program`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/superadmin/program');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal tambah program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">

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

        <div className="p-8 space-y-8 overflow-y-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black">
                Tambah <span className="text-mu-green">Program</span>
              </h1>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                <Calendar size={12}/>
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="bg-white px-6 py-3 rounded-xl shadow text-xs font-bold flex gap-2"
            >
              <RefreshCcw size={14}/> Refresh
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* FORM */}
          <div className="bg-white p-10 rounded-[2rem] shadow">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* NAMA */}
              <div>
                <label className="font-bold text-sm">Nama Program</label>
                <input
                  value={formData.nama_program}
                  onChange={(e)=>setFormData({...formData,nama_program:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                />
              </div>

              {/* JADWAL */}
              <div>
                <label className="font-bold text-sm">Jadwal Rutin</label>
                <input
                  value={formData.jadwal_rutin}
                  onChange={(e)=>setFormData({...formData,jadwal_rutin:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                />
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="font-bold text-sm">Deskripsi</label>
                <textarea
                  rows={6}
                  value={formData.deskripsi}
                  onChange={(e)=>setFormData({...formData,deskripsi:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                />
              </div>

              {/* KATEGORI */}
              <div>
                <label className="font-bold text-sm">Kategori</label>
                <select
                  value={formData.kategori_id}
                  onChange={(e)=>setFormData({...formData,kategori_id:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                >
                  <option value="">Pilih kategori</option>
                  {kategoriList.map(k => (
                    <option key={k.kategori_id} value={k.kategori_id}>
                      {k.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              {/* UPLOAD */}
<div>
  <label className="font-bold text-sm">Upload Gambar</label>

  <label
    className="w-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer mt-2 p-4 bg-gray-50 hover:border-mu-green transition overflow-hidden"
  >
    {preview ? (
      <img
        src={preview}
        className="max-h-96 w-auto object-contain rounded-lg"
      />
    ) : (
      <div className="flex flex-col items-center text-gray-400">
        <div className="text-3xl mb-2">⬆</div>
        <p className="font-medium">Klik upload gambar</p>
        <p className="text-xs">PNG / JPG (max 3MB)</p>
      </div>
    )}

    <input
      type="file"
      hidden
      accept="image/*"
      onChange={(e)=>handleImage(e.target.files[0])}
    />
  </label>
</div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-mu-green text-white py-4 rounded-xl font-bold flex justify-center gap-2"
              >
                <Save size={16}/>
                {loading ? "Menyimpan..." : "Simpan Program"}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahProgram;