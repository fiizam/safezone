<template>
  <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h3 class="font-bold text-sm tracking-tight text-slate-900">Jaringan Safe Haven</h3>
      </div>
      <span class="text-xs font-semibold text-slate-500">{{ havens.length }} Total Siaga</span>
    </div>

    <!-- 3 Stat Tiles in a Row (Matching Dribbble 3 boxes) -->
    <div class="grid grid-cols-3 gap-2.5 my-2">
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
        <div class="text-xl font-black text-slate-900">{{ havens.length }}</div>
        <div class="text-[10px] text-slate-500 font-medium mt-0.5">Pos Berlindung</div>
      </div>
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
        <div class="text-xl font-black text-emerald-600">100%</div>
        <div class="text-[10px] text-slate-500 font-medium mt-0.5">Buka 24 Jam</div>
      </div>
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
        <div class="text-xl font-black text-slate-900">450m</div>
        <div class="text-[10px] text-slate-500 font-medium mt-0.5">Radius Dekat</div>
      </div>
    </div>

    <!-- Center Spotlight Safe Haven Card (Matching Truck Showcase) -->
    <div class="my-3 p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/40 border border-slate-200/80 flex flex-col justify-between">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[11px] font-bold text-emerald-800">SPBU & Minimarket Terdekat</span>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          Aktif 24 Jam
        </span>
      </div>

      <div class="py-2">
        <h4 class="font-extrabold text-sm text-slate-900 mb-1">
          {{ currentHaven?.name || 'Indomaret Point Dipatiukur 24 Jam' }}
        </h4>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ currentHaven?.address || 'Jl. Dipatiukur No. 80 (Area Terang, Ramai Mahasiswa & CCTV)' }}
        </p>
      </div>

      <!-- Quick Navigate Button -->
      <a
        v-if="currentHaven"
        :href="`https://www.google.com/maps/dir/?api=1&destination=${currentHaven.latitude},${currentHaven.longitude}`"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-2 w-full text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98"
      >
        <span>Navigasi Rute Cepat ke Titik Aman</span>
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </a>
    </div>

    <!-- Bottom Officer Contact Row (Matching Driver Profile in Dribbble) -->
    <div class="flex items-center justify-between pt-3 border-t border-slate-100">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
          👮‍♂️
        </div>
        <div>
          <div class="text-xs font-bold text-slate-900">Polsek Coblong & Pos Ronda</div>
          <div class="text-[10px] text-emerald-600 font-semibold">Siaga Darurat 110</div>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          @click="$emit('focusHaven', currentHaven)"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          title="Fokus di Peta"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
        </button>
        <a
          href="tel:110"
          class="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
          title="Panggil Darurat"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SafeHaven } from '~/server/db/schema'

const props = defineProps<{
  havens: SafeHaven[]
}>()

defineEmits<{
  (e: 'focusHaven', haven: SafeHaven | undefined): void
}>()

const currentHaven = computed(() => {
  return props.havens && props.havens.length > 0 ? props.havens[0] : undefined
})
</script>
