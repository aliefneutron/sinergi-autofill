import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const WEEK_DAYS = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"];

export default function CalendarPicker({ value, onChange, label }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsedDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(parsedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(parsedDate.getMonth()); // 0-indexed

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  // Handle outside clicks to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for display (e.g., "1 Jul 2026" or "01-07-2026")
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "Pilih Tanggal";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Days in month calculations
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, etc. Adjust so Monday is index 0
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarCells = [];
  // Empty spaces for preceding month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-8 w-8" />);
  }

  // Active days
  const selectedDayNum = value && new Date(value).getFullYear() === currentYear && new Date(value).getMonth() === currentMonth 
    ? new Date(value).getDate() 
    : null;

  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDayNum === day;
    calendarCells.push(
      <button
        key={`day-${day}`}
        type="button"
        onClick={() => handleSelectDay(day)}
        className={`h-8 w-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
          isSelected
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold scale-110"
            : "text-slate-800 hover:bg-slate-100 hover:text-emerald-700"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <span className="block text-xs font-bold text-white mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-white/80" /> {label}
        </span>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/40 hover:bg-white/50 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2.5 text-sm font-semibold transition-all shadow-inner text-left"
      >
        <span className="truncate">{formatDateDisplay(value)}</span>
        <CalendarIcon className="w-4 h-4 text-slate-800 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-slate-800 tracking-tight">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEK_DAYS.map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
            {calendarCells}
          </div>

          {/* Footer quick selector */}
          <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const todayStr = new Date().toISOString().split("T")[0];
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 tracking-wide uppercase cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-slate-500 hover:text-slate-700 tracking-wide uppercase cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
