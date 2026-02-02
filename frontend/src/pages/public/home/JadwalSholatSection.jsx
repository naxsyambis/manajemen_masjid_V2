import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Pastikan axios terinstall
import { Sunrise, Sun, CloudSun, Sunset, Moon, RefreshCcw, AlertCircle } from 'lucide-react';

const JadwalSholatSection = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [prayerSchedule, setPrayerSchedule] = useState([]);
  const [lokasi, setLokasi] = useState('Yogyakarta & Sekitarnya');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data dari backend
  const fetchPrayerSchedule = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await axios.get('http://localhost:3000/public/jadwal-sholat?kota_id=9b04d152845ec0a378394003c96da594');
      const data = response.data.data;
      setLokasi(data.lokasi);
      setPrayerSchedule([
        { name: "Subuh", time: data.jadwal.subuh, icon: <Sunrise size={32} /> },
        { name: "Dzuhur", time: data.jadwal.dzuhur, icon: <Sun size={32} /> },
        { name: "Ashar", time: data.jadwal.ashar, icon: <CloudSun size={32} /> },
        { name: "Maghrib", time: data.jadwal.maghrib, icon: <Sunset size={32} /> },
        { name: "Isya", time: data.jadwal.isya, icon: <Moon size={32} /> },
      ]);
      setNextPrayer(data.nextPrayer);
    } catch (err) {
      console.error('Error fetching prayer schedule:', err);
      setError('Gagal memuat jadwal sholat. Silakan coba lagi.');
      setPrayerSchedule([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrayerSchedule();
  }, []);

  // Update waktu real-time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("id-ID"));
      setCurrentDate(now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Countdown untuk nextPrayer
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    if (nextPrayer) {
      const interval = setInterval(() => {
        const now = new Date();
        const [hour, minute] = nextPrayer.time.split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hour, minute, 0, 0);
        const diff = prayerTime - now;
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setCountdown(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setCountdown('Waktunya sholat!');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [nextPrayer]);

  const handleRefresh = () => {
    fetchPrayerSchedule();
  };

  if (loading) {
    return (
      <section className="relative z-10 mt-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-mu-green uppercase tracking-wider">Memuat Jadwal Sholat...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 mt-10">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-mu-green via-mu-green to-mu-green text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Sunrise size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Jadwal Sholat</h2>
                  <p className="text-white/80 text-sm mt-1">{lokasi}</p>
                  {nextPrayer && (
                    <p className="text-white/90 text-sm mt-1">
                      Sholat berikutnya: {nextPrayer.name} - {countdown}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">{currentTime}</div>
                <div className="text-sm text-white/90">{currentDate}</div>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Memuat...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 mb-6">
                <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}
            {prayerSchedule.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="prayerGrid">
                {prayerSchedule.map((prayer, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 text-center shadow-md hover:from-mu-green hover:to-mu-green hover:text-white transition-all duration-500 hover:scale-105 border border-gray-100 cursor-pointer"
                  >
                    <div className="text-mu-green group-hover:text-white mb-3 flex justify-center">
                      {prayer.icon}
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{prayer.name}</h4>
                    <p className="text-2xl font-bold">{prayer.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sunrise size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Jadwal sholat tidak tersedia</h3>
                <p className="text-gray-500">Silakan coba refresh atau periksa koneksi internet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JadwalSholatSection;