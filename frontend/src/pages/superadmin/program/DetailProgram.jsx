// frontend/src/pages/superadmin/program/DetailProgram.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Calendar, ArrowLeft, Edit, Trash2, 
  RefreshCcw, Clock, Fingerprint, Tag, 
  FileText, CheckCircle2, XCircle, AlertTriangle, 
  Info, X, Image as ImageIcon 
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

/**
 * Sub-component untuk baris informasi yang konsisten[cite: 5]
 */
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-5 hover:bg-gray-50/80 transition-all border-b border-gray-100 last:border-0 group">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400 group-hover:text-mu-green group-hover:bg-mu-green/10 transition-all">
        {icon}
      </div>
      <span className="text-xs font-black uppercase text-gray-400 tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-700">{value || "-"}</span>
  </div>
);

/**
 * AlertPopup dengan backdrop blur dan animasi scale[cite: 5]
 */
const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isConfirm = alertData.type === "confirm";
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : AlertTriangle;
  
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-6 top-6 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-10 text-center">
          <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ${isSuccess ? "bg-green-100 text-green-600" : isError ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}><Icon size={48} strokeWidth={2.5} /></div>
          <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tight leading-tight">{alertData.title}</h3>
          <p className="mt-4 text-base font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <div className="mt-10 flex gap-4">
            {isConfirm && (
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Batal</button>
            )}
            <button type="button" onClick={() => { if (alertData.onConfirm) alertData.onConfirm(); onClose(); }} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ${isConfirm || isError ? "bg-red-600 text-white shadow-red-100" : "bg-mu-green text-white shadow-green-100"}`}>{alertData.confirmText || (isConfirm ? "Ya, Hapus" : "Mengerti")}</button>
          </div>
        </div>
      </div>
    </div>, document.body
  );
};

const DetailProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [alertData, setAlertData] = useState({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null });

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => setAlertData(prev => ({ ...prev, show: false }));

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const fetchProgram = useCallback(async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    const fetchedData = res.data;
    
    console.log("Cek Data Detail dari Backend:", fetchedData); 
    setProgram(fetchedData);
  } catch (err) {
    console.error("Fetch detail error:", err);
    showPopup({ type: "error", title: "Error", message: "Gagal memuat data program." });
  } finally {
    setLoading(false);
  }
}, [id, token]);

  useEffect(() => { fetchProgram(); }, [fetchProgram]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/superadmin/program/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/superadmin/program');
    } catch (err) {
      showPopup({ type: "error", title: "Gagal", message: "Terjadi kesalahan saat menghapus data." });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black text-mu-green uppercase tracking-widest">Memuat Informasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden font-inter">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-6 md:p-10 h-full overflow-y-auto space-y-10">
          
          {/* Header & Navigasi[cite: 5] */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate('/superadmin/program')} 
                className="group p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-mu-green hover:border-mu-green/20 transition-all shadow-sm"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">
                  Detail <span className="text-mu-green">Program</span>
                </h1>
                <div className="flex items-center gap-3 mt-3 text-gray-400 font-bold text-xs uppercase tracking-widest">
                  <Fingerprint size={14} className="text-mu-green" />
                  <span>ID: #{program?.program_id}</span>
                  <span className="text-gray-200">|</span>
                  <Clock size={14} className="text-mu-green" />
                  <span>{time.toLocaleTimeString('id-ID')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate(`/superadmin/program/edit/${id}`)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                <Edit size={18} /> Edit Program
              </button>
              <button
                onClick={() => showPopup({ type: 'confirm', title: 'Hapus Data?', message: 'Menghapus program ini akan menghilangkannya secara permanen dari daftar publik.', onConfirm: handleDelete })}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 border-2 border-red-100 px-8 py-4 rounded-2xl text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={18} /> Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Kolom Kiri: Poster/Gambar (4 unit)[cite: 5] */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center">
                <div className="w-full aspect-[3/4] bg-gray-50 rounded-[2.5rem] border-4 border-gray-50 flex items-center justify-center shadow-inner mb-8 relative overflow-hidden group">
                  {program?.gambar ? (
                    <img 
                      src={`${BASE_URL}/uploads/program/${program.gambar}`} 
                      alt="Poster Program" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <ImageIcon size={80} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-mu-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">{program?.nama_program}</h2>
                <div className="mt-4 px-4 py-2 bg-mu-green/10 rounded-full flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-mu-green" />
                  <span className="text-[10px] font-black text-mu-green uppercase tracking-[0.1em]">Status Aktif</span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Detail Informasi (8 unit)[cite: 5] */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-gray-50 rounded-2xl text-mu-green shadow-inner"><Tag size={24}/></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Detail Operasional</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Klasifikasi dan manajemen waktu program</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <DetailRow icon={<Tag size={18}/>} label="Kategori Program" value={program?.kategori_program?.nama_kategori || "Tanpa Kategori"} />
                  <DetailRow icon={<Clock size={18}/>} label="Jadwal Rutin" value={program?.jadwal_rutin} />
                </div>

                <div className="mt-12 p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={16} className="text-mu-green" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deskripsi Lengkap</p>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                    {program?.deskripsi || "Tidak ada deskripsi tambahan untuk program ini."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProgram;