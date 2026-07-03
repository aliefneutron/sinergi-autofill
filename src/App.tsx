import { useState, useEffect } from "react";
import { LaporanKinerja, StatusLaporan, UserProfile } from "./types";
import { SAMPLE_LAPORAN } from "./data";
import SinergiHistory from "./components/SinergiHistory";
import SinergiForm from "./components/SinergiForm";
import BatchGenerator from "./components/BatchGenerator";
import BookmarkletGuide from "./components/BookmarkletGuide";
import { Sparkles, Calendar, Clock, Zap, User, Settings, CheckCircle, ListTodo, Plus, HelpCircle, Save, Award, Quote } from "lucide-react";

export default function App() {
  const [reports, setReports] = useState<LaporanKinerja[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nama: "AKHMAD HOLILI FAUZAN",
    nip: "19900101 202001 1 001",
    jabatan: "PENGOLAH DATA DAN INFORMASI",
    unitKerja: "BKPSDM KABUPATEN SUMENEP"
  });

  const [activeTab, setActiveTab] = useState<"BERANDA" | "BATCH" | "RIWAYAT" | "OTOMATISASI">("BERANDA");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LaporanKinerja | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load initial reports from localStorage, or populate sample ones
  useEffect(() => {
    const saved = localStorage.getItem("sinergi_reports");
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        setReports(SAMPLE_LAPORAN);
      }
    } else {
      setReports(SAMPLE_LAPORAN);
      localStorage.setItem("sinergi_reports", JSON.stringify(SAMPLE_LAPORAN));
    }

    const savedProfile = localStorage.getItem("sinergi_profile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {}
    }
  }, []);

  // Save reports to localStorage on change
  const saveReports = (newReports: LaporanKinerja[]) => {
    setReports(newReports);
    localStorage.setItem("sinergi_reports", JSON.stringify(newReports));
  };

  // Save profile to localStorage on change
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem("sinergi_profile", JSON.stringify(updatedProfile));
    setIsProfileOpen(false);
  };

  // Add / Edit Report
  const handleSaveReport = (report: LaporanKinerja) => {
    const exists = reports.some((r) => r.id === report.id);
    let newReports: LaporanKinerja[];
    if (exists) {
      newReports = reports.map((r) => (r.id === report.id ? report : r));
    } else {
      newReports = [report, ...reports];
    }
    saveReports(newReports);
    setIsFormOpen(false);
    setEditingReport(null);
  };

  // Save batch generated reports
  const handleSaveBatch = (batchReports: LaporanKinerja[]) => {
    const newReports = [...batchReports, ...reports];
    saveReports(newReports);
    setActiveTab("RIWAYAT");
  };

  // Delete Report
  const handleDeleteReport = (id: string) => {
    const newReports = reports.filter((r) => r.id !== id);
    saveReports(newReports);
  };

  // Clear all data or specific subset
  const handleClearAll = (idsToRemove?: string[]) => {
    if (idsToRemove && idsToRemove.length > 0) {
      const newReports = reports.filter((r) => !idsToRemove.includes(r.id));
      saveReports(newReports);
    } else {
      saveReports([]);
    }
  };

  // Import Backup Data
  const handleImportBackup = (imported: LaporanKinerja[]) => {
    saveReports(imported);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Upper Navigation Bar */}
      <header className="bg-white/10 sticky top-0 z-50 backdrop-blur-xl border-b border-white/20 px-4 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg border border-white/20">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-white text-base tracking-wider uppercase">SINERGI V2</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/30">HELPER</span>
              </div>
              <span className="text-[10px] text-white/70 uppercase tracking-widest font-extrabold block mt-0.5">
                KAB. SUMENEP
              </span>
            </div>
          </div>

          {/* Navigation Items (matches original layout style) */}
          <nav className="flex flex-wrap justify-center items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab("BERANDA"); setIsFormOpen(false); }}
              className={`px-4 py-2 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
                activeTab === "BERANDA" && !isFormOpen
                  ? "bg-white/20 text-white border border-white/25 shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              BERANDA
            </button>
            <button
              onClick={() => { setActiveTab("BATCH"); setIsFormOpen(false); }}
              className={`px-4 py-2 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
                activeTab === "BATCH" && !isFormOpen
                  ? "bg-white/20 text-white border border-white/25 shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              BATCH GENERATOR
            </button>
            <button
              onClick={() => { setActiveTab("RIWAYAT"); setIsFormOpen(false); }}
              className={`px-4 py-2 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
                activeTab === "RIWAYAT" && !isFormOpen
                  ? "bg-white/20 text-white border border-white/25 shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              RIWAYAT
            </button>
            <button
              onClick={() => { setActiveTab("OTOMATISASI"); setIsFormOpen(false); }}
              className={`px-4 py-2 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
                activeTab === "OTOMATISASI" && !isFormOpen
                  ? "bg-white/20 text-white border border-white/25 shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              OTOMATISASI
            </button>
          </nav>

          {/* Profile Quick Widget */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center justify-between w-full sm:w-auto gap-3 bg-white/15 hover:bg-white/20 p-1.5 pl-3 pr-2.5 rounded-xl border border-white/20 shadow-md transition-all cursor-pointer text-left"
            title="Atur Profil Saya"
          >
            <div className="leading-none flex-1 overflow-hidden">
              <span className="font-bold text-white text-[11px] sm:text-xs block truncate">{userProfile.nama}</span>
              <span className="text-[9px] sm:text-[10px] text-white/75 font-semibold block mt-1 truncate">{userProfile.jabatan}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/25 text-white flex items-center justify-center border border-white/30 shrink-0">
              <User className="w-4 h-4" />
            </div>
          </button>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Form Slideover or Full Screen view */}
        {isFormOpen ? (
          <SinergiForm
            onSave={handleSaveReport}
            onClose={() => {
              setIsFormOpen(false);
              setEditingReport(null);
            }}
            initialData={editingReport}
          />
        ) : (
          /* Active Tabs Layout */
          <div className="space-y-6">
            {activeTab === "BERANDA" && (
              <div className="space-y-6">
                {/* Hero / Overview Welcome Widget */}
                <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/25">
                      <Sparkles className="w-3.5 h-3.5" /> Berdaya dengan Google Gemini 3.5
                    </span>
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none md:text-4xl uppercase">
                      PENGINPUT OTOMATIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">SINERGI V2</span>
                    </h1>
                    <p className="text-sm text-white/90 leading-relaxed">
                      Selamat datang di asisten cerdas untuk mempermudah, menstrukturkan, dan mengotomatiskan 
                      pengisian laporan e-Kinerja harian di situs <strong className="text-white">BKPSDM Kabupaten Sumenep</strong>. 
                      Buat variasi kalimat deskripsi kerja harian dengan AI dan kirim otomatis dengan satu klik!
                    </p>
                    
                    {/* Fast Action Buttons */}
                    <div className="flex flex-col sm:flex-row w-full gap-2 pt-2">
                      <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex-1 px-2 py-2.5 bg-white text-indigo-700 hover:bg-white/95 font-bold rounded-xl text-[11px] sm:text-xs leading-snug transition-all shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
                      >
                        + Tambah Laporan Tunggal
                      </button>
                      <button
                        onClick={() => setActiveTab("BATCH")}
                        className="flex-1 px-2 py-2.5 bg-white/25 hover:bg-white/35 border border-white/20 text-white font-bold rounded-xl text-[11px] sm:text-xs leading-snug transition-colors cursor-pointer text-center"
                      >
                        ⚡ Batch Generator
                      </button>
                      <button
                        onClick={() => setActiveTab("OTOMATISASI")}
                        className="flex-1 px-2 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl text-[11px] sm:text-xs leading-snug transition-colors cursor-pointer text-center"
                      >
                        Fitur Premium Otomatisasi
                      </button>
                    </div>
                  </div>
                </div>
                {/* Motivation Quote Box */}
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg relative overflow-hidden text-white">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/25 text-white font-bold">
                    <Quote className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-white font-bold italic text-base md:text-lg leading-relaxed tracking-wide shadow-black/10 drop-shadow-sm">
                      "Barangsiapa yang Memudahkan Urusan Orang yang Kesusahan Allah Akan Mudahkan Urusannya di Dunia dan Akhirat"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] w-12 bg-white/40" />
                      <span className="text-[10px] md:text-xs text-white/60 font-black tracking-widest uppercase">
                        HR. MUSLIM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Reports Stat */}
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 shadow-lg text-white">
                    <div className="w-12 h-12 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold">
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/60 uppercase font-black tracking-widest block">Total Laporan</span>
                      <span className="text-2xl font-black text-white mt-1 block">{reports.length} Item</span>
                    </div>
                  </div>

                  {/* Date Today Stat */}
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 shadow-lg text-white">
                    <div className="w-12 h-12 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/60 uppercase font-black tracking-widest block">Tanggal Sekarang</span>
                      <span className="text-xs font-black text-white mt-1 block">
                        {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Active Profile Stat */}
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex items-center gap-4 shadow-lg text-white">
                    <div className="w-12 h-12 rounded-lg bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/60 uppercase font-black tracking-widest block">Unit Kerja</span>
                      <span className="text-xs font-bold text-white mt-1 block truncate max-w-56">{userProfile.unitKerja}</span>
                    </div>
                  </div>
                </div>

                {/* Automation Quick Start Flow */}
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4 shadow-xl text-white">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-300" /> ALUR CEPAT AUTOMATION INPUT SINERGI V2
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-white/80 leading-relaxed">
                    <div className="space-y-1.5 p-4 bg-white/10 rounded-xl border border-white/10 shadow-sm">
                      <span className="font-bold text-white block text-sm">1. Set Profil Saya</span>
                      <p>Sesuaikan NIP & Nama Jabatan Anda di tombol pojok kanan atas agar sesuai dengan akun asli.</p>
                    </div>
                    <div className="space-y-1.5 p-4 bg-white/10 rounded-xl border border-white/10 shadow-sm">
                      <span className="font-bold text-white block text-sm">2. Generator AI</span>
                      <p>Gunakan generator seminggu penuh atau ketik satu per satu. AI menghasilkan uraian kerja baku.</p>
                    </div>
                    <div className="space-y-1.5 p-4 bg-white/10 rounded-xl border border-white/10 shadow-sm">
                      <span className="font-bold text-white block text-sm">3. Unduh Payload</span>
                      <p>Setelah laporan tersimpan, masuk ke <strong className="text-white">Riwayat / Sinergi</strong> dan unduh file payload (.json).</p>
                    </div>
                    <div className="space-y-1.5 p-4 bg-white/10 rounded-xl border border-white/10 shadow-sm">
                      <span className="font-bold text-white block text-sm">4. Otomatisasi Form</span>
                      <p>Buka e-Kinerja BKPSDM Sumenep, gunakan asisten Tampermonkey/Ekstensi, lalu unggah payload (.json).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "BATCH" && (
              <BatchGenerator
                onSaveBatch={handleSaveBatch}
                onClose={() => setActiveTab("BERANDA")}
              />
            )}

            {activeTab === "RIWAYAT" && (
              <SinergiHistory
                reports={reports}
                onAddClick={() => setIsFormOpen(true)}
                onEditClick={(report) => {
                  setEditingReport(report);
                  setIsFormOpen(true);
                }}
                onDeleteClick={handleDeleteReport}
                onClearAllClick={handleClearAll}
                onImportBackup={handleImportBackup}
              />
            )}

            {activeTab === "OTOMATISASI" && (
              <BookmarkletGuide />
            )}
          </div>
        )}
      </main>

      {/* User Profile Setup Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/25 backdrop-blur-2xl border border-white/35 rounded-3xl overflow-hidden w-full max-w-md shadow-2xl">
            <div className="bg-white/10 border-b border-white/20 px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-white text-sm tracking-wide">PENGATURAN PROFIL PEGAWAI</h3>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="text-white/70 hover:text-white font-extrabold text-lg"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-white/80 font-bold block uppercase text-[10px] tracking-wider">Nama Lengkap Pegawai</label>
                <input
                  type="text"
                  value={userProfile.nama}
                  onChange={(e) => setUserProfile({ ...userProfile, nama: e.target.value })}
                  className="w-full bg-white/40 border-0 rounded-xl p-3 focus:ring-2 focus:ring-white/50 text-slate-900 placeholder-slate-600 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-bold block uppercase text-[10px] tracking-wider">NIP Pegawai</label>
                <input
                  type="text"
                  value={userProfile.nip}
                  onChange={(e) => setUserProfile({ ...userProfile, nip: e.target.value })}
                  className="w-full bg-white/40 border-0 rounded-xl p-3 focus:ring-2 focus:ring-white/50 text-slate-900 placeholder-slate-600 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-bold block uppercase text-[10px] tracking-wider">Jabatan</label>
                <input
                  type="text"
                  value={userProfile.jabatan}
                  onChange={(e) => setUserProfile({ ...userProfile, jabatan: e.target.value })}
                  className="w-full bg-white/40 border-0 rounded-xl p-3 focus:ring-2 focus:ring-white/50 text-slate-900 placeholder-slate-600 focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-bold block uppercase text-[10px] tracking-wider">Unit Kerja / Dinas</label>
                <input
                  type="text"
                  value={userProfile.unitKerja}
                  onChange={(e) => setUserProfile({ ...userProfile, unitKerja: e.target.value })}
                  className="w-full bg-white/40 border-0 rounded-xl p-3 focus:ring-2 focus:ring-white/50 text-slate-900 placeholder-slate-600 focus:outline-none font-medium"
                />
              </div>

              <div className="pt-4 border-t border-white/25 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile(userProfile)}
                  className="px-5 py-2 bg-white text-indigo-700 hover:bg-white/95 font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Simpan Profil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/10 border-t border-white/10 py-6 mt-12 text-center text-[11px] text-white/75 backdrop-blur-sm">
        <p>© 2026 SINERGI V2 Auto-Input Helper. Dioptimasi untuk BKPSDM Kabupaten Sumenep.</p>
        <p className="mt-1">
          Didukung teknologi Kecerdasan Buatan Google Gemini AI. Membantu produktivitas ASN secara maksimal.
        </p>
      </footer>
    </div>
  );
}
