// frontend/src/pages/superadmin/masjid/DetailMasjid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import GrafikKeuangan from '../../public/masjid/GrafikKeuangan';
import { 
  MapPin, Phone, FileText, Image as ImageIcon, ArrowLeft, Edit, 
  Trash2, AlertTriangle, X, Users, Package, History, 
  FileBarChart, Newspaper, Rocket, ArrowUpCircle, ArrowDownCircle, List
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const InfoItem = ({ icon, label, value }) => (
  <div className="flex gap-4 items-start p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
    <div className="p-3 bg-white rounded-xl text-mu-green shadow-sm">
      {icon}
    </div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-700 truncate">
        {value || "-"}
      </p>
    </div>
  </div>
);

const DataTable = ({ title, icon, data, columns, dataKeys, extraHeader }) => (
  <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
        <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-500">{data.length} Data</span>
      </div>
      <div className="md:ml-auto">
        {extraHeader}
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
          <tr>{columns.map((col, i) => <th key={i} className="px-8 py-5">{col}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length > 0 ? data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-all group">
              {dataKeys.map((key, i) => (
                <td key={i} className="px-8 py-5 text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  {key === 'status' || key === 'kondisi' ? (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      (item[key] === 'aktif' || item[key] === 'baik') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {item[key]}
                    </span>
                  ) : key === 'jumlah' ? (
                    <span className={`font-bold ${parseFloat(item[key]) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rp {Math.abs(item[key]).toLocaleString('id-ID')}
                    </span>
                  ) : item[key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} className="text-center py-20 text-gray-300 font-bold italic uppercase tracking-widest text-xs">Data Kosong</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const DetailMasjid = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [masjid, setMasjid] = useState(null);
  const [namaTakmir, setNamaTakmir] = useState("Memuat...");
  const [keuanganRaw, setKeuanganRaw] = useState([]); // Data asli untuk filter
  const [keuanganFiltered, setKeuanganFiltered] = useState([]);
  const [filterType, setFilterType] = useState('semua');
  
  const [jamaah, setJamaah] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [berita, setBerita] = useState([]);
  const [program, setProgram] = useState([]);

  const isExpanded = isOpen || isHovered;

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const mRes = await axios.get(`http://localhost:3000/superadmin/masjid/${id}`, { headers });
      const dataMasjid = mRes.data;
      setMasjid(dataMasjid);

      if (dataMasjid.user_id) {
        try {
          const uRes = await axios.get(`http://localhost:3000/superadmin/takmir`, { headers });
          const takmirFound = uRes.data.find(u => u.user_id === dataMasjid.user_id || u.id === dataMasjid.user_id);
          setNamaTakmir(takmirFound?.nama || "User Tidak Ditemukan");
        } catch (e) { setNamaTakmir("Gagal memuat nama"); }
      }

      const [kRes, jRes, iRes, hRes, bRes, pRes] = await Promise.all([
        axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/jamaah?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/inventaris?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/kegiatan?masjid_id=${id}`, { headers }).catch(() => ({ data: [] })),
        axios.get(`http://localhost:3000/superadmin/berita?masjid_id=${id}`, { headers }).catch(() => ({ data: [] })),
        axios.get(`http://localhost:3000/superadmin/program?masjid_id=${id}`, { headers }).catch(() => ({ data: [] }))
      ]);

      const rawKeuangan = kRes.data.data || [];
      setKeuanganRaw(rawKeuangan);
      setKeuanganFiltered(rawKeuangan);
      setJamaah(jRes.data.data || []);
      setInventaris(iRes.data.data || []);
      setRiwayat(hRes.data.data || hRes.data || []);
      setBerita(bRes.data || []);
      setProgram(pRes.data || []);
      
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Handle Filter Keuangan
  useEffect(() => {
    if (filterType === 'masuk') {
      setKeuanganFiltered(keuanganRaw.filter(item => parseFloat(item.jumlah) > 0));
    } else if (filterType === 'keluar') {
      setKeuanganFiltered(keuanganRaw.filter(item => parseFloat(item.jumlah) < 0));
    } else {
      setKeuanganFiltered(keuanganRaw);
    }
  }, [filterType, keuanganRaw]);

  const processKeuanganForChart = (data) => {
    const monthly = {};
    data.forEach(item => {
      const monthYear = new Date(item.tanggal).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      if (!monthly[monthYear]) monthly[monthYear] = { month: monthYear, pemasukan: 0, pengeluaran: 0 };
      const val = parseFloat(item.jumlah);
      if (val > 0) monthly[monthYear].pemasukan += val;
      else monthly[monthYear].pengeluaran += Math.abs(val);
    });
    return Object.values(monthly);
  };

  const handleDeleteMasjid = async () => {
    try {
      const currentToken = localStorage.getItem('token') || '';
      await axios.delete(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      navigate('/superadmin/masjid');
    } catch (err) { console.error("Gagal hapus masjid:", err); }
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center font-bold">Memuat Data Masjid...</div>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-800">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <main className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Header Profil */}
          <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 bg-gray-50 rounded-[2rem] overflow-hidden border-2 border-mu-green/20 flex items-center justify-center">
                {masjid?.logo_foto ? (
                  <img src={`http://localhost:3000${masjid.logo_foto}`} className="w-full h-full object-cover" alt="Logo" />
                ) : (
                  <ImageIcon size={60} className="text-gray-300" />
                )}
              </div>
              <h2 className="text-2xl font-black text-center">{masjid?.nama_masjid}</h2>
              <span className="bg-mu-green/10 px-4 py-1 rounded-full text-[10px] font-black text-mu-green uppercase">ID: {masjid?.masjid_id}</span>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<MapPin size={18}/>} label="Alamat" value={masjid?.alamat} />
                <InfoItem icon={<Phone size={18}/>} label="Kontak" value={masjid?.no_hp} />
                <InfoItem icon={<Users size={18}/>} label={`Takmir (User ID: ${masjid?.user_id || '-'})`} value={namaTakmir} />
                <InfoItem icon={<FileText size={18}/>} label="Deskripsi" value={masjid?.deskripsi || "Tidak ada deskripsi"} />
              </div>
              
              <div className="flex gap-3 pt-6">
                <button onClick={() => navigate(`/superadmin/masjid/edit/${id}`)} className="flex-1 bg-mu-green text-white py-4 rounded-2xl font-bold flex justify-center gap-2 items-center hover:bg-green-700 transition-all shadow-lg shadow-mu-green/20"><Edit size={18}/> Edit Data</button>
                <button onClick={() => setShowDeleteModal(true)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl font-bold flex justify-center gap-2 items-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/> Hapus</button>
              </div>
            </div>
          </div>

          {/* Grafik Keuangan */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 flex items-center gap-2"><FileBarChart className="text-mu-green" size={24}/> Grafik Arus Kas</h3>
             <GrafikKeuangan chartData={processKeuanganForChart(keuanganRaw)} />
          </div>

          {/* Tabel Transaksi Keuangan dengan Filter */}
          <DataTable 
            title="Riwayat Transaksi" 
            icon={<History className="text-mu-green" size={24}/>} 
            data={keuanganFiltered} 
            columns={['Keterangan', 'Tanggal', 'Jumlah']} 
            dataKeys={['keterangan', 'tanggal', 'jumlah']}
            extraHeader={
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                {[
                  { id: 'semua', label: 'Semua', icon: <List size={14}/> },
                  { id: 'masuk', label: 'Masuk', icon: <ArrowUpCircle size={14}/> },
                  { id: 'keluar', label: 'Keluar', icon: <ArrowDownCircle size={14}/> }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilterType(btn.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      filterType === btn.id ? 'bg-white text-mu-green shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            }
          />

          {/* Tabel Berita & Program */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataTable title="Berita Masjid" icon={<Newspaper className="text-blue-500" size={24}/>} data={berita} columns={['Judul', 'Tanggal']} dataKeys={['judul', 'tanggal']} />
            <DataTable title="Program Kerja" icon={<Rocket className="text-purple-500" size={24}/>} data={program} columns={['Nama Program', 'Status']} dataKeys={['nama_program', 'status']} />
          </div>

          {/* Tabel Jamaah, Inventaris, Riwayat */}
          <div className="space-y-8 pb-10">
            <DataTable title="Daftar Jamaah" icon={<Users className="text-blue-500" size={24}/>} data={jamaah} columns={['Nama', 'Status', 'Alamat']} dataKeys={['nama', 'status', 'alamat']} />
            <DataTable title="Daftar Inventaris" icon={<Package className="text-orange-500" size={24}/>} data={inventaris} columns={['Nama Barang', 'Jumlah', 'Kondisi']} dataKeys={['nama_barang', 'jumlah', 'kondisi']} />
            <DataTable title="Riwayat Kegiatan" icon={<History className="text-purple-500" size={24}/>} data={riwayat} columns={['Nama Kegiatan', 'Tanggal', 'Tempat']} dataKeys={['nama_kegiatan', 'tanggal', 'tempat']} />
          </div>
        </main>
      </div>

      {/* Modal Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black mb-2 text-gray-800">Hapus Masjid?</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Tindakan ini tidak dapat dibatalkan. Semua data terkait akan ikut terhapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={handleDeleteMasjid} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailMasjid;