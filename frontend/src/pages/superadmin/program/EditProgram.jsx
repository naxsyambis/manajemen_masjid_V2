import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, RefreshCcw, Calendar, Upload } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const EditProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    nama_program: '',
    jadwal_rutin: '',
    deskripsi: '',
    kategori_id: ''
  });

  const [kategoriList, setKategoriList] = useState([]);
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [gambarLama, setGambarLama] = useState(null);

  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // ⏱️ realtime
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔥 FETCH PROGRAM
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;

        setFormData({
          nama_program: data?.nama_program || '',
          jadwal_rutin: data?.jadwal_rutin || '',
          deskripsi: data?.deskripsi || '',
          kategori_id: data?.kategori_id || ''
        });

        setGambarLama(data?.gambar || null);

      } catch (err) {
        console.error("FETCH PROGRAM ERROR:", err.response?.data || err.message);
      }
    };

    fetchProgram();
  }, [id, token]);

  // 🔥 FETCH KATEGORI
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/superadmin/kategori-program`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setKategoriList(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        setKategoriList([]);
      }
    };

    fetchKategori();
  }, [token]);

  // 🔥 HANDLE IMAGE
  const handleImage = (file) => {
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Max 3MB");
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

    try {
      const form = new FormData();

      form.append("nama_program", formData.nama_program);
      form.append("jadwal_rutin", formData.jadwal_rutin);
      form.append("deskripsi", formData.deskripsi);

      if (formData.kategori_id) {
        form.append("kategori_id", formData.kategori_id);
      }

      if (gambar) {
        form.append("gambar", gambar);
      }

      await axios.put(`${BASE_URL}/superadmin/program/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/superadmin/program');

    } catch (err) {
      console.error("UPDATE ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Gagal update program");
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
                Edit <span className="text-mu-green">Program</span>
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
                  rows={8}
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
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer mt-3 p-8 bg-gray-50 hover:border-mu-green transition"
                >
                  {preview ? (
                    <img src={preview} className="max-h-[300px] object-contain rounded-xl"/>
                  ) : gambarLama ? (
                    <img
                      src={`${BASE_URL}/uploads/program/${gambarLama}`}
                      className="max-h-[300px] object-contain rounded-xl"
                    />
                  ) : (
                    <>
                      <Upload className="text-gray-400 mb-2" size={28}/>
                      <p className="text-gray-600 font-medium">Klik upload gambar</p>
                      <p className="text-xs text-gray-400">PNG / JPG (max 3MB)</p>
                    </>
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
                {loading ? "Menyimpan..." : "Update Program"}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProgram;