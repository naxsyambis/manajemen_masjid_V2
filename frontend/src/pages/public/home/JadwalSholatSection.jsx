import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Pastikan axios terinstall

const JadwalSholatSection = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [prayerSchedule, setPrayerSchedule] = useState([]);
  const [lokasi, setLokasi] = useState('Yogyakarta & Sekitarnya');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari backend
  useEffect(() => {
    const fetchPrayerSchedule = async () => {
      try {
        const response = await axios.get('http://localhost:3000/public/jadwal-sholat?kota_id=9b04d152845ec0a378394003c96da594'); // Gunakan URL lengkap dengan kota_id
        const data = response.data.data; // Akses data dari response
        setLokasi(data.lokasi);
        setPrayerSchedule([
          { name: "Subuh", time: data.jadwal.subuh, icon: "🌅" },
          { name: "Dzuhur", time: data.jadwal.dzuhur, icon: "☀️" },
          { name: "Ashar", time: data.jadwal.ashar, icon: "🌤️" },
          { name: "Maghrib", time: data.jadwal.maghrib, icon: "🌇" },
          { name: "Isya", time: data.jadwal.isya, icon: "🌙" },
        ]);
        setNextPrayer(data.nextPrayer);
        setError(null);
      } catch (err) {
        console.error('Error fetching prayer schedule:', err);
        setError('Gagal memuat jadwal sholat. Silakan coba lagi.');
        // Hapus fallback, biarkan array kosong jika gagal
        setPrayerSchedule([]);
      } finally {
        setLoading(false);
      }
    };
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

  if (loading) {
    return (
      <section className="relative z-10 mt-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-8 text-center">
            <div className="w-12 h-12 border-4 border-[#235347] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat jadwal sholat...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 mt-10">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#163832] via-[#235347] to-[#8eb69b] text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl text-2xl">⏰</div>
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
              <div className="text-center md:text-right">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">{currentTime}</div>
                <div className="text-sm text-white/90 mt-1">{currentDate}</div>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {prayerSchedule.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="prayerGrid">
                {prayerSchedule.map((prayer, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-[#daf1de]/40 to-white rounded-2xl p-5 text-center shadow-md hover:from-[#163832] hover:to-[#235347] hover:text-white transition-all duration-500 hover:scale-105 border border-gray-100 cursor-pointer"
                  >
                    <div className="text-3xl mb-3">{prayer.icon}</div>
                    <h4 className="font-semibold text-lg mb-1">{prayer.name}</h4>
                    <p className="text-2xl font-bold">{prayer.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600">Jadwal sholat tidak tersedia.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JadwalSholatSection;