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

      <div v-if="sortedHavens.length > 1" class="flex items-center gap-1">
        <button
          type="button"
          @click="prevHaven"
          aria-label="Pos sebelumnya"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
        >
          ‹
        </button>
        <span class="text-xs font-semibold text-slate-600 px-1.5 tabular-nums">
          {{ selectedIndex + 1 }}/{{ sortedHavens.length }}
        </span>
        <button
          type="button"
          @click="nextHaven"
          aria-label="Pos berikutnya"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
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
        <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
          {{ havenTypeLabel(currentItem.haven.type) }}
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
            'min-h-[40px] py-2 px-3 rounded-xl font-bold text-xs transition-colors',
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
          class="min-h-[40px] py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs transition-colors flex items-center justify-center"
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
        class="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold transition-colors"
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
