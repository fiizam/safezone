import type { Report, SafeHaven } from './schema'

export const initialReports: Report[] = [
  {
    id: 1,
    title: 'Rawan Begal & Lempar Batu Bawah Flyover',
    description: 'Gerombolan motor sering nongkrong di bawah flyover lewat jam 23.00 WIB tanpa lampu.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -6.2255,
    longitude: 106.8562,
    upvotes: 42,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 2,
    title: 'Lampu PJU Padam Sepanjang 600m Kalimalang',
    description: 'Penerangan jalan umum padam, jalan gelap dan berlubang membahayakan pengendara malam.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -6.2412,
    longitude: 106.8834,
    upvotes: 28,
    resolvedCount: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    id: 3,
    title: 'Konvoi Motor Malam Minggu Antasari',
    description: 'Kelompok motor berkonvoi ugal-ugalan sekitar pukul 01.30 WIB. Hindari jalur bawah.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -6.2625,
    longitude: 106.8122,
    upvotes: 65,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  },
  {
    id: 4,
    title: 'Jalur Penghubung Manggarai Sunyi Lewat 22.00',
    description: 'Warung tutup semua dan minim CCTV setelah jam 22.00 WIB.',
    category: 'sepi',
    dangerLevel: 'low',
    latitude: -6.2088,
    longitude: 106.8456,
    upvotes: 14,
    resolvedCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
  },
  {
    id: 5,
    title: 'Rawan Jambret & Motor Pepet Flyover Pasupati',
    description: 'Pengendara malam sering dipepet motor berboncengan di turunan flyover arah Pasteur.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -6.8989,
    longitude: 107.6081,
    upvotes: 54,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
  },
  {
    id: 6,
    title: 'Jalan Gelap Tertutup Pohon di Taman Sari',
    description: 'Lampu jalan terhalang pohon rimbun dan sepi lewat tengah malam.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -6.8932,
    longitude: 107.6095,
    upvotes: 31,
    resolvedCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: 7,
    title: 'Konvoi Liar Dini Hari Jalur Kenjeran',
    description: 'Sering ada rombongan motor kecepatan tinggi di atas jam 00.30 WIB.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -7.2484,
    longitude: 112.7801,
    upvotes: 39,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: 8,
    title: 'PJU Redup & Jalan Sepi Margomulyo',
    description: 'Jalur truk besar dengan lampu penerangan sebagian mati pada malam hari.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -7.2435,
    longitude: 112.6812,
    upvotes: 22,
    resolvedCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15)
  },
  {
    id: 9,
    title: 'Waspada Rombongan Motor Malam di Ringroad Utara',
    description: 'Pengendara disarankan lewat jalur tengah kota jika pulang lewat pukul 01.00 WIB.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -7.7525,
    longitude: 110.3821,
    upvotes: 47,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9)
  },
  {
    id: 10,
    title: 'Jalur Underpass Kentungan Minim Lampu Samping',
    description: 'Sisi barat jalur lambat cukup gelap saat hujan deras malam hari.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -7.7548,
    longitude: 110.3694,
    upvotes: 18,
    resolvedCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14)
  },
  {
    id: 11,
    title: 'Tanjakan Gombel Minim Penerangan Samping',
    description: 'Beberapa titik lampu jalan padam dan berkabut saat hujan malam.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -7.0382,
    longitude: 110.4215,
    upvotes: 19,
    resolvedCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20)
  },
  {
    id: 12,
    title: 'Jalur Arteri Utara Semarang Rawan Kebut Malam',
    description: 'Kendaraan besar dan motor melaju kencang di atas jam 23.30 WIB, minim rambu pantul.',
    category: 'sepi',
    dangerLevel: 'medium',
    latitude: -6.9565,
    longitude: 110.4028,
    upvotes: 24,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16)
  },
  {
    id: 13,
    title: 'Jalur Soekarno-Hatta Malang Rawan Balap Liar',
    description: 'Sekitar pukul 01.00 WIB sering dipakai trek-trekan motor knalpot bising.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -7.9438,
    longitude: 112.6152,
    upvotes: 35,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7)
  },
  {
    id: 14,
    title: 'Jembatan Kedungkandang Gelap Lewat Tengah Malam',
    description: 'Penerangan sisi selatan jembatan redup dan jarang ada warga melintas dini hari.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -7.9839,
    longitude: 112.6612,
    upvotes: 21,
    resolvedCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19)
  },
  {
    id: 15,
    title: 'Rawan Jambret Ponsel Turis di Sunset Road Kuta',
    description: 'Hindari membuka peta sambil memegang ponsel satu tangan di atas motor malam hari.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -8.7052,
    longitude: 115.1774,
    upvotes: 58,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3)
  },
  {
    id: 16,
    title: 'Shortcut Canggu Minim Lampu & Pembatas Sawah',
    description: 'Jalan sempit tanpa pagar pembatas dan minim lampu PJU, rawan terperosok malam hari.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -8.6502,
    longitude: 115.1385,
    upvotes: 44,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10)
  },
  {
    id: 17,
    title: 'Rawan Perampasan Tas Jalur Gatot Subroto Medan',
    description: 'Hindari menggunakan ponsel di pinggir jalan saat menunggu ojek malam hari.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: 3.5912,
    longitude: 98.6485,
    upvotes: 36,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11)
  },
  {
    id: 18,
    title: 'Konvoi Motor Remaja di Ringroad Gagak Hitam Medan',
    description: 'Sering terjadi konvoi bergerombol pada malam akhir pekan di atas pukul 00.00 WIB.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: 3.5698,
    longitude: 98.6251,
    upvotes: 29,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 17)
  },
  {
    id: 19,
    title: 'Jalur Soekarno-Hatta Palembang Sepi & Minim PJU',
    description: 'Jalur lintas truk dengan beberapa titik lampu jalan padam dan rawan tindak kejahatan.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -2.9541,
    longitude: 104.7185,
    upvotes: 33,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: 20,
    title: 'Jalur Stadion Jakabaring Sunyi Selepas 22.30 WIB',
    description: 'Area sekitar jalur luar sepi selepas jam operasional toko tutup.',
    category: 'sepi',
    dangerLevel: 'low',
    latitude: -3.0158,
    longitude: 104.7912,
    upvotes: 17,
    resolvedCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 21)
  },
  {
    id: 21,
    title: 'Konvoi Balap Malam di Jalan Arifin Ahmad Pekanbaru',
    description: 'Kelompok motor sering berkumpul dan memacu kendaraan lewat tengah malam.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: 0.4782,
    longitude: 101.4395,
    upvotes: 27,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8)
  },
  {
    id: 22,
    title: 'Waspada Geng Motor & Busur Panah di Perintis Kemerdekaan Makassar',
    description: 'Gunakan jalur utama yang terang dan ramai jika melintas di atas pukul 23.30 WITA.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -5.1342,
    longitude: 119.4881,
    upvotes: 49,
    resolvedCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    id: 23,
    title: 'Tanjakan Muara Rapak Balikpapan Minim Lampu Sisi Kiri',
    description: 'Waspada kendaraan berat dan penerangan jalan yang redup saat hujan malam.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -1.2412,
    longitude: 116.8364,
    upvotes: 23,
    resolvedCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 13)
  },
  {
    id: 24,
    title: 'Jalur Gubernur Soebarjo Banjarmasin Sepi & Gelap',
    description: 'Jalur lingkar selatan minim warung 24 jam dan lampu jalan berjarak jauh.',
    category: 'sepi',
    dangerLevel: 'medium',
    latitude: -3.3485,
    longitude: 114.6124,
    upvotes: 20,
    resolvedCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15)
  }
]

export const initialSafeHavens: SafeHaven[] = [
  {
    id: 1,
    name: 'SPBU Pertamina 24 Jam Tebet Eco Park',
    type: 'spbu',
    address: 'Jl. MT Haryono Kav. 31, Tebet, Jakarta Selatan',
    latitude: -6.2425,
    longitude: 106.8521
  },
  {
    id: 2,
    name: 'Indomaret Point 24 Jam Kasablanka',
    type: 'minimarket_24h',
    address: 'Jl. Raya Casablanca No. 88, Tebet, Jakarta Selatan',
    latitude: -6.2238,
    longitude: 106.8492
  },
  {
    id: 3,
    name: 'Polsek Metro Setiabudi',
    type: 'pos_polisi',
    address: 'Jl. RS. Mata Aini No. 1, Setiabudi, Jakarta Selatan',
    latitude: -6.2162,
    longitude: 106.8291
  },
  {
    id: 4,
    name: 'Polsek Coblong Dago Bandung',
    type: 'pos_polisi',
    address: 'Jl. Sangkuriang No. 10A, Dago, Coblong, Kota Bandung',
    latitude: -6.8819,
    longitude: 107.6119
  },
  {
    id: 5,
    name: 'SPBU Pertamina 24 Jam Dipatiukur',
    type: 'spbu',
    address: 'Jl. Dipatiukur No. 72, Lebakgede, Kota Bandung',
    latitude: -6.8904,
    longitude: 107.6168
  },
  {
    id: 6,
    name: 'Polsek Genteng Surabaya',
    type: 'pos_polisi',
    address: 'Jl. Ambengan No. 29, Ketabang, Genteng, Surabaya',
    latitude: -7.2569,
    longitude: 112.7495
  },
  {
    id: 7,
    name: 'SPBU Pertamina 24 Jam Gubeng',
    type: 'spbu',
    address: 'Jl. Sumatera No. 25, Gubeng, Surabaya',
    latitude: -7.2672,
    longitude: 112.7478
  },
  {
    id: 8,
    name: 'Polresta Yogyakarta Malioboro',
    type: 'pos_polisi',
    address: 'Jl. Reksobayan No. 1, Ngupasan, Kota Yogyakarta',
    latitude: -7.8003,
    longitude: 110.3658
  },
  {
    id: 9,
    name: 'SPBU Pertamina 24 Jam Lempuyangan',
    type: 'spbu',
    address: 'Jl. Kompol Bambang Suprapto, Baciro, Kota Yogyakarta',
    latitude: -7.7904,
    longitude: 110.3792
  },
  {
    id: 10,
    name: 'Polsek Semarang Tengah (Simpang Lima)',
    type: 'pos_polisi',
    address: 'Jl. Taman Sudirman No. 2, Pekunden, Kota Semarang',
    latitude: -6.9885,
    longitude: 110.4221
  },
  {
    id: 11,
    name: 'Polresta Malang Kota',
    type: 'pos_polisi',
    address: 'Jl. Jaksa Agung Suprapto No. 19, Klojen, Kota Malang',
    latitude: -7.9712,
    longitude: 112.6318
  },
  {
    id: 12,
    name: 'Polsek Kuta Badung Bali',
    type: 'pos_polisi',
    address: 'Jl. Raya Tuban No. 1, Kuta, Kab. Badung, Bali',
    latitude: -8.7351,
    longitude: 115.1748
  },
  {
    id: 13,
    name: 'SPBU Pertamina 24 Jam Sunset Road',
    type: 'spbu',
    address: 'Jl. Sunset Road No. 89, Kuta, Badung, Bali',
    latitude: -8.7014,
    longitude: 115.1769
  },
  {
    id: 14,
    name: 'Polsek Medan Baru',
    type: 'pos_polisi',
    address: 'Jl. Nibung Utama No. 1, Petisah Tengah, Kota Medan',
    latitude: 3.5889,
    longitude: 98.6615
  },
  {
    id: 15,
    name: 'Polrestabes Palembang',
    type: 'pos_polisi',
    address: 'Jl. Gubernur H. A. Bastari, Jakabaring, Kota Palembang',
    latitude: -3.0052,
    longitude: 104.7721
  },
  {
    id: 16,
    name: 'Polresta Pekanbaru',
    type: 'pos_polisi',
    address: 'Jl. Jend. Ahmad Yani No. 11, Kota Pekanbaru, Riau',
    latitude: 0.5264,
    longitude: 101.4442
  },
  {
    id: 17,
    name: 'Polrestabes Makassar',
    type: 'pos_polisi',
    address: 'Jl. Jend. Ahmad Yani No. 9, Baru, Ujung Pandang, Makassar',
    latitude: -5.1331,
    longitude: 119.4084
  },
  {
    id: 18,
    name: 'Polresta Balikpapan',
    type: 'pos_polisi',
    address: 'Jl. Jend. Sudirman No. 69, Klandasan Ulu, Kota Balikpapan',
    latitude: -1.2748,
    longitude: 116.8352
  },
  {
    id: 19,
    name: 'Polresta Banjarmasin',
    type: 'pos_polisi',
    address: 'Jl. S. Parman No. 16, Antasan Besar, Kota Banjarmasin',
    latitude: -3.3142,
    longitude: 114.5915
  }
]
