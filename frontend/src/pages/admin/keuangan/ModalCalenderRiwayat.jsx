import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  X,
  Calendar,
  FileDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  RotateCcw
} from 'lucide-react';

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const formatDateKey = (date) => {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Belum dipilih';

  const date = parseDate(dateString);

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;

  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';

  const Icon = isSuccess
    ? CheckCircle2
    : isError
      ? XCircle
      : isWarning
        ? AlertTriangle
        : Info;

  const iconClass = isSuccess
    ? 'bg-green-100 text-green-600'
    : isError
      ? 'bg-red-100 text-red-600'
      : isWarning
        ? 'bg-yellow-100 text-yellow-600'
        : 'bg-blue-100 text-blue-600';

  const buttonClass = isSuccess
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : isError
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : isWarning
        ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green'
        : 'bg-mu-green hover:bg-green-700 text-white';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}>
            <Icon size={42} strokeWidth={2.5} />
          </div>

          <h3 className="text-2xl font-black text-gray-800 leading-tight">
            {alertData.title || 'Informasi'}
          </h3>

          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">
            {alertData.message || '-'}
          </p>

          <button
            type="button"
            onClick={onClose}
            className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const RangeCalendar = ({ startDate, endDate, onSelectDate }) => {
  const initialDate = startDate ? parseDate(startDate) : new Date();

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const calendarDays = useMemo(() => {
    const firstDate = new Date(currentYear, currentMonth, 1);
    const lastDate = new Date(currentYear, currentMonth + 1, 0);

    const firstDayIndex = firstDate.getDay();
    const totalDays = lastDate.getDate();

    const previousMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, previousMonthLastDate - i),
        currentMonth: false
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push({
        date: new Date(currentYear, currentMonth, day),
        currentMonth: true
      });
    }

    const nextDays = 42 - days.length;

    for (let day = 1; day <= nextDays; day++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, day),
        currentMonth: false
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const start = startDate ? parseDate(startDate) : null;
  const end = endDate ? parseDate(endDate) : null;
  const todayKey = formatDateKey(new Date());

  const getDayClass = (date, isCurrentMonth) => {
    const dateKey = formatDateKey(date);

    const isStart = startDate === dateKey;
    const isEnd = endDate === dateKey;
    const isToday = todayKey === dateKey;

    const isInRange =
      start &&
      end &&
      date >= start &&
      date <= end;

    if (isStart && isEnd) {
      return 'bg-mu-green text-white shadow-lg shadow-green-100 scale-105';
    }

    if (isStart) {
      return 'bg-mu-green text-white shadow-lg shadow-green-100 scale-105 rounded-r-md';
    }

    if (isEnd) {
      return 'bg-mu-green text-white shadow-lg shadow-green-100 scale-105 rounded-l-md';
    }

    if (isInRange) {
      return 'bg-mu-green/10 text-mu-green rounded-md';
    }

    if (isToday) {
      return 'bg-green-50 text-mu-green border border-mu-green/20';
    }

    if (!isCurrentMonth) {
      return 'text-gray-200 hover:bg-gray-50';
    }

    return 'text-gray-600 hover:bg-gray-50 hover:text-mu-green';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/40 overflow-hidden">
      <div className="p-5 border-b border-gray-50 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mu-green" />
              Pilih Periode
            </p>

            <p className="mt-2 text-sm font-black text-gray-800">
              {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-mu-green/10 text-mu-green flex items-center justify-center">
            <Calendar size={22} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-mu-green hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft size={22} className="mx-auto" />
          </button>

          <div className="text-center">
            <h4 className="text-base font-black text-gray-800 uppercase tracking-tight">
              {monthNames[currentMonth]}
            </h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {currentYear}
            </p>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-mu-green hover:text-white transition-all active:scale-95"
          >
            <ChevronRight size={22} className="mx-auto" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-9 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((item) => {
            const dateKey = formatDateKey(item.date);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(dateKey)}
                className={`h-11 rounded-xl text-xs font-black transition-all active:scale-90 ${getDayClass(
                  item.date,
                  item.currentMonth
                )}`}
              >
                {item.date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-green-50/60 border border-green-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-mu-green">
              Tanggal Awal
            </p>
            <p className="mt-1 text-xs font-bold text-gray-600">
              {formatDisplayDate(startDate)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Tanggal Akhir
            </p>
            <p className="mt-1 text-xs font-bold text-gray-600">
              {formatDisplayDate(endDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalCalenderRiwayat = ({ show, onClose, onExport }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [alertData, setAlertData] = useState({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  if (!show) return null;

  const showPopup = ({ type = 'info', title = 'Informasi', message = '' }) => {
    setAlertData({
      show: true,
      type,
      title,
      message
    });
  };

  const closePopup = () => {
    setAlertData({
      show: false,
      type: 'info',
      title: '',
      message: ''
    });
  };

  const handleSelectDate = (dateKey) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateKey);
      setEndDate('');
      return;
    }

    if (startDate && !endDate) {
      if (new Date(dateKey) < new Date(startDate)) {
        setEndDate(startDate);
        setStartDate(dateKey);
      } else {
        setEndDate(dateKey);
      }
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleExportClick = () => {
    if (!startDate || !endDate) {
      showPopup({
        type: 'warning',
        title: 'Tanggal Belum Lengkap',
        message: 'Silakan pilih tanggal awal dan tanggal akhir laporan.'
      });
      return;
    }

    onExport(startDate, endDate);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <AlertPopup alertData={alertData} onClose={closePopup} />

      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md animate-fadeIn"
        onClick={onClose}
      />

      <div className="relative z-[100000] bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-gray-100 animate-scaleIn overflow-hidden">
        <div className="p-8 bg-mu-green text-white flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
              Export Laporan
            </h3>

            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-2">
              Klik tanggal awal lalu klik tanggal akhir
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <X size={24} />
          </button>

          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="p-6 md:p-8 space-y-8 max-h-[82vh] overflow-y-auto no-scrollbar">
          <RangeCalendar
            startDate={startDate}
            endDate={endDate}
            onSelectDate={handleSelectDate}
          />

          <div className="bg-mu-green/[0.03] border border-mu-green/10 p-5 rounded-[1.5rem] flex items-start gap-4">
            <div className="p-2 bg-mu-green/10 rounded-xl text-mu-green shrink-0">
              <AlertCircle size={20} />
            </div>

            <div>
              <p className="text-sm text-gray-600 font-bold leading-relaxed">
                Klik satu tanggal sebagai awal periode, lalu klik tanggal kedua sebagai akhir periode.
              </p>

              <p className="text-xs text-gray-400 font-bold mt-1">
                Periode aktif: {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all active:scale-95"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-mu-green transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <RotateCcw size={18} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleExportClick}
              className="flex-[2] py-5 bg-mu-green text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FileDown size={20} />
              Download Laporan
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  );
};

export default ModalCalenderRiwayat;