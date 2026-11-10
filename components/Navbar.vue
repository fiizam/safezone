<template>
  <header class="h-16 bg-dark-900/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between z-[500] shrink-0">
    <!-- Brand Logo -->
    <div class="flex items-center gap-3">
      <div class="relative flex items-center justify-center">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-rose-600 to-amber-500 p-[2px] shadow-glow-primary">
          <div class="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>
        <span class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-900 animate-pulse"></span>
      </div>

      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
            SafeZone
            <span class="text-xs px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              Night Intel
            </span>
          </h1>
        </div>
        <p class="text-[11px] text-slate-400 hidden sm:block">
          Crowdsourced Night-Commute & Street Safety Intelligence
        </p>
      </div>
    </div>

    <!-- Quick Stats Ticker (Desktop) -->
    <div class="hidden md:flex items-center gap-4 text-xs">
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-950/60 border border-white/5">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span class="text-slate-400">Titik Bahaya:</span>
        <span class="font-bold text-white">{{ reportsCount }}</span>
      </div>

      <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-950/60 border border-white/5">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="text-slate-400">Safe Havens 24h:</span>
        <span class="font-bold text-white">{{ havensCount }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2.5">
      <!-- Quick Info / Ronda Status -->
      <div class="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-dark-850 border border-white/10 text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Ronda Online</span>
      </div>

      <!-- Report Button -->
      <button
        @click="$emit('openReportModal')"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 hover:shadow-glow-danger transition-all active:scale-95"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>+ Laporkan Titik Rawan</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  reportsCount: number
  havensCount: number
}>()

defineEmits<{
  (e: 'openReportModal'): void
}>()
</script>
