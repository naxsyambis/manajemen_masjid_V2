import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, Calendar } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const TambahKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    nama_kegiatan: '',
    waktu_kegiatan: '',
    lokasi: '',
    deskripsi: ''
  });

  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [masjidList, setMasjidList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // ⏱ realtime
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 FETCH MASJID
  useEffect(() => {
    axios.get(`${BASE_URL}/superadmin/masjid`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMasjidList(res.data || []))
    .catch(() => setMasjidList([]));
  }, []);

  // 📅 MIN DATE (hari ini)
  const today = new Date().toISOString().slice(0,16);

  // HANDLE IMAGE
  const handleImage = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Maksimal 5MB");
      return;
    }

    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_kegiatan || !formData.waktu_kegiatan || !formData.lokasi) {
      return alert("Semua field wajib diisi");
    }

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();

      form.append("nama_kegiatan", formData.nama_kegiatan);
      form.append("waktu_kegiatan", formData.waktu_kegiatan);
      form.append("lokasi", formData.lokasi);
      form.append("deskripsi", formData.deskripsi);

      if (poster) form.append("poster", poster);

      await axios.post(`${BASE_URL}/superadmin/kegiatan`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/superadmin/kegiatan');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Gagal tambah kegiatan");
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
                Tambah <span className="text-mu-green">Kegiatan</span>
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
                <label className="font-bold text-sm">Nama Kegiatan</label>
                <input
                  value={formData.nama_kegiatan}
                  onChange={(e)=>setFormData({...formData,nama_kegiatan:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                />
              </div>

              {/* WAKTU */}
              <div>
                <label className="font-bold text-sm">Waktu Kegiatan</label>
                <input
                  type="datetime-local"
                  min={today} // ✅ MIN HARI INI
                  value={formData.waktu_kegiatan}
                  onChange={(e)=>setFormData({...formData,waktu_kegiatan:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                />
              </div>

              {/* LOKASI (DROPDOWN) */}
              <div>
                <label className="font-bold text-sm">Lokasi Masjid</label>
                <select
                  value={formData.lokasi}
                  onChange={(e)=>setFormData({...formData,lokasi:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                >
                  <option value="">Pilih Masjid</option>
                  {masjidList.map(m => (
                    <option key={m.masjid_id} value={m.nama_masjid}>
                      {m.nama_masjid}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="font-bold text-sm">Deskripsi</label>
                <textarea
                  rows={5}
                  value={formData.deskripsi}
                  onChange={(e)=>setFormData({...formData,deskripsi:e.target.value})}
                  className="w-full p-4 border rounded-xl mt-1"
                />
              </div>

              {/* UPLOAD */}
              <div>
                <label className="font-bold text-sm">Upload Poster</label>

                <label className="w-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer mt-2 p-4 bg-gray-50 hover:border-mu-green transition">

                  {preview ? (
                    <img src={preview} className="max-h-96 object-contain"/>
                  ) : (
                    <div className="text-gray-400 text-center">
                      Klik upload poster
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
                className="w-full bg-mu-green text-white py-4 rounded-xl font-bold"
              >
                {loading ? "Menyimpan..." : "Simpan Kegiatan"}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahKegiatan;