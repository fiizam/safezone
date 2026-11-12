export interface Coordinates {
  lat: number
  lng: number
}

export interface CityRegion {
  id: string
  name: string
  province: string
  center: Coordinates
  radiusKm: number
}

export const INDONESIAN_CITIES: CityRegion[] = [
  {
    id: 'jakarta',
    name: 'Jakarta & Sekitarnya',
    province: 'DKI Jakarta',
    center: { lat: -6.2297, lng: 106.8467 },
    radiusKm: 35
  },
  {
    id: 'bandung',
    name: 'Bandung Raya',
    province: 'Jawa Barat',
    center: { lat: -6.9025, lng: 107.6188 },
    radiusKm: 30
  },
  {
    id: 'surabaya',
    name: 'Surabaya',
    province: 'Jawa Timur',
    center: { lat: -7.2658, lng: 112.7426 },
    radiusKm: 30
  },
  {
    id: 'yogyakarta',
    name: 'Yogyakarta',
    province: 'DI Yogyakarta',
    center: { lat: -7.7829, lng: 110.3671 },
    radiusKm: 28
  },
  {
    id: 'semarang',
    name: 'Semarang',
    province: 'Jawa Tengah',
    center: { lat: -6.9932, lng: 110.4203 },
    radiusKm: 28
  },
  {
    id: 'medan',
    name: 'Medan',
    province: 'Sumatera Utara',
    center: { lat: 3.5952, lng: 98.6722 },
    radiusKm: 30
  },
  {
    id: 'all',
    name: 'Seluruh Indonesia',
    province: 'Nasional',
    center: { lat: -6.2297, lng: 106.8467 },
    radiusKm: 10000
  }
]

export function calculateDistanceMeters(from: Coordinates, to: Coordinates): number {
  const earthRadiusMeters = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(earthRadiusMeters * c)
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

export function estimateMotorMinutes(meters: number): number {
  const roadDistance = meters * 1.25
  return Math.max(1, Math.round(roadDistance / 500))
}

export function estimateWalkMinutes(meters: number): number {
  const roadDistance = meters * 1.2
  return Math.max(1, Math.round(roadDistance / 80))
}

export function buildWhatsAppSosUrl(
  coords: Coordinates,
  nearestHavenName?: string,
  isGpsLive = false
): string {
  const latFixed = coords.lat.toFixed(6)
  const lngFixed = coords.lng.toFixed(6)
  const mapsUrl = `https://www.google.com/maps?q=${latFixed},${lngFixed}`
  const sourceLabel = isGpsLive ? 'GPS Perangkat Aktif' : 'Titik Pantau Peta'
  const havenInfo = nearestHavenName
    ? `\nTitik aman terdekat: ${nearestHavenName}.`
    : ''

  const text = [
    '[DARURAT SAFEZONE] Saya butuh bantuan segera di jalur malam.',
    `Lokasi (${sourceLabel}): ${latFixed}, ${lngFixed}${havenInfo}`,
    `Buka peta lokasi saya: ${mapsUrl}`
  ].join('\n')

  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
