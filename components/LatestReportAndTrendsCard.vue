<template>
  <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4">
    <!-- Top Section: Latest Order Style -->
    <div class="pb-4 border-b border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <svg class="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
          <h3 class="font-bold text-sm tracking-tight text-slate-900">Laporan Baru Masuk</h3>
        </div>
        <button
          @click="$emit('openReportModal')"
          class="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          + Tambah
        </button>
      </div>

      <!-- Incident Box with Mini Map Snippet (Matching Dribbble Latest Order) -->
      <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-mono text-xs font-bold text-slate-900">#SZ-{{ latestReport?.id || 102 }}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Validasi {{ latestReport?.upvotes || 42 }}
            </span>
          </div>
          <div class="font-semibold text-xs text-slate-900 truncate">
            {{ latestReport?.title || 'Rawan Begal & Lempar Batu Bawah Flyover' }}
          </div>
          <div class="text-[11px] text-slate-500 truncate mt-0.5">
            {{ latestReport?.description || 'Terdeteksi di Jl. Cihampelas Bawah' }}
          </div>
        </div>

        <!-- Mini Dark Map Snapshot Thumbnail -->
        <div
          @click="$emit('focusReport', latestReport)"
          class="w-16 h-16 rounded-xl bg-slate-900 border border-slate-300 relative overflow-hidden flex items-center justify-center shrink-0 cursor-pointer shadow-sm group"
          title="Fokus di Peta"
        >
          <!-- Grid lines -->
          <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
          <div class="w-5 h-5 rounded-full bg-rose-500/30 flex items-center justify-center animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-rose-600 border border-white flex items-center justify-center absolute shadow-md">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section: Sales Overview Style (Peak Danger Hours) -->
    <div class="pt-1">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <span>🕒 Waktu Puncak Rawan</span>
        </div>
        <div class="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
          <span>Malam Hari</span>
        </div>
      </div>

      <!-- Main Metric -->
      <div class="flex items-baseline gap-2 mb-3">
        <span class="text-2xl font-black tracking-tight text-slate-900">23.00 - 03.30</span>
        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
          +82% Risiko
        </span>
      </div>

      <!-- Vertical Bar Chart (Matching Dribbble Histogram Bars) -->
      <div class="flex items-end justify-between gap-1 h-14 pt-2">
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-slate-100 rounded-t h-4"></div>
          <span class="text-[9px] text-slate-400">18h</span>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-slate-200 rounded-t h-6"></div>
          <span class="text-[9px] text-slate-400">20h</span>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-emerald-400 rounded-t h-10"></div>
          <span class="text-[9px] text-slate-500 font-bold">22h</span>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-emerald-500 rounded-t h-14"></div>
          <span class="text-[9px] text-emerald-700 font-bold">00h</span>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-emerald-600 rounded-t h-12"></div>
          <span class="text-[9px] text-emerald-700 font-bold">02h</span>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-emerald-400 rounded-t h-8"></div>
          <span class="text-[9px] text-slate-500 font-bold">04h</span>
        </div>
        <div class="flex-1 flex flex-col items-center gap-1">
          <div class="w-full bg-slate-100 rounded-t h-3"></div>
          <span class="text-[9px] text-slate-400">06h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Report } from '~/server/db/schema'

const props = defineProps<{
  reports: Report[]
}>()

defineEmits<{
  (e: 'openReportModal'): void
  (e: 'focusReport', report: Report | undefined): void
}>()

const latestReport = computed(() => {
  return props.reports && props.reports.length > 0 ? props.reports[0] : undefined
})
</script>
