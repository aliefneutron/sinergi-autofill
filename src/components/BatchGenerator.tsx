import { useState } from "react";
import { LaporanKinerja, StatusLaporan } from "../types";
import { DEFAULT_URAIAN_TUGAS, DETAIL_ITEMS_MAP, getDefaultDetailItem } from "../data";
import { Sparkles, Play, Calendar, Clock, Plus, Trash2, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, Info, FileText, Upload, Save, Bookmark } from "lucide-react";
import CalendarPicker from "./CalendarPicker";
import TimePicker from "./TimePicker";

interface BatchGeneratorProps {
  onSaveBatch: (reports: LaporanKinerja[]) => void;
  onClose: () => void;
}

interface Block {
  id: string;
  waktuMulai: string;
  waktuSelesai: string;
  uraianTugas: string;
  detailItemPekerjaan?: string;
  deskripsiPekerjaan: string;
  hasilPekerjaan: string;
  buktiDukungName?: string;
  buktiDukungBase64?: string;
}

interface Preset {
  id: string;
  name: string;
  deskripsi: string;
  hasil: string;
}

export default function BatchGenerator({ onSaveBatch, onClose }: BatchGeneratorProps) {
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  // New Modes
  const [mode, setMode] = useState<"MULTI_DAY" | "INSTANT_INTERVAL">("MULTI_DAY");
  const [instantGlobalStart, setInstantGlobalStart] = useState("07.30");
  const [instantGlobalEnd, setInstantGlobalEnd] = useState("15.30");
  const [instantDuration, setInstantDuration] = useState(60);
  const [instantUraianTugas, setInstantUraianTugas] = useState(DEFAULT_URAIAN_TUGAS[1]);
  const [instantDetailPekerjaan, setInstantDetailPekerjaan] = useState(getDefaultDetailItem(DEFAULT_URAIAN_TUGAS[1]));
  const [instantDeskripsi, setInstantDeskripsi] = useState("Melaksanakan perjalanan dinas daerah");
  const [instantHasil, setInstantHasil] = useState("Laporan hasil perjalanan dinas");

  // Presets
  const [savedPresets, setSavedPresets] = useState<Preset[]>(() => {
    try {
      const stored = localStorage.getItem("sinergi_presets");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to load presets", e);
    }
    return [];
  });

  const savePreset = () => {
    if (!instantDeskripsi.trim() || !instantHasil.trim()) {
      alert("Deskripsi dan Hasil Pekerjaan tidak boleh kosong!");
      return;
    }
    const presetName = prompt("Masukkan nama untuk template ini:", "Template Baru");
    if (!presetName) return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      deskripsi: instantDeskripsi,
      hasil: instantHasil
    };
    const newPresets = [...savedPresets, newPreset];
    setSavedPresets(newPresets);
    localStorage.setItem("sinergi_presets", JSON.stringify(newPresets));
    alert("Template berhasil disimpan!");
  };

  const deletePreset = (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;
    const newPresets = savedPresets.filter(p => p.id !== id);
    setSavedPresets(newPresets);
    localStorage.setItem("sinergi_presets", JSON.stringify(newPresets));
  };

  // Global Bukti Dukung Upload
  const [globalBuktiName, setGlobalBuktiName] = useState<string | undefined>(undefined);
  const [globalBuktiBase64, setGlobalBuktiBase64] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  // Daily block schedules
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "b1",
      waktuMulai: "07.30",
      waktuSelesai: "08.30",
      uraianTugas: "Melaksanakan Perjalanan Dinas Perjalanan, dinas dalam daerah",
      detailItemPekerjaan: "Persiapan dan keberangkatan menuju lokasi dinas",
      deskripsiPekerjaan: "Persiapan administrasi dan perjalanan menuju lokasi dinas daerah",
      hasilPekerjaan: "Keberangkatan dinas sesuai jadwal"
    },
    {
      id: "b2",
      waktuMulai: "08.30",
      waktuSelesai: "09.30",
      uraianTugas: "Melaksanakan Perjalanan Dinas Perjalanan, dinas dalam daerah",
      detailItemPekerjaan: "Melakukan koordinasi dengan instansi setempat",
      deskripsiPekerjaan: "Rapat koordinasi dan sinkronisasi data dengan instansi terkait di lokasi",
      hasilPekerjaan: "Terselenggaranya rapat koordinasi"
    },
    {
      id: "b3",
      waktuMulai: "09.30",
      waktuSelesai: "10.30",
      uraianTugas: "Melaksanakan Perjalanan Dinas Perjalanan, dinas dalam daerah",
      detailItemPekerjaan: "Meninjau lapangan dan pengumpulan data",
      deskripsiPekerjaan: "Survei lapangan dan observasi langsung terkait kegiatan dinas",
      hasilPekerjaan: "Data lapangan berhasil dihimpun"
    },
    {
      id: "b4",
      waktuMulai: "10.30",
      waktuSelesai: "11.30",
      uraianTugas: "Melaksanakan Perjalanan Dinas Perjalanan, dinas dalam daerah",
      detailItemPekerjaan: "Evaluasi hasil tinjauan dan pengolahan data awal",
      deskripsiPekerjaan: "Melakukan rekapitulasi dan evaluasi data hasil tinjauan lapangan",
      hasilPekerjaan: "Rekapitulasi data lapangan"
    },
    {
      id: "b5",
      waktuMulai: "11.30",
      waktuSelesai: "12.30",
      uraianTugas: "Melaksanakan Perjalanan Dinas Perjalanan, dinas dalam daerah",
      detailItemPekerjaan: "Penyusunan draf laporan dan perjalanan kembali",
      deskripsiPekerjaan: "Penyusunan laporan hasil dinas sementara dan perjalanan pulang",
      hasilPekerjaan: "Draf laporan perjalanan dinas daerah"
    }
  ]);

  // Preview generated reports before final save
  const [generatedReports, setGeneratedReports] = useState<LaporanKinerja[]>([]);
  const [step, setStep] = useState<"CONFIG" | "PREVIEW">("CONFIG");

  const addBlock = () => {
    const lastBlock = blocks[blocks.length - 1];
    let nextStart = "13.00";
    let nextEnd = "14.00";

    if (lastBlock) {
      // Calculate a reasonable subsequent slot (60 mins)
      const [endH, endM] = lastBlock.waktuSelesai.split(/[.:]/).map(Number);
      const startH = endH + 1;
      const finishH = startH + 1;
      if (startH < 15) {
        nextStart = `${String(startH).padStart(2, "0")}.00`;
        nextEnd = `${String(finishH).padStart(2, "0")}.00`;
      }
    }

    setBlocks([
      ...blocks,
      {
        id: `block-${Date.now()}`,
        waktuMulai: nextStart,
        waktuSelesai: nextEnd,
        uraianTugas: lastBlock ? lastBlock.uraianTugas : DEFAULT_URAIAN_TUGAS[1],
        detailItemPekerjaan: lastBlock ? lastBlock.detailItemPekerjaan : getDefaultDetailItem(DEFAULT_URAIAN_TUGAS[1]),
        deskripsiPekerjaan: "",
        hasilPekerjaan: ""
      }
    ]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) {
      alert("Minimal harus ada satu blok waktu aktivitas harian!");
      return;
    }
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const addMinutesToTimeStr = (timeStr: string, addMins: number): string => {
    const separator = timeStr.includes(':') ? ':' : '.';
    const parts = timeStr.split(separator);
    if (parts.length !== 2) return timeStr;
    
    let hours = parseInt(parts[0], 10);
    let mins = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(mins)) return timeStr;

    mins += addMins;
    hours += Math.floor(mins / 60);
    mins = mins % 60;
    hours = hours % 24;

    const hStr = hours.toString().padStart(2, '0');
    const mStr = mins.toString().padStart(2, '0');
    return `${hStr}${separator}${mStr}`;
  };

  const updateBlock = (id: string, key: keyof Block, value: string) => {
    setBlocks(blocks.map((b) => {
      if (b.id === id) {
        const updated = { ...b, [key]: value };
        // If uraianTugas changes, update detailItemPekerjaan to its default
        if (key === "uraianTugas") {
          updated.detailItemPekerjaan = getDefaultDetailItem(value);
        }
        // Auto-adjust waktuSelesai if waktuMulai changes
        if (key === "waktuMulai") {
          updated.waktuSelesai = addMinutesToTimeStr(value, 60);
        }
        return updated;
      }
      return b;
    }));
  };

  const handleBlockFileChange = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setBlocks(blocks.map(b => b.id === blockId ? { ...b, buktiDukungName: file.name, buktiDukungBase64: reader.result as string } : b));
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & Drop Upload Logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setGlobalBuktiName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setGlobalBuktiBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInstantGenerate = () => {
    if (!startDate || !endDate) {
      alert("Harap tentukan tanggal mulai dan tanggal selesai!");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      alert("Tanggal selesai tidak boleh mendahului tanggal mulai!");
      return;
    }

    const dates: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      const dayOfWeek = curr.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (!excludeWeekends || !isWeekend) {
        dates.push(curr.toISOString().split("T")[0]);
      }
      curr.setDate(curr.getDate() + 1);
    }
    if (dates.length === 0) {
      alert("Tidak ada hari kerja yang valid di rentang tanggal yang dipilih!");
      return;
    }

    const intervals: {start: string, end: string}[] = [];
    const [startH, startM] = instantGlobalStart.split(/[.:]/).map(Number);
    const [endH, endM] = instantGlobalEnd.split(/[.:]/).map(Number);
    
    let currentTotalMinutes = startH * 60 + (startM || 0);
    const endTotalMinutes = endH * 60 + (endM || 0);
    
    while (currentTotalMinutes < endTotalMinutes) {
      const sh = Math.floor(currentTotalMinutes / 60);
      const sm = currentTotalMinutes % 60;
      
      const nextTotalMinutes = currentTotalMinutes + instantDuration;
      const eh = Math.floor(nextTotalMinutes / 60);
      const em = nextTotalMinutes % 60;
      
      intervals.push({
        start: `${String(sh).padStart(2, '0')}.${String(sm).padStart(2, '0')}`,
        end: `${String(eh).padStart(2, '0')}.${String(em).padStart(2, '0')}`
      });
      
      currentTotalMinutes = nextTotalMinutes;
    }
    
    if (intervals.length === 0) {
      alert("Rentang waktu tidak valid atau durasi terlalu besar!");
      return;
    }

    const newReports: LaporanKinerja[] = [];
    for (const date of dates) {
      for (const interval of intervals) {
        newReports.push({
          id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tanggal: date,
          waktuMulai: interval.start,
          waktuSelesai: interval.end,
          uraianTugas: instantUraianTugas,
          detailItemPekerjaan: instantDetailPekerjaan,
          deskripsiPekerjaan: instantDeskripsi,
          hasilPekerjaan: instantHasil,
          buktiDukungName: globalBuktiName,
          buktiDukungBase64: globalBuktiBase64,
          dokumenLainnya: "",
          tautan: "",
          status: StatusLaporan.BELUM_DIPERIKSA
        });
      }
    }
    
    onSaveBatch(newReports);
  };

  // Run Batch AI generation
  const handleBatchGenerate = async () => {
    if (!startDate || !endDate) {
      alert("Harap tentukan tanggal mulai dan tanggal selesai!");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert("Tanggal selesai tidak boleh mendahului tanggal mulai!");
      return;
    }

    // List all dates
    const dates: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      const dayOfWeek = curr.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (!excludeWeekends || !isWeekend) {
        dates.push(curr.toISOString().split("T")[0]);
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (dates.length === 0) {
      alert("Tidak ada hari kerja yang valid di rentang tanggal yang dipilih!");
      return;
    }

    const tempReports: LaporanKinerja[] = [];

    for (const date of dates) {
      for (const block of blocks) {
        tempReports.push({
          id: `batch-${date}-${block.id}-${Date.now()}`,
          tanggal: date,
          waktuMulai: block.waktuMulai,
          waktuSelesai: block.waktuSelesai,
          uraianTugas: block.uraianTugas,
          detailItemPekerjaan: block.detailItemPekerjaan || block.uraianTugas,
          deskripsiPekerjaan: block.deskripsiPekerjaan,
          hasilPekerjaan: block.hasilPekerjaan,
          buktiDukungName: block.buktiDukungName || globalBuktiName,
          buktiDukungBase64: block.buktiDukungBase64 || globalBuktiBase64,
          dokumenLainnya: "",
          tautan: "",
          status: StatusLaporan.BELUM_DIPERIKSA
        });
      }
    }

    onSaveBatch(tempReports);
  };

  const handleImport = () => {
    onSaveBatch(generatedReports);
  };

  return (
    <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center rounded-t-3xl">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" /> BATCH GENERATOR
          </h2>
          <p className="text-xs text-white/80">
            Rencanakan & buat draf kinerja seminggu/sebulan penuh dalam sekali klik!
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="text-white hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold border border-white/25 transition-colors cursor-pointer disabled:opacity-50"
        >
          Tutup
        </button>
      </div>

      {isGenerating && (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 text-white">
          <RefreshCw className="w-12 h-12 text-white animate-spin" />
          <div className="space-y-1">
            <h3 className="font-bold text-white">Menghubungkan ke Gemini AI...</h3>
            <p className="text-xs text-white/80 max-w-sm">
              Sedang menyusun variasi kalimat yang realistis untuk setiap hari agar pengisian laporan harian bervariasi.
            </p>
          </div>
          <div className="w-64 bg-white/15 h-2 rounded-full overflow-hidden border border-white/20">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-white">{progress}% Selesai</span>
        </div>
      )}

      {!isGenerating && step === "CONFIG" && (
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-white">
            <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <p>
                <strong>Cara Kerja:</strong> Tentukan rentang hari kerja, lalu rancang pola jadwal kerja harian beserta deskripsi dan hasil pekerjaannya di bawah. 
                Sistem akan menyalin pola jadwal tersebut ke setiap hari secara instan, dengan secara otomatis mengeksklusi hari Sabtu-Minggu!
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex bg-white/10 p-1 rounded-xl w-fit mb-4 overflow-x-auto">
            <button
              type="button"
              onClick={() => setMode("MULTI_DAY")}
              className={`px-4 py-2 whitespace-nowrap rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mode === "MULTI_DAY" ? "bg-white text-indigo-700 shadow" : "text-white hover:bg-white/10"
              }`}
            >
              Mode Standar
            </button>
            <button
              type="button"
              onClick={() => setMode("INSTANT_INTERVAL")}
              className={`px-4 py-2 whitespace-nowrap rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                mode === "INSTANT_INTERVAL" ? "bg-white text-indigo-700 shadow" : "text-white hover:bg-white/10"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mode Instan
            </button>
          </div>

          {/* Config Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <CalendarPicker
                label="Tanggal Mulai"
                value={startDate}
                onChange={(d) => {
                  setStartDate(d);
                  if (new Date(endDate) < new Date(d)) {
                    setEndDate(d);
                  }
                }}
              />
            </div>
            <div>
              <CalendarPicker
                label="Tanggal Selesai"
                value={endDate}
                onChange={setEndDate}
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white font-bold">
                <input
                  type="checkbox"
                  checked={excludeWeekends}
                  onChange={(e) => setExcludeWeekends(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded border-white/30 bg-white/20 cursor-pointer"
                />
                Lompati Hari Sabtu & Minggu
              </label>
            </div>
          </div>

          {/* Blocks Configuration */}
          {mode !== "INSTANT_INTERVAL" ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Rancangan Blok Jadwal Harian Anda (Sequential)
                </h3>
                <button
                  type="button"
                  onClick={addBlock}
                  className="px-3 py-1.5 bg-white text-indigo-700 hover:bg-white/95 text-xs font-bold rounded-xl flex items-center gap-1 transition-transform cursor-pointer shadow-md"
                  title="Tambah Blok Waktu"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-750" /> Tambah
                </button>
              </div>

              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="bg-white/15 border border-white/20 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-md text-white"
                  >
                    {/* Number Badge */}
                    <div className="md:col-span-1 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-white/25 border border-white/30 font-mono text-xs font-black text-white flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>

                    {/* Start time */}
                    <div className="md:col-span-2">
                      <TimePicker
                        label="Mulai"
                        value={block.waktuMulai}
                        onChange={(t) => updateBlock(block.id, "waktuMulai", t)}
                        placement={index >= blocks.length - 2 && blocks.length > 3 ? "top" : "bottom"}
                      />
                    </div>

                    {/* End time */}
                    <div className="md:col-span-2">
                      <TimePicker
                        label="Selesai"
                        value={block.waktuSelesai}
                        onChange={(t) => updateBlock(block.id, "waktuSelesai", t)}
                        placement={index >= blocks.length - 2 && blocks.length > 3 ? "top" : "bottom"}
                      />
                    </div>

                    {/* Task details */}
                    <div className="md:col-span-3 space-y-1">
                      <span className="text-[10px] text-white/80 uppercase font-black">Uraian Tugas Utama & Sub</span>
                      <select
                        value={block.uraianTugas}
                        onChange={(e) => updateBlock(block.id, "uraianTugas", e.target.value)}
                        className={`w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none p-2 text-xs font-bold cursor-pointer appearance-none truncate ${
                          DETAIL_ITEMS_MAP[block.uraianTugas] && DETAIL_ITEMS_MAP[block.uraianTugas].length > 0 
                            ? "rounded-t-xl" 
                            : "rounded-xl"
                        }`}
                      >
                        {DEFAULT_URAIAN_TUGAS.map((u, i) => (
                          <option key={i} value={u} className="bg-slate-800 text-white font-sans text-xs">{u}</option>
                        ))}
                      </select>
                      {DETAIL_ITEMS_MAP[block.uraianTugas] && DETAIL_ITEMS_MAP[block.uraianTugas].length > 0 && (
                        <select
                          value={block.detailItemPekerjaan || ""}
                          onChange={(e) => updateBlock(block.id, "detailItemPekerjaan", e.target.value)}
                          className="w-full bg-white/30 text-slate-900 border-x border-b border-white/35 focus:border-white/50 focus:outline-none rounded-b-xl p-2 text-xs font-medium cursor-pointer"
                        >
                          {DETAIL_ITEMS_MAP[block.uraianTugas].map((opt) => (
                            <option key={opt} value={opt} className="bg-slate-800 text-white font-sans text-xs">
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Context / Keywords */}
                    <div className="md:col-span-3 space-y-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-white/80 uppercase font-black">Deskripsi Kerja</span>
                          <input
                            type="text"
                            value={block.deskripsiPekerjaan}
                            onChange={(e) => updateBlock(block.id, "deskripsiPekerjaan", e.target.value)}
                            className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2 text-xs font-medium"
                            placeholder="Masukkan deskripsi pekerjaan..."
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-white/80 uppercase font-black">Hasil Pekerjaan</span>
                          <input
                            type="text"
                            value={block.hasilPekerjaan}
                            onChange={(e) => updateBlock(block.id, "hasilPekerjaan", e.target.value)}
                            className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2 text-xs font-medium"
                            placeholder="Masukkan hasil pekerjaan..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete & Upload action */}
                    <div className="md:col-span-1 flex items-center justify-center pt-4 md:pt-0 gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          className={`p-1.5 border text-white rounded-xl transition-colors cursor-pointer ${block.buktiDukungBase64 ? "bg-emerald-500/20 hover:bg-emerald-500/35 border-emerald-500/35" : "bg-indigo-500/20 hover:bg-indigo-500/35 border-indigo-500/35"}`}
                          title="Upload bukti dukung untuk tugas ini"
                        >
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleBlockFileChange(block.id, e)}
                          />
                          {block.buktiDukungBase64 ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Upload className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/35 border border-red-500/35 text-white rounded-xl transition-colors cursor-pointer"
                        title="Hapus blok jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Konfigurasi Laporan Instan
              </h3>
              <div className="bg-white/15 border border-white/20 rounded-2xl p-4 md:p-6 grid grid-cols-1 gap-5 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TimePicker
                    label="Rentang Waktu Mulai (Global)"
                    value={instantGlobalStart}
                    onChange={setInstantGlobalStart}
                  />
                  <TimePicker
                    label="Rentang Waktu Selesai (Global)"
                    value={instantGlobalEnd}
                    onChange={setInstantGlobalEnd}
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/80 uppercase font-black">Durasi Tiap Laporan (Menit)</span>
                    <input
                      type="number"
                      value={instantDuration}
                      onChange={(e) => setInstantDuration(Number(e.target.value) || 60)}
                      className="w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2 text-xs font-bold"
                      min={10}
                      max={480}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-white/80 uppercase font-black">Uraian Tugas & Sub Tugas</span>
                  <select
                    value={instantUraianTugas}
                    onChange={(e) => {
                      setInstantUraianTugas(e.target.value);
                      setInstantDetailPekerjaan(getDefaultDetailItem(e.target.value));
                    }}
                    className={`w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none p-2.5 text-xs font-bold cursor-pointer ${
                      DETAIL_ITEMS_MAP[instantUraianTugas] && DETAIL_ITEMS_MAP[instantUraianTugas].length > 0 
                        ? "rounded-t-xl" 
                        : "rounded-xl"
                    }`}
                  >
                    {DEFAULT_URAIAN_TUGAS.map((u, i) => (
                      <option key={i} value={u} className="bg-slate-800 text-white font-sans text-xs">{u}</option>
                    ))}
                  </select>
                  {DETAIL_ITEMS_MAP[instantUraianTugas] && DETAIL_ITEMS_MAP[instantUraianTugas].length > 0 && (
                    <select
                      value={instantDetailPekerjaan}
                      onChange={(e) => setInstantDetailPekerjaan(e.target.value)}
                      className="w-full bg-white/30 text-slate-900 border-x border-b border-white/35 focus:border-white/50 focus:outline-none rounded-b-xl p-2.5 text-xs font-medium cursor-pointer"
                    >
                      {DETAIL_ITEMS_MAP[instantUraianTugas].map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-800 text-white font-sans text-xs">
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 bg-white/5 p-3 border border-white/10 rounded-xl flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase">Template Tersimpan:</span>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                      <select 
                        className="flex-1 md:w-64 bg-slate-800 text-white border border-white/20 rounded-lg p-2 text-xs font-medium focus:outline-none"
                        onChange={(e) => {
                          const preset = savedPresets.find(p => p.id === e.target.value);
                          if (preset) {
                            setInstantDeskripsi(preset.deskripsi);
                            setInstantHasil(preset.hasil);
                          }
                          // Reset select so it acts like an action
                          e.target.value = "";
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>-- Pilih Template --</option>
                        {savedPresets.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        {savedPresets.length === 0 && <option value="" disabled>Belum ada template</option>}
                      </select>
                      <button 
                        type="button"
                        onClick={savePreset}
                        className="bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 text-indigo-300 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap flex items-center gap-1.5"
                        title="Simpan input saat ini sebagai template"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Simpan
                      </button>
                      <button
                         type="button"
                         onClick={() => {
                           const activePreset = prompt("Ketik nama template yang ingin dihapus:\n" + savedPresets.map(p => p.name).join(", "));
                           const preset = savedPresets.find(p => p.name.toLowerCase() === activePreset?.toLowerCase());
                           if (preset) deletePreset(preset.id);
                         }}
                         disabled={savedPresets.length === 0}
                         className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-300 p-2 rounded-lg transition-colors disabled:opacity-50"
                         title="Hapus template tersimpan"
                      >
                         <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/80 uppercase font-black">Deskripsi Pekerjaan</span>
                    <textarea
                      value={instantDeskripsi}
                      onChange={(e) => setInstantDeskripsi(e.target.value)}
                      className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-3 text-xs font-medium resize-none h-24"
                      placeholder="Masukkan deskripsi statis untuk semua laporan..."
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/80 uppercase font-black">Kuantitas / Hasil Pekerjaan</span>
                    <textarea
                      value={instantHasil}
                      onChange={(e) => setInstantHasil(e.target.value)}
                      className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-3 text-xs font-medium resize-none h-24"
                      placeholder="Masukkan hasil pekerjaan statis..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* Action Footer */}
          <div className="pt-4 border-t border-white/20 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-xs text-white/90 font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Estimasi: {(() => {
                if (!startDate || !endDate) return 0;
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (end < start) return 0;
                let count = 0;
                const curr = new Date(start);
                while (curr <= end) {
                  const dayOfWeek = curr.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  if (!excludeWeekends || !isWeekend) count++;
                  curr.setDate(curr.getDate() + 1);
                }
                
                let blockCount = blocks.length;
                if (mode === "INSTANT_INTERVAL") {
                  const [startH, startM] = instantGlobalStart.split(/[.:]/).map(Number);
                  const [endH, endM] = instantGlobalEnd.split(/[.:]/).map(Number);
                  const duration = instantDuration || 60;
                  let m1 = startH * 60 + (startM || 0);
                  const m2 = endH * 60 + (endM || 0);
                  let tempC = 0;
                  while (m1 < m2) {
                    tempC++;
                    m1 += duration;
                  }
                  blockCount = tempC;
                }
                
                return (
                  <>
                    {count} Hari Kerja &times; {blockCount} Tugas
                  </>
                );
              })()}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={mode === "INSTANT_INTERVAL" ? handleInstantGenerate : handleBatchGenerate}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm bg-white text-indigo-700 hover:bg-white/95 font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer"
              >
                <Play className="w-4 h-4" /> Mulai
              </button>
            </div>
          </div>
        </div>
      )}

      {!isGenerating && step === "PREVIEW" && (
        <div className="p-6 space-y-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/25 border border-white/35 rounded-2xl p-4 gap-4 shadow-lg">
            <div className="flex gap-2.5 text-xs text-white leading-relaxed items-center">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <div>
                <p className="font-bold">Pembuatan Draf Kinerja Berhasil!</p>
                <p className="text-[11px] text-white/85">
                  Kami telah membuat <strong className="text-white">{generatedReports.length} laporan harian</strong> bervariasi dengan AI. 
                  Silakan periksa daftar draf di bawah sebelum mengimpor ke database riwayat utama Anda.
                </p>
              </div>
            </div>
            <button
              onClick={handleImport}
              className="px-5 py-2.5 bg-white hover:bg-white/95 text-indigo-755 font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer shrink-0"
            >
              Impor Semua ({generatedReports.length}) ke Riwayat
            </button>
          </div>

          {/* List of drafts */}
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
            {generatedReports.map((report, idx) => {
              let dateFormatted = report.tanggal;
              try {
                const d = new Date(report.tanggal);
                dateFormatted = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
              } catch (e) {}

              return (
                <div
                  key={report.id}
                  className="bg-white/15 border border-white/20 hover:border-white/30 rounded-2xl p-4 space-y-2 text-xs text-white shadow-md relative"
                >
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/80" /> {dateFormatted}
                    </span>
                    <span className="font-mono text-white/90 bg-white/10 border border-white/15 px-2 py-0.5 rounded text-[10px]">
                      {report.waktuMulai} - {report.waktuSelesai}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Uraian Tugas:</span>
                    <p className="font-bold text-white text-xs">{report.uraianTugas}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-yellow-300 font-bold block mb-1">DESKRIPSI PEKERJAAN (AI):</span>
                      <p className="text-[11px] text-white/95 italic">"{report.deskripsiPekerjaan}"</p>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-emerald-300 font-bold block mb-1">HASIL PEKERJAAN (AI):</span>
                      <p className="text-[11px] text-white/95 italic">"{report.hasilPekerjaan}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/20 flex justify-between">
            <button
              type="button"
              onClick={() => setStep("CONFIG")}
              className="px-5 py-2.5 text-xs bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Kembali & Atur Ulang
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-2.5 bg-white hover:bg-white/95 text-indigo-700 font-bold rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
            >
              Simpan Semua ke Riwayat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
