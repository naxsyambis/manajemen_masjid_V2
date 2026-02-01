import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Tambahkan import untuk grafik
import NavbarPublic from '../../../components/NavbarPublic'; // Import normal tanpa require
import FooterPublic from '../../../components/FooterPublic'; // Import normal tanpa require

const MasjidDetail = () => {
  const { id } = useParams(); // Mengambil id masjid dari URL params
  const [masjid, setMasjid] = useState(null);
  const [jamaah, setJamaah] = useState([]);
  const [keuangan, setKeuangan] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch detail masjid dari backend
  const fetchMasjidDetail = async () => {
    try {
      const apiUrl = `http://localhost:3000/public/masjid/${id}`;
      console.log('Fetching from:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Data received:', data);
      setMasjid(data.masjid);
      setJamaah(data.jamaah || []);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    }
  };

  // Fungsi untuk fetch keuangan masjid
  const fetchKeuangan = async () => {
    try {
      const apiUrl = `http://localhost:3000/public/keuangan?masjid_id=${id}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setKeuangan(data.data || []);
    } catch (err) {
      console.error('Fetch keuangan error:', err);
      // Jika error, tetap lanjut, tidak set error utama
    }
  };

  // Fungsi untuk fetch inventaris masjid
  const fetchInventaris = async () => {
    try {
      const apiUrl = `http://localhost:3000/public/inventaris?masjid_id=${id}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setInventaris(data || []);
    } catch (err) {
      console.error('Fetch inventaris error:', err);
      // Jika error, tetap lanjut
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchMasjidDetail(), fetchKeuangan(), fetchInventaris()]);
      setLoading(false);
    };
    fetchAllData();
  }, [id]);

  // Fungsi untuk mempersiapkan data grafik keuangan
  const prepareChartData = () => {
    const grouped = {};
    keuangan.forEach(item => {
      const date = new Date(item.tanggal).toLocaleDateString('id-ID');
      if (!grouped[date]) {
        grouped[date] = { date, pemasukan: 0, pengeluaran: 0 };
      }
      const amount = parseFloat(item.jumlah);
      if (amount >= 0) {
        grouped[date].pemasukan += amount;
      } else {
        grouped[date].pengeluaran += Math.abs(amount);
      }
    });
    return Object.values(grouped);
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarPublic />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">Memuat detail masjid...</div>
        </div>
        <FooterPublic />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarPublic />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center text-red-500">
            Error: {error}. <br />
            Tips: Pastikan backend berjalan, endpoint /public/masjid/:id tersedia, dan ID masjid valid.
          </div>
        </div>
        <FooterPublic />
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarPublic />
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">Masjid tidak ditemukan.</div>
        </div>
        <FooterPublic />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarPublic />
      
      {/* Header Section */}
      <section className="bg-[#0b2b26] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{masjid.nama_masjid}</h1>
          <p className="text-lg md:text-xl">{masjid.alamat || 'Alamat tidak tersedia'}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Info Masjid */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0b2b26] mb-4">Informasi Masjid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nama Masjid:</strong> {masjid.nama_masjid}</p>
              <p><strong>Alamat:</strong> {masjid.alamat || 'Tidak tersedia'}</p>
            </div>
            <div>
              <p><strong>Kapasitas:</strong> {masjid.kapasitas || 'Tidak tersedia'}</p>
              <p><strong>Fasilitas:</strong> {masjid.fasilitas || 'Tidak tersedia'}</p>
            </div>
          </div>
        </div>

        {/* Jamaah Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0b2b26] mb-4">Daftar Jamaah</h2>
          {jamaah.length === 0 ? (
            <p className="text-gray-500">Tidak ada data jamaah tersedia.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Jenis Kelamin</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jamaah.map((j) => (
                    <tr key={j.jamaah_id} className="border-b">
                      <td className="px-4 py-2">{j.nama}</td>
                      <td className="px-4 py-2">{j.jenis_kelamin}</td>
                      <td className="px-4 py-2">{j.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Keuangan Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0b2b26] mb-4">Keuangan Masjid</h2>
          {keuangan.length === 0 ? (
            <p className="text-gray-500">Tidak ada data keuangan tersedia.</p>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pemasukan" fill="#4CAF50" name="Pemasukan" />
                  <Bar dataKey="pengeluaran" fill="#F44336" name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Inventaris Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0b2b26] mb-4">Inventaris Masjid</h2>
          {inventaris.length === 0 ? (
            <p className="text-gray-500">Tidak ada data inventaris tersedia.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Nama Barang</th>
                    <th className="px-4 py-2 text-left">Jumlah</th>
                    <th className="px-4 py-2 text-left">Kondisi</th>
                    <th className="px-4 py-2 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {inventaris.map((item) => (
                    <tr key={item.inventaris_id} className="border-b">
                      <td className="px-4 py-2">{item.nama_barang}</td>
                      <td className="px-4 py-2">{item.jumlah}</td>
                      <td className="px-4 py-2">{item.kondisi}</td>
                      <td className="px-4 py-2">{item.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <FooterPublic />
    </div>
  );
};

export default MasjidDetail;