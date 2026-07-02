export enum StatusLaporan {
  SEMUA = "SEMUA",
  BELUM_DIPERIKSA = "BELUM DIPERIKSA",
  DISETUJUI = "DISETUJUI",
  DIKOREKSI_DITOLAK = "DIKOREKSI/DITOLAK"
}

export interface LaporanKinerja {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktuMulai: string; // HH:MM
  waktuSelesai: string; // HH:MM
  uraianTugas: string;
  detailItemPekerjaan: string; // e.g. "Perjalanan dinas luar daerah", "Penyusunan laporan"
  deskripsiPekerjaan: string;
  hasilPekerjaan: string;
  status: StatusLaporan;
  buktiDukungName?: string;
  buktiDukungBase64?: string; // Optional embedded file data
}

export interface UserProfile {
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
}

export interface BatchGeneratorConfig {
  startDate: string;
  endDate: string;
  excludeWeekends: boolean;
  dailySchedules: {
    waktuMulai: string;
    waktuSelesai: string;
    uraianTugas: string;
    context: string;
  }[];
}
