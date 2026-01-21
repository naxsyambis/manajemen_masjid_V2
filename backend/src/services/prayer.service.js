const axios = require("axios");

const BASE_URL = "https://api.myquran.com/v3/sholat";
const DEFAULT_KOTA_ID = "9b04d152845ec0a378394003c96da594";

exports.getTodayPrayerSchedule = async (kotaId = DEFAULT_KOTA_ID) => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const period = `${year}-${month}-${day}`;

  const url = `${BASE_URL}/jadwal/${kotaId}/${period}`;

  const response = await axios.get(url, {
    headers: { Accept: "application/json" },
  });

  const data = response.data?.data;
  if (!data || !data.jadwal) {
    throw new Error("Data jadwal tidak tersedia");
  }


  const todaySchedule = data.jadwal[period];
  if (!todaySchedule) {
    throw new Error("Jadwal hari ini tidak ditemukan");
  }

  const prayerTimes = [
    { name: "Subuh", time: todaySchedule.subuh },
    { name: "Dzuhur", time: todaySchedule.dzuhur },
    { name: "Ashar", time: todaySchedule.ashar },
    { name: "Maghrib", time: todaySchedule.maghrib },
    { name: "Isya", time: todaySchedule.isya },
  ];

  let nextPrayer = null;

  for (const prayer of prayerTimes) {
    if (!prayer.time) continue;

    const [hour, minute] = prayer.time.split(":").map(Number);

    const prayerDate = new Date();
    prayerDate.setHours(hour, minute, 0, 0);

    if (prayerDate > now) {
      const diff = prayerDate - now;

      nextPrayer = {
        name: prayer.name,
        time: prayer.time,
        remaining: {
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        },
      };
      break;
    }
  }

  return {
    lokasi: `${data.kabko}, ${data.prov}`,
    tanggal: period,
    jadwal: todaySchedule, 
    nextPrayer,
  };
};
