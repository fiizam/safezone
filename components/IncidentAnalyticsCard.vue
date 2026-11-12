<template>
  <article class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <h2 class="font-bold text-sm sm:text-base tracking-tight text-slate-900">Statistik Area</h2>
        <InfoPopover
          title="Statistik Area"
          content="Menampilkan jumlah dukungan warga (validasi) pada laporan di wilayah terpilih. Klik salah satu kotak kategori di bawah untuk menyaring pin di peta."
          label="Penjelasan statistik area"
        />
      </div>

      <button
        v-if="activeCategory !== 'all'"
        type="button"
        @click="$emit('selectCategory', 'all')"
        class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
      >
        Tampilkan Semua
      </button>
    </div>

    <div class="h-14 w-full my-3" aria-hidden="true">
      <svg class="w-full h-full overflow-visible" viewBox="0 0 300 60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="greenSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <path
          :d="sparklinePath.line"
          fill="none"
          stroke="#059669"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <path
          :d="sparklinePath.area"
          fill="url(#greenSpark)"
        />
      </svg>
    </div>

    <div class="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
      <div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 tabular-nums">{{ totalUpvotes }}</div>
        <div class="text-xs text-slate-600 font-medium mt-0.5">Validasi warga</div>
      </div>
      <div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight text-rose-600 tabular-nums">
          {{ highDangerCount }}
        </div>
        <div class="text-xs text-slate-600 font-medium mt-0.5">Titik bahaya tinggi</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2.5 pt-2">
      <button
        type="button"
        @click="$emit('selectCategory', activeCategory === 'begal' ? 'all' : 'begal')"
        :aria-pressed="activeCategory === 'begal'"
        :class="[
          'p-3.5 rounded-2xl border text-left transition-colors',
          activeCategory === 'begal'
            ? 'bg-slate-900 border-slate-900 text-white'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-900'
        ]"
      >
        <div class="text-xl font-black tabular-nums">{{ crimeReportsCount }}</div>
        <div :class="['text-xs font-medium mt-0.5', activeCategory === 'begal' ? 'text-slate-300' : 'text-slate-600']">
          Rawan Kejahatan
        </div>
      </button>

      <button
        type="button"
        @click="$emit('selectCategory', activeCategory === 'gelap' ? 'all' : 'gelap')"
        :aria-pressed="activeCategory === 'gelap'"
        :class="[
          'p-3.5 rounded-2xl border text-left transition-colors',
          activeCategory === 'gelap'
            ? 'bg-slate-900 border-slate-900 text-white'
            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-900'
        ]"
      >
        <div class="text-xl font-black tabular-nums">{{ infraReportsCount }}</div>
        <div :class="['text-xs font-medium mt-0.5', activeCategory === 'gelap' ? 'text-slate-300' : 'text-slate-600']">
          Gelap &amp; Sepi
        </div>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Report } from '~/server/db/schema'

const props = defineProps<{
  reports: Report[]
  activeCategory: string
}>()

defineEmits<{
  (e: 'selectCategory', category: string): void
}>()

const totalUpvotes = computed(() => {
  return props.reports.reduce((acc, item) => acc + (item.upvotes || 0), 0)
})

const highDangerCount = computed(() => {
  return props.reports.filter(r => r.dangerLevel === 'high').length
})

const crimeReportsCount = computed(() => {
  return props.reports.filter(r => r.category === 'begal' || r.category === 'geng_motor').length
})

const infraReportsCount = computed(() => {
  return props.reports.filter(r => r.category === 'gelap' || r.category === 'sepi').length
})

const sparklinePath = computed(() => {
  const items = props.reports.slice(0, 7).reverse()
  if (items.length < 2) {
    return {
      line: 'M 0,40 L 300,40',
      area: 'M 0,40 L 300,40 L 300,60 L 0,60 Z'
    }
  }

  const maxUpvotes = Math.max(...items.map(r => r.upvotes || 1), 10)
  const stepX = 300 / (items.length - 1)

  const points = items.map((r, idx) => {
    const x = Math.round(idx * stepX)
    const ratio = (r.upvotes || 0) / maxUpvotes
    const y = Math.round(48 - ratio * 34)
    return `${x},${y}`
  })

  const line = `M ${points.join(' L ')}`
  const area = `${line} L 300,60 L 0,60 Z`
  return { line, area }
})
</script>
