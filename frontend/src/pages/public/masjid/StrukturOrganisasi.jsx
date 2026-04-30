import React, { useEffect, useState } from "react";
import NavbarPublic from "/src/components/NavbarPublic";
import FooterPublic from "/src/components/FooterPublic";

const StrukturOrganisasi = () => {
  const [data, setData] = useState([]);
  const [masjidList, setMasjidList] = useState([]);
  const [selectedMasjid, setSelectedMasjid] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (masjidId = "") => {
    try {
      setLoading(true);

      const [strukturRes, masjidRes] = await Promise.all([
        fetch(
          `http://localhost:3000/public/struktur-organisasi${
            masjidId ? `?masjid_id=${masjidId}` : ""
          }`
        ),
        fetch("http://localhost:3000/public/masjid"),
      ]);

      const strukturJson = await strukturRes.json();
      const masjidJson = await masjidRes.json();

      setData(strukturJson.data);
      setMasjidList(masjidJson);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeMasjid = (e) => {
    const value = e.target.value;
    setSelectedMasjid(value);
    fetchData(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPublic />

      <div className="pt-32 pb-20 container mx-auto px-6">
        <h1 className="text-4xl font-bold text-[#006227] text-center mb-6">
          Struktur Organisasi Masjid
        </h1>

        {/* 🔥 FILTER MASJID */}
        <div className="mb-10 text-center">
          <select
            value={selectedMasjid}
            onChange={handleChangeMasjid}
            className="px-4 py-2 border rounded-lg shadow"
          >
            <option value="">Semua Masjid</option>
            {masjidList.map((m) => (
              <option key={m.masjid_id} value={m.masjid_id}>
                {m.nama_masjid}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-500">
            Tidak ada data struktur organisasi
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.map((item) => (
              <div
                key={item.struktur_id}
                className="bg-white rounded-2xl shadow p-6 text-center hover:shadow-xl transition"
              >
                <img
                  src={
                    item.foto
                      ? `http://localhost:3000/uploads/kepengurusan/${item.foto}`
                      : "/images/no-image.jpg"
                  }
                  onError={(e) => {
                    e.target.src = "/images/no-image.jpg";
                  }}
                  alt={item.nama}
                  className="w-32 h-32 rounded-full mx-auto object-cover mb-4"
                />

                <h3 className="text-xl font-bold text-[#006227]">
                  {item.nama}
                </h3>

                <p className="text-gray-600 mb-2">{item.jabatan}</p>

                {item.periode_mulai && item.periode_selesai && (
                  <p className="text-sm text-gray-500">
                    {item.periode_mulai} - {item.periode_selesai}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterPublic />
    </div>
  );
};

export default StrukturOrganisasi;