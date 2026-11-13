# SafeZone: Pemantauan Keamanan Jalan Malam & Rute Pos Aman

SafeZone adalah aplikasi web pemantauan keamanan jalan raya pada malam hari berbasis laporan warga (*crowdsourced street-safety intelligence*). Aplikasi ini membantu pengendara malam dan pejalan kaki mengetahui titik rawan kejahatan, lampu penerangan jalan umum (PJU) yang padam, serta menemukan rute jalan raya tercepat menuju tempat berlindung 24 jam (*Safe Haven* seperti Kantor Polisi, SPBU, dan Minimarket 24 Jam).

## Fitur Utama

1. **Cakupan Multi-Kota Indonesia**:
   - Mendukung pemantauan wilayah **Jakarta & Sekitarnya, Bandung Raya, Surabaya, Yogyakarta, Semarang, Medan**, serta tampilan **Seluruh Indonesia** dengan deteksi lokasi GPS pengguna.
2. **Peta Taktis Interaktif & Pin Beranimasi**:
   - Dibangun menggunakan **Leaflet & OpenStreetMap** dengan kanvas peta gelap berfokus kontras tinggi.
   - Dilengkapi indikator visual spesifik: radar merah untuk titik bahaya tinggi (`Begal` / `Geng Motor`), pendaran kuning untuk jalan gelap/sepi (`PJU Mati`), perisai hijau untuk `Pos Aman 24 Jam`, serta sonar biru untuk posisi GPS pengguna.
   - Pencarian instan jalan/pos dengan *smart dropdown* yang langsung menggerakkan kamera peta (*flyTo*) ke titik terpilih.
3. **Navigasi Rute Jalan Raya Asli (OSRM Street Routing)**:
   - Menggambar jalur *polyline* langsung mengikuti lekukan jalan raya menggunakan **OSRM Routing API** (dengan *fallback* otomatis ke kalkulasi geospasial Haversine), lengkap dengan estimasi waktu tempuh motor dan jalan kaki.
4. **Tombol Darurat SOS WhatsApp**:
   - Mengambil koordinat GPS aktif pengguna, mencari **Pos Aman 24 Jam terdekat** secara otomatis, dan menyusun pesan darurat siap kirim melalui WhatsApp lengkap dengan tautan Google Maps.
5. **Validasi Komunitas & Status Penyelesaian ("Sudah Aman")**:
   - Warga dapat memvalidasi laporan bahaya (*upvote*) maupun menandai titik yang sudah diperbaiki/kondusif (`Sudah Aman`), dilengkapi proteksi *localStorage* agar tidak terjadi duplikasi suara dari perangkat yang sama.

## Teknologi yang Digunakan

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue 3 Composition API, TypeScript, Nitro Server Engine)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Peta & Geospasial**: [Leaflet.js](https://leafletjs.com/), OpenStreetMap, & OSRM Routing API
- **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)

## Cara Menjalankan di Lokal

1. **Instal dependensi**:
   ```bash
   pnpm install
   ```

2. **Konfigurasi Environment Variable (`.env`)**:
   Salin `.env.example` menjadi `.env` dan masukkan URL koneksi PostgreSQL Neon Anda:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
   ```
   *(Catatan: Jika `DATABASE_URL` belum diisi, aplikasi tetap dapat berjalan normal menggunakan penyimpanan memori lokal bawaan).*

3. **Inisialisasi Data Awal Database (Opsional)**:
   ```bash
   pnpm db:seed
   ```

4. **Jalankan Server Pengembangan**:
   ```bash
   pnpm dev
   ```
   Buka `http://localhost:3000` di peramban Anda.

5. **Build untuk Produksi / Vercel**:
   ```bash
   pnpm build
   ```
