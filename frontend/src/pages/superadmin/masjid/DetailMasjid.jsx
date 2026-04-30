// frontend/src/pages/superadmin/masjid/DetailMasjid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import GrafikKeuangan from '../../public/masjid/GrafikKeuangan';
import { 
  MapPin, Phone, FileText, Image as ImageIcon, ArrowLeft, Edit, 
  Trash2, AlertTriangle, Users, Package, History, 
  FileBarChart, Newspaper, Rocket, ArrowUpCircle, ArrowDownCircle, List, RefreshCcw,
  ChevronLeft, ChevronRight
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
  
  const [jamaah, setJamaah] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [berita, setBerita] = useState([]);
  const [program, setProgram] = useState([]);

  // State untuk menyimpan kamus data / mapping
  const [userMap, setUserMap] = useState({});
  const [kategoriProgMap, setKategoriProgMap] = useState({});

  const [pagination, setPagination] = useState({
    keuangan: { page: 1, limit: 5 },
    berita: { page: 1, limit: 5 },
    program: { page: 1, limit: 5 },
    jamaah: { page: 1, limit: 5 },
    inventaris: { page: 1, limit: 5 },
    riwayat: { page: 1, limit: 5 }
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Ambil data Master (User & Kategori) serta Masjid & Takmir
      // Perbaikan: Tangkap uRes dan katProgRes untuk digunakan mapping
      const [mRes, tRes, uRes, katProgRes] = await Promise.all([
        axios.get(`http://localhost:3000/superadmin/masjid/${id}`, { headers }),
        axios.get(`http://localhost:3000/superadmin/takmir`, { headers }),
        axios.get(`http://localhost:3000/superadmin/user`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/kategori-program`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      setMasjid(mRes.data);

      // BUAT MAPPING USER: Mengubah ID menjadi Nama
      const usersData = uRes.data.data || uRes.data || [];
      const mapUser = {};
      usersData.forEach(u => { mapUser[u.user_id] = u.nama; });
      setUserMap(mapUser);

      // BUAT MAPPING KATEGORI PROGRAM: Mengubah ID menjadi Nama Kategori
      const katProgData = katProgRes.data.data || katProgRes.data || [];
      const mapKatProg = {};
      katProgData.forEach(k => { mapKatProg[k.kategori_id] = k.nama_kategori; });
      setKategoriProgMap(mapKatProg);

      // Setup Nama Takmir
      const daftarTakmir = tRes.data;
      if (daftarTakmir && Array.isArray(daftarTakmir)) {
        const pengelola = daftarTakmir.find(t => 
          String(t.masjid_id) === String(id) || 
          String(t.masjid?.masjid_id) === String(id)
        );
        // Cek nama dari inner relasi, atau ambil dari kamus mapUser
        setNamaTakmir(pengelola ? (pengelola.user?.nama || pengelola.nama || mapUser[pengelola.user_id] || "Tanpa Nama") : "Belum Ada Takmir");
      }

      // 2. Ambil data Relasional (Tabel-tabel)
      const [kRes, jRes, iRes, hRes, bRes, pRes] = await Promise.all([
        axios.get(`http://localhost:3000/superadmin/keuangan?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/jamaah?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/inventaris?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/kegiatan?masjid_id=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`http://localhost:3000/superadmin/berita?masjid_id=${id}`, { headers }).catch(() => ({ data: [] })),
        axios.get(`http://localhost:3000/superadmin/program?masjid_id=${id}`, { headers }).catch(() => ({ data: [] }))
      ]);

      // 3. Helper function untuk me-replace (mengganti) ID menjadi Nama pada array data
      const formatTableData = (response, mapKategoriManual = null) => {
        const arr = response.data?.data || response.data || response || [];
        if (!Array.isArray(arr)) return [];
        
        return arr.map(item => ({
          ...item,
          // Ganti user_id dengan nama user (cek relasi ORM dulu, jika gagal pakai kamus userMap)
          nama_user: item.user?.nama || mapUser[item.user_id] || `ID: ${item.user_id}`,
          
          // Ganti kategori_id dengan nama kategori
          nama_kategori: item.kategori_keuangan?.nama_kategori || item.kategori_program?.nama_kategori || (mapKategoriManual ? mapKategoriManual[item.kategori_id] : (item.kategori_id ? `ID: ${item.kategori_id}` : '-')),
          
          // Ganti approved_by dengan nama user
          nama_approved_by: item.approved_by ? (mapUser[item.approved_by] || `ID: ${item.approved_by}`) : '-'
        }));
      };

      // Terapkan formatter ke state
      const formattedKeuangan = formatTableData(kRes);
      setKeuanganRaw(formattedKeuangan);
      setKeuanganFiltered(formattedKeuangan);
      
      setBerita(formatTableData(bRes));
      setProgram(formatTableData(pRes, mapKatProg));

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
    if (filterType === 'masuk') {
      setKeuanganFiltered(keuanganRaw.filter(item => parseFloat(item.jumlah) > 0));
    } else if (filterType === 'keluar') {
      setKeuanganFiltered(keuanganRaw.filter(item => parseFloat(item.jumlah) < 0));
    } else {
      setKeuanganFiltered(keuanganRaw);
    }
    handlePageChange('keuangan', 1);
  }, [filterType, keuanganRaw]);

  const processKeuanganForChart = (data) => {
    if (!Array.isArray(data)) return [];
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

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
             <h3 className="text-xl font-black mb-6 flex items-center gap-2"><FileBarChart className="text-mu-green" size={24}/> Grafik Arus Kas</h3>
             <GrafikKeuangan chartData={processKeuanganForChart(keuanganRaw)} />
          </div>

          <DataTable 
            title="Riwayat Transaksi" 
            icon={<History className="text-mu-green" size={24}/>} 
            data={paginateData(keuanganFiltered, pagination.keuangan.page, pagination.keuangan.limit)} 
            // Perhatikan peruabahan "user" menjadi "nama_user" dan "kategori_id" menjadi "nama_kategori" di bawah ini
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