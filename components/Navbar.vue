<template>
  <header class="bg-white rounded-2xl px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 border border-slate-200/80 shadow-subtle">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      </div>
      <div class="flex items-center gap-2">
        <h1 class="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">SafeZone</h1>
        <InfoPopover
          title="Tentang SafeZone"
          content="Peta keselamatan jalan malam berbasis komunitas. Pilih kota cakupan untuk melihat laporan titik rawan dan pos berlindung 24 jam di sekitar Anda."
          label="Info tentang aplikasi SafeZone"
        />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2 order-3 lg:order-2 w-full lg:w-auto justify-between sm:justify-center">
      <div class="relative flex items-center">
        <label for="city-selector" class="sr-only">Pilih Kota Cakupan</label>
        <select
          id="city-selector"
          :value="activeCityId"
          @change="$emit('update:city', ($event.target as HTMLSelectElement).value)"
          class="min-h-[38px] appearance-none bg-slate-100 hover:bg-slate-200/80 rounded-xl pl-3.5 pr-8 py-1.5 text-xs font-bold text-slate-900 border border-slate-200/90 transition-colors"
        >
          <option
            v-for="city in cities"
            :key="city.id"
            :value="city.id"
          >
            Wilayah: {{ city.name }}
          </option>
        </select>
        <svg aria-hidden="true" class="w-3.5 h-3.5 text-slate-600 absolute right-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <nav aria-label="Filter pin di peta" class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
        <button
          type="button"
          @click="$emit('update:mapFocus', 'all')"
          :aria-pressed="mapFocus === 'all'"
          :class="[
            'min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
            mapFocus === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white'
          ]"
        >
          Semua
        </button>

        <button
          type="button"
          @click="$emit('update:mapFocus', 'reports')"
          :aria-pressed="mapFocus === 'reports'"
          :class="[
            'min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
            mapFocus === 'reports'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white'
          ]"
        >
          Rawan ({{ reportsCount }})
        </button>

        <button
          type="button"
          @click="$emit('update:mapFocus', 'havens')"
          :aria-pressed="mapFocus === 'havens'"
          :class="[
            'min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
            mapFocus === 'havens'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white'
          ]"
        >
          Pos Aman ({{ havensCount }})
        </button>
      </nav>
    </div>

    <div class="flex items-center gap-2 order-2 lg:order-3">
      <button
        type="button"
        @click="$emit('triggerSos')"
        :disabled="isSendingSos"
        class="min-h-[38px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-subtle transition-colors disabled:opacity-60"
      >
        {{ isSendingSos ? 'Memuat GPS...' : 'SOS Darurat' }}
      </button>

      <button
        type="button"
        @click="$emit('openReportModal')"
        class="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-semibold shadow-subtle transition-colors"
      >
        + Lapor Titik
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { CityRegion } from '~/utils/geo'

defineProps<{
  reportsCount: number
  havensCount: number
  mapFocus: 'all' | 'reports' | 'havens'
  activeCityId: string
  cities: CityRegion[]
  isSendingSos?: boolean
}>()

defineEmits<{
  (e: 'openReportModal'): void
  (e: 'update:mapFocus', value: 'all' | 'reports' | 'havens'): void
  (e: 'update:city', cityId: string): void
  (e: 'triggerSos'): void
}>()
</script>
