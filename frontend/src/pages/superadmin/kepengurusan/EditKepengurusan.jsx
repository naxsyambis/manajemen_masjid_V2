// frontend/src/pages/superadmin/kepengurusan/EditKepengurusan.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Save, User, Calendar, RefreshCcw, AlertCircle, Briefcase } from 'lucide-react';

const EditKepengurusan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    jabatan: '',
    periode_mulai: '',
    periode_selesai: '',
    foto_pengurus: null
  });
  
  const [existingFoto, setExistingFoto] = useState(null); // Simpan path foto lama
  const [newFile, setNewFile] = useState(null); // File baru yang dipilih
  const [previewUrl, setPreviewUrl] = useState(null); // URL untuk pratinjau

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
    fetchPengurus();
  }, [id, token]);

  const fetchPengurus = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await axios.get(`http://localhost:3000/superadmin/kepengurusan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      setFormData({
        nama_lengkap: data.nama_lengkap ?? '',
        jabatan: data.jabatan ?? '',
        periode_mulai: data.periode_mulai ? data.periode_mulai.split('T')[0] : '',
        periode_selesai: data.periode_selesai ? data.periode_selesai.split('T')[0] : '',
        foto_pengurus: data.foto_pengurus ?? null
      });

      // Tarik foto lama ke pratinjau
      if (data.foto_pengurus) {
        setExistingFoto(data.foto_pengurus);
        setPreviewUrl(`http://localhost:3000${data.foto_pengurus}`);
      }
      
      setNewFile(null);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data pengurus.');
      navigate('/superadmin/kepengurusan');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB.');
        return;
      }

      // Bersihkan memory URL lama jika ada proses ganti file
      if (newFile) URL.revokeObjectURL(previewUrl);

      setNewFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 🔥 MEKANISME X (HAPUS) IDENTIK DENGAN REQUEST SEBELUMNYA
  const handleRemoveImage = () => {
    if (newFile) {
      URL.revokeObjectURL(previewUrl);
    }

    setNewFile(null);

    // Kembalikan ke foto lama jika ada di database
    if (existingFoto) {
      setPreviewUrl(`http://localhost:3000${existingFoto}`);
    } else {
      setPreviewUrl(null);
    }

    // Reset input agar bisa pilih file yang sama lagi
    const fileInput = document.getElementById('foto-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('nama_lengkap', formData.nama_lengkap);
    data.append('jabatan', formData.jabatan);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);
    
    if (newFile) {
      data.append('foto_pengurus', newFile);
    }

    try {
      await axios.put(`http://localhost:3000/superadmin/kepengurusan/${id}`, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Pengurus berhasil diupdate ✅');
      navigate('/superadmin/kepengurusan');
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate pengurus.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex overflow-hidden">
      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout} 
        user={user} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="p-8 overflow-y-auto space-y-8">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Edit <span className="text-mu-green">Pengurus</span>
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </div>
            </div>
            
            <button 
              type="button"
              onClick={fetchPengurus}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white shadow-sm hover:bg-gray-50 transition"
            >
              <RefreshCcw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 shadow-sm">
              <AlertCircle className="text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* CARD FORM */}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow space-y-8">
            
            {/* FOTO SECTION - IDENTIK DENGAN EDIT BERITA */}
            <div>
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Foto Pengurus</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="foto-upload"
              />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrl && (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      className="w-full h-40 object-cover rounded-xl border shadow-sm"
                      alt="Preview pengurus"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                    />
                    {/* BUTTON X (SILANG) */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* BUTTON TAMBAH (+) */}
                {!newFile && (
                  <label
                    htmlFor="foto-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-40 cursor-pointer hover:bg-gray-50 transition group"
                  >
                    <span className="text-2xl text-gray-400 group-hover:text-mu-green group-hover:scale-110 transition">+</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ganti Foto</span>
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b pb-2">Biodata</h3>
                
                <div>
                  <label className="font-semibold flex items-center gap-2 text-gray-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold flex items-center gap-2 text-gray-700">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b pb-2">Periode</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-sm text-gray-700">Periode Mulai</label>
                    <input
                      type="date"
                      value={formData.periode_mulai}
                      onChange={(e) => setFormData({ ...formData, periode_mulai: e.target.value })}
                      className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="font-semibold text-sm text-gray-700">Periode Selesai</label>
                    <input
                      type="date"
                      value={formData.periode_selesai}
                      onChange={(e) => setFormData({ ...formData, periode_selesai: e.target.value })}
                      className="w-full border p-3 rounded-xl mt-2 outline-none focus:border-mu-green transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/superadmin/kepengurusan')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold transition hover:bg-gray-300"
              >
                Batal
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2 font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? 'Menyimpan...' : 'Update Pengurus'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditKepengurusan;