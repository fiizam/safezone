<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-dark-950 select-none">
    <!-- Navbar -->
    <Navbar
      :reports-count="reports.length"
      :havens-count="safeHavens.length"
      @open-report-modal="openReportModal()"
    />

    <!-- Main Content Area: Sidebar + Map -->
    <div class="flex-1 flex relative overflow-hidden">
      <!-- Sidebar / Mobile Drawer -->
      <SidebarReports
        :reports="reports"
        :safe-havens="safeHavens"
        :active-category="activeCategory"
        @focus-location="handleFocusLocation"
        @upvote="handleUpvote"
        @open-report-modal="openReportModal()"
      />

      <!-- Map Viewport -->
      <main class="flex-1 relative h-full">
        <!-- Floating Filter Bar Top -->
        <div class="absolute top-4 left-4 z-[400] max-w-[calc(100vw-120px)] sm:max-w-xl">
          <FilterBar
            :active-category="activeCategory"
            @update:category="activeCategory = $event"
          />
        </div>

        <!-- Leaflet Client Component -->
        <ClientOnly>
          <SafetyMap
            ref="safetyMapRef"
            :reports="reports"
            :safe-havens="safeHavens"
            :active-category="activeCategory"
            :is-picking-location="isPickingLocation"
            @select-location="handleSelectLocation"
            @upvote="handleUpvote"
          />
          <template #fallback>
            <div class="w-full h-full flex flex-col items-center justify-center bg-dark-950 text-slate-400 gap-3">
              <span class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              <p class="text-xs font-mono">Memuat Peta SafeZone Dark Mode...</p>
            </div>
          </template>
        </ClientOnly>

        <!-- Floating Action Button (FAB) "+ Laporkan Titik Rawan" -->
        <div class="absolute bottom-20 lg:bottom-8 right-6 z-[400]">
          <button
            @click="openReportModal()"
            class="group relative flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-rose-950/80 border border-white/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <span class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>+ Laporkan Titik Rawan</span>
          </button>
        </div>
      </main>
    </div>

    <!-- Report Modal -->
    <ReportModal
      :is-open="isReportModalOpen"
      :initial-coords="pickedCoords"
      @close="isReportModalOpen = false"
      @created="handleReportCreated"
      @pick-from-map="startMapPicker"
    />

    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] px-4 py-2.5 rounded-2xl bg-dark-900 border border-white/10 shadow-2xl text-xs font-semibold flex items-center gap-2 text-white animate-fade-in"
    >
      <span
        :class="[
          'w-2 h-2 rounded-full',
          toast.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'
        ]"
      ></span>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Report, SafeHaven } from '~/server/db/schema'

const safetyMapRef = ref<any>(null)
const reports = ref<Report[]>([])
const safeHavens = ref<SafeHaven[]>([])
const activeCategory = ref<string>('all')

const isReportModalOpen = ref(false)
const isPickingLocation = ref(false)
const pickedCoords = ref<{ lat: number; lng: number } | null>(null)

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

function showToast(message: string, type: 'success' | 'info' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3500)
}

// Fetch Reports & Safe Havens from Backend API
async function loadData() {
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
  }
}

onMounted(() => {
  loadData()
})

function handleFocusLocation(payload: { lat: number; lng: number }) {
  if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(payload.lat, payload.lng, 16)
  }
}

async function handleUpvote(reportId: number) {
  // Optimistic UI Update
  const target = reports.value.find(r => r.id === reportId)
  if (target) {
    target.upvotes += 1
  }

  showToast('Terima kasih! Upvote Anda membantu memvalidasi titik rawan.', 'success')

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
  showToast('Klik titik rawan di peta untuk menentukan koordinat', 'info')
}

function handleSelectLocation(payload: { lat: number; lng: number }) {
  pickedCoords.value = payload
  if (isPickingLocation.value) {
    isPickingLocation.value = false
    isReportModalOpen.value = true
    showToast(`Koordinat dipilih: ${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)}`, 'success')
  }
}

function handleReportCreated(newReport: Report) {
  reports.value.unshift(newReport)
  showToast('Laporan berhasil ditambahkan! Warga sekitar kini terlindungi.', 'success')
  if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(newReport.latitude, newReport.longitude, 16)
  }
}
</script>
