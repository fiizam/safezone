<template>
  <article class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <h2 class="font-bold text-sm sm:text-base tracking-tight text-slate-900">Laporan Warga</h2>
        <InfoPopover
          title="Laporan Warga"
          content="Daftar laporan jalan rawan terbaru di wilayah ini. Klik baris laporan untuk menyorot titiknya di peta, atau gunakan tombol kategori di bawah untuk menyaring."
          label="Penjelasan daftar laporan warga"
        />
      </div>

      <button
        type="button"
        @click="$emit('openReportModal')"
        class="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
      >
        + Tambah
      </button>
    </div>

    <div v-if="filteredRecentReports.length" class="space-y-2 my-1">
      <button
        v-for="item in filteredRecentReports"
        :key="item.id"
        type="button"
        @click="$emit('focusReport', item)"
        class="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center justify-between gap-3 group"
      >
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-0.5">
            <span
              :class="[
                'w-2 h-2 rounded-full shrink-0',
                (item.resolvedCount || 0) >= 3
                  ? 'bg-emerald-500'
                  : item.dangerLevel === 'high'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
              ]"
            ></span>
            <span class="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-800">
              {{ item.title }}
            </span>
          </div>
          <p class="text-[11px] text-slate-600 truncate pl-4">
            {{ item.description }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 tabular-nums">
            {{ item.upvotes }} validasi
          </span>
          <span
            v-if="(item.resolvedCount || 0) >= 3"
            class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
          >
            ✓ Mulai Kondusif
          </span>
        </div>
      </button>
    </div>

    <div
      v-else
      class="my-3 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-600"
    >
      Tidak ada laporan pada kategori ini di wilayah terpilih.
    </div>

    <div class="pt-3 mt-2 border-t border-slate-100">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-semibold text-slate-600">Saring Kategori Laporan</span>
        <button
          v-if="activeCategory !== 'all'"
          type="button"
          @click="$emit('selectCategory', 'all')"
          class="text-[11px] font-bold text-emerald-700 hover:underline"
        >
          Reset
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="cat in categoryPills"
          :key="cat.key"
          type="button"
          @click="$emit('selectCategory', activeCategory === cat.key ? 'all' : cat.key)"
          :aria-pressed="activeCategory === cat.key"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors tabular-nums',
            activeCategory === cat.key
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          ]"
        >
          {{ cat.label }} ({{ cat.count }})
        </button>
      </div>
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
  (e: 'openReportModal'): void
  (e: 'focusReport', report: Report): void
  (e: 'selectCategory', category: string): void
}>()

const filteredRecentReports = computed(() => {
  const list =
    props.activeCategory === 'all'
      ? props.reports
      : props.reports.filter(r => r.category === props.activeCategory)
  return list.slice(0, 3)
})

const categoryPills = computed(() => {
  const defs = [
    { key: 'begal', label: 'Begal' },
    { key: 'geng_motor', label: 'Geng Motor' },
    { key: 'gelap', label: 'Lampu Mati' },
    { key: 'sepi', label: 'Jalan Sepi' }
  ]

  return defs.map((d) => ({
    ...d,
    count: props.reports.filter(r => r.category === d.key).length
  }))
})
</script>
