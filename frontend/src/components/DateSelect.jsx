import React from "react";

const bulanList = [
  ["01", "Januari"],
  ["02", "Februari"],
  ["03", "Maret"],
  ["04", "April"],
  ["05", "Mei"],
  ["06", "Juni"],
  ["07", "Juli"],
  ["08", "Agustus"],
  ["09", "September"],
  ["10", "Oktober"],
  ["11", "November"],
  ["12", "Desember"],
];

const getDaysInMonth = (tahun, bulan) => {
  if (!tahun || !bulan) return 31;
  return new Date(Number(tahun), Number(bulan), 0).getDate();
};

const DateSelect = ({ value, onChange, className = "" }) => {
  const tahunSekarang = new Date().getFullYear();

  const tahun = value?.slice(0, 4) || "";
  const bulan = value?.slice(5, 7) || "";
  const tanggal = value?.slice(8, 10) || "";

  const updateDate = (newTahun, newBulan, newTanggal) => {
    const finalTahun = newTahun || tahunSekarang;
    const finalBulan = newBulan || "01";
    const jumlahHari = getDaysInMonth(finalTahun, finalBulan);
    const finalTanggal = Number(newTanggal || tanggal || "01") > jumlahHari
      ? String(jumlahHari).padStart(2, "0")
      : newTanggal || tanggal || "01";

    onChange(`${finalTahun}-${finalBulan}-${finalTanggal}`);
  };

  const jumlahHari = getDaysInMonth(tahun || tahunSekarang, bulan || "01");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <select
        value={tahun}
        onChange={(e) => updateDate(e.target.value, bulan, tanggal)}
        className={className}
      >
        <option value="">Pilih Tahun</option>
        {Array.from({ length: 21 }, (_, i) => tahunSekarang - 10 + i).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select
        value={bulan}
        onChange={(e) => updateDate(tahun, e.target.value, tanggal)}
        className={className}
      >
        <option value="">Pilih Bulan</option>
        {bulanList.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={tanggal}
        onChange={(e) => updateDate(tahun, bulan, e.target.value)}
        className={className}
      >
        <option value="">Pilih Tanggal</option>
        {Array.from({ length: jumlahHari }, (_, i) => String(i + 1).padStart(2, "0")).map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DateSelect;