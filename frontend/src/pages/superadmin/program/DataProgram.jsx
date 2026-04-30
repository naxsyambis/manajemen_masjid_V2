import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Plus, Edit, Trash2, Eye, AlertTriangle, X, Search, Calendar, RefreshCcw, ChevronLeft, ChevronRight, MapPin, Image as ImageIcon } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const DataKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [kegiatans, setKegiatans] = useState([]);
  const [filteredKegiatans, setFilteredKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchData();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const filtered = kegiatans.filter(k =>
      k.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKegiatans(filtered);
    setCurrentPage(1);
  }, [kegiatans, searchTerm]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`${BASE_URL}/superadmin/kegiatan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKegiatans(res.data.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedKegiatan) return;
    setDeleting(true);
    await axios.delete(`${BASE_URL}/superadmin/kegiatan/${selectedKegiatan.kegiatan_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
    setShowDeleteModal(false);
    setDeleting(false);
  };

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredKegiatans.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredKegiatans.length / entriesPerPage);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} user={user} onLogout={onLogout} setIsHovered={setIsHovered} isExpanded={isExpanded}/>

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user}/>

        <div className="main-content p-8 h-full overflow-y-auto space-y-8">

          {/* HEADER (IDENTIK TAKMIR) */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">
                Data <span className="text-mu-green">Kegiatan</span>
              </h1>
              <div className="text-[10px] font-bold uppercase text-gray-400 mt-2 tracking-widest">
                {time.toLocaleDateString()} • <span className="text-mu-green">{time.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={fetchData}
                className="flex items-center gap-2 bg-white border px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green shadow-sm">
                <RefreshCcw size={14}/> Refresh Data
              </button>

              <button onClick={()=>navigate('/superadmin/kegiatan/tambah')}
                className="flex items-center gap-2 bg-mu-green text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                <Plus size={14}/> Tambah Kegiatan
              </button>
            </div>
          </div>

          {/* CARD UTAMA */}
          <div className="bg-white p-10 rounded-[3rem] border shadow-sm">

            {/* TOP BAR */}
            <div className="flex flex-col lg:flex-row justify-between mb-10 gap-6">

              <div className="flex items-center gap-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Daftar Kegiatan</h3>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">
                    Total: {filteredKegiatans.length} Data
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-gray-400">Show:</span>
                  <select value={entriesPerPage}
                    onChange={(e)=>{setEntriesPerPage(Number(e.target.value)); setCurrentPage(1);}}
                    className="bg-transparent text-sm font-bold text-mu-green">
                    {[5,10,25,50,100].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  placeholder="Cari kegiatan..."
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-3 border rounded-xl w-full bg-gray-50"
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl shadow-inner">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-8 py-6 text-left text-sm font-black uppercase">Poster</th>
                    <th className="px-8 py-6 text-left text-sm font-black uppercase">Nama</th>
                    <th className="px-8 py-6 text-left text-sm font-black uppercase">Tanggal</th>
                    <th className="px-8 py-6 text-left text-sm font-black uppercase">Lokasi</th>
                    <th className="px-8 py-6 text-center text-sm font-black uppercase">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.map((k,i)=>(
                    <tr key={k.kegiatan_id}
                      className={`border-t ${i%2===0?'bg-white':'bg-gray-50/50'} hover:bg-gray-50`}>
                      
                      <td className="px-8 py-6">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {k.poster
                            ? <img src={`${BASE_URL}/uploads/kegiatan/${k.poster}`} className="w-full h-full object-cover"/>
                            : <ImageIcon size={20}/>}
                        </div>
                      </td>

                      <td className="px-8 py-6 font-semibold">{k.nama_kegiatan}</td>
                      <td className="px-8 py-6">{new Date(k.waktu_kegiatan).toLocaleDateString()}</td>
                      <td className="px-8 py-6">{k.lokasi}</td>

                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 bg-green-100 rounded"><Eye size={18}/></button>
                          <button className="p-2 bg-blue-100 rounded"><Edit size={18}/></button>
                          <button onClick={()=>{setSelectedKegiatan(k); setShowDeleteModal(true);}}
                            className="p-2 bg-red-100 rounded"><Trash2 size={18}/></button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EMPTY */}
            {filteredKegiatans.length === 0 && (
              <div className="text-center py-16">
                <Search size={48} className="mx-auto text-gray-400 mb-4"/>
                <h3 className="text-lg text-gray-600">Data tidak ditemukan</h3>
              </div>
            )}

            {/* PAGINATION */}
            {filteredKegiatans.length > 0 && (
              <div className="flex justify-between items-center mt-10">
                <p className="text-[10px] uppercase text-gray-400 font-bold">
                  {indexOfFirst+1} - {Math.min(indexOfLast, filteredKegiatans.length)} dari {filteredKegiatans.length}
                </p>

                <div className="flex gap-2">
                  <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))}
                    className="p-3 border rounded-xl"><ChevronLeft/></button>
                  <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))}
                    className="p-3 border rounded-xl"><ChevronRight/></button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default DataKegiatan;