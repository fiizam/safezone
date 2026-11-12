import type { Report, SafeHaven } from './schema'

export const initialReports: Report[] = [
  // Jakarta
  {
    id: 1,
    title: 'Rawan Begal & Lempar Batu Bawah Flyover',
    description: 'Gerombolan motor sering nongkrong di bawah flyover lewat jam 23.00 WIB tanpa lampu.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -6.2255,
    longitude: 106.8562,
    upvotes: 42,
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
  },
  // Bandung
  {
    id: 5,
    title: 'Rawan Jambret & Motor Pepet Flyover Pasupati',
    description: 'Pengendara malam sering dipepet motor berboncengan di turunan flyover arah Pasteur.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -6.8989,
    longitude: 107.6081,
    upvotes: 54,
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  // Surabaya
  {
    id: 7,
    title: 'Konvoi Liar Dini Hari Jalur Kenjeran',
    description: 'Sering ada rombongan motor kecepatan tinggi di atas jam 00.30 WIB.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -7.2484,
    longitude: 112.7801,
    upvotes: 39,
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15)
  },
  // Yogyakarta
  {
    id: 9,
    title: 'Waspada Rombongan Motor Malam di Ringroad Utara',
    description: 'Pengendara disarankan lewat jalur tengah kota jika pulang lewat pukul 01.00 WIB.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -7.7525,
    longitude: 110.3821,
    upvotes: 47,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9)
  },
  // Semarang
  {
    id: 10,
    title: 'Tanjakan Gombel Minim Penerangan Samping',
    description: 'Beberapa titik lampu jalan padam dan berkabut saat hujan malam.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -7.0382,
    longitude: 110.4215,
    upvotes: 19,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20)
  },
  // Medan
  {
    id: 11,
    title: 'Rawan Perampasan Tas Jalur Gatot Subroto Medan',
    description: 'Hindari menggunakan ponsel di pinggir jalan saat menunggu ojek malam hari.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: 3.5912,
    longitude: 98.6485,
    upvotes: 36,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11)
  }
]

export const initialSafeHavens: SafeHaven[] = [
  // Jakarta
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
  // Bandung
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
  // Surabaya
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
  // Yogyakarta
  {
    id: 8,
    name: 'Polresta Yogyakarta Malioboro',
    type: 'pos_polisi',
    address: 'Jl. Reksobayan No. 1, Ngupasan, Kota Yogyakarta',
    latitude: -7.8003,
    longitude: 110.3658
  },
  // Semarang
  {
    id: 9,
    name: 'Polsek Semarang Tengah (Simpang Lima)',
    type: 'pos_polisi',
    address: 'Jl. Taman Sudirman No. 2, Pekunden, Kota Semarang',
    latitude: -6.9885,
    longitude: 110.4221
  },
  // Medan
  {
    id: 10,
    name: 'Polsek Medan Baru',
    type: 'pos_polisi',
    address: 'Jl. Nibung Utama No. 1, Petisah Tengah, Kota Medan',
    latitude: 3.5889,
    longitude: 98.6615
  }
]
