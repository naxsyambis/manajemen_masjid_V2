import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { AlertTriangle, Trash2, X, User, Mail, Building } from 'lucide-react';

const HapusTakmir = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [takmir, setTakmir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTakmir();
  }, [id]);

  const fetchTakmir = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTakmir(res.data);
    } catch (err) {
      console.error('Error fetching takmir:', err);
      alert('Gagal memuat data takmir atau data tidak ditemukan.');
      navigate('/superadmin/takmir');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const namaTakmir = takmir?.user?.nama || "Takmir ini";
    const emailTakmir = takmir?.user?.email || "";

    const confirmDelete = window.confirm(
      `PERINGATAN KRUSIAL!\n\nApakah Anda yakin ingin menghapus "${namaTakmir}"?\n\nTindakan ini akan menghapus secara permanen:\n1. Profil Takmir (masjid_takmir)\n2. Akun Login (${emailTakmir}) dari database utama.\n\nUser ini tidak akan bisa login kembali ke sistem. Lanjutkan?`
    );

    if (!confirmDelete) return;

    setDeleting(true);
    try {
      const response = await axios.delete(`http://localhost:3000/superadmin/takmir/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.message || 'Takmir dan akun login berhasil dihapus.');
      navigate('/superadmin/takmir');
    } catch (err) {
      console.error('Error deleting takmir:', err);
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan sistem saat mencoba menghapus data.';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Memuat Data Takmir...</p>
        </div>
      </div>
    );
  }

  if (!takmir) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">


      <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />
      <SuperAdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} onLogout={onLogout} user={user} />
      
      <div className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="p-6 lg:p-10 mt-16">
          <div className="max-w-4xl mx-auto">
            
            <div className="bg-white rounded-t-3xl shadow-sm border-x border-t border-gray-200 overflow-hidden">
              <div className="bg-red-600 p-8 text-white">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <User size={40} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{takmir.user?.nama}</h1>
                    <p className="text-red-100 uppercase tracking-widest text-sm font-semibold mt-1">ID Takmir: {id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-x border-gray-200 p-8">
              <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-r-xl flex gap-4">
                <AlertTriangle className="text-red-600 shrink-0" size={28} />
                <div>
                  <h3 className="text-red-800 font-bold text-lg">Peringatan Penghapusan Akun</h3>
                  <p className="text-red-700 mt-1">
                    Menghapus takmir ini akan mengakibatkan akun login terkait (<b>{takmir.user?.email}</b>) 
                    dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-x border-b border-gray-200 rounded-b-3xl p-8 shadow-sm">
              <h2 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-6">Detail Data yang Akan Dihapus</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Box */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Nama Lengkap</p>
                    <p className="text-gray-800 font-bold">{takmir.user?.nama || '-'}</p>
                  </div>
                </div>

                {/* Email Box */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Email Login</p>
                    <p className="text-gray-800 font-bold">{takmir.user?.email || '-'}</p>
                  </div>
                </div>

                {/* Masjid Box */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 md:col-span-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-red-600">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Masjid Penugasan</p>
                    <p className="text-gray-800 font-bold">
                      {takmir.masjid?.nama_masjid || 'Tidak Terikat Masjid'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-10 pt-8 border-t border-gray-100">
                <button
                  onClick={() => navigate('/superadmin/takmir')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
                >
                  <X size={20} />
                  Batalkan
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  <Trash2 size={20} />
                  {deleting ? 'Sedang Menghapus...' : 'Ya, Hapus Permanen'}
                </button>
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-8">
              Sistem Manajemen Masjid v2.0 - Superadmin Authorization Required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HapusTakmir;