// frontend/src/pages/superadmin/masjid/DetailMasjid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'; 
import { 
  MapPin, Phone, FileText, Image as ImageIcon, ArrowLeft, Edit, 
  Trash2, AlertTriangle, Users, Package, History, 
  FileBarChart, Newspaper, Rocket, ArrowUpCircle, ArrowDownCircle, List, RefreshCcw,
  ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { formatRupiah } from '../../../utils/formatCurrency';

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

const DataTable = ({ 
  title, icon, data, columns, dataKeys, extraHeader, 
  currentLimit, onLimitChange, currentPage, totalPages, onPageChange 
}) => (
  <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
        <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-500">{data ? data.length : 0} Total</span>
      </div>
      
      <div className="md:ml-auto flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tampilkan:</span>
          <select 
            value={currentLimit} 
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="bg-transparent text-xs font-bold text-mu-green outline-none cursor-pointer"
          >
            {[5, 10, 25, 50].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        {extraHeader}
      </div>
    </div>

    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left">
        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
          <tr>{columns.map((col, i) => <th key={i} className="px-8 py-5 whitespace-nowrap">{col}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data && data.length > 0 ? (
            data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-all group">
                {dataKeys.map((key, i) => (
                  <td key={i} className="px-8 py-5 text-sm font-medium text-gray-600 group-hover:text-gray-900 whitespace-nowrap">
                    {key === 'foto' ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {item[key] ? (
                                <img src={`http://localhost:3000/uploads/kepengurusan/${item[key]}`} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><UserIcon size={20}/></div>
                            )}
                        </div>
                    ) : key === 'status' || key === 'kondisi' ? (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        (item[key] === 'aktif' || item[key] === 'baik') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {item[key]}
                      </span>
                    ) : key === 'jumlah' ? (
                      <span className={`font-bold ${parseFloat(item[key]) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatRupiah(item[key])}
                      </span>
                    ) : item[key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-20 text-gray-300 font-bold italic uppercase tracking-widest text-xs">
                Data Kosong
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {totalPages > 1 && (
      <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Halaman {currentPage} dari {totalPages}
        </p>
        <div className="flex gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 disabled:opacity-30 hover:text-mu-green transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 disabled:opacity-30 hover:text-mu-green transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    )}
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
  const [keuanganRaw, setKeuanganRaw] = useState([]);
  const [keuanganFiltered, setKeuanganFiltered] = useState([]);
  const [filterType, setFilterType] = useState('semua');
  
  // State untuk Grafik
  const [chartData, setChartData] = useState([]);
  const [filterRange, setFilterRange] = useState('minggu');
  
  const [jamaah, setJamaah] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [berita, setBerita] = useState([]);
  const [program, setProgram] = useState([]);
  const [strukturOrganisasi, setStrukturOrganisasi] = useState([]); // Perbaikan State

  const [userMap, setUserMap] = useState({});
  const [kategoriProgMap, setKategoriProgMap] = useState({});

  const [pagination, setPagination] = useState({
    keuangan: { page: 1, limit: 5 },
    berita: { page: 1, limit: 5 },
    program: { page: 1, limit: 5 },
    jamaah: { page: 1, limit: 5 },
    inventaris: { page: 1, limit: 5 },
    riwayat: { page: 1, limit: 5 },
    strukturOrganisasi: { page: 1, limit: 5 } // Perbaikan Pagination
    kepengurusan: { page: 1, limit: 5 } 
  });

  const paginateData = (data, page, limit) => {
    if (!Array.isArray(data)) return [];
    const start = (page - 1) * limit;
    const end = start + limit;
    return data.slice(start, end);
  };

  const getTotalPages = (data, limit) => {
    if (!Array.isArray(data) || data.length === 0) return 1;
    return Math.ceil(data.length / limit);
  };

  const handleLimitChange = (table, value) => {
    setPagination(prev => ({ 
        ...prev, 
        [table]: { ...prev[table], limit: value, page: 1 } 
    }));
  };

  const handlePageChange = (table, value) => {
    setPagination(prev => ({ 
        ...prev, 
        [table]: { ...prev[table], page: value } 
    }));
  };

  const isExpanded = isOpen || isHovered;

  // Logika Grafik Arus Kas
  const processKeuanganForChart = (rawData, range) => {
    const now = new Date();
    let processedData = [];

    if (range === 'tahun') {
      const monthlyMap = Array(12).fill(0).map((_, i) => ({
        name: new Date(0, i).toLocaleDateString('id-ID', { month: 'short' }),
        masuk: 0, keluar: 0
      }));
      rawData.forEach((item) => {
        const d = new Date(item.tanggal);
        if (d.getFullYear() === now.getFullYear()) {
          const val = parseFloat(item.jumlah || 0);
          if (val > 0) monthlyMap[d.getMonth()].masuk += val;
          else monthlyMap[d.getMonth()].keluar += Math.abs(val);
        }
      });
      processedData = monthlyMap;
    } else if (range === 'bulan') {
      const getWeekOfMonth = (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return Math.ceil((date.getDate() + (firstDay === 0 ? 6 : firstDay - 1)) / 7);
      };

      const weeklyMap = [1, 2, 3, 4, 5].map((w) => ({ name: `Minggu ${w}`, masuk: 0, keluar: 0 }));
      rawData.forEach((item) => {
        const d = new Date(item.tanggal);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const weekIdx = getWeekOfMonth(d) - 1;
          const val = parseFloat(item.jumlah || 0);
          if (weeklyMap[weekIdx]) {
            if (val > 0) weeklyMap[weekIdx].masuk += val;
            else weeklyMap[weekIdx].keluar += Math.abs(val);
          }
        }
      });
      processedData = weeklyMap;
    } else {
      const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const dailyMap = dayNames.map((day) => ({ name: day, masuk: 0, keluar: 0 }));
      const currentDay = now.getDay();
      const mondayThisWeek = new Date(now);
      const diffToMonday = now.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
      mondayThisWeek.setDate(diffToMonday);
      mondayThisWeek.setHours(0, 0, 0, 0);

      rawData.forEach((item) => {
        const d = new Date(item.tanggal);
        if (d >= mondayThisWeek) {
          const dayIdx = d.getDay();
          const finalIdx = dayIdx === 0 ? 6 : dayIdx - 1;
          const val = parseFloat(item.jumlah || 0);
          if (val > 0) dailyMap[finalIdx].masuk += val;
          else dailyMap[finalIdx].keluar += Math.abs(val);
        }
      });
      processedData = dailyMap;
    }
    setChartData(processedData);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [mRes, tRes, uRes, katProgRes] = await Promise.all([
        axios.get(`http://localhost:3000/superadmin/masjid/${id}`, { headers }),
        axios.get(`http://localhost:3000/superadmin/takmir`, { headers }),
        axios.get(`http://localhost:3000/superadmin/user`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/kategori-program`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      setMasjid(mRes.data);

      const usersData = uRes.data.data || uRes.data || [];
      const mapUser = {};
      usersData.forEach(u => { mapUser[u.user_id] = u.nama; });
      setUserMap(mapUser);

      const katProgData = katProgRes.data.data || katProgRes.data || [];
      const mapKatProg = {};
      katProgData.forEach(k => { mapKatProg[k.kategori_id] = k.nama_kategori; });
      setKategoriProgMap(mapKatProg);

      const daftarTakmir = tRes.data;
      if (daftarTakmir && Array.isArray(daftarTakmir)) {
        const pengelola = daftarTakmir.find(t => 
          String(t.masjid_id) === String(id) || 
          String(t.masjid?.masjid_id) === String(id)
        );
        setNamaTakmir(pengelola ? (pengelola.user?.nama || pengelola.nama || mapUser[pengelola.user_id] || "Tanpa Nama") : "Belum Ada Takmir");
      }

      const [kRes, jRes, iRes, hRes, bRes, pRes, sRes] = await Promise.all([
        axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/jamaah?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/inventaris?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/kegiatan?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/berita?masjid_id=${id}`, { headers }).catch(() => ({ data: [] })),
        axios.get(`http://localhost:3000/superadmin/program?masjid_id=${id}`, { headers }).catch(() => ({ data: [] })),
        // Perbaikan Fetch API untuk Struktur Organisasi
        axios.get(`http://localhost:3000/superadmin/struktur-organisasi?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      const formatTableData = (response, mapKategoriManual = null) => {
        const arr = response.data?.data || response.data || response || [];
        if (!Array.isArray(arr)) return [];
        return arr.map(item => ({
          ...item,
          nama_user: item.user?.nama || mapUser[item.user_id] || `ID: ${item.user_id}`,
          nama_kategori: item.kategori_keuangan?.nama_kategori || item.kategori_program?.nama_kategori || (mapKategoriManual ? mapKategoriManual[item.kategori_id] : (item.kategori_id ? `ID: ${item.kategori_id}` : '-')),
          nama_approved_by: item.approved_by ? (mapUser[item.approved_by] || `ID: ${item.approved_by}`) : '-'
        }));
      };

      const formattedKeuangan = formatTableData(kRes);
      setKeuanganRaw(formattedKeuangan);
      setKeuanganFiltered(formattedKeuangan);
      processKeuanganForChart(formattedKeuangan, filterRange);
      
      setBerita(formatTableData(bRes));
      setProgram(formatTableData(pRes, mapKatProg));
      // Simpan data struktur organisasi
      setStrukturOrganisasi(sRes.data?.data || sRes.data || []); 

      setKepengurusan(sRes.data?.data || sRes.data || []); 
      setJamaah(jRes.data?.data || jRes.data || []);
      setInventaris(iRes.data?.data || iRes.data || []);
      setRiwayat(hRes.data?.data || hRes.data || []);

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    processKeuanganForChart(keuanganRaw, filterRange);
  }, [filterRange, keuanganRaw]);

  useEffect(() => {
    if (filterType === 'masuk') {
      setKeuanganFiltered(keuanganRaw.filter(item => parseFloat(item.jumlah) > 0));
    } else if (filterType === 'keluar') {
      setKeuanganFiltered(keuanganRaw.filter(item => parseFloat(item.jumlah) < 0));
    } else {
      setKeuanganFiltered(keuanganRaw);
    }
    handlePageChange('keuangan', 1);
  }, [filterType, keuanganRaw]);

  const handleDeleteMasjid = async () => {
    try {
      await axios.delete(`http://localhost:3000/superadmin/masjid/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/superadmin/masjid');
    } catch (err) { console.error("Gagal hapus masjid:", err); }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-gray-50">
      <RefreshCcw className="animate-spin text-mu-green" size={40} />
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Memuat Data Masjid...</p>
    </div>
  );

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
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={<MapPin size={18}/>} label="Alamat" value={masjid?.alamat} />
                <InfoItem icon={<Phone size={18}/>} label="Kontak" value={masjid?.no_hp} />
                <InfoItem icon={<Users size={18}/>} label="Takmir" value={namaTakmir} />
                <InfoItem icon={<FileText size={18}/>} label="Deskripsi" value={masjid?.deskripsi || "Tidak ada deskripsi"} />
              </div>
              
              <div className="flex gap-3 pt-6">
                <button onClick={() => navigate(`/superadmin/masjid/edit/${id}`)} className="flex-1 bg-mu-green text-white py-4 rounded-2xl font-bold flex justify-center gap-2 items-center hover:bg-green-700 transition-all shadow-lg shadow-mu-green/20"><Edit size={18}/> Edit Data</button>
                <button onClick={() => setShowDeleteModal(true)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl font-bold flex justify-center gap-2 items-center hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/> Hapus</button>
              </div>
            </div>
          </div>

          {/* BAGIAN GRAFIK ARUS KAS (PENGGANTI LAPORAN KEUANGAN) */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
                  <FileBarChart className="text-mu-green" size={24}/> Analisis Arus Kas
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Filter Aktif: <span className="text-mu-green font-black">{filterRange}</span>
                </p>
              </div>
              
              <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
                {['minggu', 'bulan', 'tahun'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setFilterRange(range)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      filterRange === range ? 'bg-white text-mu-green shadow-sm scale-105' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 rounded-[2rem]">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Belum Ada Data Transaksi</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} tickMargin={15} stroke="#94a3b8" />
                    <YAxis hide domain={[0, 'auto']} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f8fafc' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{payload[0]?.payload?.name}</p>
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-mu-green">Masuk: {formatRupiah(payload[0].value)}</p>
                                <p className="text-xs font-bold text-red-500">Keluar: {formatRupiah(payload[1].value)}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="masuk" fill="#006227" radius={[6, 6, 0, 0]} barSize={filterRange === 'minggu' ? 25 : 15} />
                    <Bar dataKey="keluar" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={filterRange === 'minggu' ? 25 : 15} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <DataTable 
            title="Riwayat Transaksi" 
            icon={<History className="text-mu-green" size={24}/>} 
            data={paginateData(keuanganFiltered, pagination.keuangan.page, pagination.keuangan.limit)} 
            columns={['jumlah', 'tanggal', 'deskripsi', 'nama donatur', 'Petugas (User)', 'Kategori']} 
            dataKeys={['jumlah', 'tanggal', 'deskripsi', 'nama_donatur', 'nama_user', 'nama_kategori']} 
            currentLimit={pagination.keuangan.limit}
            onLimitChange={(val) => handleLimitChange('keuangan', val)}
            currentPage={pagination.keuangan.page}
            totalPages={getTotalPages(keuanganFiltered, pagination.keuangan.limit)}
            onPageChange={(val) => handlePageChange('keuangan', val)}
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

          {/* Perbaikan Struktur Organisasi */}
          <DataTable 
            title="Struktur Organisasi Masjid" 
            icon={<Users className="text-mu-green" size={24}/>} 
            data={paginateData(strukturOrganisasi, pagination.strukturOrganisasi.page, pagination.strukturOrganisasi.limit)} 
            columns={['Foto', 'Nama Pengurus', 'Jabatan', 'Periode Mulai', 'Periode Selesai']} 
            dataKeys={['foto', 'nama', 'jabatan', 'periode_mulai', 'periode_selesai']} 
            currentLimit={pagination.strukturOrganisasi.limit}
            onLimitChange={(val) => handleLimitChange('strukturOrganisasi', val)}
            currentPage={pagination.strukturOrganisasi.page}
            totalPages={getTotalPages(strukturOrganisasi, pagination.strukturOrganisasi.limit)}
            onPageChange={(val) => handlePageChange('strukturOrganisasi', val)}
        />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataTable 
                title="Berita Masjid" 
                icon={<Newspaper className="text-blue-500" size={24}/>} 
                data={paginateData(berita, pagination.berita.page, pagination.berita.limit)} 
                columns={['judul', 'tanggal', 'youtube url', 'Dibuat Oleh', 'Status', 'Disetujui Oleh']} 
                dataKeys={['judul', 'tanggal', 'youtube_url', 'nama_user', 'status', 'nama_approved_by']}
                currentLimit={pagination.berita.limit}
                onLimitChange={(val) => handleLimitChange('berita', val)}
                currentPage={pagination.berita.page}
                totalPages={getTotalPages(berita, pagination.berita.limit)}
                onPageChange={(val) => handlePageChange('berita', val)}
            />
            <DataTable 
                title="Program Kerja" 
                icon={<Rocket className="text-purple-500" size={24}/>} 
                data={paginateData(program, pagination.program.page, pagination.program.limit)} 
                columns={['nama program', 'jadwal rutin', 'Kategori', 'Dibuat Oleh']}
                dataKeys={['nama_program', 'jadwal_rutin', 'nama_kategori', 'nama_user']}
                currentLimit={pagination.program.limit}
                onLimitChange={(val) => handleLimitChange('program', val)}
                currentPage={pagination.program.page}
                totalPages={getTotalPages(program, pagination.program.limit)}
                onPageChange={(val) => handlePageChange('program', val)}
            />
          </div>

          <div className="space-y-8 pb-10">
            <DataTable 
                title="Daftar Jamaah" 
                icon={<Users className="text-blue-500" size={24}/>} 
                data={paginateData(jamaah, pagination.jamaah.page, pagination.jamaah.limit)} 
                columns={['nama', 'alamat', 'no hp', 'jenis kelamin', 'peran', 'status']}
                dataKeys={['nama', 'alamat', 'no_hp', 'jenis_kelamin', 'peran', 'status']}
                currentLimit={pagination.jamaah.limit}
                onLimitChange={(val) => handleLimitChange('jamaah', val)}
                currentPage={pagination.jamaah.page}
                totalPages={getTotalPages(jamaah, pagination.jamaah.limit)}
                onPageChange={(val) => handlePageChange('jamaah', val)}
            />
            <DataTable 
                title="Daftar Inventaris" 
                icon={<Package className="text-orange-500" size={24}/>} 
                data={paginateData(inventaris, pagination.inventaris.page, pagination.inventaris.limit)} 
                columns={['Nama Barang', 'Jumlah', 'Kondisi', 'keterangan']} 
                dataKeys={['nama_barang', 'jumlah', 'kondisi', 'keterangan']}
                currentLimit={pagination.inventaris.limit}
                onLimitChange={(val) => handleLimitChange('inventaris', val)}
                currentPage={pagination.inventaris.page}
                totalPages={getTotalPages(inventaris, pagination.inventaris.limit)}
                onPageChange={(val) => handlePageChange('inventaris', val)}
            />
            <DataTable 
                title="Riwayat Kegiatan" 
                icon={<History className="text-purple-500" size={24}/>} 
                data={paginateData(riwayat, pagination.riwayat.page, pagination.riwayat.limit)} 
                columns={['nama kegiatan', 'waktu kegiatan', 'lokasi', 'deskripsi']}
                dataKeys={['nama_kegiatan', 'waktu_kegiatan', 'lokasi', 'deskripsi']}
                currentLimit={pagination.riwayat.limit}
                onLimitChange={(val) => handleLimitChange('riwayat', val)}
                currentPage={pagination.riwayat.page}
                totalPages={getTotalPages(riwayat, pagination.riwayat.limit)}
                onPageChange={(val) => handlePageChange('riwayat', val)}
            />
          </div>
        </main>
      </div>

      {/* Modal Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-200">
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