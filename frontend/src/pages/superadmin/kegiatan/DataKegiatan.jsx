import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Plus, Edit, Trash2, Eye, AlertTriangle, X, MapPin, Calendar, Search, RefreshCcw, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const DataKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [kegiatans, setKegiatans] = useState([]);
  const [filteredKegiatans, setFilteredKegiatans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [time, setTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    fetchKegiatans();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const filtered = kegiatans.filter(k =>
      k.nama_kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.lokasi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKegiatans(filtered);
    setCurrentPage(1);
  }, [kegiatans, searchTerm]);

  const fetchKegiatans = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/kegiatan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKegiatans(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/superadmin/kegiatan/${selectedKegiatan.kegiatan_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchKegiatans();
      setShowDeleteModal(false);
    } catch {
      alert('Gagal hapus');
    }
  };

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredKegiatans.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredKegiatans.length / entriesPerPage);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} user={user} onLogout={onLogout} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-4 md:p-6 space-y-6 overflow-y-auto">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">
                Data <span className="text-mu-green">Kegiatan</span>
              </h1>
              <p className="text-xs text-gray-500">
                {time.toLocaleDateString()} • {time.toLocaleTimeString()}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={fetchKegiatans} className="px-4 py-2 border rounded-lg text-sm flex items-center gap-2">
                <RefreshCcw size={14}/> Refresh
              </button>

              <button onClick={() => navigate('/superadmin/kegiatan/tambah')}
                className="px-4 py-2 bg-mu-green text-white rounded-lg text-sm flex items-center gap-2">
                <Plus size={14}/> Tambah
              </button>
            </div>
          </div>

          {/* CARD */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">

            {/* TOP */}
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">

              <div className="flex items-center gap-2 text-sm">
                <span>Show:</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  {[5,10,25,50].map(n => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input
                  placeholder="Cari kegiatan..."
                  value={searchTerm}
                  onChange={(e)=>setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm"
                />
              </div>

            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Poster</th>
                    <th className="p-3 text-left">Nama</th>
                    <th className="p-3 text-left">Tanggal</th>
                    <th className="p-3 text-left">Lokasi</th>
                    <th className="p-3 text-left">Deskripsi</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map(k => (
                    <tr key={k.kegiatan_id} className="border-t">
                      <td className="p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                          {k.poster
                            ? <img src={`${BASE_URL}/uploads/kegiatan/${k.poster}`} className="w-full h-full object-cover"/>
                            : <ImageIcon size={16}/>}
                        </div>
                      </td>

                      <td className="p-3 max-w-[150px] truncate">{k.nama_kegiatan}</td>

                      <td className="p-3">
                        {k.waktu_kegiatan
                          ? new Date(k.waktu_kegiatan).toLocaleDateString()
                          : '-'}
                      </td>

                      <td className="p-3 max-w-[120px] truncate">{k.lokasi}</td>

                      <td className="p-3 max-w-[200px] truncate">{k.deskripsi}</td>

                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={()=>navigate(`/superadmin/kegiatan/detail/${k.kegiatan_id}`)} className="p-2 bg-green-100 rounded">
                            <Eye size={16}/>
                          </button>
                          <button onClick={()=>navigate(`/superadmin/kegiatan/edit/${k.kegiatan_id}`)} className="p-2 bg-blue-100 rounded">
                            <Edit size={16}/>
                          </button>
                          <button onClick={()=>{setSelectedKegiatan(k); setShowDeleteModal(true);}} className="p-2 bg-red-100 rounded">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <span>
                {indexOfFirst+1} - {Math.min(indexOfLast, filteredKegiatans.length)} dari {filteredKegiatans.length}
              </span>

              <div className="flex gap-1">
                <button onClick={()=>setCurrentPage(p=>Math.max(p-1,1))} className="px-2 border rounded">
                  <ChevronLeft size={14}/>
                </button>
                <button onClick={()=>setCurrentPage(p=>Math.min(p+1,totalPages))} className="px-2 border rounded">
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && selectedKegiatan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h2 className="font-bold mb-3">Hapus Data?</h2>
            <p className="text-sm mb-4">{selectedKegiatan.nama_kegiatan}</p>

            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowDeleteModal(false)} className="px-3 py-2 border rounded">Batal</button>
              <button onClick={handleDelete} className="px-3 py-2 bg-red-500 text-white rounded">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKegiatan;