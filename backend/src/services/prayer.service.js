const axios = require("axios");
const dayjs = require("dayjs");

const LATITUDE = -7.796667;
const LONGITUDE = 110.363889;

const METHOD = 99;
const FAJR_ANGLE = 20;
const ISHA_ANGLE = 18;

// ===============================
// TUNE (Disesuaikan Jadwal Resmi DIY 1447 H)
// Format:
// Imsak,Fajr,Sunrise,Dhuhr,Asr,Maghrib,Sunset,Isha,Midnight
// ===============================
const TUNE = "-11,-11,-3,2,2,3,0,14,0";

exports.getTodayPrayer = async () => {

  const today = dayjs().format("DD-MM-YYYY");

  const response = await axios.get(
    `https://api.aladhan.com/v1/timings/${today}`,
    {
      params: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        method: METHOD,
        fajrAngle: FAJR_ANGLE,
        ishaAngle: ISHA_ANGLE,
        school: 0,
        latitudeAdjustmentMethod: 3,
        tune: TUNE,
        adjustment: 0
      }
    }
  );

  const data = response.data.data;
  const timings = data.timings;
  const hijri = data.date.hijri;

  const jadwal = {
    lokasi: "Kabupaten Bantul",
    tanggal: data.date.gregorian.date,

    sholat5Waktu: {
      subuh: cleanTime(timings.Fajr),
      dzuhur: cleanTime(timings.Dhuhr),
      ashar: cleanTime(timings.Asr),
      maghrib: cleanTime(timings.Maghrib),
      isya: cleanTime(timings.Isha)
    },

    pemisah: "---------------------",

    ramadhan: {
      isRamadhan: hijri.month.number === 9,
      bulanHijriyah: hijri.month.en,
      tanggalHijriyah: hijri.date,
      hariKe: hijri.month.number === 9 ? Number(hijri.day) : null,
      imsak: cleanTime(timings.Imsak),
      terbit: cleanTime(timings.Sunrise)
    }
  };

  return addNextPrayer(jadwal);
};

function cleanTime(timeString) {
  return timeString.split(" ")[0];
}


function addNextPrayer(jadwal) {

  const now = dayjs();

  const prayers = [
    { name: "Subuh", time: jadwal.sholat5Waktu.subuh },
    { name: "Dzuhur", time: jadwal.sholat5Waktu.dzuhur },
    { name: "Ashar", time: jadwal.sholat5Waktu.ashar },
    { name: "Maghrib", time: jadwal.sholat5Waktu.maghrib },
    { name: "Isya", time: jadwal.sholat5Waktu.isya }
  ];

  for (const prayer of prayers) {

    const prayerTime = dayjs(
      `${now.format("YYYY-MM-DD")} ${prayer.time}`
    );

    if (now.isBefore(prayerTime)) {

      const diff = prayerTime.diff(now, "second");

      return {
        ...jadwal,
        nextPrayer: {
          nama: prayer.name,
          sisa: {
            jam: Math.floor(diff / 3600),
            menit: Math.floor((diff % 3600) / 60),
            detik: diff % 60
          }
        }
      };
    }
  }

  return {
    ...jadwal,
    nextPrayer: {
      nama: "Subuh",
      sisa: "Menunggu hari berikutnya"
    }
  };
}