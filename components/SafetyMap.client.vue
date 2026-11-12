<template>
  <div class="relative w-full h-[380px] sm:h-[400px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-card bg-[#0b0f19]">
    <!-- Map Canvas -->
    <div ref="mapContainer" class="w-full h-full z-0"></div>

    <!-- Floating Top-Left Search & Filter Bar (Matching ArgoLogistics Dribbble) -->
    <div class="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2.5">
      <!-- Search Input Pill -->
      <div class="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-slate-200/90 shadow-md">
        <svg class="w-4 h-4 text-slate-400 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari jalan, begal, lokasi..."
          class="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-36 sm:w-56 font-medium"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="text-slate-400 hover:text-slate-600 text-xs ml-1"
        >
          ✕
        </button>
      </div>

      <!-- Category Filter Dropdown Pill -->
      <div class="relative">
        <select
          :value="activeCategory"
          @change="$emit('update:category', ($event.target as HTMLSelectElement).value)"
          class="appearance-none bg-white/95 backdrop-blur-md rounded-2xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-800 border border-slate-200/90 shadow-md cursor-pointer focus:outline-none"
        >
          <option value="all">Kategori: Semua</option>
          <option value="begal">🔴 Begal & Kejahatan</option>
          <option value="geng_motor">🟠 Geng Motor / Tawuran</option>
          <option value="gelap">🟡 PJU Mati / Gelap</option>
          <option value="sepi">⚪ Jalan Sepi</option>
        </select>
        <svg class="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </div>

    <!-- Floating Top-Right Map Controls -->
    <div class="absolute top-4 right-4 z-[400] flex items-center gap-2">
      <!-- Geolocation Button -->
      <button
        @click="locateUser"
        :disabled="isLocating"
        class="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-md flex items-center justify-center transition-all active:scale-95"
        title="Lokasi GPS Saya"
      >
        <span v-if="isLocating" class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
        <svg v-else class="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      </button>

      <!-- Toggle Safe Havens -->
      <button
        @click="toggleHavens"
        :class="[
          'w-10 h-10 rounded-2xl border shadow-md flex items-center justify-center transition-all active:scale-95',
          showHavensLocal
            ? 'bg-emerald-500 text-white border-emerald-600'
            : 'bg-white/95 backdrop-blur-md text-slate-400 border-slate-200/90 hover:text-slate-700'
        ]"
        :title="showHavensLocal ? 'Sembunyikan Safe Havens' : 'Tampilkan Safe Havens'"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </button>
    </div>

    <!-- Floating Bottom-Right Clean Vertical Zoom Controls -->
    <div class="absolute bottom-4 right-4 z-[400] flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
      <button
        @click="zoomIn"
        class="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors border-b border-slate-100 font-bold text-base"
        title="Perbesar"
      >
        +
      </button>
      <button
        @click="zoomOut"
        class="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors font-bold text-base"
        title="Perkecil"
      >
        −
      </button>
    </div>

    <!-- Location Picking Indicator Notice -->
    <div
      v-if="isPickingLocation"
      class="absolute top-16 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce"
    >
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span>Klik di mana saja pada peta untuk menentukan titik koordinat</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Report, SafeHaven } from '~/server/db/schema'
import { formatRelativeTime } from '~/utils/time'

const props = withDefaults(
  defineProps<{
    reports: Report[]
    safeHavens: SafeHaven[]
    activeCategory?: string
    isPickingLocation?: boolean
  }>(),
  {
    activeCategory: 'all',
    isPickingLocation: false
  }
)

const emit = defineEmits<{
  (e: 'selectLocation', payload: { lat: number; lng: number }): void
  (e: 'upvote', reportId: number): void
  (e: 'update:category', category: string): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
let map: any = null
let L: any = null
let reportsLayerGroup: any = null
let havensLayerGroup: any = null
let userMarker: any = null
let pickerMarker: any = null

const isLocating = ref(false)
const showHavensLocal = ref(true)

// Default center: Area Bandung / Jabodetabek
const DEFAULT_CENTER: [number, number] = [-6.8925, 107.6186]
const DEFAULT_ZOOM = 14

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    ;(window as any).handleMapUpvote = (id: number) => {
      emit('upvote', id)
    }

    initMap()
  }
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  if (process.client) {
    delete (window as any).handleMapUpvote
  }
})

function initMap() {
  if (!mapContainer.value || !L) return

  map = L.map(mapContainer.value, {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: false
  })

  // Dark vector styling matching the ArgoLogistics Dribbble map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
    className: 'argologistics-style-tiles'
  }).addTo(map)

  reportsLayerGroup = L.layerGroup().addTo(map)
  havensLayerGroup = L.layerGroup().addTo(map)

  map.on('click', (e: any) => {
    const { lat, lng } = e.latlng
    setPickerLocation(lat, lng)
    emit('selectLocation', { lat, lng })
  })

  renderMarkers()
}

function zoomIn() {
  if (map) map.zoomIn()
}

function zoomOut() {
  if (map) map.zoomOut()
}

// Custom White Stem Pin Icons (Matching Dribbble ArgoLogistics Pin Markers)
function createDribbbleDangerPin(isHigh: boolean) {
  return L.divIcon({
    className: 'dribbble-map-pin',
    html: `
      <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
        <div class="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-rose-500 flex items-center justify-center transition-transform group-hover:scale-110">
          <div class="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
        </div>
        <div class="w-0.5 h-3 bg-white shadow-sm"></div>
        <div class="w-2 h-1 bg-black/40 rounded-full blur-[1px]"></div>
      </div>
    `,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44]
  })
}

function createDribbbleWarningPin() {
  return L.divIcon({
    className: 'dribbble-map-pin',
    html: `
      <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
        <div class="w-7 h-7 rounded-full bg-white shadow-lg border-2 border-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
          <div class="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white">
            <svg class="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </div>
        </div>
        <div class="w-0.5 h-2.5 bg-white shadow-sm"></div>
        <div class="w-1.5 h-1 bg-black/40 rounded-full blur-[1px]"></div>
      </div>
    `,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38]
  })
}

function createDribbbleHavenPin() {
  return L.divIcon({
    className: 'dribbble-map-pin',
    html: `
      <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full cursor-pointer group">
        <div class="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-emerald-500 flex items-center justify-center transition-transform group-hover:scale-110">
          <div class="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>
        <div class="w-0.5 h-3 bg-white shadow-sm"></div>
        <div class="w-2 h-1 bg-black/40 rounded-full blur-[1px]"></div>
      </div>
    `,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44]
  })
}

function renderMarkers() {
  if (!map || !L || !reportsLayerGroup || !havensLayerGroup) return

  reportsLayerGroup.clearLayers()
  havensLayerGroup.clearLayers()

  const q = searchQuery.value.toLowerCase().trim()

  const filteredReports = props.reports.filter((r) => {
    const matchesCat = !props.activeCategory || props.activeCategory === 'all' || r.category === props.activeCategory
    const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  filteredReports.forEach((report) => {
    const isRedPin = report.category === 'begal' || report.category === 'geng_motor'
    const isHighDanger = report.dangerLevel === 'high'
    const icon = isRedPin ? createDribbbleDangerPin(isHighDanger) : createDribbbleWarningPin()
    const marker = L.marker([report.latitude, report.longitude], { icon })

    const dangerBadgeClass = {
      high: 'bg-rose-50 text-rose-700 border-rose-200',
      medium: 'bg-amber-50 text-amber-800 border-amber-200',
      low: 'bg-slate-100 text-slate-700 border-slate-200'
    }[report.dangerLevel] || 'bg-slate-100 text-slate-700'

    const popupHtml = `
      <div class="p-3.5 bg-white text-slate-900 max-w-[260px]">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${dangerBadgeClass}">
            ${report.dangerLevel.toUpperCase()}
          </span>
          <span class="text-[10px] text-slate-400">
            ${formatRelativeTime(report.createdAt)}
          </span>
        </div>
        <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${report.title}</h4>
        <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed line-clamp-2">${report.description}</p>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onclick="window.handleMapUpvote(${report.id})"
            class="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
          >
            <span>▲ Validasi</span>
            <span class="text-slate-900">${report.upvotes}</span>
          </button>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[11px] font-medium text-emerald-700 hover:underline"
          >
            Rute
          </a>
        </div>
      </div>
    `

    marker.bindPopup(popupHtml, {
      className: 'safezone-light-popup',
      maxWidth: 280
    })

    reportsLayerGroup.addLayer(marker)
  })

  if (showHavensLocal.value) {
    const filteredHavens = props.safeHavens.filter((h) => {
      return !q || h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    })

    filteredHavens.forEach((haven) => {
      const icon = createDribbbleHavenPin()
      const marker = L.marker([haven.latitude, haven.longitude], { icon })

      const havenPopupHtml = `
        <div class="p-3.5 bg-white text-slate-900 max-w-[260px]">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              🛡️ Safe Haven 24 Jam
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${haven.name}</h4>
          <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed">${haven.address}</p>
          <div class="pt-2 border-t border-slate-100 flex justify-end">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${haven.latitude},${haven.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full text-center text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Navigasi Cepat
            </a>
          </div>
        </div>
      `

      marker.bindPopup(havenPopupHtml, {
        className: 'safezone-light-popup',
        maxWidth: 280
      })

      havensLayerGroup.addLayer(marker)
    })
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

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      if (map) {
        map.flyTo([lat, lng], 15, { duration: 1.2 })
      }
    },
    () => {
      isLocating.value = false
      alert('Gagal mengambil lokasi GPS.')
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function toggleHavens() {
  showHavensLocal.value = !showHavensLocal.value
  renderMarkers()
}

function flyTo(lat: number, lng: number, zoom = 15) {
  if (!map) return
  map.flyTo([lat, lng], zoom, { duration: 1.2 })
}

watch([() => props.reports, () => props.safeHavens, () => props.activeCategory, searchQuery], () => {
  renderMarkers()
}, { deep: true })

defineExpose({
  flyTo,
  locateUser
})
</script>

<style>
/* Exact styling matching ArgoLogistics Dark Map with Cyan Water and Mint Highlights */
.argologistics-style-tiles {
  filter: invert(100%) hue-rotate(170deg) brightness(85%) contrast(120%) saturate(140%);
}

.safezone-light-popup .leaflet-popup-content-wrapper {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  padding: 0 !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
}

.safezone-light-popup .leaflet-popup-tip {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
}

.dribbble-map-pin {
  background: transparent !important;
  border: none !important;
}
</style>
