import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../../../components/SuperAdminNavbar';
import SuperAdminSidebar from '../../../components/SuperAdminSidebar';
import {
  Edit, Trash2, Search, Plus, Image as ImageIcon, Eye
} from 'lucide-react';

const BASE_URL = "http://localhost:3000";

const DataProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);

  const [kategoriList, setKategoriList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [kategoriBaru, setKategoriBaru] = useState('');
  const [selectedKategori, setSelectedKategori] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isExpanded = isOpen || isHovered;

  // ================= FETCH =================
  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/program`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(res.data.data || []);
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/superadmin/kategori-program`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKategoriList(res.data.data || []);
    } catch {
      setKategoriList([]);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchKategori();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const filtered = programs.filter(p =>
      (p.nama_program || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [programs, searchTerm]);

  // ================= DELETE PROGRAM =================
  const handleDeleteProgram = async (id) => {
    if (!window.confirm("Hapus program?")) return;

    await axios.delete(`${BASE_URL}/superadmin/program/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchPrograms();
  };

  // ================= TAMBAH / EDIT KATEGORI =================
  const handleSaveKategori = async () => {
    if (!kategoriBaru.trim()) return alert("Isi nama kategori");

    try {
      if (selectedKategori) {
        // UPDATE
        await axios.put(
          `${BASE_URL}/superadmin/kategori-program/${selectedKategori.kategori_id}`,
          { nama_kategori: kategoriBaru },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // CREATE
        await axios.post(
          `${BASE_URL}/superadmin/kategori-program`,
          {
            nama_kategori: kategoriBaru,
            masjid_id: user?.masjid_id || 1
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setKategoriBaru('');
      setSelectedKategori(null);
      setShowModal(false);
      fetchKategori();

    } catch {
      alert("Gagal simpan kategori");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-screen flex bg-gray-50">

      <SuperAdminSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        onLogout={onLogout}
        setIsHovered={setIsHovered}
        isExpanded={isExpanded}
      />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar user={user} setIsOpen={setIsOpen} />

        <div className="p-8 space-y-8">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-black">
              Data <span className="text-mu-green">Program</span>
            </h1>

            <button
              onClick={() => navigate('/superadmin/program/tambah')}
              className="bg-mu-green text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow"
            >
              <Plus size={16}/> Program
            </button>
          </div>

          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400"/>
            <input
              placeholder="Cari program..."
              className="pl-10 pr-4 py-3 w-full rounded-xl border bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ================= PROGRAM ================= */}
          <div className="bg-white rounded-3xl shadow p-6">

            <div className="grid grid-cols-5 font-bold text-gray-500 mb-4">
              <div>Gambar</div>
              <div>Nama</div>
              <div>Jadwal</div>
              <div>Kategori</div>
              <div>Aksi</div>
            </div>

            {filteredPrograms.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                Data tidak ditemukan
              </div>
            )}

            {filteredPrograms.map(p => (
              <div
                key={p.program_id}
                className="grid grid-cols-5 items-center py-4 border-t hover:bg-gray-50 rounded-xl transition"
              >
                <div>
                  {p.gambar ? (
                    <img
                      src={`${BASE_URL}/uploads/program/${p.gambar}`}
                      className="w-14 h-14 object-cover rounded-lg"
                      onError={(e)=> e.target.src="https://via.placeholder.com/60"}
                    />
                  ) : <ImageIcon />}
                </div>

                <div className="font-semibold">{p.nama_program}</div>
                <div>{p.jadwal_rutin}</div>
                <div>{p.kategori_program?.nama_kategori || '-'}</div>

                <div className="flex gap-3">
                  <button onClick={() => navigate(`/superadmin/program/detail/${p.program_id}`)}>
                    <Eye size={18}/>
                  </button>
                  <button onClick={() => navigate(`/superadmin/program/edit/${p.program_id}`)}>
                    <Edit size={18}/>
                  </button>
                  <button onClick={() => handleDeleteProgram(p.program_id)}>
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}

          </div>

          {/* ================= KATEGORI ================= */}
          <div className="bg-white rounded-3xl shadow p-6">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">Kategori Program</h2>

              <button
                onClick={() => {
                  setSelectedKategori(null);
                  setKategoriBaru('');
                  setShowModal(true);
                }}
                className="bg-mu-green text-white px-4 py-2 rounded-xl"
              >
                + Kategori
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {kategoriList.map(k => (
                <div
                  key={k.kategori_id}
                  className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-3 hover:shadow"
                >
                  <span className="font-semibold truncate">
                    {k.nama_kategori}
                  </span>

                  <button
                    onClick={() => {
                      setKategoriBaru(k.nama_kategori);
                      setSelectedKategori(k);
                      setShowModal(true);
                    }}
                    className="text-blue-500"
                  >
                    <Edit size={18}/>
                  </button>
                </div>
              ))}

            </div>

          </div>

        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-80">
            <h2 className="font-bold mb-3">
              {selectedKategori ? "Edit Kategori" : "Tambah Kategori"}
            </h2>

            <input
              value={kategoriBaru}
              onChange={(e)=>setKategoriBaru(e.target.value)}
              className="border p-2 w-full rounded"
            />

            <button
              onClick={handleSaveKategori}
              className="bg-mu-green text-white w-full mt-3 py-2 rounded"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DataProgram;