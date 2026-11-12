import type { Report, SafeHaven } from './schema'

export const initialReports: Report[] = [
  {
    id: 1,
    title: 'Rawan Begal & Lempar Batu Bawah Flyover',
    description: 'Sering ada gerombolan motor mencurigakan nongkrong di bawah flyover setelah jam 23.00 WIB tanpa lampu. Pernah terjadi perampasan HP & tas pengendara motor.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -6.2255,
    longitude: 106.8562, // Flyover Casablanka / Tebet
    upvotes: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 2,
    title: 'Lampu PJU Mati Total Sepanjang 600m',
    description: 'Penerangan jalan umum padam sejak 3 hari lalu. Kondisi jalan sangat gelap gulita, banyak lubang tak terlihat dan membahayakan pengendara malam.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -6.2412,
    longitude: 106.8834, // Kalimalang - Cipinang Melayu
    upvotes: 28,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  },
  {
    id: 3,
    title: 'Konvoi Geng Motor Bawa Sajam',
    description: 'Sekelompok pemuda berkonvoi 15+ motor membawa sajam dan menggeber knalpot bising di malam libur sekitar pukul 01.30. Waspada dan hindari jalan ini.',
    category: 'geng_motor',
    dangerLevel: 'high',
    latitude: -6.2625,
    longitude: 106.8122, // Kemang / Antasari
    upvotes: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
  },
  {
    id: 4,
    title: 'Akses Jalan Sepi & Minim Rumah Warga',
    description: 'Jalur penghubung komplek sangat sunyi setelah jam 21.00. Tidak ada warung atau minimarket yang buka, CCTV minim.',
    category: 'sepi',
    dangerLevel: 'low',
    latitude: -6.2088,
    longitude: 106.8456, // Manggarai perbatasan
    upvotes: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18) // 18 hours ago
  },
  {
    id: 5,
    title: 'Modus Tabrak Belakang & Pura-Pura Menuduh',
    description: 'Pria berboncengan pura-pura disenggol kemudian memaksa korban berhenti di pinggir jalan yang remang. Jangan menepi di tempat sepi, arahkan ke pos polisi.',
    category: 'begal',
    dangerLevel: 'high',
    latitude: -6.2891,
    longitude: 106.8432, // TB Simatupang - Pasar Minggu
    upvotes: 89,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    id: 6,
    title: 'Lampu Jalan Kedip & Pohon Rindang Rawan Pohon Tumbang',
    description: 'Kawasan remang-remang tertutup dedaunan pohon besar, minim penerangan dan rawan tindak kriminalitas.',
    category: 'gelap',
    dangerLevel: 'medium',
    latitude: -6.1754,
    longitude: 106.8272, // Sekitar Gambir / Monas barat
    upvotes: 19,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36) // 1.5 days ago
  }
]

export const initialSafeHavens: SafeHaven[] = [
  {
    id: 1,
    name: 'SPBU Pertamina 24 Jam Tebet Eco Park',
    type: 'spbu',
    address: 'Jl. MT Haryono Kav. 31, Tebet, Jakarta Selatan (Toilet, CCTV, Satpam 24 Jam)',
    latitude: -6.2425,
    longitude: 106.8521
  },
  {
    id: 2,
    name: 'Indomaret Point 24 Jam Kasablanka',
    type: 'minimarket_24h',
    address: 'Jl. Raya Casablanca No. 88, Menteng Dalam, Tebet (Buka 24 Jam, Ramai Ojol)',
    latitude: -6.2238,
    longitude: 106.8492
  },
  {
    id: 3,
    name: 'Polsek Metro Setiabudi',
    type: 'pos_polisi',
    address: 'Jl. RS. Mata Aini No.1, Karet Kuningan, Setiabudi, Jakarta Selatan',
    latitude: -6.2162,
    longitude: 106.8291
  },
  {
    id: 4,
    name: 'SPBU Shell MT Haryono',
    type: 'spbu',
    address: 'Jl. MT Haryono No. 12, Cawang, Jakarta Timur (Terang benderang, ATM Center 24 Jam)',
    latitude: -6.2441,
    longitude: 106.8682
  },
  {
    id: 5,
    name: 'Pos Polisi Subsektor Kemang',
    type: 'pos_polisi',
    address: 'Jl. Kemang Raya No. 10, Bangka, Mampang Prapatan, Jakarta Selatan',
    latitude: -6.2589,
    longitude: 106.8152
  },
  {
    id: 6,
    name: 'Alfamart 24 Jam Margonda Raya',
    type: 'minimarket_24h',
    address: 'Jl. Margonda Raya No. 182, Pondok Cina (Parkir Luas, Kasir & Barista Standby)',
    latitude: -6.3685,
    longitude: 106.8335
  }
]

