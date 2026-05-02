import React, { useEffect, useState } from "react";

const StrukturOrganisasi = ({ masjidId }) => {
  const [data, setData] = useState([]);
  const [masjidList, setMasjidList] = useState([]);
  const [selectedMasjid, setSelectedMasjid] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async (id = "") => {
    try {
      setLoading(true);

      const [strukturRes, masjidRes] = await Promise.all([
        fetch(
          `http://localhost:3000/public/struktur-organisasi${
            id ? `?masjid_id=${id}` : ""
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
    // 🔥 kalau dipanggil dari Masjid.jsx → pakai id
    fetchData(masjidId || "");
  }, [masjidId]);

  const handleChangeMasjid = (e) => {
    const value = e.target.value;
    setSelectedMasjid(value);
    fetchData(value);
  };

  return (
    <div className="container mx-auto px-6">

      {/* 🔥 FILTER (optional, bisa tetap ada) */}
      {!masjidId && (
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
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="text-center">Memuat data...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-500">
          Tidak ada data struktur organisasi
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {data.map((item) => (
            <div
              key={item.struktur_id}
              className="w-full max-w-sm bg-white rounded-[28px] shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={
                    item.foto
                      ? `http://localhost:3000/uploads/kepengurusan/${item.foto}`
                      : "https://picsum.photos/400/500"
                  }
                  alt={item.nama}
                  className="w-full h-[300px] object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src = "https://picsum.photos/400/500";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* CONTENT */}
              <div className="p-5 text-center">

                {/* NAMA */}
                <h3 className="text-lg md:text-xl font-bold text-[#006227] mb-3">
  {item.nama}
</h3>

                {/* JABATAN */}
                <div className="mb-3">
                  <span className="inline-block bg-gray-100 text-gray-700 px-6 py-2 rounded-full text-sm font-semibold shadow-sm">
                    {item.jabatan}
                  </span>
                </div>

                

                {/* GARIS */}
                <div className="w-12 h-[2px] bg-[#006227] mx-auto mb-3"></div>

                {/* DESKRIPSI */}
                <p className="text-sm text-gray-500 leading-relaxed">
                  Berperan dalam kepengurusan masjid untuk pelayanan umat
                </p>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StrukturOrganisasi;