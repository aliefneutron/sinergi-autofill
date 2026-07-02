import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "API is running on Vercel!" });
});

const PORT = process.env.PORT || 3000;

// Lazy initialization of Gemini Client to prevent crash on startup if API key is missing/placeholder
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or is using placeholder. Falling back to static templates.");
    return null;
  }
  
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Gagal menginisialisasi GoogleGenAI SDK:", err);
      return null;
    }
  }
  return aiClient;
}

// Default Uraian Tugas and their potential detailed sub-items or templates for generator
const URAIAN_TEMPLATES: Record<string, { desc: string; output: string }[]> = {
  "Upacara / Apel": [
    {
      desc: "Mengikuti upacara bendera mingguan / apel pagi bersama seluruh staf BKPSDM Kabupaten Sumenep secara tertib guna mendengar arahan pimpinan dan meningkatkan disiplin kerja.",
      output: "Terlaksananya keikutsertaan apel pagi/upacara bendera dibuktikan dengan presensi kehadiran."
    },
    {
      desc: "Mengikuti apel sore bersama seluruh pegawai di lingkungan BKPSDM Sumenep sebagai penutup jam kerja dan evaluasi harian singkat.",
      output: "Terlaksananya keikutsertaan apel sore sebagai bentuk laporan kedisiplinan harian."
    }
  ],
  "Melaksanakan tugas lain sesuai perintah atasan": [
    {
      desc: "Membantu verifikasi dokumen usulan kenaikan pangkat PNS di lingkungan Pemerintah Kabupaten Sumenep sesuai dengan disposisi kepala bidang.",
      output: "Dokumen hasil verifikasi usulan kenaikan pangkat PNS yang telah divalidasi."
    },
    {
      desc: "Menyusun rekapitulasi data absensi bulanan pegawai ASN BKPSDM untuk dilaporkan kepada kepala subbagian umum kepegawaian.",
      output: "Laporan rekapitulasi kehadiran pegawai ASN bulan ini."
    },
    {
      desc: "Mengikuti rapat koordinasi internal pembahasan persiapan seleksi kompetensi dasar PPPK Kabupaten Sumenep.",
      output: "Catatan hasil rapat (notulensi) koordinasi persiapan seleksi PPPK."
    }
  ],
  "Mendisposisi surat masuk": [
    {
      desc: "Menerima, mencatat, dan menelaah surat masuk mengenai permohonan izin belajar mandiri PNS, kemudian menyusun draf disposisi untuk diteruskan ke pimpinan.",
      output: "Draf lembar disposisi surat masuk izin belajar PNS."
    },
    {
      desc: "Mencatat surat undangan koordinasi dari Badan Kepegawaian Negara dan menyusun rekomendasi disposisi disposisi untuk pimpinan subbidang.",
      output: "Surat masuk yang telah terregistrasi beserta draf disposisi tindak lanjut."
    }
  ],
  "Menandatangani naskah dinas": [
    {
      desc: "Menandatangani surat penyerahan dokumen kelengkapan berkas pensiun PNS Kabupaten Sumenep sesuai dengan kewenangan delegasi jabatan.",
      output: "Surat dinas penyerahan kelengkapan berkas pensiun yang telah ditandatangani."
    },
    {
      desc: "Mengesahkan draf surat tugas kepegawaian untuk pelaksanaan verifikasi lapangan berkas usulan cuti sakit pegawai.",
      output: "Naskah surat tugas dinas yang ditandatangani dan dibubuhi stempel resmi."
    }
  ],
  "Memaraf naskah dinas": [
    {
      desc: "Melakukan verifikasi dan memberikan paraf koordinasi pada draf Surat Keputusan (SK) Kenaikan Pangkat PNS Golongan III/d ke bawah sebelum diajukan ke Kepala Badan.",
      output: "Draf SK Kenaikan Pangkat PNS yang telah dibubuhi paraf koordinasi kebenaran data."
    },
    {
      desc: "Memeriksa kesesuaian draf surat undangan bimbingan teknis penyusunan SKP baru dan memberikan paraf pada lembar telaah staf.",
      output: "Lembar draf surat bimbingan teknis yang telah diparaf persetujuan."
    }
  ],
  "Melaksanakan perjalanan dinas": [
    {
      desc: "Melaksanakan perjalanan dinas luar daerah ke instansi terkait dalam rangka koordinasi penyelesaian permasalahan kepegawaian.",
      output: "Laporan hasil perjalanan dinas koordinasi kepegawaian dan surat perintah tugas yang telah ditandatangani."
    },
    {
      desc: "Melakukan perjalanan dinas dalam daerah ke beberapa unit kerja kecamatan/puskesmas di lingkungan Pemkab Sumenep untuk sosialisasi atau inspeksi kerja.",
      output: "Laporan kegiatan perjalanan dinas dalam daerah dan daftar hadir kunjungan kerja."
    }
  ],
  "Melaksanakan tugas lain": [
    {
      desc: "Melakukan pengelolaan arsip fisik file kepegawaian PNS yang baru pensiun ke dalam lemari arsip inaktif agar tertata rapi dan mudah dicari.",
      output: "Arsip file kepegawaian PNS pensiun yang terkelompokkan secara alfabetis."
    },
    {
      desc: "Membuat dokumentasi berupa foto dan mencatat poin-poin penting kegiatan penyerahan SK PNS di lingkungan BKPSDM Sumenep.",
      output: "File dokumentasi foto dan catatan rilis berita kegiatan penyerahan SK."
    }
  ]
};

// API Route for extracting Surat Tugas data using Gemini Multimodal
app.post("/api/gemini/extract-surat-tugas", async (req, res) => {
  const { imageBase64, date } = req.body;

  if (!imageBase64 || !date) {
    return res.status(400).json({ error: "imageBase64 dan date wajib diisi" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(500).json({ error: "Gemini client tidak terinisialisasi. Periksa API Key." });
  }

  try {
    const prompt = `
Anda adalah asisten data entry. Tugas Anda adalah membaca gambar Surat Tugas yang diberikan, dan mengekstrak konteks kegiatan HANYA untuk tanggal: ${date}.

Dalam Surat Tugas biasanya terdapat:
1. Judul Program/Kegiatan (misal: "Program Pengadaan Obat, Bahan Habis Pakai...", atau acara lainnya).
2. Tabel jadwal yang berisi Nama/Lokasi Puskesmas beserta Tanggal Pelaksanaannya.

Instruksi:
- Cari baris di tabel yang memiliki tanggal yang sesuai dengan ${date} (atau yang paling mendekati jika format penulisan beda, misal '22 Juni 2026' = '2026-06-22').
- Ambil Nama/Lokasi/Puskesmas dari baris tersebut.
- Gabungkan Judul Program/Kegiatan dengan Nama Lokasi tersebut menjadi satu kalimat ringkas.
Contoh: "Program Pengadaan Obat, Bahan Habis Pakai Medis, Vaksin, Makanan dan Minuman di Puskesmas Pragaan"

Format output HANYA berupa JSON persis seperti skema berikut, tanpa tambahan markdown:
{
  "context": "Hasil ekstraksi gabungan (Judul Kegiatan + Lokasi/Puskesmas sesuai tanggal)"
}
`;

    const matches = imageBase64.match(/^data:(image\/[a-zA-Z0-9\-]+|application\/pdf);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Format file tidak valid. Harus gambar atau PDF." });
    }
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: [
        prompt,
        {
          inlineData: {
            data: data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            context: {
              type: Type.STRING,
              description: "Konteks kegiatan gabungan dari judul acara dan lokasi/Puskesmas yang sesuai tanggal",
            },
          },
          required: ["context"],
        },
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    return res.status(500).json({ error: `Gagal mengekstrak data dari gambar: ${error.message || JSON.stringify(error)}` });
  }
});

// API Route for generating reports using Gemini with custom variations
app.post("/api/gemini/generate", async (req, res) => {
  const { uraianTugas, subTugas, context, count = 3 } = req.body;

  if (!uraianTugas) {
    return res.status(400).json({ error: "uraianTugas is required" });
  }

  const ai = getGeminiClient();

  // Check if Gemini API client exists, if not, fallback to template mock responses gracefully
  if (!ai) {
    console.warn("Gemini client is not initialized, using template fallbacks.");
    const templates = URAIAN_TEMPLATES[uraianTugas] || URAIAN_TEMPLATES["Melaksanakan tugas lain"];
    let selectedTemplates = templates;
    if (subTugas && uraianTugas === "Melaksanakan perjalanan dinas") {
      selectedTemplates = templates.filter(t => t.desc.toLowerCase().includes(subTugas.toLowerCase().replace("perjalanan dinas ", "")));
      if (selectedTemplates.length === 0) selectedTemplates = templates;
    }
    const results = [];
    for (let i = 0; i < count; i++) {
      const template = selectedTemplates[i % selectedTemplates.length];
      const detailMod = context ? ` (${context})` : "";
      results.push({
        deskripsi: `${template.desc}${detailMod}`,
        hasil: `${template.output}${detailMod ? " terkait " + context : ""}`,
      });
    }
    return res.json({ variations: results, isFallback: true });
  }

  try {
    const prompt = `
Anda adalah asisten khusus ASN Pemerintah Kabupaten Sumenep, Madura, Jawa Timur.
Tugas Anda adalah membuat variasi "Deskripsi Pekerjaan" (Job Description) dan "Hasil Pekerjaan" (Work Output) untuk pengisian laporan kinerja harian pada aplikasi SINERGI V2 BKPSDM Kabupaten Sumenep.

Uraian Tugas Pokok: "${uraianTugas}"
Sub Tugas / Detail Pekerjaan: "${subTugas || 'Sesuai Tupoksi'}"
Konteks / Detail Spesifik Tambahan (jika ada): "${context || 'Tidak ada konteks khusus, buatlah yang umum dan realistis sesuai tupoksi umum BKPSDM/staf pemda'}"

Hasilkan ${count} variasi alternatif yang berbeda, terdengar profesional, formal, dan realistis untuk ASN Kabupaten Sumenep.
Gunakan bahasa Indonesia yang formal, baku, dan sesuai dengan tata cara pengisian e-Kinerja yang baik (menghindari pengulangan kata yang monoton).

Format output harus berupa JSON Array dengan objek yang memiliki kunci "deskripsi" dan "hasil" persis seperti skema ini:
[
  {
    "deskripsi": "Kalimat deskripsi kegiatan lengkap yang dimulai dengan kata kerja aktif (misal: Melakukan..., Menyusun..., Menganalisis..., Membantu..., Mengikuti...)",
    "hasil": "Frasa benda yang mendeskripsikan output fisik/non-fisik yang konkret (misal: Dokumen laporan..., File rekapitulasi..., Terlaksananya kegiatan..., Draf naskah dinas...)"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              deskripsi: {
                type: Type.STRING,
                description: "Deskripsi rinci pekerjaan harian diawali kata kerja aktif",
              },
              hasil: {
                type: Type.STRING,
                description: "Hasil/output pekerjaan konkret, diawali kata benda",
              },
            },
            required: ["deskripsi", "hasil"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(text.trim());
    return res.json({ variations: parsed, isFallback: false });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // On error, fallback gracefully
    const templates = URAIAN_TEMPLATES[uraianTugas] || URAIAN_TEMPLATES["Melaksanakan tugas lain"];
    let selectedTemplates = templates;
    if (subTugas && uraianTugas === "Melaksanakan perjalanan dinas") {
      selectedTemplates = templates.filter(t => t.desc.toLowerCase().includes(subTugas.toLowerCase().replace("perjalanan dinas ", "")));
      if (selectedTemplates.length === 0) selectedTemplates = templates;
    }
    const results = [];
    for (let i = 0; i < count; i++) {
      const template = selectedTemplates[i % selectedTemplates.length];
      const detailMod = context ? ` (${context})` : "";
      results.push({
        deskripsi: `${template.desc}${detailMod}`,
        hasil: `${template.output}${detailMod ? " terkait " + context : ""}`,
      });
    }
    return res.json({
      variations: results,
      isFallback: true,
      error: error.message || "Unknown error inside Gemini API call",
    });
  }
});

export default app;
