import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { AlertTriangle, X, CheckCircle2, XCircle, Info } from 'lucide-react';

const BASE_URL = "http://localhost:3000";
const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isConfirm = alertData.type === "confirm";
  const headerBg = isConfirm || alertData.type === "error" ? "bg-[#f84c4c]" : "bg-green-500";

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn" 
        onClick={onClose} 
      />
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-scaleIn text-center border border-white/20">
        
        <div className={`${headerBg} py-10 flex justify-center items-center shadow-inner`}>
          <AlertTriangle size={64} className="text-white drop-shadow-md" strokeWidth={2} />
        </div>

        <div className="p-10">
          <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-4">
            {alertData.title}
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-400">Apakah Anda yakin ingin menghapus program:</p>
            <p className="text-sm font-black text-gray-700">"{alertData.targetName}"?</p>
            <p className="text-sm font-bold text-gray-400 mt-2">Data yang dihapus tidak bisa dikembalikan.</p>
          </div>

          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                alertData.onConfirmAction();
                onClose();
              }}
              className="flex-1 py-4 rounded-2xl bg-[#f84c4c] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-95"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const HapusProgram = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  
  const [isOpen, setIsOpen] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setProgram(res.data);
      } catch (err) {
        navigate('/superadmin/program');
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id, token, navigate]);

  const handleDeleteExecute = async () => {
    try {
      await axios.delete(`${BASE_URL}/superadmin/program/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      navigate('/superadmin/program');
    } catch (err) {
      console.error("Gagal menghapus", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-mu-green border-solid"></div>
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard min-h-screen bg-gray-100 relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
        <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} />
        
        <div className="main-content p-6 filter blur-[2px]">
           <div className="max-w-6xl mx-auto opacity-50 pointer-events-none">
              <div className="bg-white rounded-2xl h-40 mb-8 shadow-sm" />
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl h-64 shadow-sm" />
                <div className="bg-white rounded-2xl h-64 shadow-sm" />
              </div>
           </div>
        </div>
      </div>

      <AlertPopup 
        alertData={{
          show: true,
          type: "confirm",
          title: "HAPUS PROGRAM?",
          targetName: program?.nama_program,
          onConfirmAction: handleDeleteExecute
        }} 
        onClose={() => navigate('/superadmin/program')} 
      />
    </div>
  );
};

export default HapusProgram;