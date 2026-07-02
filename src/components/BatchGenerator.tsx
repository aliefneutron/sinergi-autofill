import { useState } from "react";
import { LaporanKinerja, StatusLaporan } from "../types";
import { DEFAULT_URAIAN_TUGAS } from "../data";
import { Sparkles, Play, Calendar, Clock, Plus, Trash2, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, Info } from "lucide-react";
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
  context: string;
}

export default function BatchGenerator({ onSaveBatch, onClose }: BatchGeneratorProps) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay() + 1); // Set to this week's Monday
    return today.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - today.getDay() + 5); // Set to this week's Friday
    return today.toISOString().split("T")[0];
  });

  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  // Daily block schedules
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "b1",
      waktuMulai: "07.30",
      waktuSelesai: "09.00",
      uraianTugas: "Upacara / Apel",
      context: "Mengikuti Apel Pagi kedisiplinan rutin serta mendengarkan arahan pimpinan"
    },
    {
      id: "b2",
      waktuMulai: "09.30",
      waktuSelesai: "11.30",
      uraianTugas: "Melaksanakan tugas lain sesuai perintah atasan",
      context: "Verifikasi berkas persyaratan kenaikan pangkat PNS"
    },
    {
      id: "b3",
      waktuMulai: "13.00",
      waktuSelesai: "15.30",
      uraianTugas: "Melaksanakan tugas lain",
      context: "Merapikan arsip fisik kepegawaian ASN purna tugas"
    }
  ]);

  // Preview generated reports before final save
  const [generatedReports, setGeneratedReports] = useState<LaporanKinerja[]>([]);
  const [step, setStep] = useState<"CONFIG" | "PREVIEW">("CONFIG");

  const addBlock = () => {
    const lastBlock = blocks[blocks.length - 1];
    let nextStart = "13.00";
    let nextEnd = "15.30";

    if (lastBlock) {
      // Calculate a reasonable subsequent slot
      const [endH, endM] = lastBlock.waktuSelesai.split(/[.:]/).map(Number);
      const startH = endH + 1;
      const finishH = startH + 2;
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
        uraianTugas: DEFAULT_URAIAN_TUGAS[1],
        context: ""
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

  const updateBlock = (id: string, key: keyof Block, value: string) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, [key]: value } : b))
    );
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

    setIsGenerating(true);
    setProgress(0);
    const total = dates.length * blocks.length;
    setTotalTasks(total);

    const tempReports: LaporanKinerja[] = [];
    let processedCount = 0;

    for (const date of dates) {
      for (const block of blocks) {
        try {
          // Hit the Gemini generation API with context
          const res = await fetch("/api/gemini/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uraianTugas: block.uraianTugas,
              context: block.context || undefined,
              count: 1 // We only need 1 per day block
            })
          });

          const data = await res.json();
          const variation = data.variations?.[0] || {
            deskripsi: `Mengerjakan aktivitas terkait ${block.uraianTugas}.`,
            hasil: `Terlaksananya kegiatan ${block.uraianTugas}.`
          };

          tempReports.push({
            id: `batch-${date}-${block.id}-${Date.now()}`,
            tanggal: date,
            waktuMulai: block.waktuMulai,
            waktuSelesai: block.waktuSelesai,
            uraianTugas: block.uraianTugas,
            detailItemPekerjaan: block.context || block.uraianTugas,
            deskripsiPekerjaan: variation.deskripsi,
            hasilPekerjaan: variation.hasil,
            status: StatusLaporan.BELUM_DIPERIKSA
          });
        } catch (err) {
          console.error("Gagal men-generate aktivitas:", err);
          // Fallback static templates safely if API breaks
          tempReports.push({
            id: `batch-${date}-${block.id}-${Date.now()}`,
            tanggal: date,
            waktuMulai: block.waktuMulai,
            waktuSelesai: block.waktuSelesai,
            uraianTugas: block.uraianTugas,
            detailItemPekerjaan: block.context || block.uraianTugas,
            deskripsiPekerjaan: `Melaksanakan kegiatan harian untuk tupoksi ${block.uraianTugas} secara tertib dan disiplin.`,
            hasilPekerjaan: `Laporan kegiatan ${block.uraianTugas} terdokumentasi.`,
            status: StatusLaporan.BELUM_DIPERIKSA
          });
        }
        processedCount++;
        setProgress(Math.round((processedCount / total) * 100));
      }
    }

    setGeneratedReports(tempReports);
    setStep("PREVIEW");
    setIsGenerating(false);
  };

  const handleImport = () => {
    onSaveBatch(generatedReports);
  };

  return (
    <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" /> BATCH GENERATOR AI
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
                <strong>Cara Kerja:</strong> Tentukan rentang hari kerja, lalu rancang pola jadwal kerja harian Anda di bawah. 
                AI kami akan melayari rentang tanggal tersebut, mengeksklusi hari Sabtu-Minggu, dan menggunakan Gemini 
                untuk membuat kalimat deskripsi yang unik & berbeda-beda setiap harinya!
              </p>
            </div>
          </div>

          {/* Config Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <CalendarPicker
                label="Tanggal Mulai"
                value={startDate}
                onChange={setStartDate}
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
                  className="w-4 h-4 accent-indigo-600 rounded border-white/30 bg-white/20"
                />
                Lompati Hari Sabtu & Minggu
              </label>
            </div>
          </div>

          {/* Pattern blocks creator */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Rancangan Blok Jadwal Harian Anda (Sequential)
              </h3>
              <button
                type="button"
                onClick={addBlock}
                className="px-3 py-1.5 bg-white text-indigo-700 hover:bg-white/95 text-xs font-bold rounded-xl flex items-center gap-1 transition-transform cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-750" /> Tambah Blok Waktu
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
                    />
                  </div>

                  {/* End time */}
                  <div className="md:col-span-2">
                    <TimePicker
                      label="Selesai"
                      value={block.waktuSelesai}
                      onChange={(t) => updateBlock(block.id, "waktuSelesai", t)}
                    />
                  </div>

                  {/* Uraian Tugas */}
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] text-white/80 uppercase font-black">Uraian Tugas</span>
                    <select
                      value={block.uraianTugas}
                      onChange={(e) => updateBlock(block.id, "uraianTugas", e.target.value)}
                      className="w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2 text-xs font-medium cursor-pointer"
                    >
                      {DEFAULT_URAIAN_TUGAS.map((item) => (
                        <option key={item} value={item} className="bg-slate-800 text-white font-sans text-xs">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Context / Keywords */}
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-[10px] text-white/80 uppercase font-black">Konteks / Kata Kunci</span>
                    <input
                      type="text"
                      placeholder="Misal: verifikasi berkas usulan cuti..."
                      value={block.context}
                      onChange={(e) => updateBlock(block.id, "context", e.target.value)}
                      className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2 text-xs font-medium"
                    />
                  </div>

                  {/* Delete action */}
                  <div className="md:col-span-1 flex items-center justify-center pt-4 md:pt-0">
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

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleBatchGenerate}
              className="px-6 py-2.5 rounded-xl text-sm bg-white text-indigo-700 hover:bg-white/95 font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Mulai Batch AI Generator
            </button>
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
