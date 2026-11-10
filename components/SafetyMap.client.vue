<template>
  <div class="relative w-full h-full">
    <!-- Map Container -->
    <div ref="mapContainer" class="w-full h-full z-0"></div>

    <!-- Map Overlay Controls -->
    <div class="absolute top-4 right-4 z-[400] flex flex-col gap-2">
      <!-- Geolocation Button -->
      <button
        @click="locateUser"
        :disabled="isLocating"
        class="flex items-center justify-center w-11 h-11 rounded-xl bg-dark-900/90 hover:bg-dark-800 text-slate-200 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95 group"
        title="Pusatkan ke Lokasi Saya"
      >
        <span v-if="isLocating" class="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
        <svg v-else class="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      </button>

      <!-- Toggle Havens Layer Button -->
      <button
        @click="toggleHavens"
        :class="[
          'flex items-center justify-center w-11 h-11 rounded-xl border shadow-lg backdrop-blur-md transition-all active:scale-95',
          showHavensLocal
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-emerald-950/50'
            : 'bg-dark-900/90 text-slate-400 border-white/10 hover:text-slate-200'
        ]"
        :title="showHavensLocal ? 'Sembunyikan Safe Havens' : 'Tampilkan Safe Havens'"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </button>

      <!-- Reset Map View Button -->
      <button
        @click="resetView"
        class="flex items-center justify-center w-11 h-11 rounded-xl bg-dark-900/90 hover:bg-dark-800 text-slate-200 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition-all active:scale-95 group"
        title="Reset Tampilan Peta"
      >
        <svg class="w-5 h-5 text-slate-300 group-hover:rotate-45 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    <!-- Location Picking Indicator Notice -->
    <div
      v-if="isPickingLocation"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-indigo-600/90 text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-indigo-400/50 flex items-center gap-2 text-sm font-medium animate-bounce"
    >
      <span class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
      <span>Klik di mana saja pada peta untuk menandai titik rawan</span>
    </div>

    <!-- Map Legend Footer Overlay -->
    <div class="hidden sm:flex absolute bottom-6 left-6 z-[400] bg-dark-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl text-xs space-y-2">
      <div class="font-semibold text-slate-200 flex items-center gap-1.5 pb-1 border-b border-white/10">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Legenda Titik Peta</span>
      </div>
      <div class="flex items-center gap-2 text-slate-300">
        <span class="w-3 h-3 rounded-full bg-red-500 shadow-glow-danger"></span>
        <span>Begal & Geng Motor (Bahaya Tinggi)</span>
      </div>
      <div class="flex items-center gap-2 text-slate-300">
        <span class="w-3 h-3 rounded-full bg-amber-400 shadow-glow-warning"></span>
        <span>Jalan Gelap / Lampu Mati / Sepi</span>
      </div>
      <div class="flex items-center gap-2 text-slate-300">
        <span class="w-3 h-3 rounded-md bg-emerald-500 shadow-glow-safe"></span>
        <span>Safe Haven 24 Jam (SPBU, Minimarket, Polisi)</span>
      </div>
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
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
let L: any = null
let reportsLayerGroup: any = null
let havensLayerGroup: any = null
let userMarker: any = null
let pickerMarker: any = null

const isLocating = ref(false)
const showHavensLocal = ref(true)

// Default center: Jakarta & Jabodetabek Commute Hub
const DEFAULT_CENTER: [number, number] = [-6.2297, 106.8456]
const DEFAULT_ZOOM = 13

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    // Expose upvote helper to window so popup click handler works
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

  // Add zoom control at bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  // Use CARTO Dark Matter Dark Mode Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  reportsLayerGroup = L.layerGroup().addTo(map)
  havensLayerGroup = L.layerGroup().addTo(map)

  // Map click handler for picking location
  map.on('click', (e: any) => {
    const { lat, lng } = e.latlng
    setPickerLocation(lat, lng)
    emit('selectLocation', { lat, lng })
  })

  renderMarkers()
}

// Custom DivIcons
function createRedDangerIcon(isHigh: boolean) {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        ${isHigh ? '<span class="absolute w-9 h-9 rounded-full bg-rose-500/40 animate-ping"></span>' : ''}
        <div class="relative w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 border-2 border-white/90 shadow-glow-danger flex items-center justify-center text-white">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="absolute -bottom-1.5 w-2 h-2 bg-rose-600 rotate-45 border-r border-b border-white/70"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

function createYellowWarningIcon() {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-7 h-7 rounded-full bg-amber-400/20"></span>
        <div class="relative w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-white/90 shadow-glow-warning flex items-center justify-center text-dark-950">
          <svg class="w-4 h-4 fill-dark-950" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 w-1.5 h-1.5 bg-amber-500 rotate-45 border-r border-b border-white/70"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  })
}

function createSafeHavenIcon(type: string) {
  let iconSvg = `
    <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `

  if (type === 'spbu') {
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="22" x2="15" y2="22"/>
        <line x1="4" y1="9" x2="14" y2="9"/>
        <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/>
        <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
      </svg>
    `
  } else if (type === 'minimarket_24h') {
    iconSvg = `
      <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    `
  }

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-8 h-8 rounded-xl bg-emerald-500/30 pulse-safe"></span>
        <div class="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-white/90 shadow-glow-safe flex items-center justify-center text-white">
          ${iconSvg}
        </div>
        <div class="absolute -bottom-1 w-2 h-2 bg-emerald-600 rotate-45 border-r border-b border-white/70"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

function createUserLocationIcon() {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-8 h-8 rounded-full bg-cyan-400/40 animate-ping"></span>
        <div class="relative w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

function createPickerIcon() {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-10 h-10 rounded-full bg-indigo-500/40 animate-ping"></span>
        <div class="relative w-9 h-9 rounded-full bg-indigo-600 border-2 border-white shadow-2xl flex items-center justify-center text-white font-bold text-xs">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  })
}

function renderMarkers() {
  if (!map || !L || !reportsLayerGroup || !havensLayerGroup) return

  reportsLayerGroup.clearLayers()
  havensLayerGroup.clearLayers()

  // 1. Render Reports Markers
  const filteredReports = props.activeCategory && props.activeCategory !== 'all'
    ? props.reports.filter(r => r.category === props.activeCategory)
    : props.reports

  filteredReports.forEach((report) => {
    const isRedPin = report.category === 'begal' || report.category === 'geng_motor'
    const isHighDanger = report.dangerLevel === 'high'

    const icon = isRedPin ? createRedDangerIcon(isHighDanger) : createYellowWarningIcon()

    const marker = L.marker([report.latitude, report.longitude], { icon })

    const categoryLabel = {
      begal: 'Begal & Kejahatan',
      geng_motor: 'Geng Motor / Konvoi',
      gelap: 'Jalan Gelap / PJU Mati',
      sepi: 'Jalan Sepi'
    }[report.category] || report.category

    const dangerBadgeClass = {
      high: 'bg-red-500/20 text-red-300 border-red-500/40',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      low: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
    }[report.dangerLevel] || 'bg-slate-700 text-slate-300'

    const dangerLabel = {
      high: 'Bahaya Tinggi',
      medium: 'Waspada Sedang',
      low: 'Perhatian Rendah'
    }[report.dangerLevel] || report.dangerLevel

    const popupHtml = `
      <div class="p-4 bg-dark-900 text-slate-100 max-w-[280px]">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border ${dangerBadgeClass}">
            ${dangerLabel}
          </span>
          <span class="text-[11px] text-slate-400 font-mono">
            ${formatRelativeTime(report.createdAt)}
          </span>
        </div>
        <h4 class="font-bold text-sm text-white mb-1.5 leading-snug">${report.title}</h4>
        <p class="text-xs text-slate-300 mb-3 leading-relaxed">${report.description}</p>
        <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onclick="window.handleMapUpvote(${report.id})"
            class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition-colors"
          >
            <span>▲ Validasi</span>
            <span class="font-bold text-white bg-indigo-500/40 px-1.5 py-0.2 rounded text-[10px]">${report.upvotes}</span>
          </button>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-[11px] text-slate-400 hover:text-slate-200 underline decoration-slate-600 flex items-center gap-0.5"
          >
            Rute
            <svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    `

    marker.bindPopup(popupHtml, {
      className: 'safezone-dark-popup',
      maxWidth: 300
    })

    reportsLayerGroup.addLayer(marker)
  })

  // 2. Render Safe Havens Markers
  if (showHavensLocal.value) {
    props.safeHavens.forEach((haven) => {
      const icon = createSafeHavenIcon(haven.type)
      const marker = L.marker([haven.latitude, haven.longitude], { icon })

      const typeLabel = {
        minimarket_24h: 'Minimarket 24 Jam',
        spbu: 'SPBU 24 Jam',
        pos_polisi: 'Pos Polisi / Polsek'
      }[haven.type] || 'Safe Haven'

      const havenPopupHtml = `
        <div class="p-4 bg-dark-900 text-slate-100 max-w-[280px]">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              🛡️ Safe Haven (Perlindungan 24 Jam)
            </span>
          </div>
          <h4 class="font-bold text-sm text-white mb-1 leading-snug">${haven.name}</h4>
          <span class="inline-block text-[11px] text-emerald-400 font-medium mb-2">${typeLabel}</span>
          <p class="text-xs text-slate-300 mb-3 leading-relaxed">${haven.address}</p>
          <div class="pt-2 border-t border-white/10 flex justify-end">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${haven.latitude},${haven.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full text-center text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-safe transition-colors"
            >
              Navigasi Cepat ke Titik Aman
            </a>
          </div>
        </div>
      `

      marker.bindPopup(havenPopupHtml, {
        className: 'safezone-dark-popup',
        maxWidth: 300
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
    pickerMarker = L.marker([lat, lng], {
      icon: createPickerIcon(),
      draggable: true
    }).addTo(map)

    pickerMarker.on('dragend', (e: any) => {
      const position = e.target.getLatLng()
      emit('selectLocation', { lat: position.lat, lng: position.lng })
    })
  }

  pickerMarker.bindPopup(`
    <div class="p-3 text-xs text-slate-100">
      <div class="font-bold text-indigo-400 mb-1">📍 Titik Dipilih</div>
      <div class="font-mono text-slate-300">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
    </div>
  `).openPopup()
}

function locateUser() {
  if (!navigator.geolocation) {
    alert('Browser Anda tidak mendukung geolokasi GPS.')
    return
  }

  isLocating.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      if (map && L) {
        if (userMarker) {
          userMarker.setLatLng([lat, lng])
        } else {
          userMarker = L.marker([lat, lng], { icon: createUserLocationIcon() }).addTo(map)
          userMarker.bindPopup('<div class="p-2 text-xs font-bold text-cyan-400">📍 Lokasi Anda Saat Ini</div>')
        }

        map.flyTo([lat, lng], 15, { duration: 1.5 })
      }
    },
    (error) => {
      isLocating.value = false
      console.warn('Geolocation error:', error)
      alert('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi telah diaktifkan.')
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function toggleHavens() {
  showHavensLocal.value = !showHavensLocal.value
  renderMarkers()
}

function resetView() {
  if (!map) return
  map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.2 })
}

function flyTo(lat: number, lng: number, zoom = 16) {
  if (!map) return
  map.flyTo([lat, lng], zoom, { duration: 1.5 })
}

watch(() => [props.reports, props.safeHavens, props.activeCategory], () => {
  renderMarkers()
}, { deep: true })

defineExpose({
  flyTo,
  setPickerLocation,
  locateUser
})
</script>

<style>
.safezone-dark-popup .leaflet-popup-content-wrapper {
  background: #0f172a !important;
  color: #f8fafc !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 14px !important;
  padding: 0 !important;
}

.safezone-dark-popup .leaflet-popup-tip {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.custom-map-icon {
  background: transparent !important;
  border: none !important;
}
</style>
