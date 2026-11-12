<template>
  <main class="min-h-screen bg-[#EBECEF] p-2.5 sm:p-5 lg:p-6 flex flex-col items-center justify-start antialiased font-sans">
    <div class="w-full max-w-[1440px] bg-[#F4F5F7] rounded-3xl sm:rounded-[32px] p-3.5 sm:p-5 border border-slate-300/60 shadow-2xl flex flex-col gap-4">
      <Navbar
        :reports-count="cityReports.length"
        :havens-count="cityHavens.length"
        :map-focus="mapFocus"
        :active-city-id="activeCityId"
        :cities="INDONESIAN_CITIES"
        :is-sending-sos="isSendingSos"
        @open-report-modal="openReportModal"
        @update:map-focus="handleUpdateMapFocus"
        @update:city="handleSelectCity"
        @trigger-sos="handleTriggerSos"
      />

      <div
        v-if="loadError"
        role="alert"
        class="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900"
      >
        <span class="text-xs font-medium">{{ loadError }}</span>
        <button
          type="button"
          @click="loadData"
          class="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors shrink-0"
        >
          Muat Ulang Data
        </button>
      </div>

      <section aria-label="Peta Navigasi dan Pemantauan" class="w-full">
        <ClientOnly>
          <SafetyMap
            ref="safetyMapRef"
            :reports="cityReports"
            :safe-havens="cityHavens"
            :active-category="activeCategory"
            :map-focus="mapFocus"
            :is-picking-location="isPickingLocation"
            :user-coords="userCoords"
            :active-route-haven="activeRouteHaven"
            @select-location="handleSelectLocation"
            @upvote="handleUpvote"
            @update:category="activeCategory = $event"
            @update-user-coords="handleUpdateUserCoords"
            @draw-route="handleDrawRoute"
            @clear-route="activeRouteHaven = null"
          />
          <template #fallback>
            <div class="w-full h-[380px] sm:h-[420px] rounded-3xl bg-[#0b0f19] flex flex-col items-center justify-center text-slate-300 gap-3 border border-slate-200/80">
              <span class="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
              <p class="text-xs font-semibold text-slate-200">Memuat peta navigasi SafeZone...</p>
            </div>
          </template>
        </ClientOnly>
      </section>

      <section
        v-if="isLoading"
        aria-label="Memuat statistik laporan"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card h-[280px] flex flex-col justify-between animate-pulse"
        >
          <div class="h-5 w-1/2 bg-slate-200 rounded-lg"></div>
          <div class="h-24 w-full bg-slate-100 rounded-2xl"></div>
          <div class="h-12 w-full bg-slate-100 rounded-2xl"></div>
        </div>
      </section>

      <section
        v-else
        aria-label="Panel Statistik, Pos Aman, dan Laporan Warga"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <IncidentAnalyticsCard
          :reports="cityReports"
          :active-category="activeCategory"
          @select-category="handleSelectCategory"
        />

        <SafeHavenHubCard
          :havens="cityHavens"
          :user-coords="userCoords"
          :active-route-haven-id="activeRouteHaven?.id || null"
          @focus-haven="handleFocusHaven"
          @draw-route="handleDrawRoute"
        />

        <LatestReportAndTrendsCard
          class="md:col-span-2 lg:col-span-1"
          :reports="cityReports"
          :active-category="activeCategory"
          @open-report-modal="openReportModal"
          @focus-report="handleFocusReport"
          @select-category="handleSelectCategory"
        />
      </section>
    </div>

    <ReportModal
      :is-open="isReportModalOpen"
      :initial-coords="pickedCoords || userCoords"
      @close="isReportModalOpen = false"
      @created="handleReportCreated"
      @pick-from-map="startMapPicker"
    />

    <div
      v-if="toast.show"
      role="status"
      aria-live="polite"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 shadow-float text-xs font-semibold flex items-center gap-2 text-white"
    >
      <span
        :class="[
          'w-2 h-2 rounded-full shrink-0',
          toast.type === 'success' ? 'bg-emerald-400' : 'bg-sky-400'
        ]"
      ></span>
      <span>{{ toast.message }}</span>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Report, SafeHaven } from '~/server/db/schema'
import {
  INDONESIAN_CITIES,
  calculateDistanceMeters,
  buildWhatsAppSosUrl,
  formatDistance,
  type Coordinates
} from '~/utils/geo'

const safetyMapRef = ref<any>(null)
const reports = ref<Report[]>([])
const safeHavens = ref<SafeHaven[]>([])
const isLoading = ref(true)
const loadError = ref('')

const activeCityId = ref<string>('jakarta')
const activeCategory = ref<string>('all')
const mapFocus = ref<'all' | 'reports' | 'havens'>('all')

const userCoords = ref<Coordinates>({
  lat: INDONESIAN_CITIES[0].center.lat,
  lng: INDONESIAN_CITIES[0].center.lng
})
const isUserGpsLive = ref(false)
const activeRouteHaven = ref<SafeHaven | null>(null)
const isSendingSos = ref(false)

const isReportModalOpen = ref(false)
const isPickingLocation = ref(false)
const pickedCoords = ref<Coordinates | null>(null)

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'info'
})

const currentCity = computed(() => {
  return INDONESIAN_CITIES.find(c => c.id === activeCityId.value) || INDONESIAN_CITIES[0]
})

const cityReports = computed(() => {
  if (activeCityId.value === 'all') return reports.value
  const maxMeters = currentCity.value.radiusKm * 1000
  return reports.value.filter((r) => {
    const dist = calculateDistanceMeters(currentCity.value.center, {
      lat: r.latitude,
      lng: r.longitude
    })
    return dist <= maxMeters
  })
})

const cityHavens = computed(() => {
  if (activeCityId.value === 'all') return safeHavens.value
  const maxMeters = currentCity.value.radiusKm * 1000
  return safeHavens.value.filter((h) => {
    const dist = calculateDistanceMeters(currentCity.value.center, {
      lat: h.latitude,
      lng: h.longitude
    })
    return dist <= maxMeters
  })
})

function showToast(message: string, type: 'success' | 'info' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3500)
}

async function loadData() {
  isLoading.value = true
  loadError.value = ''
  try {
    const [reportsRes, havensRes] = await Promise.all([
      $fetch<{ success: boolean; data: Report[] }>('/api/reports'),
      $fetch<{ success: boolean; data: SafeHaven[] }>('/api/havens')
    ])

    if (reportsRes.success) {
      reports.value = reportsRes.data
    }
    if (havensRes.success) {
      safeHavens.value = havensRes.data
    }
  } catch (error) {
    console.error('Gagal memuat data SafeZone:', error)
    loadError.value = 'Gagal terhubung ke server basis data. Periksa koneksi internet Anda lalu coba muat ulang.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

function handleSelectCity(cityId: string) {
  activeCityId.value = cityId
  activeRouteHaven.value = null
  const targetCity = INDONESIAN_CITIES.find(c => c.id === cityId)
  if (!targetCity) return

  if (cityId === 'all') {
    if (safetyMapRef.value?.flyTo) {
      safetyMapRef.value.flyTo(-2.5489, 118.0149, 5)
    }
    showToast('Menampilkan seluruh cakupan wilayah Indonesia.', 'info')
  } else {
    userCoords.value = { ...targetCity.center }
    if (safetyMapRef.value?.flyTo) {
      safetyMapRef.value.flyTo(targetCity.center.lat, targetCity.center.lng, 13)
    }
    showToast(`Wilayah pantauan diubah ke ${targetCity.name}.`, 'success')
  }
}

function handleUpdateUserCoords(coords: Coordinates, isLiveGps: boolean) {
  userCoords.value = coords
  if (isLiveGps) {
    isUserGpsLive.value = true
    let closestCity = INDONESIAN_CITIES[0]
    let minCityDist = Infinity
    for (const c of INDONESIAN_CITIES) {
      if (c.id === 'all') continue
      const d = calculateDistanceMeters(coords, c.center)
      if (d < minCityDist) {
        minCityDist = d
        closestCity = c
      }
    }
    if (minCityDist <= closestCity.radiusKm * 1000) {
      activeCityId.value = closestCity.id
    } else {
      activeCityId.value = 'all'
    }
    showToast('Lokasi GPS Anda berhasil diperbarui di peta.', 'success')
  } else {
    showToast('Titik awal rute diperbarui.', 'info')
  }
}

function handleDrawRoute(haven: SafeHaven) {
  if (activeRouteHaven.value?.id === haven.id) {
    activeRouteHaven.value = null
    showToast('Garis rute di peta ditutup.', 'info')
    return
  }
  mapFocus.value = 'all'
  activeRouteHaven.value = haven
  const dist = calculateDistanceMeters(userCoords.value, {
    lat: haven.latitude,
    lng: haven.longitude
  })
  showToast(`Menampilkan rute ke ${haven.name} (${formatDistance(dist)}).`, 'success')
}

function findNearestHavenName(coords: Coordinates): string | undefined {
  if (!safeHavens.value.length) return undefined
  let nearest = safeHavens.value[0]
  let minDist = Infinity
  for (const h of safeHavens.value) {
    const d = calculateDistanceMeters(coords, { lat: h.latitude, lng: h.longitude })
    if (d < minDist) {
      minDist = d
      nearest = h
    }
  }
  return nearest ? `${nearest.name} (${formatDistance(minDist)})` : undefined
}

function handleTriggerSos() {
  if (!process.client) return
  isSendingSos.value = true

  const openWa = (coords: Coordinates, live: boolean) => {
    isSendingSos.value = false
    const nearestName = findNearestHavenName(coords)
    const url = buildWhatsAppSosUrl(coords, nearestName, live)
    window.open(url, '_blank', 'noopener,noreferrer')
    showToast('Membuka WhatsApp dengan koordinat darurat.', 'success')
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        userCoords.value = coords
        isUserGpsLive.value = true
        openWa(coords, true)
      },
      () => {
        openWa(userCoords.value, isUserGpsLive.value)
      },
      { enableHighAccuracy: true, timeout: 4500 }
    )
  } else {
    openWa(userCoords.value, isUserGpsLive.value)
  }
}

function handleUpdateMapFocus(focus: 'all' | 'reports' | 'havens') {
  mapFocus.value = focus
  activeRouteHaven.value = null
  if (focus === 'havens') {
    activeCategory.value = 'all'
    showToast(`Menampilkan ${cityHavens.value.length} Pos Aman 24 Jam di wilayah ini.`, 'info')
  } else if (focus === 'reports') {
    showToast(`Menampilkan ${cityReports.value.length} Titik Rawan di wilayah ini.`, 'info')
  } else {
    showToast('Menampilkan seluruh pin Titik Rawan dan Pos Aman.', 'info')
  }
}

function handleSelectCategory(category: string) {
  activeCategory.value = category
  activeRouteHaven.value = null
  mapFocus.value = category === 'all' ? 'all' : 'reports'
}

function handleFocusHaven(haven: SafeHaven) {
  mapFocus.value = 'all'
  if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(haven.latitude, haven.longitude, 16)
  }
}

function handleFocusReport(report: Report) {
  mapFocus.value = 'all'
  if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(report.latitude, report.longitude, 16)
  }
}

async function handleUpvote(reportId: number) {
  const target = reports.value.find(r => r.id === reportId)
  if (target) {
    target.upvotes += 1
  }

  showToast('Validasi Anda tercatat untuk titik rawan ini.', 'success')

  try {
    await $fetch(`/api/reports/${reportId}/upvote`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Gagal upvote:', error)
  }
}

function openReportModal() {
  isPickingLocation.value = false
  isReportModalOpen.value = true
}

function startMapPicker() {
  isReportModalOpen.value = false
  isPickingLocation.value = true
  showToast('Klik pada peta untuk menentukan titik koordinat laporan.', 'info')
}

function handleSelectLocation(payload: Coordinates) {
  pickedCoords.value = payload
  if (isPickingLocation.value) {
    isPickingLocation.value = false
    isReportModalOpen.value = true
    showToast(`Koordinat dipilih: ${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)}`, 'success')
  }
}

function handleReportCreated(newReport: Report) {
  reports.value.unshift(newReport)
  showToast('Laporan baru berhasil disimpan dan ditampilkan di peta.', 'success')
  if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(newReport.latitude, newReport.longitude, 16)
  }
}
</script>
