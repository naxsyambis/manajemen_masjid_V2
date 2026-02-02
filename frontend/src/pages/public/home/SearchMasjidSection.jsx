import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, AlertCircle } from 'lucide-react';

const SearchMasjidSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMosques = async () => {
    try {
      const apiUrl = 'http://localhost:3000/public/masjid';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Data yang diterima bukan array');
      }
      setMosques(data);
    } catch (err) {
      setError(err.message);
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
      <section id="masjid" className="search-section animate-fadeIn relative -mt-20 z-20 pt-12 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 border-4 border-[#006227] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-[#006227] uppercase tracking-wider">Memuat data masjid...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="masjid" className="search-section animate-fadeIn relative -mt-20 z-20 pt-12 pb-24">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-[#006227] text-center mb-6 tracking-tight">Cari Masjid</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium text-sm">Error: {error}</p>
                <p className="text-red-600 text-xs mt-1">Pastikan backend berjalan dan endpoint tersedia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="masjid" className="search-section animate-fadeIn relative -mt-20 z-20 pt-12 pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-bold text-[#006227] text-center mb-6 tracking-tight">Cari Masjid</h2>
          <div className="relative">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="searchInput"
                type="text"
                placeholder="Ketik nama masjid..."
                value={searchQuery}
                onChange={handleSearchInput}
                className="w-full pl-12 pr-4 py-4 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006227] focus:border-[#006227] transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>
            <div id="searchResults" className={`absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto ${showResults ? '' : 'hidden'} z-30`}>
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
                      <MapPin size={16} className="text-[#006227] flex-shrink-0" />
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
        </div>
      </div>
    </section>
  );
};

export default SearchMasjidSection;