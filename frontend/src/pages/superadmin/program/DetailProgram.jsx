import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Calendar, FileText, ArrowLeft, Edit, Trash2, RefreshCcw, Tag, Type, Clock, CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === "success";
  const isError = alertData.type === "error";
  const isWarning = alertData.type === "warning";
  const isConfirm = alertData.type === "confirm";
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning || isConfirm ? AlertTriangle : Info;
  const iconClass = isSuccess ? "bg-green-100 text-green-600" : isError ? "bg-red-100 text-red-600" : isWarning || isConfirm ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600";
  const buttonClass = isConfirm ? "bg-red-600 hover:bg-red-700 text-white" : isSuccess ? "bg-green-600 hover:bg-green-700 text-white" : isError ? "bg-red-600 hover:bg-red-700 text-white" : isWarning ? "bg-mu-yellow hover:bg-yellow-400 text-mu-green" : "bg-mu-green hover:bg-green-700 text-white";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}><Icon size={42} strokeWidth={2.5} /></div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          {isConfirm ? (
             <div className="mt-8 grid grid-cols-2 gap-3">
               <button type="button" onClick={onClose} className="py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95">Batal</button>
               <button type="button" onClick={() => { if (alertData.onConfirm) alertData.onConfirm(); onClose(); }} className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || "Hapus"}</button>
             </div>
          ) : (
             <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || "Mengerti"}</button>
          )}
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

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => { const callback = alertData.onConfirm; setAlertData({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null }); if (callback) setTimeout(callback, 100); };

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProgram(res.data);
      } catch (err) {
        showPopup({ type: "error", title: "Error", message: "Gagal memuat data program" });
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id, token]);

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/superadmin/program/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showPopup({ type: "success", title: "Dihapus", message: "Program berhasil dihapus", onConfirm: () => navigate('/superadmin/program') });
    } catch (err) {
      showPopup({ type: "error", title: "Gagal", message: "Gagal menghapus program" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full"/></div>;
  if (!program) return null;

  return (
    <div className="h-screen bg-[#fdfdfd] flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-4 md:p-8 space-y-10 overflow-y-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-gray-800">
                Detail <span className="text-mu-green">Program</span>
              </h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar size={12}/> {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-white px-5 py-3 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-mu-green transition-all flex gap-2 active:scale-95">
              <RefreshCcw size={14}/> Refresh
            </button>
          </div>

          {/* CONTENT */}
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* GAMBAR */}
              <div className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 flex items-center justify-center min-h-[300px]">
                {program.gambar ? (
                  <img src={`${BASE_URL}/uploads/program/${program.gambar}`} className="max-h-[400px] object-contain rounded-xl shadow-md" />
                ) : (
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tidak Ada Gambar Poster</p>
                )}
              </div>

              {/* INFO */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-3xl shadow-inner border border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Type size={14} className="text-mu-green"/> Nama Program</div>
                  <p className="text-xl font-black text-gray-800">{program.nama_program}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-3xl shadow-inner border border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Tag size={14} className="text-mu-green"/> Kategori</div>
                    <p className="text-sm font-bold text-gray-800">{program.kategori_program?.nama_kategori || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-3xl shadow-inner border border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><Clock size={14} className="text-mu-green"/> Jadwal</div>
                    <p className="text-sm font-bold text-gray-800">{program.jadwal_rutin}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-3xl shadow-inner border border-gray-100 h-full">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><FileText size={14} className="text-mu-green"/> Deskripsi</div>
                  <p className="text-sm font-bold text-gray-600 leading-relaxed whitespace-pre-line">{program.deskripsi || "-"}</p>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-center md:justify-start gap-4 pt-10 mt-10 border-t border-gray-100">
              <button onClick={() => navigate('/superadmin/program')} className="px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                <ArrowLeft size={16}/> Kembali
              </button>
              <button onClick={() => navigate(`/superadmin/program/edit/${id}`)} className="px-6 py-4 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                <Edit size={16}/> Edit
              </button>
              <button onClick={() => showPopup({type: 'confirm', title: 'Hapus Program?', message: 'Data yang dihapus tidak bisa dikembalikan.', confirmText: 'Hapus Permanen', onConfirm: handleDelete})} className="px-6 py-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                <Trash2 size={16}/> Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProgram;