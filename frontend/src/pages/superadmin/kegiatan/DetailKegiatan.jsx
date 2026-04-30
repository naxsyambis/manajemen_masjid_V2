import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import {
  MapPin, Calendar, FileText, ArrowLeft,
  Edit, Trash2, AlertTriangle, X, RefreshCcw
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const DetailKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [kegiatan, setKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const isExpanded = isOpen || isHovered;

  useEffect(() => {
    fetchKegiatan();
  }, [id]);

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/superadmin/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setKegiatan(res.data);

    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${BASE_URL}/superadmin/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/superadmin/kegiatan');

    } catch {
      alert("Gagal hapus");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!kegiatan) return <div className="p-10 text-center">Data tidak ditemukan</div>;

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
            <h1 className="text-4xl font-black">
              Detail <span className="text-mu-green">Kegiatan</span>
            </h1>

            <button onClick={fetchKegiatan} className="bg-white px-4 py-2 rounded-xl shadow">
              <RefreshCcw size={16}/>
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-4 rounded-xl">
              {error}
            </div>
          )}

          {/* CONTENT */}
          <div className="bg-white p-10 rounded-[2rem] shadow space-y-8">

            {/* POSTER */}
            {kegiatan.poster && (
              <img
                src={`${BASE_URL}/uploads/kegiatan/${kegiatan.poster}`}
                className="w-full max-h-[400px] object-cover rounded-xl"
              />
            )}

            {/* NAMA */}
            <div>
              <h2 className="text-2xl font-bold">{kegiatan.nama_kegiatan}</h2>
              <p className="text-sm text-gray-400">ID: {kegiatan.kegiatan_id}</p>
            </div>

            {/* WAKTU */}
            <div className="flex items-center gap-2">
              <Calendar size={18}/>
              <span>
                {kegiatan.waktu_kegiatan
                  ? new Date(kegiatan.waktu_kegiatan).toLocaleString('id-ID')
                  : '-'}
              </span>
            </div>

            {/* LOKASI */}
            <div className="flex items-center gap-2">
              <MapPin size={18}/>
              <span>{kegiatan.lokasi}</span>
            </div>

            {/* DESKRIPSI */}
            <div className="flex gap-2">
              <FileText size={18}/>
              <p>{kegiatan.deskripsi || "Tidak ada deskripsi"}</p>
            </div>

            {/* BUTTON */}
            <div className="flex gap-4 pt-6 border-t">

              <button
                onClick={() => navigate('/superadmin/kegiatan')}
                className="px-6 py-3 bg-gray-200 rounded-xl"
              >
                <ArrowLeft size={16}/> Kembali
              </button>

              <button
                onClick={() => navigate(`/superadmin/kegiatan/edit/${id}`)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl"
              >
                <Edit size={16}/> Edit
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl"
              >
                <Trash2 size={16}/> Hapus
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl">

            <h2 className="text-lg font-bold mb-4">Hapus kegiatan?</h2>

            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)}>
                Batal
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2"
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

export default DetailKegiatan;