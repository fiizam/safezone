<template>
  <header class="bg-white rounded-2xl px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-slate-200/90 shadow-subtle">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-800">
          <svg aria-hidden="true" class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none"/>
          </svg>
        </div>

        <div class="flex items-center gap-1.5">
          <h1 class="font-extrabold text-[15px] sm:text-base tracking-tight text-slate-900 leading-none">
            SafeZone
          </h1>
          <InfoPopover
            title="Cakupan Nasional SafeZone"
            content="Sistem pemantauan keamanan jalan malam seluruh Indonesia. Pilih kota besar, tampilkan seluruh Indonesia, atau cari jalan mana pun di kotak pencarian peta untuk memindai Pos Polisi, SPBU, dan titik rawan secara langsung."
            label="Info tentang cakupan nasional SafeZone"
          />
        </div>
      </div>

      <div class="h-5 w-px bg-slate-200 hidden sm:block" aria-hidden="true"></div>

      <div ref="cityDropdownRef" class="relative">
        <button
          type="button"
          @click="isCityMenuOpen = !isCityMenuOpen"
          :aria-expanded="isCityMenuOpen"
          aria-haspopup="listbox"
          class="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 flex items-center gap-2 text-xs transition-colors"
        >
          <svg aria-hidden="true" class="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="text-slate-500 font-medium hidden md:inline">Area:</span>
          <span class="font-bold text-slate-900">{{ currentCityObj.name }}</span>
          <svg
            aria-hidden="true"
            :class="['w-3.5 h-3.5 text-slate-400 transition-transform duration-200', isCityMenuOpen ? 'rotate-180' : '']"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div
          v-if="isCityMenuOpen"
          role="listbox"
          aria-label="Daftar wilayah kota di Indonesia"
          class="absolute left-0 top-11 z-[800] w-64 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-200/90"
        >
          <div class="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Wilayah Pantauan</span>
            <span class="text-[10px] text-emerald-700 font-bold">{{ cities.length }} Area</span>
          </div>
          <div class="max-h-72 overflow-y-auto divide-y divide-slate-100/70 pr-0.5">
            <button
              v-for="city in cities"
              :key="city.id"
              type="button"
              role="option"
              :aria-selected="city.id === activeCityId"
              @click="selectCity(city.id)"
              :class="[
                'w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors',
                city.id === activeCityId
                  ? 'bg-emerald-50/90 text-emerald-950 font-bold'
                  : 'text-slate-700 hover:bg-slate-50 font-medium'
              ]"
            >
              <div>
                <div class="leading-tight">{{ city.name }}</div>
                <div class="text-[11px] text-slate-400 font-normal mt-0.5">{{ city.province }}</div>
              </div>
              <svg
                v-if="city.id === activeCityId"
                aria-hidden="true"
                class="w-4 h-4 text-emerald-600 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <nav
      aria-label="Filter tampilan pin peta"
      class="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 order-3 lg:order-2 w-full lg:w-auto justify-between sm:justify-center"
    >
      <button
        type="button"
        @click="$emit('update:mapFocus', 'all')"
        :aria-pressed="mapFocus === 'all'"
        :class="[
          'flex-1 sm:flex-initial min-h-[34px] px-3.5 py-1 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all',
          mapFocus === 'all'
            ? 'bg-white text-slate-900 font-bold shadow-sm ring-1 ring-slate-900/5'
            : 'text-slate-600 hover:text-slate-900 font-medium'
        ]"
      >
        <span>Semua Peta</span>
      </button>

      <button
        type="button"
        @click="$emit('update:mapFocus', 'reports')"
        :aria-pressed="mapFocus === 'reports'"
        :class="[
          'flex-1 sm:flex-initial min-h-[34px] px-3.5 py-1 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all',
          mapFocus === 'reports'
            ? 'bg-white text-slate-900 font-bold shadow-sm ring-1 ring-slate-900/5'
            : 'text-slate-600 hover:text-slate-900 font-medium'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
        <span>Rawan</span>
        <span
          :class="[
            'text-[11px] px-1.5 py-0.2 rounded-md tabular-nums',
            mapFocus === 'reports' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-500'
          ]"
        >
          {{ reportsCount }}
        </span>
      </button>

      <button
        type="button"
        @click="$emit('update:mapFocus', 'havens')"
        :aria-pressed="mapFocus === 'havens'"
        :class="[
          'flex-1 sm:flex-initial min-h-[34px] px-3.5 py-1 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all',
          mapFocus === 'havens'
            ? 'bg-white text-slate-900 font-bold shadow-sm ring-1 ring-slate-900/5'
            : 'text-slate-600 hover:text-slate-900 font-medium'
        ]"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
        <span>Pos Aman</span>
        <span
          :class="[
            'text-[11px] px-1.5 py-0.2 rounded-md tabular-nums',
            mapFocus === 'havens' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-500'
          ]"
        >
          {{ havensCount }}
        </span>
      </button>
    </nav>

    <div class="flex items-center gap-2 order-2 lg:order-3">
      <button
        type="button"
        @click="$emit('triggerSos')"
        :disabled="isSendingSos"
        class="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-50/90 hover:bg-rose-100/90 active:bg-rose-200/70 text-rose-700 border border-rose-200/90 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-60"
        title="Kirim pesan darurat beserta lokasi GPS ke WhatsApp"
      >
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
        <span>{{ isSendingSos ? 'Memuat GPS...' : 'SOS Darurat' }}</span>
      </button>

      <button
        type="button"
        @click="$emit('openReportModal')"
        class="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
      >
        <svg aria-hidden="true" class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Lapor Titik</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { CityRegion } from '~/utils/geo'

const props = defineProps<{
  reportsCount: number
  havensCount: number
  mapFocus: 'all' | 'reports' | 'havens'
  activeCityId: string
  cities: CityRegion[]
  isSendingSos?: boolean
}>()

const emit = defineEmits<{
  (e: 'openReportModal'): void
  (e: 'update:mapFocus', value: 'all' | 'reports' | 'havens'): void
  (e: 'update:city', cityId: string): void
  (e: 'triggerSos'): void
}>()

const isCityMenuOpen = ref(false)
const cityDropdownRef = ref<HTMLElement | null>(null)

const currentCityObj = computed(() => {
  return props.cities.find(c => c.id === props.activeCityId) || props.cities[0]
})

function selectCity(cityId: string) {
  isCityMenuOpen.value = false
  emit('update:city', cityId)
}

function handleOutsideClick(e: MouseEvent) {
  if (isCityMenuOpen.value && cityDropdownRef.value && !cityDropdownRef.value.contains(e.target as Node)) {
    isCityMenuOpen.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isCityMenuOpen.value) {
    isCityMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>
