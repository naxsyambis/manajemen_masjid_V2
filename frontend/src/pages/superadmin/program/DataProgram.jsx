import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SuperAdminNavbar from "../../../components/SuperAdminNavbar";
import SuperAdminSidebar from "../../../components/SuperAdminSidebar";
import {
  Plus, Search, RefreshCcw, ChevronLeft, ChevronRight, Calendar,
  LayoutList, Eye, Pencil, Trash2, CheckCircle2, XCircle, AlertTriangle, Info, X, Image as ImageIcon
} from "lucide-react";

const BASE_URL = "http://localhost:3000";

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;
  const iconClass = isSuccess ? "bg-green-100 text-green-600" : isError ? "bg-red-100 text-red-600" : isWarning ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600";
  const buttonClass = isSuccess ? "bg-green-600 hover:bg-green-700 text-white" : isError ? "bg-red-600 hover:bg-red-700 text-white" : isWarning ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green" : "bg-mu-green hover:bg-green-700 text-white";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}><Icon size={42} strokeWidth={2.5} /></div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || "Mengerti"}</button>
        </div>
      </div>
    </div>, document.body
  );
};

const DataProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [program, setProgram] = useState([]);
  const [filteredProgram, setFilteredProgram] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [filteredKategori, setFilteredKategori] = useState([]);

  const [searchProgram, setSearchProgram] = useState("");
  const [searchKategori, setSearchKategori] = useState("");

  const [entriesProgram, setEntriesProgram] = useState(5);
  const [entriesKategori, setEntriesKategori] = useState(5);
  const [pageProgram, setPageProgram] = useState(1);
  const [pageKategori, setPageKategori] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState(new Date());

  const [alertData, setAlertData] = useState({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null });

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => { const callback = alertData.onConfirm; setAlertData({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null }); if (callback) setTimeout(callback, 100); };

  const handleAuthError = (err) => {
    if (err.response && err.response.status === 401) {
      showPopup({ type: "error", title: "Sesi Berakhir", message: "Sesi Anda telah berakhir.", confirmText: "Login Ulang", onConfirm: () => { localStorage.removeItem("token"); window.location.href = "/login"; }});
      return true;
    }
    return false;
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const resProgram = await axios.get(`${BASE_URL}/superadmin/program`, { headers: { Authorization: `Bearer ${token}` } });
      const resKategori = await axios.get(`${BASE_URL}/superadmin/kategori-program`, { headers: { Authorization: `Bearer ${token}` } });
      setProgram(resProgram.data.data);
      setKategori(resKategori.data.data);
    } catch (err) {
      if (handleAuthError(err)) return;
      showPopup({ type: "error", title: "Gagal Memuat", message: "Gagal mengambil data program." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setFilteredProgram(program.filter((p) => p.nama_program?.toLowerCase().includes(searchProgram.toLowerCase())));
    setPageProgram(1);
  }, [program, searchProgram]);

  useEffect(() => {
    setFilteredKategori(kategori.filter((k) => k.nama_kategori?.toLowerCase().includes(searchKategori.toLowerCase())));
    setPageKategori(1);
  }, [kategori, searchKategori]);

  const paginate = (data, page, perPage) => data.slice((page - 1) * perPage, page * perPage);
  const totalPageProgram = Math.ceil(filteredProgram.length / entriesProgram);
  const totalPageKategori = Math.ceil(filteredKategori.length / entriesKategori);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full"/></div>;

  return (
    <div className="flex h-screen bg-gray-50 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} user={user} onLogout={onLogout} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-4 md:p-8 space-y-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 text-mu-green mb-2">
                <LayoutList size={28} className="animate-pulse" />
                <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-800">Manajemen <span className="text-mu-green">Program</span></h1>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> {time.toLocaleDateString("id-ID")} • {time.toLocaleTimeString("id-ID")}
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={fetchData} disabled={refreshing} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all active:scale-95">
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={() => navigate('/superadmin/program/tambah')} className="flex items-center gap-2 bg-mu-green text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all active:scale-95">
                <Plus size={16} /> Tambah Program
              </button>
            </div>
          </div>

          {/* ================= PROGRAM TABLE ================= */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Daftar Program</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {filteredProgram.length} Program</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <select value={entriesProgram} onChange={(e) => setEntriesProgram(Number(e.target.value))} className="bg-gray-50 border border-gray-200 text-sm font-bold text-mu-green rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-mu-green/20">
                  {[5, 10, 25, 50].map((n) => (<option key={n} value={n}>Show {n}</option>))}
                </select>
                <div className="relative w-full md:w-64 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors" size={18} />
                  <input placeholder="Cari program..." value={searchProgram} onChange={(e) => setSearchProgram(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-mu-green/20 transition-all" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-900 font-black">
                    <th className="p-5 w-[80px] text-center">Gambar</th>
                    <th className="p-5">Nama Program</th>
                    <th className="p-5">Jadwal</th>
                    <th className="p-5">Kategori</th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
                  {paginate(filteredProgram, pageProgram, entriesProgram).map((p) => (
                    <tr key={p.program_id} className="hover:bg-mu-green/[0.02] transition-colors group">
                      <td className="p-5 text-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto overflow-hidden flex items-center justify-center">
                          {p.gambar ? <img src={`${BASE_URL}/uploads/program/${p.gambar}`} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-400"/>}
                        </div>
                      </td>
                      <td className="p-5">{p.nama_program}</td>
                      <td className="p-5 text-mu-green">{p.jadwal_rutin}</td>
                      <td className="p-5"><span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] tracking-widest uppercase">{p.kategori_program?.nama_kategori || "-"}</span></td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/superadmin/program/detail/${p.program_id}`)} className="p-2 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl text-green-600 transition-all shadow-sm"><Eye size={16}/></button>
                          <button onClick={() => navigate(`/superadmin/program/edit/${p.program_id}`)} className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl text-blue-600 transition-all shadow-sm"><Pencil size={16}/></button>
                          <button onClick={() => navigate(`/superadmin/program/hapus/${p.program_id}`)} className="p-2 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl text-red-600 transition-all shadow-sm"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProgram.length === 0 && (
                    <tr><td colSpan="5" className="p-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">Tidak ada data program</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Halaman {pageProgram} dari {totalPageProgram || 1}</span>
              <div className="flex gap-2">
                <button onClick={() => setPageProgram(p => Math.max(1, p - 1))} disabled={pageProgram === 1} className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18} /></button>
                <button onClick={() => setPageProgram(p => Math.min(totalPageProgram, p + 1))} disabled={pageProgram === totalPageProgram || totalPageProgram === 0} className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>

          {/* ================= KATEGORI TABLE ================= */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden transition-all">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Kategori Program</h2>
              </div>
              <div className="relative w-full md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors" size={18} />
                <input placeholder="Cari kategori..." value={searchKategori} onChange={(e) => setSearchKategori(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-mu-green/20 transition-all" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-900 font-black">
                    <th className="p-5 w-[80px] text-center">ID</th>
                    <th className="p-5">Nama Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
                  {paginate(filteredKategori, pageKategori, entriesKategori).map((k) => (
                    <tr key={k.kategori_id} className="hover:bg-mu-green/[0.02] transition-colors">
                      <td className="p-5 text-center text-gray-400">#{k.kategori_id}</td>
                      <td className="p-5">{k.nama_kategori}</td>
                    </tr>
                  ))}
                  {filteredKategori.length === 0 && (
                    <tr><td colSpan="2" className="p-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">Tidak ada data kategori</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Halaman {pageKategori} dari {totalPageKategori || 1}</span>
              <div className="flex gap-2">
                <button onClick={() => setPageKategori(p => Math.max(1, p - 1))} disabled={pageKategori === 1} className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={18} /></button>
                <button onClick={() => setPageKategori(p => Math.min(totalPageKategori, p + 1))} disabled={pageKategori === totalPageKategori || totalPageKategori === 0} className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataProgram;