<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
  >
    <!-- Backdrop -->
    <div
      @click="onClose"
      class="fixed inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
    ></div>

    <!-- Modal Card -->
    <div
      class="relative w-full max-w-lg rounded-2xl bg-dark-900 border border-white/10 shadow-2xl p-6 sm:p-7 text-slate-100 z-10 my-8 overflow-hidden"
    >
      <!-- Top Decorative Accent Gradient -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500"></div>

      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white tracking-tight">Laporkan Titik Rawan</h3>
            <p class="text-xs text-slate-400">Bantu lindungi komuter malam dengan info akurat</p>
          </div>
        </div>

        <button
          @click="onClose"
          class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Judul Laporan -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Judul Laporan <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Contoh: Rawan Begal di Bawah Flyover Jam 23.00"
            class="w-full px-3.5 py-2.5 rounded-xl bg-dark-950/80 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>

        <!-- Kategori Bahaya -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Kategori Bahaya <span class="text-rose-400">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="form.category = 'begal'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs',
                form.category === 'begal'
                  ? 'bg-rose-500/20 border-rose-500 text-white shadow-glow-danger'
                  : 'bg-dark-950/50 border-white/10 text-slate-300 hover:border-white/20'
              ]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 mt-0.5 shrink-0"></span>
              <div>
                <div class="font-semibold">Begal & Kejahatan</div>
                <div class="text-[10px] text-slate-400">Pin Merah</div>
              </div>
            </button>

            <button
              type="button"
              @click="form.category = 'geng_motor'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs',
                form.category === 'geng_motor'
                  ? 'bg-rose-500/20 border-rose-500 text-white shadow-glow-danger'
                  : 'bg-dark-950/50 border-white/10 text-slate-300 hover:border-white/20'
              ]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-red-500 mt-0.5 shrink-0"></span>
              <div>
                <div class="font-semibold">Geng Motor / Tawuran</div>
                <div class="text-[10px] text-slate-400">Pin Merah</div>
              </div>
            </button>

            <button
              type="button"
              @click="form.category = 'gelap'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs',
                form.category === 'gelap'
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow-warning'
                  : 'bg-dark-950/50 border-white/10 text-slate-300 hover:border-white/20'
              ]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 mt-0.5 shrink-0"></span>
              <div>
                <div class="font-semibold">Jalan Gelap / PJU Mati</div>
                <div class="text-[10px] text-slate-400">Pin Kuning</div>
              </div>
            </button>

            <button
              type="button"
              @click="form.category = 'sepi'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs',
                form.category === 'sepi'
                  ? 'bg-yellow-500/20 border-yellow-500 text-white shadow-glow-warning'
                  : 'bg-dark-950/50 border-white/10 text-slate-300 hover:border-white/20'
              ]"
            >
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400 mt-0.5 shrink-0"></span>
              <div>
                <div class="font-semibold">Jalan Sepi & Rawan</div>
                <div class="text-[10px] text-slate-400">Pin Kuning</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Tingkat Bahaya (Danger Level) -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Tingkat Bahaya <span class="text-rose-400">*</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="form.dangerLevel = 'high'"
              :class="[
                'py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all',
                form.dangerLevel === 'high'
                  ? 'bg-red-500/25 border-red-500 text-red-200'
                  : 'bg-dark-950/50 border-white/10 text-slate-400 hover:border-white/20'
              ]"
            >
              🚨 Tinggi
            </button>
            <button
              type="button"
              @click="form.dangerLevel = 'medium'"
              :class="[
                'py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all',
                form.dangerLevel === 'medium'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-200'
                  : 'bg-dark-950/50 border-white/10 text-slate-400 hover:border-white/20'
              ]"
            >
              ⚠️ Sedang
            </button>
            <button
              type="button"
              @click="form.dangerLevel = 'low'"
              :class="[
                'py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all',
                form.dangerLevel === 'low'
                  ? 'bg-blue-500/25 border-blue-500 text-blue-200'
                  : 'bg-dark-950/50 border-white/10 text-slate-400 hover:border-white/20'
              ]"
            >
              ℹ️ Rendah
            </button>
          </div>
        </div>

        <!-- Deskripsi Kejadian -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1.5">
            Deskripsi & Kronologi Singkat <span class="text-rose-400">*</span>
          </label>
          <textarea
            v-model="form.description"
            required
            rows="3"
            placeholder="Jelaskan kondisi jalan, jam rawan, atau ciri modus kejahatan..."
            class="w-full px-3.5 py-2 rounded-xl bg-dark-950/80 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Koordinat Lokasi & Aksi GPS -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-slate-300">
              Koordinat Lokasi <span class="text-rose-400">*</span>
            </label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="getGpsLocation"
                :disabled="isGettingGps"
                class="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-lg border border-indigo-500/20 flex items-center gap-1 transition-colors"
              >
                <span v-if="isGettingGps" class="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                <span v-else>📍 Lokasi GPS Saya</span>
              </button>
              <button
                type="button"
                @click="onPickFromMap"
                class="text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1 transition-colors"
              >
                🗺️ Klik di Peta
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <input
                v-model.number="form.latitude"
                type="number"
                step="any"
                required
                placeholder="Latitude (-6.2xxx)"
                class="w-full px-3 py-2 rounded-xl bg-dark-950/80 border border-white/10 text-xs text-white placeholder-slate-500"
              />
            </div>
            <div>
              <input
                v-model.number="form.longitude"
                type="number"
                step="any"
                required
                placeholder="Longitude (106.8xxx)"
                class="w-full px-3 py-2 rounded-xl bg-dark-950/80 border border-white/10 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-rose-900/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isSubmitting ? 'Mengirim...' : 'Kirim Laporan' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  initialCoords?: { lat: number; lng: number } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', report: any): void
  (e: 'pickFromMap'): void
}>()

const isSubmitting = ref(false)
const isGettingGps = ref(false)
const errorMessage = ref('')

const form = reactive({
  title: '',
  description: '',
  category: 'begal',
  dangerLevel: 'high',
  latitude: -6.2255,
  longitude: 106.8562
})

watch(() => props.initialCoords, (newCoords) => {
  if (newCoords && newCoords.lat && newCoords.lng) {
    form.latitude = parseFloat(newCoords.lat.toFixed(6))
    form.longitude = parseFloat(newCoords.lng.toFixed(6))
  }
}, { immediate: true })

function onClose() {
  errorMessage.value = ''
  emit('close')
}

function onPickFromMap() {
  emit('pickFromMap')
}

function getGpsLocation() {
  if (!navigator.geolocation) {
    alert('Browser tidak mendukung geolokasi GPS')
    return
  }

  isGettingGps.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isGettingGps.value = false
      form.latitude = parseFloat(pos.coords.latitude.toFixed(6))
      form.longitude = parseFloat(pos.coords.longitude.toFixed(6))
    },
    (err) => {
      isGettingGps.value = false
      alert('Gagal mengambil lokasi GPS: ' + err.message)
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const res = await $fetch<{ success: boolean; data: any }>('/api/reports', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description,
        category: form.category,
        dangerLevel: form.dangerLevel,
        latitude: form.latitude,
        longitude: form.longitude
      }
    })

    if (res.success) {
      emit('created', res.data)
      form.title = ''
      form.description = ''
      onClose()
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Gagal mengirim laporan'
  } finally {
    isSubmitting.value = false
  }
}
</script>
