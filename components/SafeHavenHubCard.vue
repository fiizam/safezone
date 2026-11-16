<template>
  <article class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <h2 class="font-bold text-sm sm:text-base tracking-tight text-slate-900">Pos Aman 24 Jam</h2>
        <InfoPopover
          title="Pos Aman (Safe Haven)"
          content="Daftar Kantor Polisi, SPBU, dan Minimarket 24 jam yang terang serta ramai untuk menepi saat darurat. Diurutkan otomatis dari jarak terdekat dengan posisi Anda."
          label="Penjelasan Pos Aman 24 Jam"
        />
      </div>

      <div v-if="sortedHavens.length > 1" class="flex items-center gap-1.5">
        <button
          type="button"
          @click="prevHaven"
          aria-label="Pos sebelumnya"
          class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ‹
        </button>
        <span class="text-xs font-semibold text-slate-600 px-1 tabular-nums">
          {{ selectedIndex + 1 }}/{{ sortedHavens.length }}
        </span>
        <button
          type="button"
          @click="nextHaven"
          aria-label="Pos berikutnya"
          class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ›
        </button>
      </div>
    </div>

    <div
      v-if="currentItem"
      class="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between gap-3"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex items-center gap-2 text-xs font-bold text-emerald-900">
          <span class="w-6 h-6 rounded-lg bg-[#071512] border border-emerald-400/60 text-emerald-300 inline-flex items-center justify-center shrink-0">
            <svg
              v-if="currentItem.haven.type === 'pos_polisi'"
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2.8 4.5 6v5.6c0 5.1 3.2 9.3 7.5 10.4 4.3-1.1 7.5-5.3 7.5-10.4V6L12 2.8Z"/>
              <path d="M12 7.5 13.3 10.3 16.2 10.7 14 12.7 14.6 15.6 12 14.1 9.4 15.6 10 12.7 7.8 10.7 10.7 10.3 12 7.5Z" fill="currentColor" stroke="none"/>
            </svg>
            <svg
              v-else-if="currentItem.haven.type === 'spbu'"
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="4" y="3.5" width="10" height="17" rx="2"/>
              <line x1="2.5" y1="20.5" x2="15.5" y2="20.5"/>
              <line x1="6.5" y1="7.5" x2="11.5" y2="7.5"/>
              <path d="M14 11.5h2a2 2 0 0 1 2 2v3a1.75 1.75 0 0 0 3.5 0V9.2a2 2 0 0 0-.6-1.4L18 5"/>
            </svg>
            <svg
              v-else
              class="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 9.5 5.2 4h13.6l1.7 5.5"/>
              <path d="M3.5 9.5a2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.8 0 2.8 2.8 0 0 0 5.6 0"/>
              <path d="M5 9.8V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V9.8"/>
            </svg>
          </span>
          <span>{{ havenTypeLabel(currentItem.haven.type) }}</span>
        </span>
        <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tabular-nums">
          {{ currentItem.distanceLabel }} · ~{{ currentItem.motorMinutes }} mnt
        </span>
      </div>

      <div>
        <button
          type="button"
          @click="$emit('focusHaven', currentItem.haven)"
          class="text-left font-extrabold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors"
        >
          {{ currentItem.haven.name }}
        </button>
        <p class="text-xs text-slate-600 mt-1 leading-relaxed">
          {{ currentItem.haven.address }}
        </p>
      </div>

      <div class="pt-1 grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="$emit('drawRoute', currentItem.haven)"
          :class="[
            'min-h-[42px] py-2 px-3 rounded-xl font-bold text-xs transition-colors',
            activeRouteHavenId === currentItem.haven.id
              ? 'bg-slate-900 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
          ]"
        >
          {{ activeRouteHavenId === currentItem.haven.id ? 'Tutup Rute Peta' : 'Rute di Peta' }}
        </button>

        <a
          :href="`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${currentItem.haven.latitude},${currentItem.haven.longitude}&travelmode=two-wheeler`"
          target="_blank"
          rel="noopener noreferrer"
          class="min-h-[42px] py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-colors flex items-center justify-center"
        >
          Google Maps
        </a>
      </div>
    </div>

    <div
      v-else
      class="my-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-600"
    >
      Belum ada Pos Aman terdaftar di wilayah ini.
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
      <span class="text-slate-600 font-medium">Panggilan Darurat Polisi</span>
      <a
        href="tel:110"
        class="min-h-[38px] px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition-colors inline-flex items-center"
      >
        Hubungi 110
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SafeHaven } from '~/server/db/schema'
import {
  calculateDistanceMeters,
  formatDistance,
  estimateMotorMinutes,
  type Coordinates
} from '~/utils/geo'

const props = defineProps<{
  havens: SafeHaven[]
  userCoords: Coordinates
  activeRouteHavenId?: number | null
}>()

defineEmits<{
  (e: 'focusHaven', haven: SafeHaven): void
  (e: 'drawRoute', haven: SafeHaven): void
}>()

const selectedIndex = ref(0)

const sortedHavens = computed(() => {
  return [...props.havens]
    .map((haven) => {
      const meters = calculateDistanceMeters(props.userCoords, {
        lat: haven.latitude,
        lng: haven.longitude
      })
      return {
        haven,
        meters,
        distanceLabel: formatDistance(meters),
        motorMinutes: estimateMotorMinutes(meters)
      }
    })
    .sort((a, b) => a.meters - b.meters)
})

watch(
  () => props.havens,
  () => {
    selectedIndex.value = 0
  }
)

const currentItem = computed(() => {
  return sortedHavens.value[selectedIndex.value] || null
})

function havenTypeLabel(type: string): string {
  if (type === 'pos_polisi') return 'Kantor Polisi'
  if (type === 'spbu') return 'SPBU 24 Jam'
  return 'Minimarket 24 Jam'
}

function prevHaven() {
  if (!sortedHavens.value.length) return
  selectedIndex.value =
    (selectedIndex.value - 1 + sortedHavens.value.length) % sortedHavens.value.length
}

function nextHaven() {
  if (!sortedHavens.value.length) return
  selectedIndex.value = (selectedIndex.value + 1) % sortedHavens.value.length
}
</script>
