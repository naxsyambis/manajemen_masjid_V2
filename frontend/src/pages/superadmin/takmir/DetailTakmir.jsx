// frontend/src/pages/superadmin/takmir/DetailTakmir.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { 
  Calendar, User, Mail, Building, ArrowLeft, Edit, 
  Trash2, AlertTriangle, RefreshCcw, ShieldCheck, 
  MapPin, Clock, Fingerprint
} from 'lucide-react';

// Sub-component untuk baris informasi yang lebih detail
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

const DetailTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [takmir, setTakmir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTakmir = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTakmir(res.data);
    } catch (err) {
      console.error('Error fetching takmir:', err);
      navigate('/superadmin/takmir');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    fetchTakmir();
  }, [fetchTakmir]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/superadmin/takmir');
    } catch (err) {
      alert('Gagal menghapus takmir');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SuperAdminSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        onLogout={onLogout} 
        user={user} 
        setIsHovered={setIsHovered} 
        isExpanded={isExpanded} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        
        <div className="main-content p-6 md:p-10 h-full overflow-y-auto space-y-10">
          
          {/* Header & Navigasi */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => navigate('/superadmin/takmir')} 
                className="group p-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-mu-green hover:border-mu-green/20 transition-all shadow-sm"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tighter">
                  Detail <span className="text-mu-green">Takmir</span>
                </h1>
                <div className="flex items-center gap-3 mt-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
                  <Fingerprint size={14} className="text-mu-green" />
                  <span>ID: {takmir?.id}</span>
                  <span className="text-gray-200">|</span>
                  <Clock size={14} className="text-mu-green" />
                  <span>{time.toLocaleTimeString('id-ID')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate(`/superadmin/takmir/edit/${id}`)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-mu-green text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
              >
                <Edit size={18} /> Edit Profil
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 border-2 border-red-100 px-8 py-4 rounded-2xl text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={18} /> Hapus
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Kartu Profil Utama (Kiri) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-gray-50 rounded-[2.5rem] border-4 border-gray-50 flex items-center justify-center shadow-inner mb-6 relative overflow-hidden group">
                  <User size={80} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-mu-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">{takmir?.user?.nama}</h2>
                <div className="w-full mt-10 pt-10 border-t border-gray-50 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl text-left">
                    <Mail className="text-mu-green flex-shrink-0" size={20} />
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-700 truncate">{takmir?.user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Detail & Penugasan (Kanan) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 h-full">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-gray-50 rounded-2xl text-mu-green shadow-inner"><Building size={24}/></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Detail Penugasan</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Informasi instansi dan akses sistem</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <DetailRow icon={<Building size={18}/>} label="Masjid Penempatan" value={takmir?.masjid?.nama_masjid} />

                  <DetailRow icon={<User size={18}/>} label="Role Akun" value={takmir?.user?.role || "Takmir"} />
                  <DetailRow icon={<Calendar size={18}/>} label="Status Aktif" value="Aktif" />
                </div>

                <div className="mt-12 p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Catatan Superadmin</p>
                  <p className="text-sm text-gray-500 text-center leading-relaxed italic">
                    "Takmir ini memiliki akses penuh untuk mengelola data masjid, keuangan, dan program kerja pada instansi terkait."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Modal consistent with DataMasjid */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="bg-red-500 p-10 flex justify-center text-white">
              <AlertTriangle size={64} className="animate-bounce" />
            </div>
            <div className="p-10 text-center">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-4">Hapus Takmir?</h2>
              <p className="text-base text-gray-500 mb-8 leading-relaxed">
                Menghapus takmir <strong>{takmir?.user?.nama}</strong> akan mencabut akses mereka dari sistem secara permanen.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={deleting} 
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 shadow-xl shadow-red-200 transition-all flex items-center justify-center"
                >
                  {deleting ? <RefreshCcw size={18} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailTakmir;