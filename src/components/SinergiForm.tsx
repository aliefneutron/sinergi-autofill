import React, { useState, useEffect } from "react";
import { LaporanKinerja, StatusLaporan } from "../types";
import { DEFAULT_URAIAN_TUGAS, DETAIL_ITEMS_MAP, getDefaultDetailItem } from "../data";
import { Sparkles, Save, Clock, Calendar, Check, AlertCircle, RefreshCw, Upload, FileText, ChevronRight } from "lucide-react";
import CalendarPicker from "./CalendarPicker";
import TimePicker from "./TimePicker";

interface SinergiFormProps {
  onSave: (laporan: LaporanKinerja) => void;
  onClose: () => void;
  initialData?: LaporanKinerja | null;
}

export default function SinergiForm({ onSave, onClose, initialData }: SinergiFormProps) {
  const [tanggal, setTanggal] = useState("");
  const [waktuMulai, setWaktuMulai] = useState("07:30");
  const [waktuSelesai, setWaktuSelesai] = useState("09:00");
  const [uraianTugas, setUraianTugas] = useState(DEFAULT_URAIAN_TUGAS[1]); // Default to "Melaksanakan tugas lain sesuai perintah atasan"
  const [detailItemPekerjaan, setDetailItemPekerjaan] = useState("");
  const [deskripsiPekerjaan, setDeskripsiPekerjaan] = useState("");
  const [hasilPekerjaan, setHasilPekerjaan] = useState("");
  
  // File Upload
  const [buktiDukungName, setBuktiDukungName] = useState<string | undefined>(undefined);
  const [buktiDukungBase64, setBuktiDukungBase64] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  // AI states
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiVariations, setAiVariations] = useState<{ deskripsi: string; hasil: string }[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number | null>(null);

  // Initialize form with initialData if editing
  useEffect(() => {
    if (initialData) {
      setTanggal(initialData.tanggal);
      setWaktuMulai(initialData.waktuMulai);
      setWaktuSelesai(initialData.waktuSelesai);
      setUraianTugas(initialData.uraianTugas);
      setDetailItemPekerjaan(initialData.detailItemPekerjaan);
      setDeskripsiPekerjaan(initialData.deskripsiPekerjaan);
      setHasilPekerjaan(initialData.hasilPekerjaan);
      setBuktiDukungName(initialData.buktiDukungName);
      setBuktiDukungBase64(initialData.buktiDukungBase64);
    } else {
      // Set to current date as default
      const today = new Date().toISOString().split("T")[0];
      setTanggal(today);
    }
  }, [initialData]);

  // Set default detail item when Uraian Tugas changes
  useEffect(() => {
    if (!initialData) {
      setDetailItemPekerjaan(getDefaultDetailItem(uraianTugas));
    }
  }, [uraianTugas, initialData]);

  // Handle AI generation
  const handleAiGenerate = async () => {
    setIsGenerating(true);
    setAiError(null);
    setSelectedVariationIndex(null);

    try {
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uraianTugas,
          context: context || detailItemPekerjaan,
          count: 3
        }),
      });

      const data = await res.json();
      if (res.ok && data.variations && data.variations.length > 0) {
        setAiVariations(data.variations);
        // Automatically pre-select first variation
        setDeskripsiPekerjaan(data.variations[0].deskripsi);
        setHasilPekerjaan(data.variations[0].hasil);
        setSelectedVariationIndex(0);
      } else {
        throw new Error(data.error || "Gagal mendapatkan variasi AI.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Gagal menyambungkan ke server AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Drag and Drop handlers
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
    setBuktiDukungName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBuktiDukungBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !waktuMulai || !waktuSelesai || !uraianTugas || !deskripsiPekerjaan || !hasilPekerjaan) {
      alert("Harap lengkapi semua isian bertanda bintang (*)");
      return;
    }

    const report: LaporanKinerja = {
      id: initialData?.id || `rep-${Date.now()}`,
      tanggal,
      waktuMulai,
      waktuSelesai,
      uraianTugas,
      detailItemPekerjaan,
      deskripsiPekerjaan,
      hasilPekerjaan,
      status: initialData?.status || StatusLaporan.BELUM_DIPERIKSA,
      buktiDukungName,
      buktiDukungBase64
    };

    onSave(report);
  };

  return (
    <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            {initialData ? "EDIT LAPORAN KINERJA" : "INPUT KINERJA HARIAN"}
          </h2>
          <p className="text-xs text-white/80">
            Formulir pengisian aktivitas kerja harian (Replika SINERGI V2)
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold border border-white/25 transition-colors cursor-pointer"
        >
          Kembali
        </button>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Date and Time selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <CalendarPicker
              label="Tanggal Pelaksanaan *"
              value={tanggal}
              onChange={(date) => setTanggal(date)}
            />
          </div>

          {/* Start Time */}
          <div>
            <TimePicker
              label="Jam Mulai *"
              value={waktuMulai}
              onChange={(time) => setWaktuMulai(time)}
              minTime="07.30"
            />
          </div>

          {/* End Time */}
          <div>
            <TimePicker
              label="Jam Selesai *"
              value={waktuSelesai}
              onChange={(time) => setWaktuSelesai(time)}
              maxTime="15.30"
            />
          </div>
        </div>

        {/* Uraian Tugas Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Uraian Tugas Pokok *
          </label>
          <select
            value={uraianTugas}
            onChange={(e) => setUraianTugas(e.target.value)}
            className="w-full bg-white/40 text-slate-950 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-3 text-sm font-medium cursor-pointer"
          >
            {DEFAULT_URAIAN_TUGAS.map((item) => (
              <option key={item} value={item} className="bg-slate-800 text-white font-sans text-xs">
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Detail Item Pekerjaan Preset Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Detail Item Pekerjaan (Sub-tugas)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] text-white/90 font-bold block">Pilih dari rekomendasi instansi:</span>
              <select
                value={detailItemPekerjaan}
                onChange={(e) => setDetailItemPekerjaan(e.target.value)}
                className="w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2.5 text-xs font-medium cursor-pointer"
              >
                {(DETAIL_ITEMS_MAP[uraianTugas] || []).map((item) => (
                  <option key={item} value={item} className="bg-slate-800 text-white font-sans">
                    {item}
                  </option>
                ))}
                <option value="" className="bg-slate-800 text-white italic">-- Ketik Kustom --</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-white/90 font-bold block">Atau ketik kustom detail pekerjaan:</span>
              <input
                type="text"
                placeholder="Misal: Penyusunan berkas kenaikan pangkat sub-bidang"
                value={detailItemPekerjaan}
                onChange={(e) => setDetailItemPekerjaan(e.target.value)}
                className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2.5 text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* AI Helper Generator Section */}
        <div className="bg-white/20 border border-white/25 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                DENGAN GEMINI AI: GENERATOR PARAGRAF KINERJA
              </h4>
              <p className="text-[11px] text-white/85">
                Tulis deskripsi & hasil pekerjaan bervariasi otomatis agar tidak terlihat repetitif di e-Kinerja
              </p>
            </div>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleAiGenerate}
              className="px-3 py-1.5 text-xs bg-white hover:bg-white/90 text-indigo-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> Sedang Menghasilkan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" /> Generasikan Deskripsi
                </>
              )}
            </button>
          </div>

          {/* Context Input */}
          <div className="space-y-1">
            <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">
              Beri Konteks Kegiatan Spesifik (Opsional, agar AI membuat hasil kustom):
            </span>
            <input
              type="text"
              placeholder="Misal: Ke kantor BKN Surabaya mengantarkan SK PNS, atau koordinasi rapat evaluasi..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-white/40 text-slate-900 placeholder-slate-600 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-2 text-xs font-medium"
            />
          </div>

          {/* AI Variations List */}
          {aiVariations.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/20">
              <span className="text-[10px] text-white/80 font-extrabold block uppercase tracking-wider">PILIH VARIASI PARAGRAF HASIL AI:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {aiVariations.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDeskripsiPekerjaan(v.deskripsi);
                      setHasilPekerjaan(v.hasil);
                      setSelectedVariationIndex(i);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-[11px] flex flex-col justify-between transition-all cursor-pointer ${
                      selectedVariationIndex === i
                        ? "bg-white/35 border-white text-white shadow-md"
                        : "bg-white/10 border-white/20 hover:border-white/35 text-white/90"
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-white block mb-1">Pilihan #{i + 1}</span>
                      <p className="line-clamp-3 mb-2 font-semibold italic">"{v.deskripsi}"</p>
                    </div>
                    <div className="pt-1.5 border-t border-white/20 text-[10px] text-white/80">
                      <strong>Hasil:</strong> <span className="line-clamp-1">{v.hasil}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiError && (
            <div className="text-xs text-white bg-amber-500/20 border border-amber-500/30 rounded-lg p-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-200" />
              <span>{aiError} (Menggunakan data cadangan luring otomatis)</span>
            </div>
          )}
        </div>

        {/* Written Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deskripsi Pekerjaan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex justify-between">
              <span>Deskripsi Pekerjaan *</span>
              <span className="text-[10px] text-white/80 italic">Diawali kata kerja aktif</span>
            </label>
            <textarea
              required
              rows={4}
              value={deskripsiPekerjaan}
              onChange={(e) => setDeskripsiPekerjaan(e.target.value)}
              placeholder="Jelaskan detail aktivitas kerja harian yang dilakukan hari ini..."
              className="w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-3 text-xs leading-relaxed font-medium placeholder-slate-700"
            />
          </div>

          {/* Hasil Pekerjaan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex justify-between">
              <span>Hasil Pekerjaan *</span>
              <span className="text-[10px] text-white/80 italic">Diawali kata benda</span>
            </label>
            <textarea
              required
              rows={4}
              value={hasilPekerjaan}
              onChange={(e) => setHasilPekerjaan(e.target.value)}
              placeholder="Tulis hasil/output konkret dari pekerjaan di atas..."
              className="w-full bg-white/40 text-slate-900 border border-white/35 focus:border-white/50 focus:outline-none rounded-xl p-3 text-xs leading-relaxed font-medium placeholder-slate-700"
            />
          </div>
        </div>

        {/* Supporting Evidence File Upload */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white uppercase tracking-wider block">
            Unggah Bukti Dukung (PDF/Gambar, Maks 2MB)
          </label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging
                ? "border-white bg-white/30"
                : buktiDukungName
                ? "border-white/60 bg-white/20"
                : "border-white/30 hover:border-white/50 bg-white/10"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full">
              {buktiDukungName ? (
                <>
                  <FileText className="w-8 h-8 text-white" />
                  <span className="text-xs font-bold text-white mt-2">{buktiDukungName}</span>
                  <span className="text-[10px] text-white/80 mt-1">
                    Seret berkas baru atau klik untuk mengganti dokumen pendukung
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/60" />
                  <span className="text-xs font-bold text-white mt-2">
                    Tarik & Lepas file bukti di sini, atau cari berkas...
                  </span>
                  <span className="text-[10px] text-white/70 mt-1">
                    Mendukung format PDF, PNG, JPG hingga 2MB
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-white/25 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-sm bg-white text-indigo-700 hover:bg-white/95 font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {initialData ? "Simpan Perubahan" : "Kirim Laporan Kinerja"}
          </button>
        </div>
      </form>
    </div>
  );
}
