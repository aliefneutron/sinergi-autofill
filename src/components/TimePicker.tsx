import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value: string; // "HH.MM" or "HH:MM"
  onChange: (time: string) => void;
  label?: string;
  minTime?: string;
  maxTime?: string;
}

const PRESETS = [
  "07.30", "08.00", "08.30", "09.00", "09.30", "10.00", "10.30",
  "11.00", "11.30", "12.00", "12.30", "13.00", "13.30", "14.00",
  "14.30", "15.00", "15.30", "16.00", "16.30"
];

const HOURS = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16"];
const MINUTES = ["00", "15", "30", "45"];

export default function TimePicker({ value, onChange, label, minTime, maxTime }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state for input editing
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format time properly (ensure colon or dots are consistent, default is dot)
  const cleanAndFormatTime = (str: string) => {
    const clean = str.replace(/[^0-9.:]/g, "");
    if (!clean) return "";
    
    // Convert to dot separator for Sinergi
    let formatted = clean.replace(":", ".");
    return formatted;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(cleanAndFormatTime(val));
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    setInputValue(preset);
    setIsOpen(false);
  };

  // Extract hours and minutes from current value
  const parts = value.split(/[.:]/);
  const currentHour = parts[0] || "07";
  const currentMin = parts[1] || "30";

  const handleSelectHour = (hr: string) => {
    const newTime = `${hr}.${currentMin}`;
    onChange(newTime);
    setInputValue(newTime);
  };

  const handleSelectMin = (min: string) => {
    const newTime = `${currentHour}.${min}`;
    onChange(newTime);
    setInputValue(newTime);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <span className="block text-xs font-bold text-white mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-white/80" /> {label}
        </span>
      )}

      <div className="flex rounded-xl bg-white/40 border border-white/35 focus-within:border-white/50 focus-within:ring-1 focus-within:ring-white/20 overflow-hidden transition-all shadow-inner">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="07.30"
          className="w-full bg-transparent text-slate-900 focus:outline-none p-2.5 text-sm font-semibold placeholder-slate-700/60 border-none"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 hover:bg-white/10 text-slate-800 border-l border-white/25 flex items-center justify-center cursor-pointer transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {minTime && !isOpen && (
        <span className="absolute right-2.5 -bottom-5 text-[9px] text-white/80 font-bold tracking-wider">
          Min: {minTime}
        </span>
      )}
      {maxTime && !isOpen && (
        <span className="absolute right-2.5 -bottom-5 text-[9px] text-white/80 font-bold tracking-wider">
          Max: {maxTime}
        </span>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Hour & Minute Selector Grid */}
            <div className="space-y-3 pr-2 border-r border-slate-100">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Jam</span>
                <div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto pr-1">
                  {HOURS.map((hr) => {
                    const isSelected = currentHour === hr;
                    return (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => handleSelectHour(hr)}
                        className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {hr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Menit</span>
                <div className="grid grid-cols-2 gap-1">
                  {MINUTES.map((min) => {
                    const isSelected = currentMin === min;
                    return (
                      <button
                        key={min}
                        type="button"
                        onClick={() => handleSelectMin(min)}
                        className={`py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {min}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Quick Preset Options */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Preset Cepat</span>
              <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                {PRESETS.map((preset) => {
                  const isSelected = value === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`py-1 px-2 text-left text-xs font-bold rounded-md transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/85 text-emerald-700 border border-emerald-200/50"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="border-t border-slate-100 mt-3 pt-2.5 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 tracking-wide uppercase cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
