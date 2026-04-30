import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import {
  AlertTriangle, Trash2, X, MapPin, Calendar, FileText
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const HapusKegiatan = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [kegiatan, setKegiatan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchKegiatan();
  }, [id]);

  const fetchKegiatan = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/kegiatan/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setKegiatan(res.data);

    } catch (err) {
      console.error(err);
      alert("Gagal ambil data");
      navigate('/superadmin/kegiatan');
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

    } catch (err) {
      console.error(err);
      alert("Gagal hapus kegiatan");
    } finally {
      setDeleting(false);
    }
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return '-';
    return new Date(tgl).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100">
        <p className="font-bold text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (!kegiatan) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">

      <SuperAdminSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onLogout={onLogout}
        user={user}
      />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-8">

          <div className="max-w-6xl mx-auto">

            {/* HEADER */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-10 text-white">

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">

                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      {kegiatan.nama_kegiatan}
                    </h1>
                    <p className="text-red-100">
                      ID Kegiatan: {kegiatan.kegiatan_id}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-6 lg:mt-0">
                    <AlertTriangle size={48} className="animate-pulse" />
                    <div>
                      <h2 className="text-2xl font-bold">Konfirmasi Hapus</h2>
                      <p className="text-red-100">Tidak dapat dibatalkan</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* WARNING */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-8 shadow">

              <div className="flex items-center gap-4 mb-4">
                <AlertTriangle size={32} className="text-red-600 animate-pulse"/>
                <h3 className="text-2xl font-bold text-red-700">
                  Peringatan Penting
                </h3>
              </div>

              <p className="text-red-600">
                Menghapus kegiatan ini akan menghilangkan semua data secara permanen dan tidak bisa dikembalikan.
              </p>

            </div>

            {/* DETAIL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-white p-6 rounded-2xl shadow">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-red-500"/>
                  <h3 className="font-semibold">Waktu Kegiatan</h3>
                </div>
                <p>{formatTanggal(kegiatan.waktu_kegiatan)}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="text-red-500"/>
                  <h3 className="font-semibold">Lokasi</h3>
                </div>
                <p>{kegiatan.lokasi}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-red-500"/>
                  <h3 className="font-semibold">Deskripsi</h3>
                </div>
                <p>{kegiatan.deskripsi || '-'}</p>
              </div>

            </div>

            {/* BUTTON */}
            <div className="flex justify-center gap-4 mt-10 pt-6 border-t">

              <button
                onClick={() => navigate('/superadmin/kegiatan')}
                className="px-8 py-3 bg-gray-200 rounded-xl flex items-center gap-2"
              >
                <X size={18}/> Batal
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl flex items-center gap-2"
              >
                <Trash2 size={18}/>
                {deleting ? "Menghapus..." : "Hapus Kegiatan"}
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default HapusKegiatan;