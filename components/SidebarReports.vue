<template>
  <aside
    :class="[
      'bg-dark-900/95 backdrop-blur-xl border-white/10 flex flex-col z-[450] transition-all duration-300 ease-in-out',
      // Desktop styles: fixed width sidebar on the left
      'lg:w-96 lg:h-full lg:border-r',
      // Mobile styles: bottom sheet drawer
      'fixed inset-x-0 bottom-0 max-h-[82vh] rounded-t-3xl border-t shadow-2xl lg:relative lg:rounded-none lg:inset-auto lg:max-h-full',
      isOpenOnMobile ? 'translate-y-0' : 'translate-y-[calc(100%-60px)] lg:translate-y-0'
    ]"
  >
    <!-- Mobile Drawer Pull Handle -->
    <div
      class="lg:hidden flex flex-col items-center justify-center pt-2.5 pb-2 cursor-pointer select-none"
      @click="toggleMobileDrawer"
    >
      <div class="w-12 h-1.5 rounded-full bg-slate-600 mb-1"></div>
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-300">
        <span>{{ isOpenOnMobile ? 'Tutup Daftar Laporan' : 'Buka Daftar Laporan & Safe Havens' }}</span>
        <svg
          :class="['w-4 h-4 transition-transform text-slate-400', isOpenOnMobile ? 'rotate-180' : '']"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </div>
    </div>

    <!-- Header Section -->
    <div class="p-4 border-b border-white/10 space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-bold text-base text-white tracking-tight flex items-center gap-2">
            <span>Aktivitas Intelijen</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Live Feed
            </span>
          </h2>
          <p class="text-xs text-slate-400">Pantau jalanan malam sekitar Anda</p>
        </div>

        <button
          @click="$emit('openReportModal')"
          class="lg:hidden px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-rose-950/40 active:scale-95"
        >
          + Lapor
        </button>
      </div>

      <!-- Navigation Tabs: Reports vs Havens -->
      <div class="grid grid-cols-2 p-1 rounded-xl bg-dark-950/80 border border-white/5 text-xs font-semibold">
        <button
          @click="activeTab = 'reports'"
          :class="[
            'py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all',
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <span>⚠️ Titik Bahaya</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
            {{ reports.length }}
          </span>
        </button>

        <button
          @click="activeTab = 'havens'"
          :class="[
            'py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all',
            activeTab === 'havens'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          ]"
        >
          <span>🛡️ Safe Haven</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
            {{ safeHavens.length }}
          </span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="activeTab === 'reports' ? 'Cari jalan, begal, lokasi...' : 'Cari SPBU, Indomaret, Polsek...'"
          class="w-full pl-9 pr-3.5 py-2 rounded-xl bg-dark-950/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
    </div>

    <!-- Scrollable Content Body -->
    <div class="flex-1 overflow-y-auto p-3.5 space-y-3 pb-24 lg:pb-6">
      <!-- 1. REPORTS TAB CONTENT -->
      <div v-if="activeTab === 'reports'" class="space-y-3">
        <div v-if="filteredReports.length === 0" class="py-12 text-center text-slate-500 text-xs space-y-2">
          <svg class="w-8 h-8 mx-auto text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>Tidak ada laporan bahaya yang cocok dengan filter.</p>
        </div>

        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="group p-3.5 rounded-2xl bg-dark-850/80 hover:bg-dark-800 border border-white/5 hover:border-white/15 transition-all shadow-md cursor-pointer relative"
          @click="$emit('focusLocation', { lat: report.latitude, lng: report.longitude })"
        >
          <!-- Danger Header Badges -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1',
                report.category === 'begal' || report.category === 'geng_motor'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              ]"
            >
              <span
                :class="[
                  'w-1.5 h-1.5 rounded-full',
                  report.dangerLevel === 'high' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'
                ]"
              ></span>
              <span>{{ getCategoryLabel(report.category) }}</span>
            </span>

            <span class="text-[11px] text-slate-400 font-medium">
              {{ formatRelativeTime(report.createdAt) }}
            </span>
          </div>

          <!-- Title & Description -->
          <h4 class="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors mb-1.5 line-clamp-1">
            {{ report.title }}
          </h4>
          <p class="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
            {{ report.description }}
          </p>

          <!-- Card Actions: Upvote & Location -->
          <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <button
              @click.stop="$emit('upvote', report.id)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all active:scale-95 text-[11px] font-medium"
            >
              <span>▲ Validasi</span>
              <span class="font-bold text-white bg-indigo-500/30 px-1 rounded">{{ report.upvotes }}</span>
            </button>

            <button
              @click.stop="$emit('focusLocation', { lat: report.latitude, lng: report.longitude })"
              class="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Lihat di Peta</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. HAVENS TAB CONTENT -->
      <div v-else class="space-y-3">
        <div v-if="filteredHavens.length === 0" class="py-12 text-center text-slate-500 text-xs space-y-2">
          <svg class="w-8 h-8 mx-auto text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p>Tidak ada Safe Haven yang cocok dengan pencarian.</p>
        </div>

        <div
          v-for="haven in filteredHavens"
          :key="haven.id"
          class="group p-3.5 rounded-2xl bg-dark-850/80 hover:bg-dark-800 border border-white/5 hover:border-emerald-500/30 transition-all shadow-md cursor-pointer relative"
          @click="$emit('focusLocation', { lat: haven.latitude, lng: haven.longitude })"
        >
          <!-- Haven Type Badge -->
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{{ getHavenTypeLabel(haven.type) }}</span>
            </span>

            <span class="text-[10px] text-emerald-400 font-semibold">Buka 24 Jam</span>
          </div>

          <!-- Haven Name & Address -->
          <h4 class="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors mb-1">
            {{ haven.name }}
          </h4>
          <p class="text-[11px] text-slate-300 leading-relaxed mb-3">
            {{ haven.address }}
          </p>

          <!-- Card Actions -->
          <div class="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <a
              :href="`https://www.google.com/maps/dir/?api=1&destination=${haven.latitude},${haven.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
              class="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 underline decoration-emerald-600"
            >
              <span>Navigasi Rute Cepat</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>

            <button
              @click.stop="$emit('focusLocation', { lat: haven.latitude, lng: haven.longitude })"
              class="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Lihat di Peta</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Report, SafeHaven } from '~/server/db/schema'
import { formatRelativeTime } from '~/utils/time'

const props = defineProps<{
  reports: Report[]
  safeHavens: SafeHaven[]
  activeCategory?: string
}>()

const emit = defineEmits<{
  (e: 'focusLocation', payload: { lat: number; lng: number }): void
  (e: 'upvote', reportId: number): void
  (e: 'openReportModal'): void
}>()

const activeTab = ref<'reports' | 'havens'>('reports')
const searchQuery = ref('')
const isOpenOnMobile = ref(false)

function toggleMobileDrawer() {
  isOpenOnMobile.value = !isOpenOnMobile.value
}

const filteredReports = computed(() => {
  return props.reports.filter((r) => {
    const matchesCategory =
      !props.activeCategory || props.activeCategory === 'all' || r.category === props.activeCategory

    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })
})

const filteredHavens = computed(() => {
  return props.safeHavens.filter((h) => {
    const q = searchQuery.value.toLowerCase().trim()
    return !q || h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
  })
})

function getCategoryLabel(cat: string) {
  const map: Record<string, string> = {
    begal: 'Begal & Kejahatan',
    geng_motor: 'Geng Motor / Tawuran',
    gelap: 'Jalan Gelap / PJU Mati',
    sepi: 'Jalan Sepi'
  }
  return map[cat] || cat
}

function getHavenTypeLabel(type: string) {
  const map: Record<string, string> = {
    minimarket_24h: 'Minimarket 24 Jam',
    spbu: 'SPBU 24 Jam',
    pos_polisi: 'Pos Polisi / Polsek'
  }
  return map[type] || 'Titik Aman'
}
</script>
