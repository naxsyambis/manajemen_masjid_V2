import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, Tag, Save, Pencil } from 'lucide-react';

const handleAuthError = (err) => { 
  if (err.response && err.response.status === 401) {
    alert(err.response.data.message || "Sesi Anda telah berakhir");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }
  return false;
};

const ModalKeuangan = ({ show, onClose, onSuccess, jenis, editData }) => {
  const [namaKategori, setNamaKategori] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (show) {
      setNamaKategori(editData ? editData.nama_kategori : '');
    }
  }, [show, editData]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaKategori.trim()) return;

    try {
      setLoading(true);
      if (editData) {
        await axios.put(`http://localhost:3000/takmir/kategori-keuangan/${editData.kategori_id}`, {
          nama_kategori: namaKategori,
          jenis: jenis
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onSuccess(editData.kategori_id);
      } else {
        const res = await axios.post('http://localhost:3000/takmir/kategori-keuangan', {
          nama_kategori: namaKategori,
          jenis: jenis
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onSuccess(res.data.kategori_id);
      }

      setNamaKategori('');
      onClose();
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(editData ? "Gagal mengubah kategori." : "Gagal menambahkan kategori.");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      ></div>

      <form 
        onSubmit={handleSubmit} 
        className="relative z-[100000] bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn mx-auto my-auto"
      >
        <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 text-mu-green font-black uppercase tracking-tighter text-sm">
              {editData ? <Pencil size={20} /> : <Tag size={20} />}
              <h3 className="text-xl">{editData ? 'Update Kategori' : 'Tambah Kategori'}</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-8">
              Pengaturan Kategori Kas
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
              {editData ? 'Ubah Nama Kategori' : `Nama Kategori Baru (${jenis})`}
            </label>
            <input 
              type="text" 
              autoFocus 
              value={namaKategori}
              onChange={(e) => setNamaKategori(e.target.value)}
              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-mu-green font-bold text-gray-700 shadow-inner"
              placeholder="Misal: Infaq Jum'at, Listrik..." 
              required
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 border-2 border-mu-green text-mu-green rounded-2xl font-black uppercase text-xs hover:bg-green-50 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-4 bg-mu-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-green-800 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> {loading ? '...' : (editData ? 'Update' : 'Simpan')}
            </button>
          </div>
        </div>

        <div className="p-4 bg-green-50 text-center border-t border-green-100">
          <p className="text-[8px] font-bold text-mu-green uppercase tracking-widest opacity-60 italic">
            *Pastikan nama kategori sudah sesuai sebelum disimpan
          </p>
        </div>
      </form>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ModalKeuangan;