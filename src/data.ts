import { LaporanKinerja, StatusLaporan } from "./types";

export const DEFAULT_URAIAN_TUGAS = [
  "Upacara / Apel",
  "Melaksanakan tugas lain sesuai perintah atasan",
  "Mendisposisi surat masuk",
  "Menandatangani naskah dinas",
  "Memaraf naskah dinas",
  "Melaksanakan perjalanan dinas",
  "Melaksanakan tugas lain"
];

export const DETAIL_ITEMS_MAP: Record<string, string[]> = {
  "Upacara / Apel": [
    "Mengikuti Apel Pagi rutin setiap Senin pagi",
    "Mengikuti Upacara Hari Kemerdekaan RI",
    "Mengikuti Apel Sore sebelum pulang kerja"
  ],
  "Melaksanakan tugas lain sesuai perintah atasan": [
    "NORMA: 5 MENIT",
    "NORMA: 10 MENIT",
    "NORMA: 15 MENIT",
    "NORMA: 20 MENIT",
    "NORMA: 30 MENIT",
    "NORMA: 40 MENIT",
    "NORMA: 50 MENIT",
    "NORMA: 60 MENIT"
  ],
  "Mendisposisi surat masuk": [
    "Membaca/mempelajari isi surat masuk",
    "Mendisposisi surat",
    "Membaca/mempelajari isi surat masuk dan mendisposisi surat (perhari eselon II)",
    "Membaca/mempelajari isi surat masuk dan mendisposisi surat (perhari eselon III)",
    "Membaca/mempelajari isi surat masuk dan mendisposisi surat (perhari eselon IV)"
  ],
  "Menandatangani naskah dinas": [
    "Membaca/mempelajari isi naskah dinas dan menandatangani (non telaahan/kajian)",
    "Membaca/mempelajari isi naskah dinas dan menandatangani (telaahan/kajian)",
    "Membaca/mempelajari isi naskah dinas dan menandatangani (Keputusan)"
  ],
  "Memaraf naskah dinas": [
    "Membaca/mempelajari naskah dinas dan memaraf (non telaahan/kajian/peraturan perundang-undangan)",
    "Membaca/mempelajari naskah dinas dan memaraf (telaahan/kajian)",
    "Membaca/mempelajari naskah dinas dan memaraf (Perda)",
    "Membaca/mempelajari naskah dinas dan memaraf (Perbup)",
    "Membaca/mempelajari naskah dinas dan memaraf (keputusan)",
    "NORMA: 60 MENIT"
  ],
  "Melaksanakan perjalanan dinas": [
    "Perjalanan dinas luar daerah",
    "Perjalanan dinas dalam daerah"
  ],
  "Melaksanakan tugas lain": [
    "Penataan dokumen dan arsip fisik file kepegawaian",
    "Penginputan database ke dalam aplikasi SIMPEG",
    "Mengikuti seminar bimbingan teknis e-Kinerja secara online"
  ]
};

export const SAMPLE_LAPORAN: LaporanKinerja[] = [
  {
    id: "rep-1",
    tanggal: "2026-06-22",
    waktuMulai: "07:30",
    waktuSelesai: "09:00",
    uraianTugas: "Upacara / Apel",
    detailItemPekerjaan: "Mengikuti Apel Pagi rutin setiap Senin pagi",
    deskripsiPekerjaan: "Mengikuti upacara bendera mingguan / apel pagi bersama seluruh staf BKPSDM Kabupaten Sumenep secara tertib guna mendengar arahan pimpinan dan meningkatkan disiplin kerja.",
    hasilPekerjaan: "Terlaksananya keikutsertaan apel pagi/upacara bendera dibuktikan dengan presensi kehadiran.",
    status: StatusLaporan.DISETUJUI
  },
  {
    id: "rep-2",
    tanggal: "2026-06-22",
    waktuMulai: "09:30",
    waktuSelesai: "11:30",
    uraianTugas: "Melaksanakan perjalanan dinas",
    detailItemPekerjaan: "Perjalanan dinas luar daerah",
    deskripsiPekerjaan: "Melaksanakan perjalanan dinas luar daerah ke Kantor Regional II BKN Surabaya dalam rangka koordinasi penyelesaian permasalahan penetapan NIP PPPK formasi tahun sebelumnya.",
    hasilPekerjaan: "Laporan hasil perjalanan dinas koordinasi penetapan NIP PPPK dan surat perintah tugas (SPT) tercap.",
    status: StatusLaporan.BELUM_DIPERIKSA
  },
  {
    id: "rep-3",
    tanggal: "2026-06-23",
    waktuMulai: "08:00",
    waktuSelesai: "11:00",
    uraianTugas: "Mendisposisi surat masuk",
    detailItemPekerjaan: "Disposisi surat masuk dari BKN Regional II",
    deskripsiPekerjaan: "Menerima, mencatat, dan menelaah surat masuk mengenai permohonan izin belajar mandiri PNS, kemudian menyusun draf disposisi untuk diteruskan ke pimpinan.",
    hasilPekerjaan: "Draf lembar disposisi surat masuk izin belajar PNS.",
    status: StatusLaporan.DISETUJUI
  },
  {
    id: "rep-4",
    tanggal: "2026-06-23",
    waktuMulai: "13:00",
    waktuSelesai: "15:30",
    uraianTugas: "Melaksanakan tugas lain",
    detailItemPekerjaan: "Penataan dokumen dan arsip fisik file kepegawaian",
    deskripsiPekerjaan: "Melakukan pengelolaan arsip fisik file kepegawaian PNS yang baru pensiun ke dalam lemari arsip inaktif agar tertata rapi dan mudah dicari.",
    hasilPekerjaan: "Arsip file kepegawaian PNS pensiun yang terkelompokkan secara alfabetis.",
    status: StatusLaporan.DIKOREKSI_DITOLAK
  }
];
