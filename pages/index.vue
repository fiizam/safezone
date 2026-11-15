<template>
  <main class="min-h-screen bg-[#EBECEF] p-2.5 sm:p-5 lg:p-6 flex flex-col items-center justify-start antialiased font-sans">
    <div class="w-full max-w-[1440px] bg-[#F4F5F7] rounded-3xl sm:rounded-[32px] p-3.5 sm:p-5 border border-slate-300/60 shadow-2xl flex flex-col gap-3.5">
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
        class="bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-subtle flex flex-wrap items-center justify-between gap-2.5 text-xs"
        role="region"
        aria-label="Pemberitahuan kondisi jalan dan radar pelosok nasional"
      >
        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5 min-w-0">
          <span
            v-if="detectedAreaLabel"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-900 text-white shrink-0"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Radar: {{ detectedAreaLabel }}</span>
          </span>

          <span
            :class="[
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] border shrink-0',
              roadWeather?.isHazardousWeather
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-slate-100 text-slate-800 border-slate-200/80'
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                roadWeather?.isHazardousWeather ? 'bg-amber-500' : 'bg-emerald-500'
              ]"
            ></span>
            <span>{{ roadWeather ? roadWeather.conditionLabel : 'Memuat Cuaca Jalan...' }}</span>
          </span>

          <span class="text-slate-600 font-medium truncate">
            {{ roadWeather ? roadWeather.advisoryText : 'Memantau visibilitas dan keamanan jalur malam hingga tingkat desa/kecamatan.' }}
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0 ml-auto">
          <span
            v-if="discoveredReports.length > 0 || discoveredHavens.length > 0"
            class="text-[11px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg"
          >
            +{{ discoveredReports.length }} Rawan & +{{ discoveredHavens.length }} Pos Lokal Aktif
          </span>
          <InfoPopover
            title="Radar Pelosok Nusantara"
            content="Menjangkau seluruh desa, kelurahan, kecamatan, dan jalan pelosok Indonesia. Ketik alamat Anda di kotak pencarian peta atau geser peta untuk mendeteksi titik rawan, laporan warga, dan pos aman terdekat secara otomatis."
            label="Info radar pelosok nusantara"
          />
        </div>
      </div>

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
            :upvoted-ids="upvotedIds"
            :resolved-ids="resolvedIds"
            :is-scanning-area="isScanningOverpass"
            @select-location="handleSelectLocation"
            @upvote="handleUpvote"
            @resolve="handleResolve"
            @update:category="activeCategory = $event"
            @update-user-coords="handleUpdateUserCoords"
            @draw-route="handleDrawRoute"
            @clear-route="activeRouteHaven = null"
            @scan-area="handleScanArea"
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
  scanDeepAreaIntelligence,
  fetchRoadWeatherCondition,
  type Coordinates,
  type RoadWeatherAlert
} from '~/utils/geo'

const UPVOTED_STORAGE_KEY = 'safezone_upvoted_reports_v1'
const RESOLVED_STORAGE_KEY = 'safezone_resolved_reports_v1'

const safetyMapRef = ref<any>(null)
const reports = ref<Report[]>([])
const safeHavens = ref<SafeHaven[]>([])
const discoveredReports = ref<Report[]>([])
const discoveredHavens = ref<SafeHaven[]>([])
const detectedAreaLabel = ref<string>('Jakarta & Sekitarnya')
const isScanningOverpass = ref(false)
const roadWeather = ref<RoadWeatherAlert | null>(null)

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

const upvotedIds = ref<number[]>([])
const resolvedIds = ref<number[]>([])

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

const mergedReports = computed<Report[]>(() => {
  const combined = [...reports.value]
  for (const localRep of discoveredReports.value) {
    const isDuplicate = combined.some(
      existing =>
        existing.id === localRep.id ||
        calculateDistanceMeters(
          { lat: existing.latitude, lng: existing.longitude },
          { lat: localRep.latitude, lng: localRep.longitude }
        ) < 110
    )
    if (!isDuplicate) {
      combined.push(localRep)
    }
  }
  return combined
})

const mergedSafeHavens = computed<SafeHaven[]>(() => {
  const combined = [...safeHavens.value]
  for (const disc of discoveredHavens.value) {
    const isDuplicate = combined.some(
      existing =>
        existing.id === disc.id ||
        calculateDistanceMeters(
          { lat: existing.latitude, lng: existing.longitude },
          { lat: disc.latitude, lng: disc.longitude }
        ) < 85
    )
    if (!isDuplicate) {
      combined.push(disc)
    }
  }
  return combined
})

const cityReports = computed(() => {
  const maxMeters = currentCity.value.radiusKm * 1000
  const filtered =
    activeCityId.value === 'all'
      ? [...mergedReports.value]
      : mergedReports.value.filter((r) => {
          const distFromCity = calculateDistanceMeters(currentCity.value.center, {
            lat: r.latitude,
            lng: r.longitude
          })
          const distFromUser = calculateDistanceMeters(userCoords.value, {
            lat: r.latitude,
            lng: r.longitude
          })
          return distFromCity <= maxMeters || distFromUser <= 25000
        })

  return filtered.sort((a, b) => {
    const distA = calculateDistanceMeters(userCoords.value, { lat: a.latitude, lng: a.longitude })
    const distB = calculateDistanceMeters(userCoords.value, { lat: b.latitude, lng: b.longitude })
    return distA - distB
  })
})

const cityHavens = computed(() => {
  if (activeCityId.value === 'all') return mergedSafeHavens.value
  const maxMeters = currentCity.value.radiusKm * 1000
  return mergedSafeHavens.value.filter((h) => {
    const distFromCity = calculateDistanceMeters(currentCity.value.center, {
      lat: h.latitude,
      lng: h.longitude
    })
    const distFromUser = calculateDistanceMeters(userCoords.value, {
      lat: h.latitude,
      lng: h.longitude
    })
    return distFromCity <= maxMeters || distFromUser <= 25000
  })
})

function loadStoredVotes() {
  if (!process.client) return
  try {
    const rawUpvoted = localStorage.getItem(UPVOTED_STORAGE_KEY)
    if (rawUpvoted) {
      upvotedIds.value = JSON.parse(rawUpvoted)
    }
    const rawResolved = localStorage.getItem(RESOLVED_STORAGE_KEY)
    if (rawResolved) {
      resolvedIds.value = JSON.parse(rawResolved)
    }
  } catch {
    upvotedIds.value = []
    resolvedIds.value = []
  }
}

function saveStoredVotes() {
  if (!process.client) return
  try {
    localStorage.setItem(UPVOTED_STORAGE_KEY, JSON.stringify(upvotedIds.value))
    localStorage.setItem(RESOLVED_STORAGE_KEY, JSON.stringify(resolvedIds.value))
  } catch {
    // Abaikan batas penyimpanan lokal
  }
}

function showToast(message: string, type: 'success' | 'info' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3500)
}

async function refreshAreaIntelligence(coords: Coordinates, silent = true) {
  if (!process.client) return
  isScanningOverpass.value = true
  try {
    const [scanRes, weather] = await Promise.all([
      scanDeepAreaIntelligence(coords, 5500),
      fetchRoadWeatherCondition(coords)
    ])

    if (weather) {
      roadWeather.value = weather
    }

    if (scanRes.areaLabel) {
      detectedAreaLabel.value = scanRes.areaLabel
    }

    let addedHavens = 0
    if (scanRes.havens.length > 0) {
      const nextHavens = [...discoveredHavens.value]
      for (const item of scanRes.havens) {
        const exists = nextHavens.some(
          m =>
            calculateDistanceMeters(
              { lat: m.latitude, lng: m.longitude },
              { lat: item.latitude, lng: item.longitude }
            ) < 85
        )
        if (!exists) {
          nextHavens.push(item)
          addedHavens++
        }
      }
      discoveredHavens.value = nextHavens
    }

    let addedReports = 0
    if (scanRes.localReports.length > 0) {
      const nextReports = [...discoveredReports.value]
      for (const rep of scanRes.localReports) {
        const existsInDb = reports.value.some(
          r =>
            calculateDistanceMeters(
              { lat: r.latitude, lng: r.longitude },
              { lat: rep.latitude, lng: rep.longitude }
            ) < 400
        )
        const existsInDiscovered = nextReports.some(
          r =>
            r.id === rep.id ||
            calculateDistanceMeters(
              { lat: r.latitude, lng: r.longitude },
              { lat: rep.latitude, lng: rep.longitude }
            ) < 180
        )
        if (!existsInDb && !existsInDiscovered) {
          nextReports.unshift(rep)
          addedReports++
        }
      }
      discoveredReports.value = nextReports
    }

    if (!silent) {
      showToast(
        `Area ${scanRes.areaLabel}: terdeteksi ${scanRes.localReports.length} titik rawan & ${scanRes.havens.length} pos aman sekitar.`,
        'success'
      )
    } else if (addedReports > 0 || addedHavens > 0) {
      showToast(
        `Radar ${scanRes.areaLabel} memetakan +${addedReports} laporan jalan & +${addedHavens} pos aman.`,
        'info'
      )
    }
  } finally {
    isScanningOverpass.value = false
  }
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

onMounted(async () => {
  loadStoredVotes()
  await loadData()
  refreshAreaIntelligence(userCoords.value, true)
})

function matchCityByCoords(coords: Coordinates) {
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
}

function handleSelectCity(cityId: string) {
  activeCityId.value = cityId
  activeRouteHaven.value = null
  const targetCity = INDONESIAN_CITIES.find(c => c.id === cityId)
  if (!targetCity) return

  if (cityId === 'all') {
    if (safetyMapRef.value?.flyTo) {
      safetyMapRef.value.flyTo(-2.5489, 118.0149, 5)
    }
    showToast('Menampilkan seluruh cakupan wilayah nasional Indonesia.', 'info')
  } else {
    userCoords.value = { ...targetCity.center }
    if (safetyMapRef.value?.flyTo) {
      safetyMapRef.value.flyTo(targetCity.center.lat, targetCity.center.lng, 13)
    }
    refreshAreaIntelligence(targetCity.center, true)
    showToast(`Wilayah pantauan diubah ke ${targetCity.name}.`, 'success')
  }
}

function handleScanArea(coords: Coordinates, placeLabel?: string, isSilent = false) {
  userCoords.value = coords
  matchCityByCoords(coords)
  if (placeLabel) {
    detectedAreaLabel.value = placeLabel
  }
  refreshAreaIntelligence(coords, isSilent)
}

function handleUpdateUserCoords(coords: Coordinates, isLiveGps: boolean) {
  userCoords.value = coords
  if (isLiveGps) {
    isUserGpsLive.value = true
    matchCityByCoords(coords)
    refreshAreaIntelligence(coords, false)
  } else {
    refreshAreaIntelligence(coords, true)
    showToast('Titik pantau diperbarui & memindai jalan sekitar.', 'info')
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
  showToast(`Menghitung rute jalan raya ke ${haven.name} (~${formatDistance(dist)}).`, 'success')
}

function findNearestHavenName(coords: Coordinates): string | undefined {
  if (!mergedSafeHavens.value.length) return undefined
  let nearest = mergedSafeHavens.value[0]
  let minDist = Infinity
  for (const h of mergedSafeHavens.value) {
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
  if (safetyMapRef.value?.focusPin) {
    safetyMapRef.value.focusPin('haven', haven.id, haven.latitude, haven.longitude)
  } else if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(haven.latitude, haven.longitude, 16)
  }
}

function handleFocusReport(report: Report) {
  mapFocus.value = 'all'
  if (safetyMapRef.value?.focusPin) {
    safetyMapRef.value.focusPin('report', report.id, report.latitude, report.longitude)
  } else if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(report.latitude, report.longitude, 16)
  }
}

async function handleUpvote(reportId: number) {
  if (upvotedIds.value.includes(reportId)) {
    showToast('Anda sudah memberikan validasi pada titik laporan ini.', 'info')
    return
  }

  upvotedIds.value = [...upvotedIds.value, reportId]
  saveStoredVotes()

  const targetDb = reports.value.find(r => r.id === reportId)
  if (targetDb) {
    targetDb.upvotes += 1
  }
  const targetLocal = discoveredReports.value.find(r => r.id === reportId)
  if (targetLocal) {
    targetLocal.upvotes += 1
  }

  showToast('Validasi Anda tercatat untuk titik rawan ini.', 'success')

  if (reportId < 500000) {
    try {
      await $fetch(`/api/reports/${reportId}/upvote`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Gagal upvote:', error)
    }
  }
}

async function handleResolve(reportId: number) {
  if (resolvedIds.value.includes(reportId)) {
    showToast('Anda sudah menandai titik ini sebagai kondusif.', 'info')
    return
  }

  resolvedIds.value = [...resolvedIds.value, reportId]
  saveStoredVotes()

  const targetDb = reports.value.find(r => r.id === reportId)
  if (targetDb) {
    targetDb.resolvedCount = (targetDb.resolvedCount || 0) + 1
  }
  const targetLocal = discoveredReports.value.find(r => r.id === reportId)
  if (targetLocal) {
    targetLocal.resolvedCount = (targetLocal.resolvedCount || 0) + 1
  }

  showToast('Terima kasih! Konfirmasi kondisi aman/kondusif telah dicatat.', 'success')

  if (reportId < 500000) {
    try {
      await $fetch(`/api/reports/${reportId}/resolve`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Gagal resolve:', error)
    }
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
  userCoords.value = { lat: newReport.latitude, lng: newReport.longitude }
  matchCityByCoords(userCoords.value)
  showToast('Laporan baru berhasil disimpan dan ditampilkan di peta.', 'success')
  if (safetyMapRef.value?.focusPin) {
    safetyMapRef.value.focusPin('report', newReport.id, newReport.latitude, newReport.longitude)
  } else if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(newReport.latitude, newReport.longitude, 16)
  }
}
</script>
