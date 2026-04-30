// frontend/src/pages/superadmin/program/DataProgram.jsx

import React, { useEffect, useState, useCallback } from "react";
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
  const buttonClass = isSuccess ? "bg-green-600 hover:bg-green-700 text-white shadow-green-100" : isError ? "bg-red-600 hover:bg-red-700 text-white shadow-red-100" : isWarning ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-100" : "bg-mu-green hover:bg-green-700 text-white shadow-green-100";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-6 top-6 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-10 text-center">
          <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ${iconClass}`}><Icon size={48} strokeWidth={2.5} /></div>
          <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tight leading-tight">{alertData.title}</h3>
          <p className="mt-4 text-base font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={onClose} className={`mt-10 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${buttonClass}`}>{alertData.confirmText || "Mengerti"}</button>
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

  const fetchData = useCallback(async () => {
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
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const getPaginationNumbers = (current, total) => {
    const maxVisible = 5;
    let start = Math.max(current - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;
    if (end > total) { end = total; start = Math.max(end - maxVisible + 1, 1); }
    return Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-mu-green uppercase tracking-widest">Memuat Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        user={user} 
        onLogout={onLogout} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="main-content p-6 md:p-10 h-full overflow-y-auto space-y-10">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">
                Manajemen <span className="text-mu-green">Program</span>
              </h1>
              <div className="flex items-center gap-3 mt-3 text-gray-500 font-bold text-xs md:text-sm uppercase tracking-widest">
                <Calendar size={16} className="text-mu-green" />
                <span>{time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="text-mu-green font-black ml-2">{time.toLocaleTimeString("id-ID")}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={fetchData} disabled={refreshing} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-mu-green transition-all shadow-sm">
                <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
              <button onClick={() => navigate('/superadmin/program/tambah')} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">
                <Plus size={20} /> Tambah Program
              </button>
            </div>
          </div>

          {/* TABLE PROGRAM */}
          <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="hidden sm:block">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Daftar Program</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {filteredProgram.length}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-100 px-4 py-2.5 rounded-2xl">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Show:</span>
                  <select 
                    value={entriesProgram} 
                    onChange={(e) => { setEntriesProgram(Number(e.target.value)); setPageProgram(1); }} 
                    className="bg-transparent text-sm font-bold text-mu-green focus:outline-none cursor-pointer"
                  >
                    {[5, 10, 25, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
                  </select>
                </div>
              </div>
              <div className="relative w-full md:w-80">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input placeholder="Cari program..." value={searchProgram} onChange={(e) => setSearchProgram(e.target.value)} className="pl-12 pr-6 py-4 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 text-sm w-full font-medium" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Gambar</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Nama Program</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Jadwal</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Kategori</th>
                    <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredProgram, pageProgram, entriesProgram).map((p) => (
                    <tr key={p.program_id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden shadow-inner mx-auto flex items-center justify-center border-2 border-transparent group-hover:border-mu-green transition-all">
                          {p.gambar ? <img src={`${BASE_URL}/uploads/program/${p.gambar}`} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-gray-300"/>}
                        </div>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="text-lg font-bold text-gray-800 group-hover:text-mu-green transition-colors">{p.nama_program}</div>
                        <div className="text-xs text-gray-400 font-black uppercase tracking-tighter mt-1">ID: #{p.program_id}</div>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <div className="text-sm text-gray-800 font-black bg-gray-100/50 w-fit px-3 py-2 rounded-xl border border-gray-100">{p.jadwal_rutin}</div>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50">
                        <span className="px-4 py-1.5 bg-mu-green/10 text-mu-green rounded-full text-[10px] font-black uppercase tracking-widest border border-mu-green/10">{p.kategori_program?.nama_kategori || "-"}</span>
                      </td>
                      <td className="px-6 py-6 border-b border-gray-50 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button onClick={() => navigate(`/superadmin/program/detail/${p.program_id}`)} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><Eye size={20}/></button>
                          <button onClick={() => navigate(`/superadmin/program/edit/${p.program_id}`)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Pencil size={20}/></button>
                          <button onClick={() => navigate(`/superadmin/program/hapus/${p.program_id}`)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={20}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Program */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Halaman <span className="text-mu-green">{pageProgram}</span> dari {totalPageProgram || 1}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPageProgram(p => Math.max(1, p - 1))} disabled={pageProgram === 1} className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"><ChevronLeft size={22} /></button>
                <div className="flex gap-2">
                  {getPaginationNumbers(pageProgram, totalPageProgram).map((n) => (
                    <button key={n} onClick={() => setPageProgram(n)} className={`min-w-[45px] h-11 rounded-xl text-xs font-black transition-all ${pageProgram === n ? "bg-mu-green text-white shadow-lg shadow-green-100 scale-110" : "bg-white text-gray-400 border-2 border-gray-50 hover:border-mu-green"}`}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setPageProgram(p => Math.min(totalPageProgram, p + 1))} disabled={pageProgram === totalPageProgram || totalPageProgram === 0} className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"><ChevronRight size={22} /></button>
              </div>
            </div>
          </div>

          {/* TABLE KATEGORI */}
          <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="hidden sm:block">
                  <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Kategori Program</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Total: {filteredKategori.length}</p>
                </div>
              </div>
              <div className="relative w-full md:w-80">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input placeholder="Cari kategori..." value={searchKategori} onChange={(e) => setSearchKategori(e.target.value)} className="pl-12 pr-6 py-4 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-mu-green/10 focus:border-mu-green transition-all bg-gray-50 text-sm w-full font-medium" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-6 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50 w-24">ID</th>
                    <th className="px-6 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-50">Nama Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredKategori, pageKategori, entriesKategori).map((k) => (
                    <tr key={k.kategori_id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-6 border-b border-gray-50 text-center text-gray-400 font-bold">#{k.kategori_id}</td>
                      <td className="px-6 py-6 border-b border-gray-50 font-bold text-gray-800">{k.nama_kategori}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Kategori */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Halaman <span className="text-mu-green">{pageKategori}</span> dari {totalPageKategori || 1}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPageKategori(p => Math.max(1, p - 1))} disabled={pageKategori === 1} className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"><ChevronLeft size={22} /></button>
                <div className="flex gap-2">
                  {getPaginationNumbers(pageKategori, totalPageKategori).map((n) => (
                    <button key={n} onClick={() => setPageKategori(n)} className={`min-w-[45px] h-11 rounded-xl text-xs font-black transition-all ${pageKategori === n ? "bg-mu-green text-white shadow-lg shadow-green-100 scale-110" : "bg-white text-gray-400 border-2 border-gray-50 hover:border-mu-green"}`}>{n}</button>
                  ))}
                </div>
                <button onClick={() => setPageKategori(p => Math.min(totalPageKategori, p + 1))} disabled={pageKategori === totalPageKategori || totalPageKategori === 0} className="p-3 rounded-xl bg-gray-50 text-gray-400 disabled:opacity-30 hover:bg-mu-green hover:text-white transition-all shadow-sm"><ChevronRight size={22} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataProgram;