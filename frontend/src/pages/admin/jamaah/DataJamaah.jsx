import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  UserCheck, 
  UserMinus, 
  Pencil, 
  Trash2, 
  Shield,
  VenetianMask 
} from 'lucide-react'; 
import Button from '../../../components/Button';
import StatCard from '../../../components/StatCard';
import ModalJamaah from './ModalJamaah';

const handleAuthError = (err) => { 
  if (err.response && err.response.status === 401) {
    alert(err.response.data.message || "Sesi Anda telah berakhir");
    localStorage.removeItem("token");
    window.location.href = "/login";
    return true;
  }
  return false;
};

const DataJamaah = () => {
  const [jamaah, setJamaah] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  const [form, setForm] = useState({ 
    nama: '', 
    alamat: '',
    no_hp: '', 
    jenis_kelamin: 'Laki-laki', 
    peran: '',
    status: 'aktif' 
  });

  const token = localStorage.getItem('token');

  const fetchJamaah = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/takmir/jamaah', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJamaah(res.data);
    } catch (err) {
      if (handleAuthError(err)) return;
      console.error("Gagal ambil data jamaah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchJamaah();
  }, [token]);

  const filteredJamaah = jamaah.filter(j => {
    const matchSearch = j.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'semua' || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openTambah = () => {
    setIsEdit(false);
    setForm({ nama: '', alamat: '', no_hp: '', jenis_kelamin: 'Laki-laki', peran: '', status: 'aktif' });
    setShowForm(true);
  };

  const handleEdit = (j) => {
    setIsEdit(true);
    setSelected(j);
    setForm({
      nama: j.nama,
      alamat: j.alamat || '',
      no_hp: j.no_hp,
      jenis_kelamin: j.jenis_kelamin,
      peran: j.peran || '',
      status: j.status || 'aktif'
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:3000/takmir/jamaah/${selected.jamaah_id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3000/takmir/jamaah', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      fetchJamaah();
    } catch (err) {
      if (handleAuthError(err)) return;
      alert("Gagal menyimpan data.");
    }
  };

  const handleHapus = async (id) => {
    if (window.confirm("Hapus data jamaah ini?")) {
      try {
        await axios.delete(`http://localhost:3000/takmir/jamaah/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchJamaah();
      } catch (err) {
        if (handleAuthError(err)) return;
        alert("Gagal hapus data.");
      }
    }
  };

  return (
    <div className="p-4 space-y-10 animate-fadeIn bg-[#fdfdfd]">
      <ModalJamaah 
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
             <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 rounded-2xl shadow-xl shadow-green-100 text-white transform -rotate-3 hover:rotate-0 transition-all duration-300">
                <Users size={32} strokeWidth={2.5} />
             </div>
             <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                Jamaah
             </h2>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] ml-1">Database Umat & Masyarakat</p>
        </div>
        
        <Button onClick={openTambah} className="text-white !rounded-2xl !py-5 !px-10 !bg-mu-green shadow-xl shadow-green-200 hover:translate-y-[-4px] transition-all flex items-center">
          <UserPlus size={22} className="mr-2" strokeWidth={3} /> Registrasi Jamaah
        </Button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          title="Total Jamaah" 
          value={jamaah.length} 
          icon={<Users size={26} strokeWidth={2.5} />} 
          colorClass="bg-blue-50/50 text-blue-600 border border-blue-100 shadow-sm" 
        />
        <StatCard 
          title="Jamaah Aktif" 
          value={jamaah.filter(j => j.status === 'aktif').length} 
          icon={<UserCheck size={26} strokeWidth={2.5} />} 
          colorClass="bg-green-50/50 text-green-600 border border-green-100 shadow-sm" 
        />
        <StatCard 
          title="Tidak Aktif" 
          value={jamaah.filter(j => j.status !== 'aktif').length} 
          icon={<UserMinus size={26} strokeWidth={2.5} />} 
          colorClass="bg-gray-50/50 text-gray-400 border border-gray-100 shadow-sm" 
        />
      </div>

      {}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden transition-all">
        <div className="p-8 border-b border-gray-50 bg-white/50 backdrop-blur-sm flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="relative w-full md:w-96 group">
             <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-mu-green transition-colors" />
             <input 
                type="text" 
                placeholder="Cari nama jamaah..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl outline-none text-sm font-bold text-gray-900 focus:ring-2 focus:ring-mu-green/20 transition-all shadow-inner placeholder:text-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>

           <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 shrink-0 overflow-x-auto no-scrollbar">
             {['semua', 'aktif', 'tidak aktif'].map((s) => (
               <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === s ? 'bg-white text-mu-green shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'
                }`}
               >
                 {s}
               </button>
             ))}
           </div>
        </div>

        {}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-800 border-b border-gray-100 bg-gray-50/20">
                <th className="p-8 text-center">No</th>
                <th className="p-8">Nama Lengkap</th>
                <th className="p-8">Alamat</th>
                <th className="p-8">No HP</th>
                <th className="p-8 text-center">Gender</th>
                <th className="p-8">Peran</th>
                <th className="p-8 text-center">Status</th>
                <th className="p-8 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="8" className="p-32 text-center"><div className="animate-bounce inline-block p-4 bg-green-50 rounded-full text-mu-green font-black tracking-widest uppercase italic">Memuat Data...</div></td></tr>
              ) : filteredJamaah.map((j, index) => (
                <tr key={j.jamaah_id} className="group hover:bg-mu-green/[0.03] transition-all duration-300 cursor-default font-black text-[10px] uppercase">
                  {}
                  <td className="p-8 text-center text-gray-900 font-black">{index + 1}</td>
                  
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-mu-green text-white flex items-center justify-center shadow-lg shadow-green-100 transition-all duration-300 font-black text-lg">
                        {j.nama.charAt(0).toUpperCase()}
                      </div>
                      {}
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tighter group-hover:text-mu-green transition-colors">{j.nama}</span>
                    </div>
                  </td>

                  <td className="p-8">
                    {}
                    <div className="flex items-center gap-2 text-gray-900 font-black lowercase italic">
                      <MapPin size={12} className="text-mu-green shrink-0" /> {j.alamat || '-'}
                    </div>
                  </td>

                  <td className="p-8">
                    {}
                    <div className="flex items-center gap-2 font-mono text-gray-900 font-black">
                      <Phone size={12} className="text-mu-green shrink-0" /> {j.no_hp}
                    </div>
                  </td>

                  <td className="p-8 text-center">
                    {}
                    <span className="text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-300 font-black">
                      {j.jenis_kelamin}
                    </span>
                  </td>

                  <td className="p-8">
                    {}
                    <div className="flex items-center gap-2 text-mu-green font-black tracking-tight">
                      {j.peran || 'jamaah'}
                    </div>
                  </td>

                  <td className="p-8 text-center">
                    <span className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3 transition-all group-hover:scale-105 shadow-sm ${
                      j.status === 'aktif' ? 'bg-green-100/50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${j.status === 'aktif' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'bg-gray-400'}`}></span>
                      {j.status}
                    </span>
                  </td>

                  <td className="p-8 text-center">
                    <div className="flex justify-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(j)} className="p-4 bg-white border border-gray-200 text-yellow-600 rounded-2xl shadow-sm hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all transform hover:-translate-y-1">
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button onClick={() => handleHapus(j.jamaah_id)} className="p-4 bg-white border border-gray-200 text-red-600 rounded-2xl shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all transform hover:-translate-y-1">
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredJamaah.length === 0 && (
          <div className="p-32 text-center flex flex-col items-center gap-6 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-gray-200 shadow-sm border border-gray-50 animate-pulse">
               <VenetianMask size={48} />
            </div>
            <div className="space-y-1">
               <p className="text-gray-900 font-black uppercase tracking-widest">Data Tidak Ditemukan</p>
               <p className="text-[10px] text-gray-500 italic">Coba periksa kembali kata kunci atau filter Anda.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataJamaah;