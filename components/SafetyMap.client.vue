<template>
  <div class="w-full rounded-3xl border border-slate-200/90 shadow-card bg-white overflow-hidden flex flex-col">
    <div class="px-3.5 sm:px-4 py-2.5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 relative z-[450]">
      <div class="relative flex-1 min-w-[220px] sm:max-w-md">
        <div class="flex items-center bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-slate-900 rounded-xl px-3 py-2 border border-slate-200/90 transition-colors">
          <label for="map-search-input" class="sr-only">Cari alamat, desa, kecamatan, atau jalan di Indonesia</label>
          <svg aria-hidden="true" class="w-4 h-4 text-slate-500 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="map-search-input"
            v-model="searchQuery"
            type="search"
            @focus="isSearchDropdownOpen = true"
            @keydown.enter.prevent="selectFirstSearchResult"
            placeholder="Ketik alamat, desa, kecamatan, atau nama jalan..."
            class="bg-transparent text-xs text-slate-900 placeholder-slate-500 focus:outline-none w-full font-medium"
          />
          <span
            v-if="isSearchingPlaces"
            class="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin ml-1.5 shrink-0"
            aria-hidden="true"
          ></span>
          <button
            v-else-if="searchQuery"
            type="button"
            @click="clearSearch"
            aria-label="Hapus pencarian"
            class="text-slate-500 hover:text-slate-900 text-xs ml-1.5 px-1 font-bold"
          >
            ×
          </button>
        </div>

        <div
          v-if="searchQuery.trim() && isSearchDropdownOpen"
          class="absolute left-0 right-0 top-11 z-[900] bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden"
        >
          <div class="max-h-64 overflow-y-auto divide-y divide-slate-100">
            <div v-if="remotePlaces.length > 0">
              <div class="px-3.5 py-1.5 bg-emerald-50/90 text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center justify-between">
                <span>Alamat, Desa & Jalan di Indonesia</span>
                <span>Klik untuk Pindai</span>
              </div>
              <button
                v-for="place in remotePlaces"
                :key="`place-${place.id}`"
                type="button"
                @click="handleSelectRemotePlace(place)"
                class="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/80 transition-colors flex items-start gap-2.5"
              >
                <svg aria-hidden="true" class="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold text-slate-900 truncate">{{ place.name }}</div>
                  <div class="text-[11px] text-slate-500 truncate">{{ place.displayName }}</div>
                </div>
              </button>
            </div>

            <div v-if="searchResults.length > 0">
              <div class="px-3.5 py-1.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Titik Pantau Terdeteksi
              </div>
              <button
                v-for="res in searchResults"
                :key="`${res.kind}-${res.id}`"
                type="button"
                @click="handleSelectSearchResult(res)"
                class="w-full px-3.5 py-2.5 text-left hover:bg-slate-100/90 transition-colors flex items-start gap-2.5"
              >
                <span
                  :class="[
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    res.kind === 'haven' ? 'bg-emerald-500' : 'bg-rose-500'
                  ]"
                ></span>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold text-slate-900 truncate">{{ res.title }}</div>
                  <div class="text-[11px] text-slate-600 truncate">{{ res.subtitle }}</div>
                </div>
              </button>
            </div>

            <div
              v-if="isSearchingPlaces && remotePlaces.length === 0"
              class="px-3.5 py-3 text-xs text-slate-600 flex items-center justify-center gap-2"
            >
              <span class="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Mencari alamat "{{ searchQuery }}" di seluruh Indonesia...</span>
            </div>

            <div
              v-else-if="searchResults.length === 0 && remotePlaces.length === 0 && !isSearchingPlaces"
              class="px-3.5 py-3 text-xs text-slate-600 text-center"
            >
              Ketik nama jalan, kelurahan/desa, atau kecamatan lalu tekan Enter.
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        <button
          v-if="activeCategory !== 'all'"
          type="button"
          @click="$emit('update:category', 'all')"
          class="min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
          title="Hapus saringan kategori"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{{ categoryName(activeCategory) }}</span>
          <span class="text-slate-500 font-bold ml-0.5">×</span>
        </button>

        <button
          type="button"
          @click="locateUser"
          :disabled="isLocating"
          aria-label="Deteksi lokasi GPS alamat saya sekarang"
          title="Deteksi lokasi GPS saya sekarang"
          class="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 flex items-center gap-1.5 text-xs font-bold transition-colors"
        >
          <span v-if="isLocating" class="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
          <svg v-else aria-hidden="true" class="w-3.5 h-3.5 text-sky-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span>{{ isLocating ? 'Melacak...' : 'Lokasi Saya' }}</span>
        </button>

        <button
          type="button"
          @click="scanCurrentMapArea"
          :disabled="isScanningArea"
          aria-label="Pindai titik rawan, laporan warga, dan pos aman di area peta ini"
          title="Pindai titik rawan dan pos aman di area peta ini"
          class="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-70"
        >
          <span
            v-if="isScanningArea"
            class="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0"
          ></span>
          <svg
            v-else
            aria-hidden="true"
            class="w-3.5 h-3.5 text-emerald-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="3" x2="12" y2="6"/>
          </svg>
          <span>{{ isScanningArea ? 'Memindai...' : 'Pindai Area Ini' }}</span>
        </button>

        <button
          type="button"
          @click="routeToNearestHaven"
          aria-label="Tampilkan rute ke Pos Aman terdekat"
          title="Rute ke Pos Aman terdekat"
          class="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-700 flex items-center gap-1.5 text-xs font-bold transition-colors"
        >
          <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
          <span>Rute Pos Terdekat</span>
        </button>
      </div>
    </div>

    <div class="relative w-full h-[400px] sm:h-[450px] bg-[#0b0f19]">
      <div
        ref="mapContainer"
        class="w-full h-full z-0"
        role="region"
        aria-label="Peta interaktif titik rawan dan tempat berlindung 24 jam seluruh Indonesia"
      ></div>

      <div
        v-if="activeRouteInfo"
        class="absolute bottom-3.5 left-3.5 right-16 sm:right-auto sm:max-w-md z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-300 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        role="status"
        aria-live="polite"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {{ isFetchingRoute ? 'Menghitung Rute Jalan...' : activeRouteInfo.isRoadRoute ? 'Rute Jalan Raya Aktif' : 'Rute Kompas Aktif' }}
            </span>
          </div>
          <p class="text-xs font-bold text-slate-900 truncate">{{ activeRouteInfo.haven.name }}</p>
          <p class="text-[11px] text-slate-600 font-medium mt-0.5">
            Jarak tempuh: <strong class="text-slate-900">{{ activeRouteInfo.distanceLabel }}</strong>
            · Est. motor <strong class="text-slate-900">{{ activeRouteInfo.motorMinutes }} mnt</strong>
            (jalan kaki {{ activeRouteInfo.walkMinutes }} mnt)
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <a
            :href="`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeRouteInfo.haven.latitude},${activeRouteInfo.haven.longitude}&travelmode=two-wheeler`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            Google Maps
          </a>
          <button
            type="button"
            @click="$emit('clearRoute')"
            class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            aria-label="Tutup tampilan rute di peta"
          >
            Tutup
          </button>
        </div>
      </div>

      <div class="absolute bottom-3.5 right-3.5 z-[400] flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        <button
          type="button"
          @click="zoomIn"
          aria-label="Perbesar peta"
          title="Perbesar peta"
          class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors border-b border-slate-200 font-bold text-base"
        >
          +
        </button>
        <button
          type="button"
          @click="zoomOut"
          aria-label="Perkecil peta"
          title="Perkecil peta"
          class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors font-bold text-base"
        >
          −
        </button>
      </div>

      <div
        v-if="isPickingLocation"
        class="absolute top-3.5 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold border border-slate-700"
        role="status"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Klik pada peta untuk memilih titik koordinat laporan</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Report, SafeHaven } from '~/server/db/schema'
import { formatRelativeTime } from '~/utils/time'
import {
  calculateDistanceMeters,
  formatDistance,
  estimateMotorMinutes,
  estimateWalkMinutes,
  fetchOsrmStreetRoute,
  searchIndonesianPlaces,
  type Coordinates,
  type GeocodedPlace
} from '~/utils/geo'

interface SearchItem {
  kind: 'report' | 'haven'
  id: number
  title: string
  subtitle: string
  lat: number
  lng: number
}

const props = withDefaults(
  defineProps<{
    reports: Report[]
    safeHavens: SafeHaven[]
    activeCategory?: string
    mapFocus?: 'all' | 'reports' | 'havens'
    isPickingLocation?: boolean
    userCoords: Coordinates
    activeRouteHaven?: SafeHaven | null
    upvotedIds?: number[]
    resolvedIds?: number[]
    isScanningArea?: boolean
  }>(),
  {
    activeCategory: 'all',
    mapFocus: 'all',
    isPickingLocation: false,
    activeRouteHaven: null,
    upvotedIds: () => [],
    resolvedIds: () => [],
    isScanningArea: false
  }
)

const emit = defineEmits<{
  (e: 'selectLocation', payload: Coordinates): void
  (e: 'upvote', reportId: number): void
  (e: 'resolve', reportId: number): void
  (e: 'update:category', category: string): void
  (e: 'updateUserCoords', coords: Coordinates, isLiveGps: boolean): void
  (e: 'drawRoute', haven: SafeHaven): void
  (e: 'clearRoute'): void
  (e: 'scanArea', coords: Coordinates, placeLabel?: string, isSilent?: boolean): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const isSearchDropdownOpen = ref(false)
const remotePlaces = ref<GeocodedPlace[]>([])
const isSearchingPlaces = ref(false)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let mapMoveDebounceTimer: ReturnType<typeof setTimeout> | null = null
let lastAutoScanCoords: Coordinates = { ...props.userCoords }

const openedPopupTarget = ref<{ kind: 'report' | 'haven'; id: number } | null>(null)
let isRebuildingMarkers = false

let map: any = null
let L: any = null
let reportsLayerGroup: any = null
let havensLayerGroup: any = null
let routeLayerGroup: any = null
let userMarker: any = null
let pickerMarker: any = null
const reportMarkersMap = new Map<number, any>()
const havenMarkersMap = new Map<number, any>()

const isLocating = ref(false)
const isFetchingRoute = ref(false)
const osrmRouteStats = ref<{
  distanceMeters: number
  durationSeconds: number
  isRoadRoute: boolean
} | null>(null)

function categoryName(cat: string): string {
  const names: Record<string, string> = {
    begal: 'Begal & Kejahatan',
    geng_motor: 'Geng Motor',
    gelap: 'Lampu Mati / Gelap',
    sepi: 'Jalan Sepi'
  }
  return names[cat] || cat
}

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const searchResults = computed<SearchItem[]>(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []

  const matchedReports: SearchItem[] = props.reports
    .filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .map(r => ({
      kind: 'report',
      id: r.id,
      title: r.title,
      subtitle: r.description,
      lat: r.latitude,
      lng: r.longitude
    }))

  const matchedHavens: SearchItem[] = props.safeHavens
    .filter(h => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q))
    .map(h => ({
      kind: 'haven',
      id: h.id,
      title: h.name,
      subtitle: h.address,
      lat: h.latitude,
      lng: h.longitude
    }))

  return [...matchedReports, ...matchedHavens].slice(0, 5)
})

watch(searchQuery, (newVal) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  const q = newVal.trim()
  if (q.length < 3) {
    remotePlaces.value = []
    isSearchingPlaces.value = false
    return
  }

  isSearchingPlaces.value = true
  searchDebounceTimer = setTimeout(async () => {
    const places = await searchIndonesianPlaces(q)
    if (searchQuery.value.trim() === q) {
      remotePlaces.value = places
      isSearchingPlaces.value = false
    }
  }, 320)
})

function clearSearch() {
  searchQuery.value = ''
  remotePlaces.value = []
  isSearchDropdownOpen.value = false
  renderMarkers(false)
}

function focusPin(kind: 'report' | 'haven', id: number, lat: number, lng: number) {
  if (!map) return
  openedPopupTarget.value = { kind, id }
  lastAutoScanCoords = { lat, lng }
  map.flyTo([lat, lng], 16, { duration: 0.85 })
  setTimeout(() => {
    const marker = kind === 'report' ? reportMarkersMap.get(id) : havenMarkersMap.get(id)
    if (marker) {
      marker.openPopup()
    }
  }, 600)
}

function handleSelectSearchResult(item: SearchItem) {
  isSearchDropdownOpen.value = false
  focusPin(item.kind, item.id, item.lat, item.lng)
}

function handleSelectRemotePlace(place: GeocodedPlace) {
  isSearchDropdownOpen.value = false
  searchQuery.value = ''
  remotePlaces.value = []
  openedPopupTarget.value = null
  const coords = { lat: place.lat, lng: place.lng }
  lastAutoScanCoords = { ...coords }
  if (map) {
    map.flyTo([place.lat, place.lng], 15, { duration: 1.0 })
  }
  emit('scanArea', coords, place.name, false)
}

async function selectFirstSearchResult() {
  if (remotePlaces.value.length > 0) {
    handleSelectRemotePlace(remotePlaces.value[0])
    return
  }
  if (searchResults.value.length > 0) {
    handleSelectSearchResult(searchResults.value[0])
    return
  }
  const q = searchQuery.value.trim()
  if (q.length >= 3) {
    isSearchingPlaces.value = true
    const places = await searchIndonesianPlaces(q)
    isSearchingPlaces.value = false
    if (places.length > 0) {
      handleSelectRemotePlace(places[0])
    }
  }
}

function scanCurrentMapArea() {
  openedPopupTarget.value = null
  if (!map) {
    emit('scanArea', props.userCoords, undefined, false)
    return
  }
  const center = map.getCenter()
  const coords = { lat: center.lat, lng: center.lng }
  lastAutoScanCoords = { ...coords }
  emit('scanArea', coords, undefined, false)
}

const activeRouteInfo = computed(() => {
  if (!props.activeRouteHaven) return null
  const fallbackMeters = calculateDistanceMeters(props.userCoords, {
    lat: props.activeRouteHaven.latitude,
    lng: props.activeRouteHaven.longitude
  })
  const meters = osrmRouteStats.value?.distanceMeters ?? fallbackMeters
  const motorMinutes = osrmRouteStats.value?.isRoadRoute
    ? Math.max(1, Math.round(osrmRouteStats.value.durationSeconds / 60))
    : estimateMotorMinutes(meters)

  return {
    haven: props.activeRouteHaven,
    meters,
    distanceLabel: formatDistance(meters),
    motorMinutes,
    walkMinutes: estimateWalkMinutes(meters),
    isRoadRoute: osrmRouteStats.value?.isRoadRoute ?? false
  }
})

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    ;(window as any).handleMapUpvote = (id: number) => {
      emit('upvote', id)
    }
    ;(window as any).handleMapResolve = (id: number) => {
      emit('resolve', id)
    }
    ;(window as any).handleMapRouteHaven = (havenId: number) => {
      const target = props.safeHavens.find(h => h.id === havenId)
      if (target) {
        emit('drawRoute', target)
      }
    }

    initMap()
  }
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  if (mapMoveDebounceTimer) {
    clearTimeout(mapMoveDebounceTimer)
  }
  if (map) {
    map.remove()
    map = null
  }
  if (process.client) {
    delete (window as any).handleMapUpvote
    delete (window as any).handleMapResolve
    delete (window as any).handleMapRouteHaven
  }
})

function initMap() {
  if (!mapContainer.value || !L) return

  map = L.map(mapContainer.value, {
    center: [props.userCoords.lat, props.userCoords.lng],
    zoom: 13,
    zoomControl: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
    className: 'argologistics-style-tiles'
  }).addTo(map)

  routeLayerGroup = L.layerGroup().addTo(map)
  reportsLayerGroup = L.layerGroup().addTo(map)
  havensLayerGroup = L.layerGroup().addTo(map)

  map.on('click', (e: any) => {
    isSearchDropdownOpen.value = false
    openedPopupTarget.value = null
    const { lat, lng } = e.latlng
    if (props.isPickingLocation) {
      setPickerLocation(lat, lng)
      emit('selectLocation', { lat, lng })
    }
  })

  map.on('popupclose', () => {
    if (!isRebuildingMarkers) {
      openedPopupTarget.value = null
    }
  })

  map.on('moveend', () => {
    if (!map || openedPopupTarget.value) return
    const zoom = map.getZoom()
    if (zoom < 12) return

    const center = map.getCenter()
    const currentCenter = { lat: center.lat, lng: center.lng }
    const movedMeters = calculateDistanceMeters(lastAutoScanCoords, currentCenter)

    if (movedMeters > 1800) {
      if (mapMoveDebounceTimer) clearTimeout(mapMoveDebounceTimer)
      mapMoveDebounceTimer = setTimeout(() => {
        if (openedPopupTarget.value) return
        lastAutoScanCoords = { ...currentCenter }
        emit('scanArea', currentCenter, undefined, true)
      }, 700)
    }
  })

  renderUserMarker()
  renderMarkers(true)
  renderRouteLine()
}

function zoomIn() {
  if (map) map.zoomIn()
}

function zoomOut() {
  if (map) map.zoomOut()
}

function createUserPin() {
  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-user-beacon" title="Titik Posisi Anda (Geser untuk ubah titik awal)">
        <span class="sz-sonar-ring"></span>
        <span class="sz-sonar-ring sz-sonar-delay"></span>
        <div class="sz-user-core">
          <span class="sz-user-dot"></span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18]
  })
}

function createDangerPin(category: string, isResolved: boolean) {
  const isGang = category === 'geng_motor'
  const svgIcon = isGang
    ? `<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
       </svg>`
    : `<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
         <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
         <line x1="12" y1="9" x2="12" y2="13"/>
         <line x1="12" y1="17" x2="12.01" y2="17"/>
       </svg>`

  const resolvedBadge = isResolved
    ? `<span class="sz-resolved-badge" title="Mulai Kondusif">✓</span>`
    : ''

  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-pin-wrapper sz-pin-danger group">
        ${isResolved ? '' : '<span class="sz-danger-pulse"></span><span class="sz-danger-pulse sz-pulse-delay"></span>'}
        <div class="sz-pin-body sz-body-danger">
          ${resolvedBadge}
          <div class="sz-pin-inner-ring">
            ${svgIcon}
          </div>
        </div>
        <div class="sz-pin-tip sz-tip-danger"></div>
        <div class="sz-pin-shadow"></div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 48],
    popupAnchor: [0, -44]
  })
}

function createWarningPin(category: string, isResolved: boolean) {
  const isDarkRoad = category === 'gelap'
  const svgIcon = isDarkRoad
    ? `<svg class="w-4 h-4 text-slate-950 sz-flicker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
         <path d="M9 18h6"/>
         <path d="M10 22h4"/>
         <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
       </svg>`
    : `<svg class="w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
       </svg>`

  const resolvedBadge = isResolved
    ? `<span class="sz-resolved-badge" title="Mulai Kondusif">✓</span>`
    : ''

  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-pin-wrapper sz-pin-warning group">
        <span class="sz-warning-halo"></span>
        <div class="sz-pin-body sz-body-warning">
          ${resolvedBadge}
          <div class="sz-pin-inner-amber">
            ${svgIcon}
          </div>
        </div>
        <div class="sz-pin-tip sz-tip-warning"></div>
        <div class="sz-pin-shadow"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 44],
    popupAnchor: [0, -40]
  })
}

function createHavenPin(type: string) {
  let svgIcon = ''
  if (type === 'pos_polisi') {
    svgIcon = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>`
  } else if (type === 'spbu') {
    svgIcon = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="22" x2="15" y2="22"/>
        <line x1="4" y1="9" x2="14" y2="9"/>
        <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/>
        <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
      </svg>`
  } else {
    svgIcon = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>`
  }

  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-pin-wrapper sz-pin-haven group">
        <span class="sz-haven-glow"></span>
        <div class="sz-pin-body sz-body-haven">
          <span class="sz-live-badge"></span>
          <div class="sz-pin-inner-ring">
            ${svgIcon}
          </div>
        </div>
        <div class="sz-pin-tip sz-tip-haven"></div>
        <div class="sz-pin-shadow"></div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 48],
    popupAnchor: [0, -44]
  })
}

function renderUserMarker() {
  if (!map || !L) return

  if (userMarker) {
    userMarker.setLatLng([props.userCoords.lat, props.userCoords.lng])
  } else {
    userMarker = L.marker([props.userCoords.lat, props.userCoords.lng], {
      icon: createUserPin(),
      draggable: true
    }).addTo(map)

    userMarker.bindPopup(`
      <div class="p-3.5 pr-6 bg-white text-slate-900 max-w-[225px]">
        <div class="text-xs font-bold text-slate-900 mb-1">Titik Posisi Anda</div>
        <p class="text-[11px] text-slate-600 leading-snug">Geser pin biru ini atau klik tombol Lokasi Saya di bilah atas peta untuk memindai area sekitar.</p>
      </div>
    `, {
      className: 'safezone-light-popup',
      autoPanPaddingTopLeft: [20, 20],
      autoPanPaddingBottomRight: [20, 50]
    })

    userMarker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng()
      emit('updateUserCoords', { lat: pos.lat, lng: pos.lng }, false)
    })
  }
}

function renderMarkers(shouldFitBounds = false) {
  if (!map || !L || !reportsLayerGroup || !havensLayerGroup) return

  const activePopup = openedPopupTarget.value
  isRebuildingMarkers = true

  reportsLayerGroup.clearLayers()
  havensLayerGroup.clearLayers()
  reportMarkersMap.clear()
  havenMarkersMap.clear()

  const q = searchQuery.value.toLowerCase().trim()
  const showReports = props.mapFocus === 'all' || props.mapFocus === 'reports'
  const showHavens = props.mapFocus === 'all' || props.mapFocus === 'havens'

  const visiblePoints: [number, number][] = []

  if (showReports) {
    const filteredReports = props.reports.filter((r) => {
      const matchesCat = !props.activeCategory || props.activeCategory === 'all' || r.category === props.activeCategory
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })

    filteredReports.forEach((report) => {
      visiblePoints.push([report.latitude, report.longitude])
      const isRedPin = report.category === 'begal' || report.category === 'geng_motor'
      const isResolved = (report.resolvedCount || 0) >= 3
      const icon = isRedPin
        ? createDangerPin(report.category, isResolved)
        : createWarningPin(report.category, isResolved)
      const marker = L.marker([report.latitude, report.longitude], { icon })
      reportMarkersMap.set(report.id, marker)

      const hasUpvoted = props.upvotedIds.includes(report.id)
      const hasResolved = props.resolvedIds.includes(report.id)

      const dangerLabel = isResolved
        ? 'Mulai Kondusif'
        : ({
            high: 'Bahaya Tinggi',
            medium: 'Waspada',
            low: 'Risiko Rendah'
          }[report.dangerLevel] || 'Waspada')

      const dangerBadgeClass = isResolved
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : ({
            high: 'bg-rose-50 text-rose-700 border-rose-200',
            medium: 'bg-amber-50 text-amber-800 border-amber-200',
            low: 'bg-slate-100 text-slate-700 border-slate-200'
          }[report.dangerLevel] || 'bg-slate-100 text-slate-700')

      const upvoteBtnClass = hasUpvoted
        ? 'bg-slate-900 text-white border-slate-900'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'

      const resolveBtnClass = hasResolved
        ? 'bg-emerald-600 text-white border-emerald-600'
        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'

      const popupHtml = `
        <div class="p-3.5 bg-white text-slate-900 max-w-[265px]">
          <div class="flex items-center justify-between gap-2 pr-5 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${dangerBadgeClass}">
              ${dangerLabel}
            </span>
            <span class="text-[10px] font-medium text-slate-500">
              ${formatRelativeTime(report.createdAt)}
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${escapeHtml(report.title)}</h4>
          <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed">${escapeHtml(report.description)}</p>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
            <button
              type="button"
              onclick="window.handleMapUpvote(${report.id})"
              class="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${upvoteBtnClass}"
            >
              <span>${hasUpvoted ? '✓ Tervalidasi' : 'Validasi'}</span>
              <span>(${report.upvotes})</span>
            </button>
            <button
              type="button"
              onclick="window.handleMapResolve(${report.id})"
              class="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${resolveBtnClass}"
              title="Tandai jika jalan ini sudah diperbaiki atau sudah aman"
            >
              <span>${hasResolved ? '✓ Kondusif' : 'Sudah Aman'}</span>
              <span>(${report.resolvedCount || 0})</span>
            </button>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, {
        className: 'safezone-light-popup',
        maxWidth: 275,
        autoPan: true,
        autoPanPaddingTopLeft: [20, 20],
        autoPanPaddingBottomRight: [20, 56]
      })

      marker.on('popupopen', () => {
        openedPopupTarget.value = { kind: 'report', id: report.id }
      })

      reportsLayerGroup.addLayer(marker)
    })
  }

  if (showHavens) {
    const filteredHavens = props.safeHavens.filter((h) => {
      return !q || h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    })

    filteredHavens.forEach((haven) => {
      visiblePoints.push([haven.latitude, haven.longitude])
      const icon = createHavenPin(haven.type)
      const marker = L.marker([haven.latitude, haven.longitude], { icon })
      havenMarkersMap.set(haven.id, marker)

      const distMeters = calculateDistanceMeters(props.userCoords, {
        lat: haven.latitude,
        lng: haven.longitude
      })

      const havenPopupHtml = `
        <div class="p-3.5 bg-white text-slate-900 max-w-[260px]">
          <div class="flex items-center justify-between gap-2 pr-5 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              Pos Aman 24 Jam
            </span>
            <span class="text-[10px] font-semibold text-slate-600">
              ${formatDistance(distMeters)}
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${escapeHtml(haven.name)}</h4>
          <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed">${escapeHtml(haven.address)}</p>
          <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onclick="window.handleMapRouteHaven(${haven.id})"
              class="flex-1 text-center text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Rute Jalan Peta
            </button>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${haven.latitude},${haven.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
            >
              Maps
            </a>
          </div>
        </div>
      `

      marker.bindPopup(havenPopupHtml, {
        className: 'safezone-light-popup',
        maxWidth: 275,
        autoPan: true,
        autoPanPaddingTopLeft: [20, 20],
        autoPanPaddingBottomRight: [20, 56]
      })

      marker.on('popupopen', () => {
        openedPopupTarget.value = { kind: 'haven', id: haven.id }
      })

      havensLayerGroup.addLayer(marker)
    })
  }

  if (activePopup) {
    const targetMarker =
      activePopup.kind === 'report'
        ? reportMarkersMap.get(activePopup.id)
        : havenMarkersMap.get(activePopup.id)
    if (targetMarker) {
      targetMarker.openPopup()
    } else {
      openedPopupTarget.value = null
    }
  }

  isRebuildingMarkers = false

  if (shouldFitBounds && visiblePoints.length > 0 && !props.activeRouteHaven && !activePopup) {
    if (visiblePoints.length === 1) {
      map.flyTo(visiblePoints[0], 15, { duration: 0.9 })
    } else {
      const bounds = L.latLngBounds(visiblePoints)
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 })
    }
  }
}

async function renderRouteLine() {
  if (!map || !L || !routeLayerGroup) return

  routeLayerGroup.clearLayers()
  osrmRouteStats.value = null

  if (!props.activeRouteHaven) return

  const targetHaven = props.activeRouteHaven
  isFetchingRoute.value = true

  const routeData = await fetchOsrmStreetRoute(props.userCoords, {
    lat: targetHaven.latitude,
    lng: targetHaven.longitude
  })

  isFetchingRoute.value = false
  if (!props.activeRouteHaven || props.activeRouteHaven.id !== targetHaven.id) return

  osrmRouteStats.value = {
    distanceMeters: routeData.distanceMeters,
    durationSeconds: routeData.durationSeconds,
    isRoadRoute: routeData.isRoadRoute
  }

  const outerLine = L.polyline(routeData.coordinates, {
    color: '#10b981',
    weight: 9,
    opacity: 0.28,
    lineCap: 'round',
    lineJoin: 'round'
  })

  const innerLine = L.polyline(routeData.coordinates, {
    color: '#34d399',
    weight: 4,
    opacity: 0.96,
    dashArray: routeData.isRoadRoute ? undefined : '8, 8',
    lineCap: 'round',
    lineJoin: 'round'
  })

  routeLayerGroup.addLayer(outerLine)
  routeLayerGroup.addLayer(innerLine)

  const bounds = L.latLngBounds(routeData.coordinates)
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
}

function routeToNearestHaven() {
  if (!props.safeHavens.length) return
  let nearest = props.safeHavens[0]
  let minDistance = Infinity

  for (const h of props.safeHavens) {
    const d = calculateDistanceMeters(props.userCoords, { lat: h.latitude, lng: h.longitude })
    if (d < minDistance) {
      minDistance = d
      nearest = h
    }
  }

  if (nearest) {
    emit('drawRoute', nearest)
  }
}

function setPickerLocation(lat: number, lng: number) {
  if (!map || !L) return

  if (pickerMarker) {
    pickerMarker.setLatLng([lat, lng])
  } else {
    pickerMarker = L.marker([lat, lng], { draggable: true }).addTo(map)
    pickerMarker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng()
      emit('selectLocation', { lat: pos.lat, lng: pos.lng })
    })
  }
}

function locateUser() {
  if (!navigator.geolocation) return
  isLocating.value = true
  openedPopupTarget.value = null

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      lastAutoScanCoords = { lat, lng }
      emit('updateUserCoords', { lat, lng }, true)
      if (map) {
        map.flyTo([lat, lng], 15, { duration: 1.0 })
      }
    },
    () => {
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function flyTo(lat: number, lng: number, zoom = 15) {
  if (!map) return
  lastAutoScanCoords = { lat, lng }
  map.flyTo([lat, lng], zoom, { duration: 1.0 })
}

watch(
  [() => props.activeCategory, () => props.mapFocus],
  () => {
    openedPopupTarget.value = null
    renderMarkers(true)
  }
)

watch(
  [() => props.reports, () => props.safeHavens, () => props.upvotedIds, () => props.resolvedIds],
  () => {
    renderMarkers(false)
  },
  { deep: true }
)

watch(
  () => props.userCoords,
  () => {
    renderUserMarker()
    renderMarkers(false)
    if (props.activeRouteHaven) {
      renderRouteLine()
    }
  },
  { deep: true }
)

watch(
  () => props.activeRouteHaven,
  () => {
    renderRouteLine()
  }
)

defineExpose({
  flyTo,
  focusPin,
  locateUser,
  routeToNearestHaven,
  fitToVisibleMarkers: () => renderMarkers(true)
})
</script>

<style>
.argologistics-style-tiles {
  filter: invert(100%) hue-rotate(170deg) brightness(85%) contrast(120%) saturate(140%);
}

.safezone-light-popup .leaflet-popup-content-wrapper {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 16px !important;
  padding: 0 !important;
  box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.32) !important;
}

.safezone-light-popup .leaflet-popup-content {
  margin: 0 !important;
}

.safezone-light-popup .leaflet-popup-tip {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
}

.safezone-light-popup .leaflet-popup-close-button {
  top: 10px !important;
  right: 10px !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 8px !important;
  background: #f1f5f9 !important;
  color: #475569 !important;
  font-size: 15px !important;
  line-height: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  padding: 0 !important;
  transition: background-color 0.15s ease, color 0.15s ease !important;
}

.safezone-light-popup .leaflet-popup-close-button:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}

.sz-custom-pin {
  background: transparent !important;
  border: none !important;
}

.sz-pin-wrapper {
  position: relative;
  width: 44px;
  height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.sz-pin-wrapper:hover {
  transform: translateY(-5px) scale(1.1);
  z-index: 900;
}

.sz-pin-body {
  position: relative;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px -3px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.35);
}

.sz-body-danger {
  background: linear-gradient(145deg, #fb7185 0%, #e11d48 55%, #9f1239 100%);
  border: 1.5px solid #ffe4e6;
}

.sz-body-warning {
  width: 32px;
  height: 32px;
  border-radius: 11px;
  background: linear-gradient(145deg, #fde047 0%, #f59e0b 65%, #d97706 100%);
  border: 1.5px solid #fef9c3;
}

.sz-body-haven {
  background: linear-gradient(145deg, #34d399 0%, #059669 60%, #065f46 100%);
  border: 1.5px solid #d1fae5;
  animation: sz-haven-float 3.2s ease-in-out infinite;
}

.sz-pin-inner-ring {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sz-pin-inner-amber {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sz-pin-tip {
  width: 9px;
  height: 9px;
  transform: rotate(45deg);
  margin-top: -5px;
  z-index: 1;
  border-radius: 1.5px;
}

.sz-tip-danger {
  background: #9f1239;
  border-right: 1.5px solid #ffe4e6;
  border-bottom: 1.5px solid #ffe4e6;
}

.sz-tip-warning {
  background: #d97706;
  border-right: 1.5px solid #fef9c3;
  border-bottom: 1.5px solid #fef9c3;
}

.sz-tip-haven {
  background: #065f46;
  border-right: 1.5px solid #d1fae5;
  border-bottom: 1.5px solid #d1fae5;
  animation: sz-haven-float 3.2s ease-in-out infinite;
}

.sz-pin-shadow {
  width: 14px;
  height: 4px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.55);
  filter: blur(1px);
  margin-top: 2px;
}

.sz-danger-pulse {
  position: absolute;
  top: 2px;
  left: 7px;
  width: 30px;
  height: 30px;
  border-radius: 12px;
  background: rgba(244, 63, 94, 0.45);
  border: 1.5px solid rgba(251, 113, 133, 0.8);
  z-index: 0;
  pointer-events: none;
  animation: sz-radar-wave 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.sz-pulse-delay {
  animation-delay: 1.2s;
}

.sz-warning-halo {
  position: absolute;
  top: 0px;
  left: 4px;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.55) 0%, rgba(251, 191, 36, 0) 72%);
  z-index: 0;
  pointer-events: none;
  animation: sz-amber-breathe 2.6s ease-in-out infinite;
}

.sz-flicker-icon {
  animation: sz-lamp-flicker 3.5s infinite;
}

.sz-haven-glow {
  position: absolute;
  top: 2px;
  left: 7px;
  width: 30px;
  height: 30px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.35);
  filter: blur(5px);
  z-index: 0;
  pointer-events: none;
  animation: sz-amber-breathe 3s ease-in-out infinite;
}

.sz-live-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  background: #4ade80;
  border: 1.5px solid #064e3b;
  box-shadow: 0 0 6px #4ade80;
}

.sz-resolved-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: #10b981;
  color: #ffffff;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.sz-user-beacon {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.sz-user-beacon:active {
  cursor: grabbing;
}

.sz-sonar-ring {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: rgba(56, 189, 248, 0.32);
  border: 1.5px solid rgba(125, 211, 252, 0.7);
  animation: sz-sonar-expand 2.6s ease-out infinite;
  pointer-events: none;
}

.sz-sonar-delay {
  animation-delay: 1.3s;
}

.sz-user-core {
  position: relative;
  z-index: 2;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(14, 165, 233, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sz-user-dot {
  width: 11px;
  height: 11px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
}

@keyframes sz-radar-wave {
  0% {
    transform: scale(0.95);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.75);
    opacity: 0;
  }
}

@keyframes sz-sonar-expand {
  0% {
    transform: scale(0.45);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}

@keyframes sz-haven-float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2.5px);
  }
}

@keyframes sz-amber-breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.55;
  }
  50% {
    transform: scale(1.28);
    opacity: 0.95;
  }
}

@keyframes sz-lamp-flicker {
  0%, 18%, 22%, 62%, 64%, 100% {
    opacity: 1;
  }
  20%, 63% {
    opacity: 0.45;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sz-danger-pulse,
  .sz-sonar-ring,
  .sz-warning-halo,
  .sz-haven-glow,
  .sz-body-haven,
  .sz-tip-haven,
  .sz-flicker-icon {
    animation: none !important;
  }
}
</style>
