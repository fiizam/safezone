<template>
  <header class="bg-white rounded-2xl px-5 py-3.5 flex items-center justify-between border border-slate-200/80 shadow-subtle">
    <!-- Brand Logo Left -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
        <svg class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg tracking-tight text-slate-900">SafeZone</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <p class="text-[11px] text-slate-500 hidden sm:block font-medium">Night Commute Intelligence</p>
      </div>
    </div>

    <!-- Center Floating Icon Dock -->
    <div class="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60">
      <button
        @click="activeView = 'map'"
        :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ease-smooth',
          activeView === 'map' ? 'bg-emerald-500 text-white shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
        ]"
        title="Peta Navigasi"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      </button>

      <button
        @click="activeView = 'reports'"
        :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ease-smooth',
          activeView === 'reports' ? 'bg-emerald-500 text-white shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
        ]"
        title="Daftar Titik Bahaya"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      <button
        @click="activeView = 'havens'"
        :class="[
          'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ease-smooth',
          activeView === 'havens' ? 'bg-emerald-500 text-white shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
        ]"
        title="Safe Havens 24 Jam"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </button>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-3">
      <!-- Report Button -->
      <button
        @click="$emit('openReportModal')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle hover:shadow-card transition-all duration-200 ease-smooth active:scale-95"
      >
        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>+ Laporkan Titik</span>
      </button>

      <!-- Status Indicator -->
      <div class="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>

      <!-- User Avatar Profile -->
      <div class="w-9 h-9 rounded-xl bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden font-bold text-xs text-slate-700">
        SZ
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  reportsCount: number
  havensCount: number
}>()

defineEmits<{
  (e: 'openReportModal'): void
}>()

const activeView = ref<'map' | 'reports' | 'havens'>('map')
</script>
