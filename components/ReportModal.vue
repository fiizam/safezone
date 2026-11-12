<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
  >
    <!-- Backdrop -->
    <div
      @click="onClose"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
    ></div>

    <!-- Modal Card -->
    <div
      class="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-float p-6 sm:p-7 text-slate-900 z-10 my-8 overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 tracking-tight">Laporkan Titik Rawan</h3>
            <p class="text-xs text-slate-500">Bantu sesama pengendara mengetahui kondisi jalur berbahaya</p>
          </div>
        </div>

        <button
          @click="onClose"
          class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
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
          class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2"
        >
          <svg class="w-4 h-4 shrink-0 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Judul Laporan -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Judul Laporan <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Contoh: Rawan Begal di Bawah Flyover Jam 23.00"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200 ease-smooth"
          />
        </div>

        <!-- Kategori Bahaya -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Kategori Bahaya <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              @click="form.category = 'begal'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 ease-smooth text-xs',
                form.category === 'begal'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-subtle'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0"></span>
              <div>
                <div class="font-semibold">Begal & Kejahatan</div>
                <div :class="['text-[10px]', form.category === 'begal' ? 'text-slate-300' : 'text-slate-500']">Pin Merah</div>
              </div>
            </button>

            <button
              type="button"
              @click="form.category = 'geng_motor'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 ease-smooth text-xs',
                form.category === 'geng_motor'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-subtle'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0"></span>
              <div>
                <div class="font-semibold">Geng Motor / Tawuran</div>
                <div :class="['text-[10px]', form.category === 'geng_motor' ? 'text-slate-300' : 'text-slate-500']">Pin Merah</div>
              </div>
            </button>

            <button
              type="button"
              @click="form.category = 'gelap'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 ease-smooth text-xs',
                form.category === 'gelap'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-subtle'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-yellow-500 mt-1 shrink-0"></span>
              <div>
                <div class="font-semibold">Jalan Gelap / PJU Mati</div>
                <div :class="['text-[10px]', form.category === 'gelap' ? 'text-slate-300' : 'text-slate-500']">Pin Kuning</div>
              </div>
            </button>

            <button
              type="button"
              @click="form.category = 'sepi'"
              :class="[
                'p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all duration-200 ease-smooth text-xs',
                form.category === 'sepi'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-subtle'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-slate-400 mt-1 shrink-0"></span>
              <div>
                <div class="font-semibold">Jalan Sepi & Rawan</div>
                <div :class="['text-[10px]', form.category === 'sepi' ? 'text-slate-300' : 'text-slate-500']">Pin Kuning</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Tingkat Bahaya (Danger Level) -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Tingkat Bahaya <span class="text-rose-500">*</span>
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="form.dangerLevel = 'high'"
              :class="[
                'py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all duration-200 ease-smooth',
                form.dangerLevel === 'high'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              ]"
            >
              Tinggi
            </button>
            <button
              type="button"
              @click="form.dangerLevel = 'medium'"
              :class="[
                'py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all duration-200 ease-smooth',
                form.dangerLevel === 'medium'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              ]"
            >
              Sedang
            </button>
            <button
              type="button"
              @click="form.dangerLevel = 'low'"
              :class="[
                'py-2 px-3 rounded-xl border text-center text-xs font-semibold transition-all duration-200 ease-smooth',
                form.dangerLevel === 'low'
                  ? 'bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              ]"
            >
              Rendah
            </button>
          </div>
        </div>

        <!-- Deskripsi Kejadian -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Keterangan & Kronologi Singkat <span class="text-rose-500">*</span>
          </label>
          <textarea
            v-model="form.description"
            required
            rows="3"
            placeholder="Jelaskan kondisi jalan, perkiraan jam rawan, atau modus yang sering terjadi..."
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200 ease-smooth resize-none"
          ></textarea>
        </div>

        <!-- Koordinat Lokasi & Aksi GPS -->
        <div class="space-y-2 pt-1">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-slate-700">
              Koordinat Lokasi <span class="text-rose-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="getGpsLocation"
                :disabled="isGettingGps"
                class="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
              >
                <span v-if="isGettingGps" class="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                <span v-else>📍 Lokasi GPS Saya</span>
              </button>
              <button
                type="button"
                @click="onPickFromMap"
                class="text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors"
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
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <input
                v-model.number="form.longitude"
                type="number"
                step="any"
                required
                placeholder="Longitude (106.8xxx)"
                class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-subtle hover:shadow-card flex items-center gap-2 transition-all duration-200 ease-smooth active:scale-[0.98] disabled:opacity-50"
          >
            <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
  latitude: -6.8925,
  longitude: 107.6186
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
