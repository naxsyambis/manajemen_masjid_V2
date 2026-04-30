// src/pages/superadmin/program/DataProgram.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import SuperAdminNavbar from "../../../components/SuperAdminNavbar";
import SuperAdminSidebar from "../../../components/SuperAdminSidebar";
import {
  Plus,
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

const DataProgram = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;

  const token = localStorage.getItem("token");

  // ===== PROGRAM =====
  const [program, setProgram] = useState([]);
  const [filteredProgram, setFilteredProgram] = useState([]);

  // ===== KATEGORI =====
  const [kategori, setKategori] = useState([]);
  const [filteredKategori, setFilteredKategori] = useState([]);

  const [searchProgram, setSearchProgram] = useState("");
  const [searchKategori, setSearchKategori] = useState("");

  const [entriesProgram, setEntriesProgram] = useState(5);
  const [entriesKategori, setEntriesKategori] = useState(5);

  const [pageProgram, setPageProgram] = useState(1);
  const [pageKategori, setPageKategori] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);

      const resProgram = await axios.get(
        "http://localhost:3000/superadmin/program",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resKategori = await axios.get(
        "http://localhost:3000/superadmin/kategori-program",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProgram(resProgram.data.data);
      setKategori(resKategori.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===== FILTER =====
  useEffect(() => {
    const result = program.filter((p) =>
      p.nama_program?.toLowerCase().includes(searchProgram.toLowerCase())
    );
    setFilteredProgram(result);
    setPageProgram(1);
  }, [program, searchProgram]);

  useEffect(() => {
    const result = kategori.filter((k) =>
      k.nama_kategori?.toLowerCase().includes(searchKategori.toLowerCase())
    );
    setFilteredKategori(result);
    setPageKategori(1);
  }, [kategori, searchKategori]);

  // ===== PAGINATION =====
  const paginate = (data, page, perPage) => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  };

  const totalPageProgram = Math.ceil(filteredProgram.length / entriesProgram);
  const totalPageKategori = Math.ceil(filteredKategori.length / entriesKategori);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SuperAdminSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        onLogout={onLogout}
        setIsHovered={setIsHovered}
        isExpanded={isExpanded}
      />

      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar setIsOpen={setIsOpen} user={user} />

        <div className="p-6 space-y-10 overflow-y-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black">
                Data <span className="text-green-600">Program</span>
              </h1>
              <p className="text-xs text-gray-400 flex items-center gap-2 mt-2">
                <Calendar size={14} />
                {time.toLocaleString("id-ID")}
              </p>
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow text-sm"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {/* ================= PROGRAM ================= */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between mb-4 flex-wrap gap-3">

              <h2 className="font-bold text-lg">Data Program</h2>

              <input
                placeholder="Cari program..."
                value={searchProgram}
                onChange={(e) => setSearchProgram(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Nama</th>
                    <th className="p-3 text-left">Jadwal</th>
                    <th className="p-3 text-left">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredProgram, pageProgram, entriesProgram).map(
                    (p) => (
                      <tr key={p.program_id} className="border-b">
                        <td className="p-3">{p.nama_program}</td>
                        <td className="p-3">{p.jadwal_rutin}</td>
                        <td className="p-3">
                          {p.kategori_program?.nama_kategori || "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <select
                value={entriesProgram}
                onChange={(e) => setEntriesProgram(Number(e.target.value))}
              >
                {[5, 10, 25, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button onClick={() => setPageProgram(pageProgram - 1)}>
                  <ChevronLeft />
                </button>
                <span>{pageProgram}</span>
                <button onClick={() => setPageProgram(pageProgram + 1)}>
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>

          {/* ================= KATEGORI ================= */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between mb-4 flex-wrap gap-3">

              <h2 className="font-bold text-lg">Kategori Program</h2>

              <input
                placeholder="Cari kategori..."
                value={searchKategori}
                onChange={(e) => setSearchKategori(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Nama Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredKategori, pageKategori, entriesKategori).map(
                    (k) => (
                      <tr key={k.kategori_id} className="border-b">
                        <td className="p-3">{k.nama_kategori}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between mt-4">
              <select
                value={entriesKategori}
                onChange={(e) => setEntriesKategori(Number(e.target.value))}
              >
                {[5, 10, 25, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button onClick={() => setPageKategori(pageKategori - 1)}>
                  <ChevronLeft />
                </button>
                <span>{pageKategori}</span>
                <button onClick={() => setPageKategori(pageKategori + 1)}>
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataProgram;