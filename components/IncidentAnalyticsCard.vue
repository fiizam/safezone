<template>
  <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
          <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <h3 class="font-bold text-sm tracking-tight text-slate-900">Aktivitas & Validasi Bahaya</h3>
      </div>
      <button class="text-slate-400 hover:text-slate-600">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="4" y1="21" x2="4" y2="14"/>
          <line x1="4" y1="10" x2="4" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12" y2="3"/>
          <line x1="20" y1="21" x2="20" y2="16"/>
          <line x1="20" y1="10" x2="20" y2="3"/>
        </svg>
      </button>
    </div>

    <!-- Green Sparkline Graph (Matching Dribbble Wave Line) -->
    <div class="h-14 w-full my-1">
      <svg class="w-full h-full overflow-visible" viewBox="0 0 300 60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="greenSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <path
          d="M 0,35 Q 25,15 50,28 T 100,20 T 150,38 T 200,12 T 250,24 T 300,15"
          fill="none"
          stroke="#10b981"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <path
          d="M 0,35 Q 25,15 50,28 T 100,20 T 150,38 T 200,12 T 250,24 T 300,15 L 300,60 L 0,60 Z"
          fill="url(#greenSpark)"
        />
      </svg>
    </div>

    <!-- Main KPIs -->
    <div class="grid grid-cols-2 gap-4 my-3 pt-2 border-t border-slate-100">
      <div>
        <div class="text-2xl font-black tracking-tight text-slate-900">142</div>
        <div class="text-[11px] text-slate-500 font-medium">Laporan terverifikasi warga</div>
      </div>
      <div>
        <div class="text-2xl font-black tracking-tight text-emerald-600 flex items-center gap-1">
          96%
          <span class="text-xs text-emerald-500">↑</span>
        </div>
        <div class="text-[11px] text-slate-500 font-medium">Tingkat akurasi komunitas</div>
      </div>
    </div>

    <!-- Middle 2 Stat Tiles -->
    <div class="grid grid-cols-2 gap-3 my-3">
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div class="text-[11px] font-semibold text-slate-600 mb-1">Titik Rawan Aktif</div>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-slate-900">{{ reportsCount }}</span>
          <!-- Mini Bar Chart -->
          <div class="flex items-end gap-1 h-5">
            <span class="w-1 bg-emerald-400 rounded-t h-2"></span>
            <span class="w-1 bg-emerald-500 rounded-t h-3.5"></span>
            <span class="w-1 bg-emerald-600 rounded-t h-5"></span>
            <span class="w-1 bg-emerald-500 rounded-t h-3"></span>
          </div>
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div class="text-[11px] font-semibold text-slate-600 mb-1">Lampu/Jalan Diperbaiki</div>
        <div class="flex items-center justify-between">
          <span class="text-xl font-bold text-slate-900">18</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            85% selesai
          </span>
        </div>
      </div>
    </div>

    <!-- Bottom Stat Row -->
    <div class="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
      <div>
        <div class="text-[11px] text-slate-500 font-medium">Kecepatan Validasi</div>
        <div class="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
          ~4 Menit
          <span class="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">Cepat</span>
        </div>
      </div>
      <div>
        <div class="text-[11px] text-slate-500 font-medium">Jam Patroli Warga</div>
        <div class="text-sm font-bold text-slate-900 mt-0.5">22.00 - 05.00</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reportsCount: number
}>()
</script>
