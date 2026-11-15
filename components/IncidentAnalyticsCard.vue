<template>
  <article class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <h2 class="font-bold text-sm sm:text-base tracking-tight text-slate-900">Statistik Area</h2>
        <InfoPopover
          title="Statistik Area"
          content="Menampilkan jumlah dukungan warga (validasi), titik berstatus bahaya tinggi, serta perbandingan laporan yang masih aktif dibanding yang sudah ditandai kondusif."
          label="Penjelasan statistik area"
        />
      </div>

      <span class="text-xs font-semibold text-slate-600 tabular-nums">
        {{ reports.length }} titik pantau
      </span>
    </div>

    <div class="my-3">
      <div class="flex items-center justify-between text-[11px] text-slate-600 font-medium mb-1">
        <span>Sebaran validasi per laporan</span>
        <span class="tabular-nums font-semibold text-emerald-700">Maks: {{ peakUpvotes }} validasi</span>
      </div>
      <div class="h-12 w-full" aria-hidden="true">
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
    </div>

    <div class="grid grid-cols-2 gap-4 py-3 border-t border-slate-100">
      <div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 tabular-nums">{{ totalUpvotes }}</div>
        <div class="text-xs text-slate-600 font-medium mt-0.5">Total validasi warga</div>
      </div>
      <div>
        <div class="text-2xl sm:text-3xl font-black tracking-tight text-rose-600 tabular-nums">
          {{ highDangerCount }}
        </div>
        <div class="text-xs text-slate-600 font-medium mt-0.5">Titik bahaya tinggi</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-2.5 pt-2">
      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          <span class="text-xl font-black text-slate-900 tabular-nums">{{ activeUnresolvedCount }}</span>
        </div>
        <div class="text-xs font-medium text-slate-600 mt-0.5">
          Masih Rawan Aktif
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span class="text-xl font-black text-emerald-900 tabular-nums">{{ resolvedCount }}</span>
        </div>
        <div class="text-xs font-medium text-emerald-800 mt-0.5">
          Mulai Kondusif
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Report } from '~/server/db/schema'

const props = defineProps<{
  reports: Report[]
}>()

const totalUpvotes = computed(() => {
  return props.reports.reduce((acc, item) => acc + (item.upvotes || 0), 0)
})

const peakUpvotes = computed(() => {
  if (!props.reports.length) return 0
  return Math.max(...props.reports.map(r => r.upvotes || 0))
})

const highDangerCount = computed(() => {
  return props.reports.filter(r => r.dangerLevel === 'high' && (r.resolvedCount || 0) < 3).length
})

const resolvedCount = computed(() => {
  return props.reports.filter(r => (r.resolvedCount || 0) >= 3).length
})

const activeUnresolvedCount = computed(() => {
  return Math.max(0, props.reports.length - resolvedCount.value)
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
