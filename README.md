# 🛡️ SafeZone — Crowdsourced Night-Commute & Street Safety Intelligence

**SafeZone** adalah platform intelijen keselamatan perjalanan malam dan rute komuter berbasis crowdsourcing. Dibangun untuk membantu warga, pekerja shift malam, ojek online, dan komuter mengidentifikasi titik rawan kejahatan jalanan (begal, geng motor, jalan gelap tanpa penerangan, jalan sepi) sekaligus menemukan **Safe Haven 24 Jam** (SPBU, minimarket 24 jam, pos polisi) untuk berlindung di saat darurat.

---

## 🚀 Fitur Utama

- 🗺️ **Peta Interaktif Mode Dark Theme (SSR-Safe)**:
  - Menggunakan Leaflet dengan tile CARTO Dark Matter beresolusi tinggi.
  - Bebas error SSR (`SafetyMap.client.vue`).
- 📍 **Marker Kustom Berbasis Status**:
  - **Pin Merah (Pulsating Radar)**: Begal & Tindak Kejahatan / Konvoi Geng Motor.
  - **Pin Kuning (Glow Alert)**: Jalan Gelap / Lampu PJU Padam / Jalan Sepi.
  - **Pin Hijau Tameng (Shield Pulse)**: Safe Haven 24 Jam (SPBU Pertamina/Shell, Minimarket 24 jam, Pos Polisi).
  - **Pin Biru Neon (GPS Indicator)**: Lokasi pengguna saat ini.
- ⚡ **Floating Action Button (FAB) & Modal Pelaporan Interaktif**:
  - Pelaporan cepat titik rawan dengan pilihan kategori ('begal', 'geng_motor', 'gelap', 'sepi') & tingkat bahaya ('high', 'medium', 'low').
  - Tombol **"Lokasi GPS Saya"** untuk deteksi koordinat otomatis.
  - Mode **"Pilih Titik di Peta"** untuk penempatan pin secara presisi hanya dengan mengklik peta.
- 🔺 **Sistem Validasi / Upvote Komunitas**:
  - Warga dapat memvalidasi laporan langsung dari pop-up peta maupun sidebar.
- 🗂️ **Filter Bar Dinamis**:
  - Filter cepat kategori bahaya dan pencarian instan berbasis teks.
- 📱 **Drawer & Sidebar Responsif**:
  - Panel daftar laporan terkini dengan kalkulasi waktu relatif (*time ago*, misal: "5 menit lalu", "2 jam lalu").
  - Menjadi drawer bawah (*bottom sheet*) yang elegan di perangkat seluler.
- 🐘 **Modern Database with Drizzle ORM & Neon PostgreSQL**:
  - Schema terdefinisi kuat dengan TypeScript di `server/db/schema.ts`.
  - Fallback aman (*graceful in-memory demo data*) jika Neon belum terhubung, sehingga aplikasi langsung berfungsi tanpa crash.

---

## 🛠️ Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3, Vite, Nitro Server Engine)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan skema Dark Mode & palet Night Intelligence
- **Peta Digital**: [Leaflet](https://leafletjs.com/) & CARTO Dark Matter Tiles
- **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Ikon**: [Lucide Vue Next](https://lucide.dev/) & Custom SVG Markers
- **Runtime & Deployment**: Node.js 20+, Vercel Edge / Serverless Ready

---

## 📂 Struktur Direktori Proyek

```
safezone/
├── assets/
│   └── css/
│       └── main.css              # Styling Tailwind, Leaflet popup & radar keyframes
├── components/
│   ├── FilterBar.vue             # Filter chip kategori bahaya
│   ├── Navbar.vue                # Topbar header dengan status Live Intel & stats
│   ├── ReportModal.vue           # Modal interaktif input laporan & GPS picker
│   ├── SafetyMap.client.vue      # Peta Leaflet Dark Theme bebas SSR error
│   └── SidebarReports.vue        # Sidebar desktop & mobile bottom sheet drawer
├── pages/
│   └── index.vue                 # Dashboard utama SafeZone
├── server/
│   ├── api/
│   │   ├── havens/
│   │   │   ├── index.get.ts      # GET /api/havens
│   │   │   └── index.post.ts     # POST /api/havens
│   │   └── reports/
│   │       ├── [id]/
│   │       │   └── upvote.post.ts# POST /api/reports/:id/upvote
│   │       ├── index.get.ts      # GET /api/reports
│   │       └── index.post.ts     # POST /api/reports
│   └── db/
│       ├── index.ts              # Inisialisasi koneksi Neon & Drizzle ORM
│       ├── mock-data.ts          # Data awal Jabodetabek (fallback & seed source)
│       ├── schema.ts             # Skema Drizzle ORM (reports & safe_havens)
│       └── seed.ts               # Skrip penyuntikan data awal ke Neon
├── utils/
│   ├── constants.ts              # Kategori, warna, label, dan jenis safe haven
│   └── time.ts                   # Pemformat waktu relatif Bahasa Indonesia
├── .env.example                  # Template variabel lingkungan
├── drizzle.config.ts             # Konfigurasi Drizzle Kit
├── nuxt.config.ts                # Konfigurasi Nuxt 3 & Tailwind
├── tailwind.config.ts            # Konfigurasi tema warna & glow effects
└── vercel.json                   # Konfigurasi deployment Vercel
```

---

## ⚙️ Panduan Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
pnpm install
# atau
npm install
```

### 2. Konfigurasi Database Neon PostgreSQL
1. Buat database baru di [Neon Console](https://console.neon.tech).
2. Salin *Connection String* Neon Anda.
3. Buat file `.env` (atau edit file yang tersedia) dan masukkan URL koneksi:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### 3. Migrasi & Seeding Database
Jalankan perintah push skema Drizzle dan seeding data:
```bash
# Push skema tabel reports dan safe_havens ke Neon
pnpm db:push

# Suntikkan titik-titik rawan dan safe havens awal
pnpm db:seed
```

> **Catatan**: Jika `DATABASE_URL` belum diisi, server SafeZone secara otomatis berjalan dalam mode fallback menggunakan in-memory store data realistis Jabodetabek agar pengembang dan penguji tetap dapat menjelajahi seluruh fitur aplikasi secara penuh tanpa error 500.

### 4. Menjalankan Server Development
```bash
pnpm dev
```
Buka browser di `http://localhost:3000`.

### 5. Build Produksi
```bash
pnpm build
pnpm preview
```

---

## 📡 Dokumentasi Endpoint API

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/reports` | Mengambil seluruh titik bahaya aktif (mendukung query `?category=` & `?dangerLevel=`) |
| `POST` | `/api/reports` | Menambahkan laporan titik rawan baru dari warga |
| `POST` | `/api/reports/:id/upvote` | Memvalidasi / menambah upvote laporan bahaya |
| `GET` | `/api/havens` | Mengambil daftar lokasi perlindungan 24 jam (SPBU, Minimarket, Pos Polisi) |
| `POST` | `/api/havens` | Mendaftarkan titik Safe Haven baru |

---

## 🚀 Panduan Deployment ke Vercel

1. Push repositori SafeZone ke GitHub / GitLab / Bitbucket.
2. Di dashboard [Vercel](https://vercel.com/), klik **Add New Project** dan impor repositori SafeZone.
3. Vercel akan otomatis mengenali framework **Nuxt.js**.
4. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: URL PostgreSQL dari Neon Anda.
5. Klik **Deploy**. Proyek SafeZone Anda akan aktif dan terdistribusi secara global di Vercel Edge Network.

