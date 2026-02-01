import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Tambahkan import useNavigate

const SearchMasjidSection = () => {
  const navigate = useNavigate(); // Inisialisasi navigate
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk fetch data masjid dari backend
  const fetchMosques = async () => {
    try {
      // URL backend: berdasarkan router di backend, endpoint adalah /public/masjid
      const apiUrl = 'http://localhost:3000/public/masjid'; // Ganti port jika backend di port lain
      console.log('Fetching from:', apiUrl); // Log untuk debugging
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status); // Log status
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Data received:', data); // Log data untuk memastikan JSON
      if (!Array.isArray(data)) {
        throw new Error('Data yang diterima bukan array');
      }
      setMosques(data);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err); // Log detail error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMosques();
  }, []);

  const handleSearchInput = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearchQuery(e.target.value);
    if (query === '') {
      setShowResults(false);
      return;
    }
    const filtered = mosques.filter(mosque => mosque.nama_masjid && mosque.nama_masjid.toLowerCase().includes(query));
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleResultClick = (mosque) => {
    // Navigasi ke halaman detail masjid
    navigate(`/masjid/${mosque.masjid_id}`);
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (loading) {
    return (
      <section id="masjid" className="search-section relative -mt-20 z-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b26] text-center mb-6">Cari Masjid</h2>
            <div className="text-center">Memuat data masjid...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="masjid" className="search-section relative -mt-20 z-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b26] text-center mb-6">Cari Masjid</h2>
            <div className="text-center text-red-500">
              Error: {error}. <br />
              Tips: Pastikan backend berjalan di http://localhost:3000, endpoint /public/masjid tersedia, dan router public dipasang. Cek konsol browser untuk log detail.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="masjid" className="search-section relative -mt-20 z-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0b2b26] text-center mb-6">Cari Masjid</h2>
          <div className="relative">
            <input
              id="searchInput"
              type="text"
              placeholder="Ketik nama masjid..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-transparent"
            />
            <div id="searchResults" className={`absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto ${showResults ? '' : 'hidden'}`}>
              {searchResults.length === 0 ? (
                <div className="px-4 py-2 text-gray-500">Tidak ada masjid ditemukan</div>
              ) : (
                searchResults.map((mosque) => (
                  <div
                    key={mosque.masjid_id}
                    className="px-4 py-3 hover:bg-[#daf1de] cursor-pointer transition-colors"
                    onClick={() => handleResultClick(mosque)}
                  >
                    {mosque.nama_masjid}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchMasjidSection;