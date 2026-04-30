const axios = require("axios");
const dayjs = require("dayjs");

const LATITUDE = -7.796667;
const LONGITUDE = 110.363889;

const METHOD = 99;
const FAJR_ANGLE = 20;
const ISHA_ANGLE = 18;

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
    imsak: cleanTime(timings.Imsak),
    subuh: cleanTime(timings.Fajr),
    terbit: cleanTime(timings.Sunrise),
    dzuhur: cleanTime(timings.Dhuhr),
    ashar: cleanTime(timings.Asr),
    maghrib: cleanTime(timings.Maghrib),
    isya: cleanTime(timings.Isha)
  };

  const nextPrayer = getNextPrayer(jadwal);

  return {
    lokasi: "Kabupaten Bantul",
    tanggal: data.date.gregorian.date,
    jadwal,          
    nextPrayer,      
    ramadhan: {
      isRamadhan: hijri.month.number === 9,
      bulanHijriyah: hijri.month.en,
      tanggalHijriyah: hijri.date,
      hariKe: hijri.month.number === 9 ? Number(hijri.day) : null,
      imsak: cleanTime(timings.Imsak),
      terbit: cleanTime(timings.Sunrise)
    }
  };
};

function cleanTime(timeString) {
  return timeString.split(" ")[0];
}

function getNextPrayer(jadwal) {
  const now = dayjs();

  const prayers = [
    { name: "Imsak", time: jadwal.imsak },
    { name: "Subuh", time: jadwal.subuh },
    { name: "Terbit", time: jadwal.terbit },
    { name: "Dzuhur", time: jadwal.dzuhur },
    { name: "Ashar", time: jadwal.ashar },
    { name: "Maghrib", time: jadwal.maghrib },
    { name: "Isya", time: jadwal.isya }
  ];

  for (const prayer of prayers) {
    const prayerTime = dayjs(`${now.format("YYYY-MM-DD")} ${prayer.time}`);

    if (now.isBefore(prayerTime)) {
      return {
        name: prayer.name,
        time: prayer.time
      };
    }
  }

  return {
    name: "Imsak",
    time: jadwal.imsak
  };
}