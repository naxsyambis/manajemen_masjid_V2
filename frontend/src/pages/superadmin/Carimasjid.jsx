// frontend/src/pages/superadmin/Carimasjid.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ditambahkan: gunakan axios untuk konsistensi dengan komponen lain
import { Search, MapPin, AlertCircle } from 'lucide-react';

const Carimasjid = ({ onMasjidClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMosques = async () => {
    try {
      setError(null); // Reset error sebelum fetch
      const response = await axios.get('http://localhost:3000/public/masjid'); // Diperbaiki: gunakan axios untuk konsistensi
      if (!Array.isArray(response.data)) {
        throw new Error('Data yang diterima bukan array. Periksa endpoint API.');
      }
      setMosques(response.data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data masjid.');
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
      setSearchResults([]);
      return;
    }
    // Filter dengan check aman untuk nama_masjid (diperbaiki: tambah check untuk alamat juga jika diperlukan)
    const filtered = mosques.filter(mosque => 
      mosque && mosque.nama_masjid && mosque.nama_masjid.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleResultClick = (mosque) => {
    if (onMasjidClick && mosque && mosque.masjid_id) {
      onMasjidClick(mosque.masjid_id);
    }
    setShowResults(false);
    setSearchQuery('');
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
      <div className="relative z-10">
        <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-mu-green uppercase tracking-wider text-center">Memuat data masjid...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative z-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium text-sm">Error: {error}</p>
            <p className="text-red-600 text-xs mt-1">Pastikan backend berjalan dan endpoint tersedia.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          id="searchInput"
          type="text"
          placeholder="Cari masjid..."
          value={searchQuery}
          onChange={handleSearchInput}
          className="p-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mu-green focus:border-mu-green transition-all duration-300 bg-white text-gray-700 placeholder-gray-400 shadow-sm w-full"
        />
      </div>
      
      {/* Dropdown Results */}
      <div id="searchResults" className={`absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto ${showResults ? '' : 'hidden'} z-50`}>
        {searchResults.length === 0 ? (
          <div className="px-4 py-3 text-gray-500 text-center text-sm">Tidak ada masjid ditemukan</div>
        ) : (
          searchResults.map((mosque) => (
            <div
              key={mosque.masjid_id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 hover:shadow-sm"
              onClick={() => handleResultClick(mosque)}
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-mu-green flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{mosque.nama_masjid}</div>
                  {mosque.alamat && <div className="text-sm text-gray-500">{mosque.alamat}</div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Carimasjid;