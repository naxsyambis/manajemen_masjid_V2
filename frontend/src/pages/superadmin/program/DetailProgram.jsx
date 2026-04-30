import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import { Calendar, FileText, ArrowLeft, Edit, Trash2, AlertTriangle, X, RefreshCcw, AlertCircle } from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const DetailProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const res = await axios.get(`${BASE_URL}/superadmin/program/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProgram(res.data);

    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      setError("Gagal memuat data program");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/superadmin/program/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Program berhasil dihapus");
      navigate('/superadmin/program');

    } catch (err) {
      alert("Gagal hapus program");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-mu-green border-t-transparent rounded-full"/>
      </div>
    );
  }

  if (!program) {
    return <div className="p-10 text-center text-red-500">Data tidak ditemukan</div>;
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <SuperAdminSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onLogout={onLogout}
        user={user}
        setIsHovered={setIsHovered}
        isExpanded={isExpanded}
      />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-8 space-y-8 overflow-y-auto">

          {/* HEADER */}
          <div className="flex justify-between">
            <div>
              <h1 className="text-4xl font-black">
                Detail <span className="text-mu-green">Program</span>
              </h1>
              <p className="text-xs text-gray-400 mt-2">
                {time.toLocaleDateString('id-ID')} • {time.toLocaleTimeString('id-ID')}
              </p>
            </div>

            <button
              onClick={fetchProgram}
              className="bg-white px-5 py-3 rounded-xl shadow text-xs flex gap-2"
            >
              <RefreshCcw size={14}/> Refresh
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* CONTENT */}
          <div className="bg-white p-10 rounded-3xl shadow space-y-10">

            {/* GAMBAR */}
            <div>
              <label className="font-bold text-sm">Gambar Program</label>

              {program.gambar ? (
                <img
                  src={`${BASE_URL}/uploads/program/${program.gambar}`}
                  className="mt-3 max-h-[350px] object-contain rounded-xl"
                />
              ) : (
                <p className="text-gray-400 mt-2">Tidak ada gambar</p>
              )}
            </div>

            {/* NAMA */}
            <div>
              <label className="font-bold text-sm">Nama Program</label>
              <p className="mt-1 text-lg">{program.nama_program}</p>
            </div>

            {/* JADWAL */}
            <div>
              <label className="font-bold text-sm">Jadwal</label>
              <p className="mt-1">{program.jadwal_rutin}</p>
            </div>

            {/* KATEGORI */}
            <div>
              <label className="font-bold text-sm">Kategori</label>
              <p className="mt-1">
                {program.kategori_program?.nama_kategori || "-"}
              </p>
            </div>

            {/* DESKRIPSI */}
            <div>
              <label className="font-bold text-sm">Deskripsi</label>
              <p className="mt-1 whitespace-pre-line">
                {program.deskripsi || "Tidak ada deskripsi"}
              </p>
            </div>

            {/* BUTTON */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => navigate('/superadmin/program')}
                className="px-6 py-3 bg-gray-200 rounded-xl flex items-center gap-2"
              >
                <ArrowLeft size={16}/> Kembali
              </button>

              <button
                onClick={() => navigate(`/superadmin/program/edit/${id}`)}
                className="px-6 py-3 bg-mu-green text-white rounded-xl flex items-center gap-2"
              >
                <Edit size={16}/> Edit
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl flex items-center gap-2"
              >
                <Trash2 size={16}/> Hapus
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="font-bold text-lg mb-4">Hapus Program?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Data akan hilang permanen.
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={()=>setShowDeleteModal(false)}>Batal</button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailProgram;