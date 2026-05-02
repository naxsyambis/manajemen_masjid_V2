import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sunrise, Sun, CloudSun, Sunset, Moon, RefreshCcw, AlertCircle, Clock, CloudMoon } from 'lucide-react';

const JadwalSholatSection = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [prayerSchedule, setPrayerSchedule] = useState([]);
  const [lokasi, setLokasi] = useState('Yogyakarta & Sekitarnya');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [ramadhanInfo, setRamadhanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrayerSchedule = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await axios.get("http://localhost:3000/public/jadwal-sholat");

      console.log("FULL RESPONSE:", response.data);

      const result = response.data.data;

      if (!result || !result.jadwal) {
        console.error("INVALID DATA:", result);
        throw new Error("Format data tidak valid");
      }

      setLokasi(result.lokasi || "Lokasi tidak diketahui");
      setRamadhanInfo(result.ramadhan || null);

      setPrayerSchedule([
        { name: "Imsak", time: result.jadwal.imsak, icon: <Clock size={32} /> },
        { name: "Subuh", time: result.jadwal.subuh, icon: <CloudMoon size={32} /> },
        { name: "Terbit", time: result.jadwal.terbit, icon: <Sunrise size={32} /> },
        { name: "Dzuhur", time: result.jadwal.dzuhur, icon: <Sun size={32} /> },
        { name: "Ashar", time: result.jadwal.ashar, icon: <CloudSun size={32} /> },
        { name: "Maghrib", time: result.jadwal.maghrib, icon: <Sunset size={32} /> },
        { name: "Isya", time: result.jadwal.isya, icon: <Moon size={32} /> },
      ]);

      setNextPrayer({
        name: result.nextPrayer?.name || "-",
        time: result.nextPrayer?.time || "-"
      });

    } catch (err) {
      console.error('Error fetching prayer schedule:', err);
      setError('Gagal memuat jadwal sholat.');
      setPrayerSchedule([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrayerSchedule();
  }, []);

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

  const handleRefresh = () => {
    fetchPrayerSchedule();
  };

  if (loading) {
    return (
      <section className="relative z-10 mt-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-mu-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-mu-green uppercase">
              Memuat Jadwal Sholat...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 mt-10">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-mu-green to-mu-green text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Sunrise size={32} />
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    Jadwal Sholat
                  </h2>
                  <p className="text-white/80 text-sm mt-1">
                    {lokasi}
                  </p>
                  {nextPrayer && (
                    <p className="text-white/90 text-sm mt-1 font-medium bg-white/10 px-2 py-1 rounded inline-block">
                      Waktu berikutnya: {nextPrayer.name} - {nextPrayer.time}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="text-3xl md:text-4xl font-bold">
                  {currentTime}
                </div>
                <div className="text-sm text-white/90">
                  {currentDate}
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-sm hover:bg-white/30"
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
                <AlertCircle size={24} className="text-red-500" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {ramadhanInfo?.isRamadhan && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-amber-800 font-bold text-lg">Ramadhan {ramadhanInfo.hariKe}</p>
                  <p className="text-amber-600 text-sm">
                    {ramadhanInfo.bulanHijriyah} - {ramadhanInfo.tanggalHijriyah}
                  </p>
                </div>
              </div>
            )}

            {prayerSchedule.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {prayerSchedule.map((prayer, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-2xl p-4 text-center shadow hover:shadow-md hover:scale-105 transition border border-gray-100"
                  >
                    <div className="text-mu-green mb-3 flex justify-center">
                      {prayer.icon}
                    </div>
                    <h4 className="font-semibold text-sm md:text-base text-gray-700">
                      {prayer.name}
                    </h4>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                      {prayer.time}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Sunrise size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl text-gray-600">
                  Jadwal tidak tersedia
                </h3>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default JadwalSholatSection;