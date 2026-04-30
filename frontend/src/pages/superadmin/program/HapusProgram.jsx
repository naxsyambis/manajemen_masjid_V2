import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { AlertTriangle, Trash2, X, Calendar, FileText, Clock, CheckCircle2, XCircle, Info } from 'lucide-react';

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

const HapusProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [alertData, setAlertData] = useState({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null });

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => { const callback = alertData.onConfirm; setAlertData({ show: false, type: "info", title: "", message: "", confirmText: "", onConfirm: null }); if (callback) setTimeout(callback, 100); };

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProgram(res.data);
      } catch (err) {
        showPopup({ type: "error", title: "Error", message: "Gagal memuat data program", onConfirm: () => navigate('/superadmin/program') });
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/superadmin/program/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showPopup({ type: "success", title: "Dihapus", message: "Program berhasil dihapus secara permanen.", onConfirm: () => navigate('/superadmin/program') });
    } catch (err) {
      showPopup({ type: "error", title: "Gagal", message: "Gagal menghapus program." });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full"/></div>;
  if (!program) return null;

  return (
    <div className="h-screen bg-gray-50 flex animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} setIsHovered={setIsHovered} isExpanded={isExpanded} />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-4 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* CARD MERAH */}
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-[3rem] shadow-2xl p-10 text-white overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 opacity-20"><AlertTriangle size={200}/></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shrink-0">
                  <Calendar size={48} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tighter mb-2">{program.nama_program}</h1>
                  <p className="text-red-200 text-xs font-bold uppercase tracking-widest">ID Program: #{program.program_id}</p>
                </div>
              </div>
            </div>
            
            {/* PERINGATAN */}
            <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-red-800 uppercase tracking-tighter">Konfirmasi Hapus</h3>
                  <p className="text-red-600 text-sm font-bold">Tindakan ini tidak dapat dibatalkan!</p>
                </div>
              </div>
              <p className="text-red-700 font-medium">
                Anda akan menghapus data <span className="font-bold">"{program.nama_program}"</span> dari database. Semua informasi mengenai program ini termasuk gambar dan detailnya akan terhapus selamanya.
              </p>
            </div>
            
            {/* DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                  <Clock size={20} className="text-red-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Jadwal Rutin</h3>
                </div>
                <p className="text-gray-800 font-bold">{program.jadwal_rutin}</p>
              </div>
              
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                  <FileText size={20} className="text-red-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Deskripsi Singkat</h3>
                </div>
                <p className="text-gray-800 font-bold truncate">{program.deskripsi || 'Tidak ada deskripsi.'}</p>
              </div>
            </div>
            
            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button onClick={() => navigate(`/superadmin/program`)} className="px-8 py-5 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                <X size={18} /> Batal Hapus
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-8 py-5 bg-red-600 text-white rounded-2xl hover:bg-red-700 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl hover:translate-y-[-2px] disabled:opacity-50">
                <Trash2 size={18} /> {deleting ? 'Memproses...' : 'Ya, Hapus Permanen'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HapusProgram;