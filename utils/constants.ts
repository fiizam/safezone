export interface CategoryInfo {
  id: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  iconName: string
  description: string
  pinColor: 'red' | 'yellow' | 'green'
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  begal: {
    id: 'begal',
    label: 'Begal & Kejahatan',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    iconName: 'AlertTriangle',
    description: 'Tindak kejahatan, penodongan, pencurian dengan kekerasan',
    pinColor: 'red'
  },
  geng_motor: {
    id: 'geng_motor',
    label: 'Geng Motor / Tawuran',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    iconName: 'Flame',
    description: 'Konvoi sajam, balap liar, potensi ricuh malam',
    pinColor: 'red'
  },
  gelap: {
    id: 'gelap',
    label: 'Jalan Gelap / PJU Mati',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    iconName: 'Moon',
    description: 'Penerangan mati, jalan berlubang di kegelapan',
    pinColor: 'yellow'
  },
  sepi: {
    id: 'sepi',
    label: 'Jalan Sepi & Rawan',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    iconName: 'EyeOff',
    description: 'Minim pemukiman, tanpa CCTV, tidak ada pos keamanan',
    pinColor: 'yellow'
  }
}

export const DANGER_LEVELS = {
  high: {
    label: 'Bahaya Tinggi',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40',
    dotClass: 'bg-red-500'
  },
  medium: {
    label: 'Waspada Sedang',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dotClass: 'bg-amber-500'
  },
  low: {
    label: 'Perhatian Rendah',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    dotClass: 'bg-blue-500'
  }
}

export const HAVEN_TYPES = {
  minimarket_24h: {
    label: 'Minimarket 24 Jam',
    icon: 'Store',
    color: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  spbu: {
    label: 'SPBU 24 Jam',
    icon: 'Fuel',
    color: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  },
  pos_polisi: {
    label: 'Pos Polisi / Polsek',
    icon: 'Shield',
    color: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
  }
}

