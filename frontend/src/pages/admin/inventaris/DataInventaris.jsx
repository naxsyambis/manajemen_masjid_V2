import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Pencil, 
  Trash2, 
  Plus, 
  Search,
  Box,
  Filter,
  ArrowUpDown,
  Archive
} from 'lucide-react'; 
import Button from '../../../components/Button';
import StatCard from '../../../components/StatCard';
import ModalInventaris from './ModalInventaris';

const handleAuthError = (err) => { 
  if (err.response && err.response.status === 401) {
    alert(err.response.data.message || "Sesi Anda telah berakhir");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }
  return false;
};

const DataInventaris = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('semua');

  const token = localStorage.getItem('token');

  const [form, setForm] = useState({ 
    nama_barang: '', 
    jumlah: '', 
    kondisi: 'baik', 
    keterangan: '' 
  });

  const fetchInventaris = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/takmir/inventaris', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    } catch (err) {
      if (handleAuthError(err)) return;
      console.error("Gagal load database inventaris");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInventaris();
  }, [token]);

  const filteredItems = items.filter(item => {
    const matchSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKondisi = filterKondisi === 'semua' || item.kondisi === filterKondisi;
    return matchSearch && matchKondisi;
  });

  const openTambah = () => {
    setIsEdit(false);
    setForm({ nama_barang: '', jumlah: '', kondisi: 'baik', keterangan: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setSelectedId(item.inventaris_id);
    setForm({
      nama_barang: item.nama_barang,
      jumlah: item.jumlah,
      kondisi: item.kondisi,
      keterangan: item.keterangan || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:3000/takmir/inventaris/${selectedId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3000/takmir/inventaris', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      fetchInventaris();
    } catch (err) {
      if (handleAuthError(err)) return;
      alert("Gagal simpan ke database.");
    }
  };

  const handleHapus = async (id) => {
    if (window.confirm("Hapus barang dari database?")) {
      try {
        await axios.delete(`http://localhost:3000/takmir/inventaris/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchInventaris();
      } catch (err) {
        if (handleAuthError(err)) return;
        alert("Gagal hapus data.");
      }
    }
  };

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <ModalInventaris 
        show={showForm} 
        onClose={() => setShowForm(false)} 
        onSubmit={handleSave}
        form={form}
        setForm={setForm}
        isEdit={isEdit}
      />

      {}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Package size={32} strokeWidth={2.5} />
             </div>
             <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Inventaris
             </h2>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] ml-1"> KELOLA INVENNTARIS ANDA</p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={openTambah} className="text-white !rounded-2xl !py-5 !px-10 !bg-mu-green shadow-xl shadow-green-200 hover:translate-y-[-4px] transition-all flex items-center">
            <Plus size={22} className="mr-2" strokeWidth={3} /> Tambah Barang Baru
          </Button>
        </div> 
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card-hover transition-all hover:scale-105">
            <StatCard title="Total Aset" value={items.length} icon={<Box size={26} strokeWidth={2.5} />} colorClass="bg-blue-50/50 text-blue-600 border border-blue-100 shadow-sm" />
        </div>
        <div className="stat-card-hover transition-all hover:scale-105">
            <StatCard title="Kondisi Layak" value={items.filter(i => i.kondisi === 'baik').length} icon={<CheckCircle2 size={26} strokeWidth={2.5} />} colorClass="bg-green-50/50 text-green-600 border border-green-100 shadow-sm" />
        </div>
        <div className="stat-card-hover transition-all hover:scale-105">
            <StatCard title="Dalam Perbaikan" value={items.filter(i => i.kondisi !== 'baik').length} icon={<AlertCircle size={26} strokeWidth={2.5} />} colorClass="bg-red-50/50 text-red-600 border border-red-100 shadow-sm" />
        </div>
      </div>

      {}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="relative w-full md:w-96 group">
             <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800 group-focus-within:text-mu-green transition-colors" />
             <input 
                type="text" 
                placeholder="Cari aset masjid..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold text-gray-600 focus:ring-2 focus:ring-mu-green/20 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shrink-0 overflow-x-auto no-scrollbar">
             {['semua', 'baik', 'rusak', 'hilang'].map((k) => (
               <button
                key={k}
                onClick={() => setFilterKondisi(k)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterKondisi === k ? 'bg-white text-mu-green shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
               >
                 {k}
               </button>
             ))}
           </div>
        </div>

        {}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-800 border-b border-gray-100 bg-gray-50/20">
                <th className="p-8"><div className="flex items-center gap-2"><Archive size={14} /> Nama Barang</div></th>
                <th className="p-8"><div className="flex items-center gap-2"><ArrowUpDown size={14} /> Kuantitas</div></th>
                <th className="p-8 text-center">Status Aset</th>
                <th className="p-8">Keterangan</th>
                <th className="p-8 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-32 text-center"><div className="animate-bounce inline-block p-4 bg-green-50 rounded-full text-mu-green font-black tracking-widest uppercase italic">Updating Database...</div></td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.inventaris_id} className="group hover:bg-mu-green/[0.03] transition-all duration-300 cursor-default">
                  <td className="p-8">
                    <span className="text-sm font-black text-gray-700 uppercase tracking-tighter group-hover:text-mu-green transition-colors">{item.nama_barang}</span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-gray-800 leading-none">{item.jumlah}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Unit</span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all group-hover:scale-105 shadow-sm ${
                      item.kondisi === 'baik' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${item.kondisi === 'baik' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`}></span>
                      {item.kondisi}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1 max-w-[250px]">
                        <p className="text-[11px] text-gray-500 italic font-semibold leading-relaxed line-clamp-2">
                          {item.keterangan || 'Lokasi Belum Terdata'}
                        </p>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex justify-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="p-4 bg-white border border-gray-100 text-yellow-500 rounded-2xl shadow-sm hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all transform hover:-translate-y-1">
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleHapus(item.inventaris_id)} className="p-4 bg-white border border-gray-100 text-red-500 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all transform hover:-translate-y-1">
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        {!loading && filteredItems.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center gap-6 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-gray-200 shadow-sm border border-gray-50 animate-pulse">
               <Archive size={48} />
            </div>
            <div className="space-y-1">
               <p className="text-gray-400 font-black uppercase tracking-widest">Aset Tidak Ditemukan</p>
               <p className="text-[10px] text-gray-800 italic">Coba kata kunci lain atau periksa filter kondisi Anda.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataInventaris;