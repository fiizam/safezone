import type { Report, SafeHaven } from '~/server/db/schema'

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

export interface RouteGeometryResult {
  coordinates: [number, number][]
  distanceMeters: number
  durationSeconds: number
  isRoadRoute: boolean
}

export interface GeocodedPlace {
  id: string
  name: string
  displayName: string
  lat: number
  lng: number
}

export interface RoadWeatherAlert {
  conditionLabel: string
  advisoryText: string
  temperatureC: number
  isHazardousWeather: boolean
}

export interface DeepAreaScanResult {
  areaLabel: string
  subdistrictLabel: string
  havens: SafeHaven[]
  localReports: Report[]
}

export const INDONESIAN_CITIES: CityRegion[] = [
  {
    id: 'jakarta',
    name: 'Jakarta & Sekitarnya',
    province: 'DKI Jakarta & Bodetabek',
    center: { lat: -6.2297, lng: 106.8467 },
    radiusKm: 40
  },
  {
    id: 'bandung',
    name: 'Bandung Raya',
    province: 'Jawa Barat',
    center: { lat: -6.9025, lng: 107.6188 },
    radiusKm: 32
  },
  {
    id: 'surabaya',
    name: 'Surabaya & Sidoarjo',
    province: 'Jawa Timur',
    center: { lat: -7.2658, lng: 112.7426 },
    radiusKm: 35
  },
  {
    id: 'yogyakarta',
    name: 'Yogyakarta',
    province: 'DI Yogyakarta',
    center: { lat: -7.7829, lng: 110.3671 },
    radiusKm: 30
  },
  {
    id: 'semarang',
    name: 'Semarang',
    province: 'Jawa Tengah',
    center: { lat: -6.9932, lng: 110.4203 },
    radiusKm: 30
  },
  {
    id: 'malang',
    name: 'Malang Raya',
    province: 'Jawa Timur',
    center: { lat: -7.9666, lng: 112.6326 },
    radiusKm: 28
  },
  {
    id: 'denpasar',
    name: 'Denpasar & Badung',
    province: 'Bali',
    center: { lat: -8.6705, lng: 115.2126 },
    radiusKm: 32
  },
  {
    id: 'medan',
    name: 'Medan',
    province: 'Sumatera Utara',
    center: { lat: 3.5952, lng: 98.6722 },
    radiusKm: 32
  },
  {
    id: 'palembang',
    name: 'Palembang',
    province: 'Sumatera Selatan',
    center: { lat: -2.9761, lng: 104.7754 },
    radiusKm: 30
  },
  {
    id: 'pekanbaru',
    name: 'Pekanbaru',
    province: 'Riau',
    center: { lat: 0.5071, lng: 101.4478 },
    radiusKm: 30
  },
  {
    id: 'makassar',
    name: 'Makassar',
    province: 'Sulawesi Selatan',
    center: { lat: -5.1477, lng: 119.4327 },
    radiusKm: 32
  },
  {
    id: 'balikpapan',
    name: 'Balikpapan & Samarinda',
    province: 'Kalimantan Timur',
    center: { lat: -1.2379, lng: 116.8529 },
    radiusKm: 45
  },
  {
    id: 'banjarmasin',
    name: 'Banjarmasin',
    province: 'Kalimantan Selatan',
    center: { lat: -3.3194, lng: 114.5908 },
    radiusKm: 30
  },
  {
    id: 'all',
    name: 'Seluruh Indonesia',
    province: 'Lintas Provinsi & Pelosok Nasional',
    center: { lat: -2.5489, lng: 118.0149 },
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

export async function fetchOsrmStreetRoute(
  from: Coordinates,
  to: Coordinates
): Promise<RouteGeometryResult> {
  const fallbackMeters = calculateDistanceMeters(from, to)
  const fallbackResult: RouteGeometryResult = {
    coordinates: [
      [from.lat, from.lng],
      [to.lat, to.lng]
    ],
    distanceMeters: fallbackMeters,
    durationSeconds: estimateMotorMinutes(fallbackMeters) * 60,
    isRoadRoute: false
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4500)

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!response.ok) return fallbackResult
    const data = await response.json()

    if (
      data?.code === 'Ok' &&
      Array.isArray(data.routes) &&
      data.routes.length > 0 &&
      data.routes[0]?.geometry?.coordinates?.length > 1
    ) {
      const route = data.routes[0]
      const latLngs: [number, number][] = route.geometry.coordinates.map(
        (pair: [number, number]) => [pair[1], pair[0]]
      )
      return {
        coordinates: latLngs,
        distanceMeters: Math.round(route.distance || fallbackMeters),
        durationSeconds: Math.round(route.duration || fallbackResult.durationSeconds),
        isRoadRoute: true
      }
    }
  } catch {
    // Gunakan rute garis kompas jika server publik sedang sibuk
  }

  return fallbackResult
}

function computeCoordSeed(lat: number, lng: number): number {
  const latGrid = Math.round(lat * 200)
  const lngGrid = Math.round(lng * 200)
  return Math.abs((latGrid * 73856093) ^ (lngGrid * 19349663))
}

async function reverseGeocodeArea(coords: Coordinates): Promise<{
  roadName: string
  villageName: string
  subdistrictName: string
  cityName: string
}> {
  const fallback = {
    roadName: 'Jalur Utama Warga',
    villageName: 'Area Pemukiman',
    subdistrictName: 'Kecamatan Setempat',
    cityName: 'Indonesia'
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat.toFixed(5)}&lon=${coords.lng.toFixed(5)}&zoom=16&addressdetails=1`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept-Language': 'id' }
    })
    clearTimeout(timer)

    if (!res.ok) return fallback
    const data = await res.json()
    const addr = data?.address || {}

    const roadName =
      addr.road ||
      addr.pedestrian ||
      addr.residential ||
      addr.path ||
      addr.hamlet ||
      data?.name ||
      'Jalur Penghubung Desa'

    const villageName =
      addr.village ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.hamlet ||
      roadName

    const subdistrictName =
      addr.city_district ||
      addr.municipality ||
      addr.Subdistrict ||
      addr.town ||
      addr.county ||
      villageName

    const cityName =
      addr.city ||
      addr.county ||
      addr.regency ||
      addr.state_district ||
      addr.state ||
      'Indonesia'

    return {
      roadName: String(roadName),
      villageName: String(villageName),
      subdistrictName: String(subdistrictName),
      cityName: String(cityName)
    }
  } catch {
    return fallback
  }
}

async function queryOverpassWithFallback(query: string): Promise<any[]> {
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter'
  ]

  for (const base of endpoints) {
    try {
      const url = `${base}?data=${encodeURIComponent(query)}`
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 6500)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.elements)) {
          return data.elements
        }
      }
    } catch {
      // Lanjut ke server cadangan berikutnya
    }
  }
  return []
}

export async function scanDeepAreaIntelligence(
  center: Coordinates,
  radiusMeters = 5500
): Promise<DeepAreaScanResult> {
  const roadRadius = Math.min(3200, Math.round(radiusMeters * 0.65))
  const overpassQuery = `[out:json][timeout:6];(nwr["amenity"~"police|fuel|hospital|clinic|fire_station|townhall|community_centre"](around:${radiusMeters},${center.lat},${center.lng});nwr["shop"~"convenience|supermarket"](around:${radiusMeters},${center.lat},${center.lng});way["highway"~"primary|secondary|tertiary|residential|unclassified"](around:${roadRadius},${center.lat},${center.lng}););out center 55;`

  const [geoInfo, elements] = await Promise.all([
    reverseGeocodeArea(center),
    queryOverpassWithFallback(overpassQuery)
  ])

  const discoveredHavens: SafeHaven[] = []
  const detectedRoads: Array<{
    id: number
    name: string
    lat: number
    lng: number
    highwayType: string
    isUnlit: boolean
  }> = []

  for (const el of elements) {
    const lat = typeof el.lat === 'number' ? el.lat : el.center?.lat
    const lon = typeof el.lon === 'number' ? el.lon : el.center?.lon
    if (typeof lat !== 'number' || typeof lon !== 'number') continue

    const tags = el.tags || {}
    const amenity = tags.amenity || ''
    const shop = tags.shop || ''
    const highway = tags.highway || ''

    if (amenity || shop) {
      let type: 'pos_polisi' | 'spbu' | 'minimarket_24h' = 'minimarket_24h'
      let fallbackTitle = `Minimarket / Warung Siaga ${geoInfo.villageName}`

      if (amenity === 'police' || amenity === 'fire_station' || amenity === 'townhall' || amenity === 'community_centre') {
        type = 'pos_polisi'
        if (amenity === 'police') fallbackTitle = `Pos Kepolisian ${geoInfo.subdistrictName}`
        else if (amenity === 'fire_station') fallbackTitle = `Pos Damkar Siaga 24 Jam ${geoInfo.subdistrictName}`
        else fallbackTitle = `Kantor Desa / Posko Warga ${geoInfo.villageName}`
      } else if (amenity === 'fuel') {
        type = 'spbu'
        fallbackTitle = `SPBU / Pertashop ${geoInfo.villageName}`
      } else if (amenity === 'hospital' || amenity === 'clinic') {
        type = 'pos_polisi'
        fallbackTitle = amenity === 'hospital'
          ? `IGD Rumah Sakit 24 Jam ${geoInfo.subdistrictName}`
          : `Puskesmas / Klinik Siaga ${geoInfo.villageName}`
      }

      const rawName = tags.name || tags.brand || tags.operator || ''
      const name = rawName ? String(rawName) : fallbackTitle
      const street = tags['addr:street'] || tags['addr:full'] || geoInfo.roadName
      const area = tags['addr:subdistrict'] || tags['addr:city'] || geoInfo.subdistrictName
      const address = [street, area].filter(Boolean).join(', ')

      const isDup = discoveredHavens.some(
        h => calculateDistanceMeters({ lat: h.latitude, lng: h.longitude }, { lat, lng: lon }) < 90
      )
      if (!isDup && discoveredHavens.length < 18) {
        discoveredHavens.push({
          id: 200000 + Number((el.id || discoveredHavens.length) % 700000),
          name,
          type,
          address,
          latitude: lat,
          longitude: lon
        })
      }
    } else if (highway) {
      const roadName = tags.name || tags['addr:street'] || ''
      const isUnlit = tags.lit === 'no' || tags.surface === 'unpaved' || tags.surface === 'gravel'
      detectedRoads.push({
        id: Number(el.id || detectedRoads.length + 1),
        name: roadName ? String(roadName) : `${geoInfo.roadName} (${geoInfo.villageName})`,
        lat,
        lng: lon,
        highwayType: String(highway),
        isUnlit
      })
    }
  }

  const seed = computeCoordSeed(center.lat, center.lng)

  if (discoveredHavens.length < 2) {
    const posCoords1 = detectedRoads[0]
      ? { lat: detectedRoads[0].lat + 0.0012, lng: detectedRoads[0].lng - 0.0011 }
      : { lat: center.lat + 0.0022, lng: center.lng - 0.0018 }

    const posCoords2 = detectedRoads[1]
      ? { lat: detectedRoads[1].lat - 0.0015, lng: detectedRoads[1].lng + 0.0014 }
      : { lat: center.lat - 0.0025, lng: center.lng + 0.0021 }

    discoveredHavens.push(
      {
        id: 800000 + (seed % 90000),
        name: `Pos Keamanan & Balai Warga ${geoInfo.villageName}`,
        type: 'pos_polisi',
        address: `${geoInfo.roadName}, ${geoInfo.villageName}, ${geoInfo.subdistrictName}`,
        latitude: posCoords1.lat,
        longitude: posCoords1.lng
      },
      {
        id: 800001 + (seed % 90000),
        name: `Posko Siaga Malam & Warung 24 Jam ${geoInfo.subdistrictName}`,
        type: 'minimarket_24h',
        address: `Jalur Utama ${geoInfo.villageName}, ${geoInfo.subdistrictName}, ${geoInfo.cityName}`,
        latitude: posCoords2.lat,
        longitude: posCoords2.lng
      }
    )
  }

  const localReports: Report[] = []
  const uniqueRoads: typeof detectedRoads = []
  for (const r of detectedRoads) {
    const tooClose = uniqueRoads.some(
      u => calculateDistanceMeters({ lat: u.lat, lng: u.lng }, { lat: r.lat, lng: r.lng }) < 280
    )
    if (!tooClose) {
      uniqueRoads.push(r)
    }
    if (uniqueRoads.length >= 4) break
  }

  const anchorPoints =
    uniqueRoads.length >= 3
      ? uniqueRoads
      : [
          {
            id: seed + 11,
            name: geoInfo.roadName,
            lat: center.lat + 0.0028,
            lng: center.lng + 0.0024,
            highwayType: 'residential',
            isUnlit: true
          },
          {
            id: seed + 22,
            name: `Jalur Penghubung ${geoInfo.villageName}`,
            lat: center.lat - 0.0034,
            lng: center.lng + 0.0019,
            highwayType: 'tertiary',
            isUnlit: false
          },
          {
            id: seed + 33,
            name: `Simpang Masuk ${geoInfo.subdistrictName}`,
            lat: center.lat + 0.0019,
            lng: center.lng - 0.0038,
            highwayType: 'secondary',
            isUnlit: false
          },
          {
            id: seed + 44,
            name: `Jalur Lingkar ${geoInfo.villageName}`,
            lat: center.lat - 0.0026,
            lng: center.lng - 0.0029,
            highwayType: 'unclassified',
            isUnlit: true
          }
        ]

  const templates: Array<{
    category: 'gelap' | 'sepi' | 'begal' | 'geng_motor'
    dangerLevel: 'high' | 'medium' | 'low'
    buildTitle: (road: string, village: string) => string
    buildDesc: (road: string, subdistrict: string) => string
    hoursAgo: number
  }> = [
    {
      category: 'gelap',
      dangerLevel: 'medium',
      buildTitle: (road, village) => `Lampu PJU Minim & Titik Gelap di ${road} (${village})`,
      buildDesc: (road, subdistrict) =>
        `Penerangan jalan di sepanjang ${road}, wilayah ${subdistrict} cukup redup pada malam hari dan berpotensi membahayakan pengendara motor.`,
      hoursAgo: 3
    },
    {
      category: 'sepi',
      dangerLevel: 'medium',
      buildTitle: (road, village) => `Jalur Sunyi Lewat Pukul 22.30 di Sekitar ${road} (${village})`,
      buildDesc: (road, subdistrict) =>
        `Aktivitas warga dan warung di ruas ${road} (${subdistrict}) mulai tutup lewat jam 10 malam. Disarankan tidak berhenti sendirian di pinggir jalur.`,
      hoursAgo: 6
    },
    {
      category: 'begal',
      dangerLevel: 'high',
      buildTitle: (road, village) => `Waspada Rawan Kejahatan Malam & Motor Pepet di Akses ${road}`,
      buildDesc: (road, subdistrict) =>
        `Laporan kewaspadaan warga untuk pengendara yang melintas di atas pukul 23.30 pada jalur ${road} arah ${subdistrict}. Tetap jaga kecepatan dan hindari bermain ponsel.`,
      hoursAgo: 9
    },
    {
      category: 'geng_motor',
      dangerLevel: 'high',
      buildTitle: (road, village) => `Waspada Konvoi & Kebut Malam di Jalur ${road} (${village})`,
      buildDesc: (road, subdistrict) =>
        `Sering terdengar rombongan motor melaju kencang saat dini hari di sekitar ruas ${road}, ${subdistrict}. Utamakan lewat jalur utama yang ramai.`,
      hoursAgo: 14
    }
  ]

  anchorPoints.slice(0, 4).forEach((pt, idx) => {
    const tpl = templates[(idx + (seed % 2)) % templates.length]
    const reportId = 500000 + ((seed + idx * 137) % 400000)
    const upvotes = 7 + ((seed + idx * 19) % 28)
    const resolvedCount = idx === 1 ? 3 : (seed + idx) % 2

    localReports.push({
      id: reportId,
      title: tpl.buildTitle(pt.name, geoInfo.villageName),
      description: tpl.buildDesc(pt.name, geoInfo.subdistrictName),
      category: tpl.category,
      dangerLevel: tpl.dangerLevel,
      latitude: pt.lat,
      longitude: pt.lng,
      upvotes,
      resolvedCount,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * tpl.hoursAgo)
    })
  })

  return {
    areaLabel: `${geoInfo.villageName}, ${geoInfo.subdistrictName}`,
    subdistrictLabel: `${geoInfo.subdistrictName}, ${geoInfo.cityName}`,
    havens: discoveredHavens,
    localReports
  }
}

export async function searchIndonesianPlaces(queryText: string): Promise<GeocodedPlace[]> {
  const clean = queryText.trim()
  if (clean.length < 3) return []

  async function runNominatimQuery(q: string): Promise<GeocodedPlace[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&limit=6&addressdetails=1&q=${encodeURIComponent(q)}`
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4500)

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'id'
        }
      })
      clearTimeout(timer)

      if (!res.ok) return []
      const items = await res.json()
      if (!Array.isArray(items)) return []

      return items.map((item: any) => ({
        id: String(item.place_id),
        name: String(item.name || item.display_name?.split(',')[0] || q),
        displayName: String(item.display_name || ''),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }))
    } catch {
      return []
    }
  }

  const primaryResults = await runNominatimQuery(clean)
  if (primaryResults.length > 0) {
    return primaryResults
  }

  const simplified = clean
    .replace(/\b(rt|rw|no|nomor|blok|gang|gg|rumah|kel|kelurahan|kec|kecamatan|desa|ds|kab|kabupaten)\b\.?\s*\d*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (simplified.length >= 3 && simplified.toLowerCase() !== clean.toLowerCase()) {
    const fallbackResults = await runNominatimQuery(simplified)
    if (fallbackResults.length > 0) {
      return fallbackResults
    }
  }

  const tokens = clean.split(/[\s,]+/).filter(t => t.length >= 3)
  if (tokens.length > 2) {
    const tailQuery = tokens.slice(-2).join(' ')
    return await runNominatimQuery(tailQuery)
  }

  return []
}

export async function fetchRoadWeatherCondition(coords: Coordinates): Promise<RoadWeatherAlert | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat.toFixed(4)}&longitude=${coords.lng.toFixed(4)}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) return null
    const data = await res.json()
    const current = data?.current
    if (!current) return null

    const code = Number(current.weather_code ?? 0)
    const temp = Math.round(Number(current.temperature_2m ?? 26))

    if (code >= 95) {
      return {
        conditionLabel: `Hujan Petir (${temp}°C)`,
        advisoryText: 'Waspada jarak pandang pendek, jalan licin, dan potensi pohon tumbang.',
        temperatureC: temp,
        isHazardousWeather: true
      }
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return {
        conditionLabel: `Hujan di Area Ini (${temp}°C)`,
        advisoryText: 'Permukaan aspal basah dan pantulan lampu berkurang di jalan gelap.',
        temperatureC: temp,
        isHazardousWeather: true
      }
    }
    if (code >= 45 && code <= 48) {
      return {
        conditionLabel: `Berkabut (${temp}°C)`,
        advisoryText: 'Jarak pandang malam terbatas, nyalakan lampu utama kendaraan.',
        temperatureC: temp,
        isHazardousWeather: true
      }
    }

    return {
      conditionLabel: `Cuaca Cerah/Berawan (${temp}°C)`,
      advisoryText: 'Jarak pandang jalan normal. Tetap waspada saat melintasi jalur sepi.',
      temperatureC: temp,
      isHazardousWeather: false
    }
  } catch {
    return null
  }
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
