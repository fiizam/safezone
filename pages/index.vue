<template>
  <div class="min-h-screen bg-[#EBECEF] p-3 sm:p-5 lg:p-6 flex flex-col items-center justify-start antialiased font-sans">
    <!-- Main Dashboard Frame (Matching ArgoLogistics Dribbble Canvas) -->
    <div class="w-full max-w-[1440px] bg-[#F4F5F7] rounded-[32px] p-4 sm:p-5 border border-slate-300/60 shadow-2xl flex flex-col gap-4">
      <!-- 1. Top Navbar -->
      <Navbar
        :reports-count="reports.length"
        :havens-count="safeHavens.length"
        @open-report-modal="openReportModal()"
      />

      <!-- 2. Hero Section: Dedicated Map Card (Framed, No Collisions) -->
      <section class="w-full">
        <ClientOnly>
          <SafetyMap
            ref="safetyMapRef"
            :reports="reports"
            :safe-havens="safeHavens"
            :active-category="activeCategory"
            :is-picking-location="isPickingLocation"
            @select-location="handleSelectLocation"
            @upvote="handleUpvote"
            @update:category="activeCategory = $event"
          />
          <template #fallback>
            <div class="w-full h-[380px] rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200/80">
              <span class="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
              <p class="text-xs font-semibold text-slate-300">Memuat Navigasi SafeZone...</p>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- 3. Bottom Section: 3-Column Structured Dashboard Grid (Matching Dribbble Layout) -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Column 1: Incident & Validation Analytics (Delivery Volume style) -->
        <IncidentAnalyticsCard
          :reports-count="reports.length"
        />

        <!-- Column 2: Safe Haven Hub 24 Jam (Vehicles style) -->
        <SafeHavenHubCard
          :havens="safeHavens"
          @focus-haven="handleFocusHaven"
        />

        <!-- Column 3: Latest Report & Peak Danger Hours (Latest Order & Sales style) -->
        <LatestReportAndTrendsCard
          :reports="reports"
          @open-report-modal="openReportModal()"
          @focus-report="handleFocusReport"
        />
      </section>
    </div>

    <!-- Report Modal Popup -->
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
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[700] px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-float text-xs font-semibold flex items-center gap-2 text-white animate-fade-in"
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

function handleFocusHaven(haven: SafeHaven | undefined) {
  if (haven && safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(haven.latitude, haven.longitude, 16)
  }
}

function handleFocusReport(report: Report | undefined) {
  if (report && safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(report.latitude, report.longitude, 16)
  }
}

async function handleUpvote(reportId: number) {
  const target = reports.value.find(r => r.id === reportId)
  if (target) {
    target.upvotes += 1
  }

  showToast('Terima kasih! Upvote Anda memvalidasi titik rawan.', 'success')

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
  showToast('Laporan berhasil ditambahkan! Warga sekitar kini terinformasi.', 'success')
  if (safetyMapRef.value?.flyTo) {
    safetyMapRef.value.flyTo(newReport.latitude, newReport.longitude, 16)
  }
}
</script>
