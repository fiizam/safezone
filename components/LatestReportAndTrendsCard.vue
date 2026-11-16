<template>
  <article class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <h2 class="font-bold text-sm sm:text-base tracking-tight text-slate-900">Laporan Warga</h2>
        <InfoPopover
          title="Laporan Warga"
          content="Daftar laporan jalan rawan terdekat di wilayah ini lengkap dengan rentang jam rawan dan bukti foto. Klik baris laporan untuk membuka detail pinnya di peta."
          label="Penjelasan daftar laporan warga"
        />
      </div>

      <button
        type="button"
        @click="$emit('openReportModal')"
        class="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
      >
        + Tambah
      </button>
    </div>

    <div
      v-if="filteredRecentReports.length"
      class="space-y-2 my-1 max-h-[225px] overflow-y-auto pr-1"
    >
      <button
        v-for="item in filteredRecentReports"
        :key="item.id"
        type="button"
        @click="$emit('focusReport', item)"
        class="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition-colors flex items-center justify-between gap-3 group"
      >
        <img
          v-if="item.photoUrl"
          :src="item.photoUrl"
          :alt="item.title"
          class="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-0.5">
            <span
              :class="[
                'w-5 h-5 rounded-md border inline-flex items-center justify-center shrink-0',
                (item.resolvedCount || 0) >= 3
                  ? 'bg-[#0d151c] border-teal-400/50 text-teal-300'
                  : item.category === 'begal' || item.category === 'geng_motor' || item.dangerLevel === 'high'
                    ? 'bg-[#160910] border-rose-400/60 text-rose-300'
                    : 'bg-[#141008] border-amber-400/60 text-amber-200'
              ]"
            >
              <svg
                v-if="(item.resolvedCount || 0) >= 3"
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.3"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m8 12.5 2.5 2.5 5.5-5.5"/>
              </svg>
              <svg
                v-else-if="item.category === 'begal'"
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.1"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 4 7v5c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V7l-8-4Z"/>
                <path d="M12 8v4.5"/>
                <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              <svg
                v-else-if="item.category === 'geng_motor'"
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="5.5" cy="17" r="2.5"/>
                <circle cx="18.5" cy="17" r="2.5"/>
                <path d="M8 17h5l2-5.5-3.5-1.5-2.5 3H6.5L8 17Z"/>
              </svg>
              <svg
                v-else-if="item.category === 'gelap'"
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M6 20V6a3 3 0 0 1 3-3h6"/>
                <path d="M13 3h5l1 3h-7l1-3Z"/>
                <path d="m14 10 4 4m0-4-4 4"/>
              </svg>
              <svg
                v-else
                class="w-3 h-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M4 20 9 4m11 16L15 4"/>
                <path d="M12 6v2m0 3v2m0 3v3"/>
              </svg>
            </span>
            <span class="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-800">
              {{ item.title }}
            </span>
          </div>
          <p class="text-xs text-slate-600 truncate pl-7">
            {{ item.description }}
          </p>
          <div class="flex flex-wrap items-center gap-1.5 pl-7 mt-1">
            <span class="text-[10px] font-semibold text-slate-700 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded-md">
              Jam Rawan: {{ item.vulnerableHours || defaultHours(item.category) }}
            </span>
            <span
              v-if="item.photoUrl"
              class="text-[10px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md"
            >
              Foto Bukti
            </span>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 tabular-nums">
            {{ item.upvotes }} validasi
          </span>
          <span
            v-if="(item.resolvedCount || 0) >= 3"
            class="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
          >
            ✓ Kondusif
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
        <span class="text-xs font-semibold text-slate-600">Saring Kategori Laporan</span>
        <button
          v-if="activeCategory !== 'all'"
          type="button"
          @click="$emit('selectCategory', 'all')"
          class="text-xs font-bold text-emerald-700 hover:underline"
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
            'min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors tabular-nums',
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

function defaultHours(cat: string): string {
  if (cat === 'begal') return '23:00 - 04:00 WIB'
  if (cat === 'geng_motor') return '00:00 - 04:30 WIB'
  if (cat === 'gelap') return '18:30 - 05:30 WIB'
  return '22:00 - 04:00 WIB'
}

const filteredRecentReports = computed(() => {
  const list =
    props.activeCategory === 'all'
      ? props.reports
      : props.reports.filter(r => r.category === props.activeCategory)
  return list.slice(0, 12)
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
