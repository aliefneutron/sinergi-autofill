import React, { useState } from "react";
import { LaporanKinerja, StatusLaporan } from "../types";
import { Copy, Edit, Trash, Plus, Search, Calendar, ChevronDown, Check, FileText, Download, Upload, Trash2 } from "lucide-react";

interface SinergiHistoryProps {
  reports: LaporanKinerja[];
  onAddClick: () => void;
  onEditClick: (report: LaporanKinerja) => void;
  onDeleteClick: (id: string) => void;
  onClearAllClick: (ids?: string[]) => void;
  onImportBackup: (imported: LaporanKinerja[]) => void;
}

const MONTHS = [
  "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
  "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
];

const YEARS = ["2024", "2025", "2026", "2027"];

export default function SinergiHistory({
  reports,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onClearAllClick,
  onImportBackup
}: SinergiHistoryProps) {
  const today = new Date();
  const currentMonthName = MONTHS[today.getMonth()];
  const currentYearStr = String(today.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Auto-switch filter to the latest report's month and year if a new report is added or loaded
  React.useEffect(() => {
    if (reports && reports.length > 0) {
      const latestReport = reports[0];
      try {
        const d = new Date(latestReport.tanggal);
        if (!isNaN(d.getTime())) {
          const mIdx = d.getMonth();
          const latestMonth = MONTHS[mIdx];
          const latestYear = String(d.getFullYear());
          
          if (latestMonth && MONTHS.includes(latestMonth)) {
            setSelectedMonth(latestMonth);
          }
          if (latestYear && YEARS.includes(latestYear)) {
            setSelectedYear(latestYear);
          }
        }
      } catch (e) {
        console.error("Gagal mendeteksi tanggal laporan terbaru:", e);
      }
    }
  }, [reports]);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    // Date filter: check if report matches selected month and year
    // report.tanggal is YYYY-MM-DD
    let reportMonthStr = "";
    let reportYearStr = "";
    try {
      const d = new Date(report.tanggal);
      const mIdx = d.getMonth();
      reportMonthStr = MONTHS[mIdx];
      reportYearStr = String(d.getFullYear());
    } catch (e) {}

    const matchesMonth = selectedMonth ? reportMonthStr === selectedMonth : true;
    const matchesYear = selectedYear ? reportYearStr === selectedYear : true;

    // Search query filter
    const matchesSearch = searchQuery
      ? report.uraianTugas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.deskripsiPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.detailItemPekerjaan.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesMonth && matchesYear && matchesSearch;
  }).sort((a, b) => {
    if (a.tanggal !== b.tanggal) {
      return a.tanggal.localeCompare(b.tanggal);
    }
    return a.waktuMulai.localeCompare(b.waktuMulai);
  });

  // Download payload as JSON file
  const handleDownloadPayload = () => {
    if (filteredReports.length === 0) {
      alert("Tidak ada laporan yang ditampilkan untuk diunduh!");
      return;
    }
    try {
      const cleanPayload = filteredReports.map(({ id, tanggal, waktuMulai, waktuSelesai, uraianTugas, detailItemPekerjaan, deskripsiPekerjaan, hasilPekerjaan, buktiDukungBase64, buktiDukungName }) => ({
        id, tanggal, waktuMulai, waktuSelesai, uraianTugas, detailItemPekerjaan, deskripsiPekerjaan, hasilPekerjaan, buktiDukungBase64, buktiDukungName
      }));
      
      const jsonStr = JSON.stringify(cleanPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const dlAnchorElem = document.createElement("a");
      dlAnchorElem.setAttribute("href", url);
      dlAnchorElem.setAttribute("download", `sinergi-payload-${selectedMonth}-${selectedYear}.json`);
      dlAnchorElem.click();
      
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mengunduh payload:", err);
    }
  };

  // Export full JSON file
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reports, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `sinergi-v2-backup-${new Date().toISOString().split("T")[0]}.json`);
    dlAnchorElem.click();
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert(`Berhasil mengimpor ${parsed.length} laporan kinerja!`);
        } else {
          alert("Format file tidak valid!");
        }
      } catch (err) {
        alert("Gagal membaca file JSON!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-white rounded-full inline-block" />
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              RIWAYAT <span className="text-yellow-200">KINERJA</span>
            </h1>
          </div>
          <p className="text-xs text-white/80">
            Pantau dan kelola seluruh catatan aktivitas harian Anda.
          </p>
        </div>

        {/* Buttons and Selection filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Add report button */}
          <button
            onClick={onAddClick}
            className="px-5 py-2.5 bg-white text-indigo-700 hover:bg-white/95 font-bold rounded-xl text-xs flex items-center gap-2 transition-transform hover:-translate-y-0.5 shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> TAMBAH LAPORAN
          </button>

          {/* Month selector */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-white/20 text-white border border-white/20 focus:border-white/40 focus:outline-none rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold cursor-pointer"
            >
              <option value="" className="text-slate-900">Semua Bulan</option>
              {MONTHS.map((m) => (
                <option key={m} value={m} className="text-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white absolute right-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Year selector */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white/20 text-white border border-white/20 focus:border-white/40 focus:outline-none rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold cursor-pointer"
            >
              <option value="" className="text-slate-900">Semua Tahun</option>
              {YEARS.map((y) => (
                <option key={y} value={y} className="text-slate-900">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white absolute right-3.5 top-3.5 pointer-events-none" />
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Cari aktivitas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white/40 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium"
            />
            <Search className="w-4 h-4 text-white/70 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      {/* Copy payload bar */}
      {filteredReports.length > 0 && (
        <div className="bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shadow-lg">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🚀 UNDUH FILE PAYLOAD UNTUK ASISTEN OTOMATISASI</span>
            </h4>
            <p className="text-[11px] text-white/80">
              Mengekspor <span className="text-white font-bold">{filteredReports.length} dari {reports.length}</span> laporan kerja bulan {selectedMonth} {selectedYear} sebagai file payload siap unggah.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            {/* Download Payload Button (Recommended Primary) */}
            <button
              onClick={handleDownloadPayload}
              className="px-4 py-2 text-xs font-black bg-white text-indigo-700 rounded-lg hover:bg-white/95 transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-md shadow-indigo-500/10 cursor-pointer border border-white"
            >
              <Download className="w-4 h-4" /> Unduh File Payload (.json)
            </button>

            {/* Backups buttons */}
            <button
              onClick={handleExportBackup}
              title="Ekspor sebagai berkas JSON cadangan penuh"
              className="px-3 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg transition-colors flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Backup App
            </button>

            <label className="px-3 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg transition-colors flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Import App
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            {confirmClearAll ? (
              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 p-1.5 rounded-lg w-full sm:w-auto justify-center">
                <span className="text-[10px] font-black text-red-200 uppercase tracking-wider pl-1">Hapus semua?</span>
                <button
                  onClick={() => {
                    const idsToRemove = filteredReports.map(r => r.id);
                    onClearAllClick(idsToRemove);
                    setConfirmClearAll(false);
                  }}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded cursor-pointer"
                >
                  Ya
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                title="Bersihkan semua data"
                className="px-3 py-2 text-xs font-bold bg-red-500/20 hover:bg-red-500/35 border border-red-500/35 text-white rounded-lg transition-colors flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reports Table Replica */}
      <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-xl">
        {filteredReports.length === 0 ? (
          // Empty State - matches Image 1 exactly!
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white/60">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white/70 tracking-widest uppercase">
                TIDAK ADA DATA RIWAYAT
              </h3>
              <p className="text-xs text-white/60 max-w-xs">
                Silakan tambahkan laporan baru atau gunakan generator otomatis di tab atas.
              </p>
            </div>
          </div>
        ) : (
          // Table layout
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-white/10 text-white font-bold border-b border-white/15 uppercase tracking-wider text-[10px]">
                  <th className="p-4 w-48">TANGGAL & WAKTU</th>
                  <th className="p-4">DETAIL PEKERJAAN</th>
                  <th className="p-4 w-40 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredReports.map((report) => {
                  let dateFormatted = report.tanggal;
                  try {
                    const d = new Date(report.tanggal);
                    dateFormatted = d.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    });
                  } catch (e) {}

                  return (
                    <tr key={report.id} className="hover:bg-white/10 transition-colors">
                      {/* Tanggal & Waktu */}
                      <td className="p-4 align-top space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-white/60" />
                          {dateFormatted}
                        </div>
                        <div className="font-mono text-white/90 bg-white/10 border border-white/15 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]">
                          {report.waktuMulai} - {report.waktuSelesai}
                        </div>
                      </td>

                      {/* Detail Pekerjaan */}
                      <td className="p-4 align-top space-y-2 max-w-xl">
                        {/* Uraian Tugas Header */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-yellow-300 font-bold block uppercase tracking-wider">
                            {report.uraianTugas}
                          </span>
                          <span className="text-white font-bold text-xs block">
                            {report.detailItemPekerjaan}
                          </span>
                        </div>

                        {/* Description & Results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 space-y-1">
                            <span className="text-[10px] text-white/60 font-extrabold uppercase tracking-wide block">
                              Deskripsi:
                            </span>
                            <p className="text-white/95 leading-relaxed italic text-[11px]">
                              "{report.deskripsiPekerjaan}"
                            </p>
                          </div>
                          <div className="bg-white/10 border border-white/10 rounded-lg p-2.5 space-y-1">
                            <span className="text-[10px] text-white/60 font-extrabold uppercase tracking-wide block">
                              Hasil:
                            </span>
                            <p className="text-white/95 leading-relaxed italic text-[11px]">
                              "{report.hasilPekerjaan}"
                            </p>
                          </div>
                        </div>

                        {/* Attached Evidence Badge */}
                        {report.buktiDukungName && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/20">
                            📎 Bukti: {report.buktiDukungName}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">

                          <button
                            onClick={() => onEditClick(report)}
                            title="Edit laporan harian"
                            className="w-full sm:w-auto px-2 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/20 transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === report.id ? (
                            <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/40 p-1 rounded-lg">
                              <button
                                onClick={() => {
                                  onDeleteClick(report.id);
                                  setConfirmDeleteId(null);
                                }}
                                title="Yakin Hapus"
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[9px] font-black rounded cursor-pointer"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                title="Batal Hapus"
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[9px] font-bold rounded cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(report.id)}
                              title="Hapus laporan harian"
                              className="w-full sm:w-auto px-2 py-1.5 bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
