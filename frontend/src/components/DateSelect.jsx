import React, { useEffect, useMemo, useState } from "react";
import { Calendar, X } from "lucide-react";

const bulanList = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const hariList = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const formatDateKey = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => {
  if (!dateKey) return null;

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatTanggalIndo = (dateKey) => {
  if (!dateKey) return "Pilih tanggal";

  const date = parseDateKey(dateKey);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DateSelect = ({ value, onChange, className = "" }) => {
  const selectedDate = value ? parseDateKey(value) : new Date();

  const [showCalendar, setShowCalendar] = useState(false);
  const [mode, setMode] = useState("date");

  const [activeMonth, setActiveMonth] = useState(selectedDate.getMonth());
  const [activeYear, setActiveYear] = useState(selectedDate.getFullYear());

  const tahunSekarang = new Date().getFullYear();

  useEffect(() => {
    if (value) {
      const date = parseDateKey(value);
      setActiveMonth(date.getMonth());
      setActiveYear(date.getFullYear());
    }
  }, [value]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(activeYear, activeMonth, 1);
    const lastDay = new Date(activeYear, activeMonth + 1, 0);

    const startDayIndex = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonthLastDate = new Date(activeYear, activeMonth, 0).getDate();

    const days = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(activeYear, activeMonth - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(activeYear, activeMonth, day),
        isCurrentMonth: true,
      });
    }

    while (days.length < 42) {
      const nextDay = days.length - (startDayIndex + daysInMonth) + 1;

      days.push({
        date: new Date(activeYear, activeMonth + 1, nextDay),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [activeMonth, activeYear]);

  const handlePickDate = (dateKey) => {
    onChange(dateKey);
    setShowCalendar(false);
    setMode("date");
  };

  const handlePickMonth = (monthIndex) => {
    setActiveMonth(monthIndex);
    setMode("date");
  };

  const handlePickYear = (year) => {
    setActiveYear(year);
    setMode("month");
  };

  const todayKey = formatDateKey(new Date());

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setShowCalendar(true);
          setMode("date");
        }}
        className={`${className} text-left flex items-center justify-between gap-3`}
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {formatTanggalIndo(value)}
        </span>

        <Calendar size={18} className="text-gray-400 shrink-0" />
      </button>

      {showCalendar && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => {
              setShowCalendar(false);
              setMode("date");
            }}
          />

          <div className="relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
            <div className="p-6 bg-mu-green text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                  Pilih Tanggal
                </h3>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">
                  Pilih bulan dan tahun langsung
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCalendar(false);
                  setMode("date");
                }}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setMode("month")}
                  className={`py-4 rounded-2xl font-black uppercase text-xs transition-all ${
                    mode === "month"
                      ? "bg-mu-green text-white shadow-lg shadow-green-100"
                      : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-mu-green"
                  }`}
                >
                  {bulanList[activeMonth]}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("year")}
                  className={`py-4 rounded-2xl font-black uppercase text-xs transition-all ${
                    mode === "year"
                      ? "bg-mu-green text-white shadow-lg shadow-green-100"
                      : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-mu-green"
                  }`}
                >
                  {activeYear}
                </button>
              </div>

              {mode === "date" && (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {hariList.map((hari) => (
                      <div
                        key={hari}
                        className="h-9 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400"
                      >
                        {hari}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((item, index) => {
                      const dateKey = formatDateKey(item.date);
                      const isSelected = value === dateKey;
                      const isToday = todayKey === dateKey;

                      return (
                        <button
                          key={`${dateKey}-${index}`}
                          type="button"
                          onClick={() => handlePickDate(dateKey)}
                          className={`h-11 rounded-xl text-xs font-black transition-all active:scale-90 ${
                            isSelected
                              ? "bg-mu-green text-white shadow-lg shadow-green-100 scale-105"
                              : isToday
                                ? "bg-green-50 text-mu-green border border-mu-green/20"
                                : item.isCurrentMonth
                                  ? "text-gray-700 hover:bg-gray-50 hover:text-mu-green"
                                  : "text-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {item.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {mode === "month" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bulanList.map((bulan, index) => (
                    <button
                      key={bulan}
                      type="button"
                      onClick={() => handlePickMonth(index)}
                      className={`py-4 rounded-2xl font-black text-xs uppercase transition-all ${
                        activeMonth === index
                          ? "bg-mu-green text-white shadow-lg shadow-green-100"
                          : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-mu-green"
                      }`}
                    >
                      {bulan}
                    </button>
                  ))}
                </div>
              )}

              {mode === "year" && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                  {Array.from(
                    { length: 31 },
                    (_, i) => tahunSekarang - 20 + i
                  ).map((tahun) => (
                    <button
                      key={tahun}
                      type="button"
                      onClick={() => handlePickYear(tahun)}
                      className={`py-4 rounded-2xl font-black text-xs uppercase transition-all ${
                        activeYear === tahun
                          ? "bg-mu-green text-white shadow-lg shadow-green-100"
                          : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-mu-green"
                      }`}
                    >
                      {tahun}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 bg-mu-green/[0.03] border border-mu-green/10 p-4 rounded-2xl">
                <p className="text-[10px] text-mu-green font-black uppercase tracking-widest">
                  Tanggal Terpilih
                </p>
                <p className="text-sm text-gray-700 font-bold mt-1">
                  {formatTanggalIndo(value)}
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setShowCalendar(false);
                    setMode("date");
                  }}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
                >
                  Kosongkan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(false);
                    setMode("date");
                  }}
                  className="flex-[2] py-4 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelect;