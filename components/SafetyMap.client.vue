<template>
  <div class="w-full rounded-3xl border border-slate-200/90 shadow-card bg-white overflow-hidden flex flex-col">
    <div class="px-3.5 sm:px-4 py-2.5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 relative z-[450]">
      <div class="relative flex-1 min-w-[220px] sm:max-w-md">
        <div class="flex items-center bg-slate-50 hover:bg-slate-100/80 focus-within:bg-white focus-within:border-slate-900 rounded-xl px-3 py-2 border border-slate-200/90 transition-colors">
          <label for="map-search-input" class="sr-only">Cari alamat, desa, kecamatan, atau jalan di Indonesia</label>
          <svg aria-hidden="true" class="w-4 h-4 text-slate-500 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            id="map-search-input"
            v-model="searchQuery"
            type="search"
            @focus="isSearchDropdownOpen = true"
            @keydown.enter.prevent="selectFirstSearchResult"
            placeholder="Ketik alamat, desa, kecamatan, atau nama jalan..."
            class="bg-transparent text-xs text-slate-900 placeholder-slate-500 focus:outline-none w-full font-medium"
          />
          <span
            v-if="isSearchingPlaces"
            class="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin ml-1.5 shrink-0"
            aria-hidden="true"
          ></span>
          <button
            v-else-if="searchQuery"
            type="button"
            @click="clearSearch"
            aria-label="Hapus pencarian"
            class="text-slate-500 hover:text-slate-900 text-xs ml-1.5 px-1 font-bold"
          >
            ×
          </button>
        </div>

        <div
          v-if="searchQuery.trim() && isSearchDropdownOpen"
          class="absolute left-0 right-0 top-11 z-[900] bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden"
        >
          <div class="max-h-64 overflow-y-auto divide-y divide-slate-100">
            <div v-if="remotePlaces.length > 0">
              <div class="px-3.5 py-1.5 bg-emerald-50/90 text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center justify-between">
                <span>Alamat, Desa & Jalan di Indonesia</span>
                <span>Klik untuk Pindai</span>
              </div>
              <button
                v-for="place in remotePlaces"
                :key="`place-${place.id}`"
                type="button"
                @click="handleSelectRemotePlace(place)"
                class="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/80 transition-colors flex items-start gap-2.5"
              >
                <svg aria-hidden="true" class="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold text-slate-900 truncate">{{ place.name }}</div>
                  <div class="text-[11px] text-slate-500 truncate">{{ place.displayName }}</div>
                </div>
              </button>
            </div>

            <div v-if="searchResults.length > 0">
              <div class="px-3.5 py-1.5 bg-slate-50/90 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Titik Pantau Terdeteksi
              </div>
              <button
                v-for="res in searchResults"
                :key="`${res.kind}-${res.id}`"
                type="button"
                @click="handleSelectSearchResult(res)"
                class="w-full px-3.5 py-2.5 text-left hover:bg-slate-100/90 transition-colors flex items-start gap-2.5"
              >
                <span
                  :class="[
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    res.kind === 'haven' ? 'bg-emerald-500' : 'bg-rose-500'
                  ]"
                ></span>
                <div class="min-w-0 flex-1">
                  <div class="text-xs font-bold text-slate-900 truncate">{{ res.title }}</div>
                  <div class="text-[11px] text-slate-600 truncate">{{ res.subtitle }}</div>
                </div>
              </button>
            </div>

            <div
              v-if="isSearchingPlaces && remotePlaces.length === 0"
              class="px-3.5 py-3 text-xs text-slate-600 flex items-center justify-center gap-2"
            >
              <span class="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Mencari alamat "{{ searchQuery }}" di seluruh Indonesia...</span>
            </div>

            <div
              v-else-if="searchResults.length === 0 && remotePlaces.length === 0 && !isSearchingPlaces"
              class="px-3.5 py-3 text-xs text-slate-600 text-center"
            >
              Ketik nama jalan, kelurahan/desa, atau kecamatan lalu tekan Enter.
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        <button
          v-if="activeCategory !== 'all'"
          type="button"
          @click="$emit('update:category', 'all')"
          class="min-h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
          title="Hapus saringan kategori"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{{ categoryName(activeCategory) }}</span>
          <span class="text-slate-500 font-bold ml-0.5">×</span>
        </button>

        <button
          type="button"
          @click="locateUser"
          :disabled="isLocating"
          aria-label="Deteksi lokasi GPS alamat saya sekarang"
          title="Deteksi lokasi GPS saya sekarang"
          class="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/90 flex items-center gap-1.5 text-xs font-bold transition-colors"
        >
          <span v-if="isLocating" class="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
          <svg v-else aria-hidden="true" class="w-3.5 h-3.5 text-sky-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span>{{ isLocating ? 'Melacak...' : 'Lokasi Saya' }}</span>
        </button>

        <button
          type="button"
          @click="scanCurrentMapArea"
          :disabled="isScanningArea"
          aria-label="Pindai titik rawan, laporan warga, dan pos aman di area peta ini"
          title="Pindai titik rawan dan pos aman di area peta ini"
          class="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-70"
        >
          <span
            v-if="isScanningArea"
            class="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0"
          ></span>
          <svg
            v-else
            aria-hidden="true"
            class="w-3.5 h-3.5 text-emerald-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="3" x2="12" y2="6"/>
          </svg>
          <span>{{ isScanningArea ? 'Memindai...' : 'Pindai Area Ini' }}</span>
        </button>

        <button
          type="button"
          @click="toggleRoutePlanner"
          aria-label="Cek keamanan rute pulang dari Titik A ke Titik B"
          title="Cek keamanan rute pulang dari Titik A ke Titik B"
          :class="[
            'min-h-[36px] px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors',
            isPlannerOpen || commuteRoutes.length > 0
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
          ]"
        >
          <svg aria-hidden="true" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="6" cy="19" r="3"/>
            <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
            <circle cx="18" cy="5" r="3"/>
          </svg>
          <span>Cek Rute Pulang (A → B)</span>
        </button>

        <button
          type="button"
          @click="routeToNearestHaven"
          aria-label="Tampilkan rute ke Pos Aman terdekat"
          title="Rute ke Pos Aman terdekat"
          class="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-700 flex items-center gap-1.5 text-xs font-bold transition-colors"
        >
          <span class="w-2 h-2 rounded-full bg-white shrink-0"></span>
          <span>Rute Pos Terdekat</span>
        </button>
      </div>
    </div>

    <div
      v-if="isPlannerOpen || commuteRoutes.length > 0"
      class="px-3.5 sm:px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex flex-col gap-3 relative z-[440]"
      role="region"
      aria-label="Perencana Keamanan Rute Pulang Titik A ke Titik B"
    >
      <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
        <div class="md:col-span-4 relative">
          <label for="route-origin-input" class="block text-[11px] font-bold text-slate-700 mb-1">
            Titik Berangkat (A)
          </label>
          <div class="flex items-center gap-1.5">
            <div class="relative flex-1">
              <input
                id="route-origin-input"
                v-model="originQuery"
                type="text"
                @focus="isOriginDropdownOpen = true"
                placeholder="Lokasi Saya (Ketik jika ingin ubah)..."
                class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-xs text-slate-900 placeholder-slate-500 font-medium"
              />
              <div
                v-if="isOriginDropdownOpen && originRemotePlaces.length > 0"
                class="absolute left-0 right-0 top-10 z-[920] bg-white rounded-xl border border-slate-200 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100"
              >
                <button
                  v-for="place in originRemotePlaces"
                  :key="`orig-${place.id}`"
                  type="button"
                  @click="selectOriginPlace(place)"
                  class="w-full px-3 py-2 text-left hover:bg-emerald-50 text-xs"
                >
                  <div class="font-bold text-slate-900 truncate">{{ place.name }}</div>
                  <div class="text-[10px] text-slate-500 truncate">{{ place.displayName }}</div>
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="useMyLocationAsOrigin"
              title="Gunakan titik posisi saya saat ini"
              class="min-h-[34px] px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 shrink-0"
            >
              GPS Saya
            </button>
          </div>
        </div>

        <div class="md:col-span-5 relative">
          <label for="route-dest-input" class="block text-[11px] font-bold text-slate-700 mb-1">
            Titik Tujuan Pulang (B)
          </label>
          <div class="flex items-center gap-1.5">
            <div class="relative flex-1">
              <input
                id="route-dest-input"
                v-model="destQuery"
                type="text"
                @focus="isDestDropdownOpen = true"
                @keydown.enter.prevent="runCommuteSafetyCheck"
                placeholder="Ketik alamat tujuan, desa, kampus, atau jalan..."
                class="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-slate-900 text-xs text-slate-900 placeholder-slate-500 font-medium"
              />
              <div
                v-if="isDestDropdownOpen && destRemotePlaces.length > 0"
                class="absolute left-0 right-0 top-10 z-[920] bg-white rounded-xl border border-slate-200 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100"
              >
                <button
                  v-for="place in destRemotePlaces"
                  :key="`dest-${place.id}`"
                  type="button"
                  @click="selectDestPlace(place)"
                  class="w-full px-3 py-2 text-left hover:bg-emerald-50 text-xs"
                >
                  <div class="font-bold text-slate-900 truncate">{{ place.name }}</div>
                  <div class="text-[10px] text-slate-500 truncate">{{ place.displayName }}</div>
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="startPickDestinationOnMap"
              :class="[
                'min-h-[34px] px-2.5 py-1.5 rounded-xl border text-[11px] font-bold shrink-0 transition-colors',
                isPickingDestination
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              ]"
            >
              {{ isPickingDestination ? 'Klik Peta...' : 'Pilih di Peta' }}
            </button>
          </div>
        </div>

        <div class="md:col-span-3 flex items-end gap-1.5 pt-0 md:pt-5">
          <button
            type="button"
            @click="runCommuteSafetyCheck"
            :disabled="isPlanningCommute"
            class="flex-1 min-h-[36px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <span v-if="isPlanningCommute" class="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isPlanningCommute ? 'Menganalisis...' : 'Analisis Rute' }}</span>
          </button>
          <button
            type="button"
            @click="closeCommutePlanner"
            aria-label="Tutup panel cek rute pulang"
            class="min-h-[36px] px-2.5 py-2 rounded-xl bg-white hover:bg-slate-200/70 text-slate-700 border border-slate-200 text-xs font-bold"
          >
            ×
          </button>
        </div>
      </div>

      <p v-if="plannerError" class="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
        {{ plannerError }}
      </p>

      <div v-if="commuteRoutes.length > 0 && selectedCommuteRoute" class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-subtle flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <button
              v-for="(opt, idx) in commuteRoutes"
              :key="opt.id"
              type="button"
              @click="selectCommuteRouteIndex(idx)"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5',
                selectedCommuteIdx === idx
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              ]"
            >
              <span>{{ opt.label }}</span>
              <span
                :class="[
                  'text-[10px] px-1.5 py-0.5 rounded-md font-extrabold',
                  opt.safetyLevel === 'safe'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : opt.safetyLevel === 'moderate'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                ]"
                v-if="selectedCommuteIdx === idx"
              >
                {{ opt.safetyScore }}%
              </span>
              <span v-else class="text-[10px] text-slate-500">({{ opt.safetyScore }}%)</span>
              <span
                v-if="opt.isRecommended"
                class="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md"
              >
                Rekomendasi Aman
              </span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <a
              :href="commuteGoogleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              Buka Google Maps
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div
            :class="[
              'p-2.5 rounded-xl border flex flex-col justify-between',
              selectedCommuteRoute.safetyLevel === 'safe'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : selectedCommuteRoute.safetyLevel === 'moderate'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
            ]"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-75">Skor Keamanan Rute</span>
            <div class="text-base font-extrabold mt-0.5">
              {{ selectedCommuteRoute.safetyScore }}% · {{ selectedCommuteRoute.safetyLabel }}
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jarak &amp; Waktu Tempuh</span>
            <div class="text-xs font-bold text-slate-900 mt-1">
              {{ selectedCommuteRoute.distanceLabel }} · ~{{ selectedCommuteRoute.motorMinutes }} mnt motor
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Titik Rawan Terlewati</span>
            <div class="text-xs font-bold text-slate-900 mt-1">
              {{ selectedCommuteRoute.highDangerCount }} Bahaya Tinggi · {{ selectedCommuteRoute.warningCount }} Gelap/Sepi
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pos Aman 24 Jam di Jalur</span>
            <div class="text-xs font-bold text-emerald-800 mt-1">
              {{ selectedCommuteRoute.passedHavens.length }} Pos Siaga Terlewati
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-700 font-medium">
          <strong class="text-slate-900">Analisis Jalur:</strong> {{ selectedCommuteRoute.advisorySummary }}
        </p>
      </div>
    </div>

    <div class="relative w-full h-[400px] sm:h-[450px] bg-[#0b0f19]">
      <div
        ref="mapContainer"
        class="w-full h-full z-0"
        role="region"
        aria-label="Peta interaktif titik rawan dan tempat berlindung 24 jam seluruh Indonesia"
      ></div>

      <div
        v-if="activeRouteInfo"
        class="absolute bottom-3.5 left-3.5 right-16 sm:right-auto sm:max-w-md z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-300 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        role="status"
        aria-live="polite"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {{ isFetchingRoute ? 'Menghitung Rute Jalan...' : activeRouteInfo.isRoadRoute ? 'Rute Jalan Raya Aktif' : 'Rute Kompas Aktif' }}
            </span>
          </div>
          <p class="text-xs font-bold text-slate-900 truncate">{{ activeRouteInfo.haven.name }}</p>
          <p class="text-[11px] text-slate-600 font-medium mt-0.5">
            Jarak tempuh: <strong class="text-slate-900">{{ activeRouteInfo.distanceLabel }}</strong>
            · Est. motor <strong class="text-slate-900">{{ activeRouteInfo.motorMinutes }} mnt</strong>
            (jalan kaki {{ activeRouteInfo.walkMinutes }} mnt)
          </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <a
            :href="`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${activeRouteInfo.haven.latitude},${activeRouteInfo.haven.longitude}&travelmode=two-wheeler`"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
          >
            Google Maps
          </a>
          <button
            type="button"
            @click="$emit('clearRoute')"
            class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            aria-label="Tutup tampilan rute di peta"
          >
            Tutup
          </button>
        </div>
      </div>

      <div class="absolute bottom-3.5 right-3.5 z-[400] flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        <button
          type="button"
          @click="zoomIn"
          aria-label="Perbesar peta"
          title="Perbesar peta"
          class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors border-b border-slate-200 font-bold text-base"
        >
          +
        </button>
        <button
          type="button"
          @click="zoomOut"
          aria-label="Perkecil peta"
          title="Perkecil peta"
          class="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors font-bold text-base"
        >
          −
        </button>
      </div>

      <div
        v-if="isPickingLocation || isPickingDestination"
        class="absolute top-3.5 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold border border-slate-700"
        role="status"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>
          {{
            isPickingDestination
              ? 'Klik pada peta untuk memilih Titik Tujuan Pulang (B)'
              : 'Klik pada peta untuk memilih titik koordinat laporan'
          }}
        </span>
      </div>
    </div>

    <div
      class="px-3.5 sm:px-4 py-2.5 bg-[#0b0f19] border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300"
      role="region"
      aria-label="Legenda Taksonomi Pin Peta dan Saringan Cepat"
    >
      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden xl:inline">
          Taksonomi Pin:
        </span>

        <button
          type="button"
          @click="$emit('update:category', activeCategory === 'begal' ? 'all' : 'begal')"
          :aria-pressed="activeCategory === 'begal'"
          :class="[
            'sz-legend-chip',
            activeCategory === 'begal' ? 'sz-legend-chip--active-danger' : ''
          ]"
          title="Saring titik rawan Begal & Kejahatan"
        >
          <span class="sz-legend-icon sz-legend-icon--danger">
            <span class="sz-legend-pulse-danger"></span>
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3 4 7v5c0 5 3.4 9.3 8 10 4.6-.7 8-5 8-10V7l-8-4Z" stroke-linejoin="round"/>
              <path d="M12 8v4.5" stroke-linecap="round"/>
              <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </span>
          <span>Begal / Kriminal</span>
        </button>

        <button
          type="button"
          @click="$emit('update:category', activeCategory === 'geng_motor' ? 'all' : 'geng_motor')"
          :aria-pressed="activeCategory === 'geng_motor'"
          :class="[
            'sz-legend-chip',
            activeCategory === 'geng_motor' ? 'sz-legend-chip--active-danger' : ''
          ]"
          title="Saring titik rawan Geng Motor & Konvoi Liar"
        >
          <span class="sz-legend-icon sz-legend-icon--convoy">
            <span class="sz-legend-pulse-danger"></span>
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="5.5" cy="17.5" r="2.5"/>
              <circle cx="18.5" cy="17.5" r="2.5"/>
              <path d="M8 17.5h5l2-5.5-3.5-1.5-2.5 3H6.5L8 17.5Z" stroke-linejoin="round"/>
              <path d="M13 6.5h3l2 4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span>Geng Motor</span>
        </button>

        <button
          type="button"
          @click="$emit('update:category', activeCategory === 'gelap' ? 'all' : 'gelap')"
          :aria-pressed="activeCategory === 'gelap'"
          :class="[
            'sz-legend-chip',
            activeCategory === 'gelap' ? 'sz-legend-chip--active-warning' : ''
          ]"
          title="Saring titik Jalan Gelap & Lampu PJU Mati"
        >
          <span class="sz-legend-icon sz-legend-icon--warning">
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 21V6a3 3 0 0 1 3-3h6" stroke-linecap="round"/>
              <path d="M13 3h5l1 3h-7l1-3Z" stroke-linejoin="round"/>
              <path d="m14 10 4 4m0-4-4 4" stroke-linecap="round"/>
            </svg>
          </span>
          <span>PJU Mati / Gelap</span>
        </button>

        <button
          type="button"
          @click="$emit('update:category', activeCategory === 'sepi' ? 'all' : 'sepi')"
          :aria-pressed="activeCategory === 'sepi'"
          :class="[
            'sz-legend-chip',
            activeCategory === 'sepi' ? 'sz-legend-chip--active-warning' : ''
          ]"
          title="Saring titik Jalan Sepi & Minim Pengawasan"
        >
          <span class="sz-legend-icon sz-legend-icon--warning">
            <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 20 9 4m11 16L15 4" stroke-linecap="round"/>
              <path d="M12 6v2m0 3v2m0 3v3" stroke-linecap="round"/>
            </svg>
          </span>
          <span>Jalan Sepi</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-300">
        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-emerald-300 font-semibold">
          <span class="relative flex h-2 w-2">
            <span class="sz-legend-beacon-ring"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>Pos Polisi · SPBU · Mart 24J</span>
        </span>

        <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-slate-300 font-medium">
          <span class="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>✓ Kondusif</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import type { Report, SafeHaven } from '~/server/db/schema'
import { formatRelativeTime } from '~/utils/time'
import {
  calculateDistanceMeters,
  formatDistance,
  estimateMotorMinutes,
  estimateWalkMinutes,
  fetchOsrmStreetRoute,
  planSafeCommuteRoutes,
  searchIndonesianPlaces,
  type Coordinates,
  type GeocodedPlace,
  type AnalyzedRouteOption
} from '~/utils/geo'

interface SearchItem {
  kind: 'report' | 'haven'
  id: number
  title: string
  subtitle: string
  lat: number
  lng: number
}

const props = withDefaults(
  defineProps<{
    reports: Report[]
    safeHavens: SafeHaven[]
    activeCategory?: string
    mapFocus?: 'all' | 'reports' | 'havens'
    isPickingLocation?: boolean
    userCoords: Coordinates
    activeRouteHaven?: SafeHaven | null
    upvotedIds?: number[]
    resolvedIds?: number[]
    isScanningArea?: boolean
  }>(),
  {
    activeCategory: 'all',
    mapFocus: 'all',
    isPickingLocation: false,
    activeRouteHaven: null,
    upvotedIds: () => [],
    resolvedIds: () => [],
    isScanningArea: false
  }
)

const emit = defineEmits<{
  (e: 'selectLocation', payload: Coordinates): void
  (e: 'upvote', reportId: number): void
  (e: 'resolve', reportId: number): void
  (e: 'update:category', category: string): void
  (e: 'updateUserCoords', coords: Coordinates, isLiveGps: boolean): void
  (e: 'drawRoute', haven: SafeHaven): void
  (e: 'clearRoute'): void
  (e: 'scanArea', coords: Coordinates, placeLabel?: string, isSilent?: boolean): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const isSearchDropdownOpen = ref(false)
const remotePlaces = ref<GeocodedPlace[]>([])
const isSearchingPlaces = ref(false)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let mapMoveDebounceTimer: ReturnType<typeof setTimeout> | null = null
let lastAutoScanCoords: Coordinates = { ...props.userCoords }

const openedPopupTarget = ref<{ kind: 'report' | 'haven'; id: number } | null>(null)
let isRebuildingMarkers = false

let map: any = null
let L: any = null
let reportsLayerGroup: any = null
let havensLayerGroup: any = null
let routeLayerGroup: any = null
let userMarker: any = null
let pickerMarker: any = null
const reportMarkersMap = new Map<number, any>()
const havenMarkersMap = new Map<number, any>()

const isLocating = ref(false)
const isFetchingRoute = ref(false)
const osrmRouteStats = ref<{
  distanceMeters: number
  durationSeconds: number
  isRoadRoute: boolean
} | null>(null)

const isPlannerOpen = ref(false)
const isPickingDestination = ref(false)
const isPlanningCommute = ref(false)
const plannerError = ref('')
const originQuery = ref('Lokasi Saya Saat Ini')
const destQuery = ref('')
const originCoords = ref<Coordinates>({ ...props.userCoords })
const destCoords = ref<Coordinates | null>(null)
const originRemotePlaces = ref<GeocodedPlace[]>([])
const destRemotePlaces = ref<GeocodedPlace[]>([])
const isOriginDropdownOpen = ref(false)
const isDestDropdownOpen = ref(false)
const commuteRoutes = ref<AnalyzedRouteOption[]>([])
const selectedCommuteIdx = ref(0)
let originDebounceTimer: ReturnType<typeof setTimeout> | null = null
let destDebounceTimer: ReturnType<typeof setTimeout> | null = null
let destMarker: any = null

const selectedCommuteRoute = computed<AnalyzedRouteOption | null>(() => {
  return commuteRoutes.value[selectedCommuteIdx.value] || commuteRoutes.value[0] || null
})

const commuteGoogleMapsUrl = computed(() => {
  const dest = destCoords.value
  if (!dest) return 'https://www.google.com/maps'
  return `https://www.google.com/maps/dir/?api=1&origin=${originCoords.value.lat},${originCoords.value.lng}&destination=${dest.lat},${dest.lng}&travelmode=two-wheeler`
})

watch(originQuery, (val) => {
  if (originDebounceTimer) clearTimeout(originDebounceTimer)
  const q = val.trim()
  if (q.length < 3 || q === 'Lokasi Saya Saat Ini') {
    originRemotePlaces.value = []
    return
  }
  originDebounceTimer = setTimeout(async () => {
    originRemotePlaces.value = await searchIndonesianPlaces(q)
  }, 300)
})

watch(destQuery, (val) => {
  if (destDebounceTimer) clearTimeout(destDebounceTimer)
  const q = val.trim()
  if (q.length < 3 || q.startsWith('Titik Peta (')) {
    destRemotePlaces.value = []
    return
  }
  destDebounceTimer = setTimeout(async () => {
    destRemotePlaces.value = await searchIndonesianPlaces(q)
  }, 300)
})

function toggleRoutePlanner() {
  isPlannerOpen.value = !isPlannerOpen.value
  if (isPlannerOpen.value) {
    originCoords.value = { ...props.userCoords }
    if (!originQuery.value) {
      originQuery.value = 'Lokasi Saya Saat Ini'
    }
  } else {
    isPickingDestination.value = false
  }
}

function closeCommutePlanner() {
  isPlannerOpen.value = false
  isPickingDestination.value = false
  plannerError.value = ''
  commuteRoutes.value = []
  selectedCommuteIdx.value = 0
  if (destMarker && map) {
    map.removeLayer(destMarker)
    destMarker = null
  }
  renderRouteLine()
}

function useMyLocationAsOrigin() {
  originCoords.value = { ...props.userCoords }
  originQuery.value = 'Lokasi Saya Saat Ini'
  isOriginDropdownOpen.value = false
}

function selectOriginPlace(place: GeocodedPlace) {
  originCoords.value = { lat: place.lat, lng: place.lng }
  originQuery.value = place.name
  originRemotePlaces.value = []
  isOriginDropdownOpen.value = false
}

function selectDestPlace(place: GeocodedPlace) {
  destCoords.value = { lat: place.lat, lng: place.lng }
  destQuery.value = place.name
  destRemotePlaces.value = []
  isDestDropdownOpen.value = false
  plannerError.value = ''
  runCommuteSafetyCheck()
}

function startPickDestinationOnMap() {
  isPickingDestination.value = !isPickingDestination.value
  plannerError.value = ''
}

function selectCommuteRouteIndex(idx: number) {
  selectedCommuteIdx.value = idx
  renderCommuteRoutesOnMap()
}

async function runCommuteSafetyCheck() {
  plannerError.value = ''
  isOriginDropdownOpen.value = false
  isDestDropdownOpen.value = false

  if (!destCoords.value) {
    const q = destQuery.value.trim()
    if (q.length >= 3) {
      isPlanningCommute.value = true
      const found = await searchIndonesianPlaces(q)
      if (found.length > 0) {
        destCoords.value = { lat: found[0].lat, lng: found[0].lng }
        destQuery.value = found[0].name
      } else {
        isPlanningCommute.value = false
        plannerError.value = 'Alamat tujuan tidak ditemukan. Coba ketik nama jalan/kecamatan atau klik tombol Pilih di Peta.'
        return
      }
    } else {
      plannerError.value = 'Ketik alamat tujuan pulang (B) atau klik tombol Pilih di Peta terlebih dahulu.'
      return
    }
  }

  if (originQuery.value.trim() === 'Lokasi Saya Saat Ini') {
    originCoords.value = { ...props.userCoords }
  }

  emit('clearRoute')
  isPlanningCommute.value = true

  try {
    const analyzed = await planSafeCommuteRoutes(
      originCoords.value,
      destCoords.value,
      props.reports,
      props.safeHavens
    )
    commuteRoutes.value = analyzed
    const recIdx = analyzed.findIndex(r => r.isRecommended)
    selectedCommuteIdx.value = recIdx >= 0 ? recIdx : 0
    renderCommuteRoutesOnMap()
  } catch {
    plannerError.value = 'Gagal menghitung rute perjalanan. Silakan coba lagi.'
  } finally {
    isPlanningCommute.value = false
  }
}

function renderCommuteRoutesOnMap() {
  if (!map || !L || !routeLayerGroup) return
  routeLayerGroup.clearLayers()

  if (!commuteRoutes.value.length) return

  commuteRoutes.value.forEach((opt, idx) => {
    if (idx === selectedCommuteIdx.value) return
    const altLine = L.polyline(opt.coordinates, {
      color: '#94a3b8',
      weight: 4,
      opacity: 0.65,
      dashArray: '6, 8',
      lineCap: 'round'
    })
    routeLayerGroup.addLayer(altLine)
  })

  const activeOpt = selectedCommuteRoute.value
  if (activeOpt) {
    const mainColor =
      activeOpt.safetyLevel === 'safe'
        ? '#10b981'
        : activeOpt.safetyLevel === 'moderate'
          ? '#f59e0b'
          : '#f43f5e'

    const glowLine = L.polyline(activeOpt.coordinates, {
      color: mainColor,
      weight: 10,
      opacity: 0.28,
      lineCap: 'round',
      lineJoin: 'round'
    })
    const coreLine = L.polyline(activeOpt.coordinates, {
      color: mainColor,
      weight: 4.5,
      opacity: 0.96,
      lineCap: 'round',
      lineJoin: 'round'
    })
    routeLayerGroup.addLayer(glowLine)
    routeLayerGroup.addLayer(coreLine)

    if (destCoords.value) {
      if (destMarker) {
        map.removeLayer(destMarker)
      }
      const destIcon = createDestinationPin()
      destMarker = L.marker([destCoords.value.lat, destCoords.value.lng], { icon: destIcon }).addTo(map)
    }

    const bounds = L.latLngBounds(activeOpt.coordinates)
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
  }
}

function categoryName(cat: string): string {
  const names: Record<string, string> = {
    begal: 'Begal & Kejahatan',
    geng_motor: 'Geng Motor',
    gelap: 'Lampu Mati / Gelap',
    sepi: 'Jalan Sepi'
  }
  return names[cat] || cat
}

function escapeHtml(raw: string): string {
  return String(raw || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const searchResults = computed<SearchItem[]>(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []

  const matchedReports: SearchItem[] = props.reports
    .filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    .map(r => ({
      kind: 'report',
      id: r.id,
      title: r.title,
      subtitle: r.description,
      lat: r.latitude,
      lng: r.longitude
    }))

  const matchedHavens: SearchItem[] = props.safeHavens
    .filter(h => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q))
    .map(h => ({
      kind: 'haven',
      id: h.id,
      title: h.name,
      subtitle: h.address,
      lat: h.latitude,
      lng: h.longitude
    }))

  return [...matchedReports, ...matchedHavens].slice(0, 5)
})

watch(searchQuery, (newVal) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  const q = newVal.trim()
  if (q.length < 3) {
    remotePlaces.value = []
    isSearchingPlaces.value = false
    return
  }

  isSearchingPlaces.value = true
  searchDebounceTimer = setTimeout(async () => {
    const places = await searchIndonesianPlaces(q)
    if (searchQuery.value.trim() === q) {
      remotePlaces.value = places
      isSearchingPlaces.value = false
    }
  }, 320)
})

function clearSearch() {
  searchQuery.value = ''
  remotePlaces.value = []
  isSearchDropdownOpen.value = false
  renderMarkers(false)
}

function focusPin(kind: 'report' | 'haven', id: number, lat: number, lng: number) {
  if (!map) return
  openedPopupTarget.value = { kind, id }
  lastAutoScanCoords = { lat, lng }
  map.flyTo([lat, lng], 16, { duration: 0.85 })
  setTimeout(() => {
    const marker = kind === 'report' ? reportMarkersMap.get(id) : havenMarkersMap.get(id)
    if (marker) {
      marker.openPopup()
    }
  }, 600)
}

function handleSelectSearchResult(item: SearchItem) {
  isSearchDropdownOpen.value = false
  focusPin(item.kind, item.id, item.lat, item.lng)
}

function handleSelectRemotePlace(place: GeocodedPlace) {
  isSearchDropdownOpen.value = false
  searchQuery.value = ''
  remotePlaces.value = []
  openedPopupTarget.value = null
  const coords = { lat: place.lat, lng: place.lng }
  lastAutoScanCoords = { ...coords }
  if (map) {
    map.flyTo([place.lat, place.lng], 15, { duration: 1.0 })
  }
  emit('scanArea', coords, place.name, false)
}

async function selectFirstSearchResult() {
  if (remotePlaces.value.length > 0) {
    handleSelectRemotePlace(remotePlaces.value[0])
    return
  }
  if (searchResults.value.length > 0) {
    handleSelectSearchResult(searchResults.value[0])
    return
  }
  const q = searchQuery.value.trim()
  if (q.length >= 3) {
    isSearchingPlaces.value = true
    const places = await searchIndonesianPlaces(q)
    isSearchingPlaces.value = false
    if (places.length > 0) {
      handleSelectRemotePlace(places[0])
    }
  }
}

function scanCurrentMapArea() {
  openedPopupTarget.value = null
  if (!map) {
    emit('scanArea', props.userCoords, undefined, false)
    return
  }
  const center = map.getCenter()
  const coords = { lat: center.lat, lng: center.lng }
  lastAutoScanCoords = { ...coords }
  emit('scanArea', coords, undefined, false)
}

const activeRouteInfo = computed(() => {
  if (!props.activeRouteHaven) return null
  const fallbackMeters = calculateDistanceMeters(props.userCoords, {
    lat: props.activeRouteHaven.latitude,
    lng: props.activeRouteHaven.longitude
  })
  const meters = osrmRouteStats.value?.distanceMeters ?? fallbackMeters
  const motorMinutes = osrmRouteStats.value?.isRoadRoute
    ? Math.max(1, Math.round(osrmRouteStats.value.durationSeconds / 60))
    : estimateMotorMinutes(meters)

  return {
    haven: props.activeRouteHaven,
    meters,
    distanceLabel: formatDistance(meters),
    motorMinutes,
    walkMinutes: estimateWalkMinutes(meters),
    isRoadRoute: osrmRouteStats.value?.isRoadRoute ?? false
  }
})

onMounted(async () => {
  if (process.client) {
    L = await import('leaflet')
    ;(window as any).handleMapUpvote = (id: number) => {
      emit('upvote', id)
    }
    ;(window as any).handleMapResolve = (id: number) => {
      emit('resolve', id)
    }
    ;(window as any).handleMapRouteHaven = (havenId: number) => {
      const target = props.safeHavens.find(h => h.id === havenId)
      if (target) {
        emit('drawRoute', target)
      }
    }

    initMap()
  }
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  if (mapMoveDebounceTimer) {
    clearTimeout(mapMoveDebounceTimer)
  }
  if (map) {
    map.remove()
    map = null
  }
  if (process.client) {
    delete (window as any).handleMapUpvote
    delete (window as any).handleMapResolve
    delete (window as any).handleMapRouteHaven
  }
})

function initMap() {
  if (!mapContainer.value || !L) return

  map = L.map(mapContainer.value, {
    center: [props.userCoords.lat, props.userCoords.lng],
    zoom: 13,
    zoomControl: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
    maxZoom: 19,
    className: 'argologistics-style-tiles'
  }).addTo(map)

  routeLayerGroup = L.layerGroup().addTo(map)
  reportsLayerGroup = L.layerGroup().addTo(map)
  havensLayerGroup = L.layerGroup().addTo(map)

  map.on('click', (e: any) => {
    isSearchDropdownOpen.value = false
    isOriginDropdownOpen.value = false
    isDestDropdownOpen.value = false
    openedPopupTarget.value = null
    const { lat, lng } = e.latlng
    if (isPickingDestination.value) {
      isPickingDestination.value = false
      destCoords.value = { lat, lng }
      destQuery.value = `Titik Peta (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      runCommuteSafetyCheck()
      return
    }
    if (props.isPickingLocation) {
      setPickerLocation(lat, lng)
      emit('selectLocation', { lat, lng })
    }
  })

  map.on('popupclose', () => {
    if (!isRebuildingMarkers) {
      openedPopupTarget.value = null
    }
  })

  map.on('moveend', () => {
    if (!map || openedPopupTarget.value) return
    const zoom = map.getZoom()
    if (zoom < 12) return

    const center = map.getCenter()
    const currentCenter = { lat: center.lat, lng: center.lng }
    const movedMeters = calculateDistanceMeters(lastAutoScanCoords, currentCenter)

    if (movedMeters > 1800) {
      if (mapMoveDebounceTimer) clearTimeout(mapMoveDebounceTimer)
      mapMoveDebounceTimer = setTimeout(() => {
        if (openedPopupTarget.value) return
        lastAutoScanCoords = { ...currentCenter }
        emit('scanArea', currentCenter, undefined, true)
      }, 700)
    }
  })

  renderUserMarker()
  renderMarkers(true)
  renderRouteLine()
}

function zoomIn() {
  if (map) map.zoomIn()
}

function zoomOut() {
  if (map) map.zoomOut()
}

function createUserPin() {
  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-user-beacon" title="Titik Posisi Anda (Geser untuk ubah titik awal)">
        <span class="sz-user-fov" aria-hidden="true"></span>
        <span class="sz-sonar-ring" aria-hidden="true"></span>
        <span class="sz-sonar-ring sz-sonar-delay" aria-hidden="true"></span>
        <div class="sz-user-core">
          <svg class="sz-user-heading" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3.5 18 19l-6-3.2L6 19 12 3.5Z" fill="currentColor"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -20]
  })
}

function createDestinationPin() {
  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-dest-pin">
        <div class="sz-dest-pill">
          <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          <span>TUJUAN (B)</span>
        </div>
        <span class="sz-pin-stem sz-stem-haven"></span>
        <span class="sz-pin-ground-dot sz-ground-haven"></span>
      </div>
    `,
    iconSize: [96, 42],
    iconAnchor: [48, 39],
    popupAnchor: [0, -36]
  })
}

function createPickerPin() {
  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-picker-pin" title="Geser untuk sesuaikan titik laporan">
        <span class="sz-picker-ring" aria-hidden="true"></span>
        <div class="sz-picker-head">
          <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
          </svg>
        </div>
        <span class="sz-pin-stem sz-stem-haven"></span>
        <span class="sz-pin-ground-dot sz-ground-haven"></span>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 49],
    popupAnchor: [0, -44]
  })
}

function getCategoryGlyphSvg(category: string, isResolved: boolean): { svg: string; microTag: string } {
  if (isResolved) {
    return {
      microTag: 'KONDUSIF',
      svg: `
        <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3 4.5 6.5v5.2c0 4.8 3.2 8.9 7.5 9.8 4.3-.9 7.5-5 7.5-9.8V6.5L12 3Z" fill="currentColor" fill-opacity="0.16"/>
          <path d="m8.8 12.2 2.2 2.2 4.4-4.5" stroke-width="2.3"/>
        </svg>
      `
    }
  }

  if (category === 'begal') {
    return {
      microTag: 'BEGAL',
      svg: `
        <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8m8 0h2.5A1.5 1.5 0 0 1 20 5.5V8m0 8v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" stroke-opacity="0.65" stroke-width="1.75"/>
          <path d="M12 5.5 6.5 8.2v4.1c0 3.5 2.3 6.5 5.5 7.2 3.2-.7 5.5-3.7 5.5-7.2V8.2L12 5.5Z" fill="currentColor" fill-opacity="0.2"/>
          <path d="M12 9.2v3.6" stroke-width="2.3"/>
          <circle cx="12" cy="15.5" r="1.15" fill="currentColor" stroke="none"/>
        </svg>
      `
    }
  }

  if (category === 'geng_motor') {
    return {
      microTag: 'KONVOI',
      svg: `
        <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="5.5" cy="16.5" r="2.75" fill="currentColor" fill-opacity="0.18"/>
          <circle cx="18.5" cy="16.5" r="2.75" fill="currentColor" fill-opacity="0.18"/>
          <path d="M8.2 16.5h4.8l2.1-5.2-3.6-1.3-2.4 3.2H6.5l1.7 3.3Z" fill="currentColor" fill-opacity="0.2"/>
          <path d="M13.2 6.8h2.8l2.2 4.2"/>
          <path d="M19.5 9.2 22 8.5m-2.5 2.5 2.5.4" stroke-width="1.75"/>
          <path d="M4 9.5h3.5M2.5 12h3" stroke-opacity="0.75" stroke-width="1.65"/>
        </svg>
      `
    }
  }

  if (category === 'gelap') {
    return {
      microTag: 'PJU MATI',
      svg: `
        <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5.5 20.5V6.5a3 3 0 0 1 3-3H15"/>
          <path d="M3.5 20.5h4.5"/>
          <path d="M12.5 3.5h5.2l1.3 2.8h-7.5l1-2.8Z" fill="currentColor" fill-opacity="0.25"/>
          <path class="sz-svg-cone" d="M13 9.5 10.5 18m7-8.5L20 18" stroke-dasharray="2 2.5" stroke-opacity="0.65" stroke-width="1.6"/>
          <path d="m13.2 11.2 4.2 4.2m0-4.2-4.2 4.2" stroke-width="2.1"/>
        </svg>
      `
    }
  }

  return {
    microTag: 'JALAN SEPI',
    svg: `
      <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.5 19.5 8.8 4.5m11.7 15-5.3-15"/>
        <path class="sz-svg-lane" d="M12 5v2.2m0 3.1v2.5m0 3.2v3.5" stroke-width="2.1"/>
        <circle cx="17.5" cy="6.5" r="2" fill="currentColor" fill-opacity="0.3" stroke-width="1.6"/>
      </svg>
    `
  }
}

function createReportPin(category: string, dangerLevel: string, isResolved: boolean) {
  const isCritical = !isResolved && (category === 'begal' || category === 'geng_motor' || dangerLevel === 'high')
  const isConvoy = !isResolved && category === 'geng_motor'
  const { svg, microTag } = getCategoryGlyphSvg(category, isResolved)

  const toneClass = isResolved
    ? 'sz-tone-resolved'
    : isConvoy
      ? 'sz-tone-convoy'
      : isCritical
        ? 'sz-tone-danger'
        : 'sz-tone-warning'

  const radarRingMarkup = isResolved
    ? ''
    : isCritical
      ? `
        <span class="sz-telemetry-wave sz-wave-danger" aria-hidden="true"></span>
        <span class="sz-telemetry-wave sz-wave-danger sz-wave-delay" aria-hidden="true"></span>
        <svg class="sz-radar-Arc" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="17.5" stroke="currentColor" stroke-opacity="0.22" stroke-width="1"/>
          <path d="M20 2.5 A17.5 17.5 0 0 1 37.5 20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        </svg>
      `
      : `
        <span class="sz-telemetry-wave sz-wave-warning" aria-hidden="true"></span>
        <svg class="sz-radar-Arc sz-radar-Arc--slow" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="17" stroke="currentColor" stroke-opacity="0.2" stroke-width="1" stroke-dasharray="3 3"/>
        </svg>
      `

  const statusPipMarkup = isResolved
    ? `<span class="sz-status-pip sz-pip-resolved" title="Mulai Kondusif">✓</span>`
    : `<span class="sz-status-pip ${isCritical ? 'sz-pip-danger' : 'sz-pip-warning'}">
         <span class="sz-pip-ring"></span>
         <span class="sz-pip-dot"></span>
       </span>`

  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-pin-wrapper ${toneClass}">
        <span class="sz-micro-tag">${microTag}</span>
        <div class="sz-pin-stage">
          ${radarRingMarkup}
          <div class="sz-pin-chassis">
            ${statusPipMarkup}
            ${svg}
          </div>
        </div>
        <span class="sz-pin-stem"></span>
        <span class="sz-pin-ground-dot"></span>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 52],
    popupAnchor: [0, -48]
  })
}

function createHavenPin(type: string) {
  let svgIcon = ''
  let microTag = 'POS 24J'
  let subtypeClass = 'sz-haven-mart'

  if (type === 'pos_polisi') {
    microTag = 'POLISI 24J'
    subtypeClass = 'sz-haven-police'
    svgIcon = `
      <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2.8 4.5 6v5.6c0 5.1 3.2 9.3 7.5 10.4 4.3-1.1 7.5-5.3 7.5-10.4V6L12 2.8Z" fill="currentColor" fill-opacity="0.2"/>
        <path d="M12 7.5 13.3 10.3 16.2 10.7 14 12.7 14.6 15.6 12 14.1 9.4 15.6 10 12.7 7.8 10.7 10.7 10.3 12 7.5Z" fill="currentColor" stroke="none"/>
      </svg>`
  } else if (type === 'spbu') {
    microTag = 'SPBU 24J'
    subtypeClass = 'sz-haven-spbu'
    svgIcon = `
      <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="3.5" width="10" height="17" rx="2" fill="currentColor" fill-opacity="0.18"/>
        <line x1="2.5" y1="20.5" x2="15.5" y2="20.5"/>
        <line x1="6.5" y1="7.5" x2="11.5" y2="7.5"/>
        <path d="M14 11.5h2a2 2 0 0 1 2 2v3a1.75 1.75 0 0 0 3.5 0V9.2a2 2 0 0 0-.6-1.4L18 5"/>
        <circle cx="9" cy="14" r="1.4" fill="currentColor" stroke="none"/>
      </svg>`
  } else {
    microTag = 'MART 24J'
    subtypeClass = 'sz-haven-mart'
    svgIcon = `
      <svg class="sz-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3.5 9.5 5.2 4h13.6l1.7 5.5" fill="currentColor" fill-opacity="0.2"/>
        <path d="M3.5 9.5a2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.8 0 2.8 2.8 0 0 0 5.6 0"/>
        <path d="M5 9.8V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V9.8"/>
        <path d="M9.5 20.5v-5.5h5v5.5"/>
      </svg>`
  }

  return L.divIcon({
    className: 'sz-custom-pin',
    html: `
      <div class="sz-pin-wrapper sz-tone-haven ${subtypeClass}">
        <span class="sz-micro-tag">${microTag}</span>
        <div class="sz-pin-stage">
          <span class="sz-telemetry-wave sz-wave-haven" aria-hidden="true"></span>
          <div class="sz-pin-chassis">
            <span class="sz-status-pip sz-pip-haven" title="Siaga 24 Jam">
              <span class="sz-pip-ring"></span>
              <span class="sz-pip-dot"></span>
            </span>
            ${svgIcon}
          </div>
        </div>
        <span class="sz-pin-stem"></span>
        <span class="sz-pin-ground-dot"></span>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 52],
    popupAnchor: [0, -48]
  })
}

function renderUserMarker() {
  if (!map || !L) return

  if (userMarker) {
    userMarker.setLatLng([props.userCoords.lat, props.userCoords.lng])
  } else {
    userMarker = L.marker([props.userCoords.lat, props.userCoords.lng], {
      icon: createUserPin(),
      draggable: true
    }).addTo(map)

    userMarker.bindPopup(`
      <div class="p-3.5 pr-6 bg-white text-slate-900 max-w-[225px]">
        <div class="text-xs font-bold text-slate-900 mb-1">Titik Posisi Anda</div>
        <p class="text-[11px] text-slate-600 leading-snug">Geser pin biru ini atau klik tombol Lokasi Saya di bilah atas peta untuk memindai area sekitar.</p>
      </div>
    `, {
      className: 'safezone-light-popup',
      autoPanPaddingTopLeft: [20, 20],
      autoPanPaddingBottomRight: [20, 50]
    })

    userMarker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng()
      emit('updateUserCoords', { lat: pos.lat, lng: pos.lng }, false)
    })
  }
}

function renderMarkers(shouldFitBounds = false) {
  if (!map || !L || !reportsLayerGroup || !havensLayerGroup) return

  const activePopup = openedPopupTarget.value
  isRebuildingMarkers = true

  reportsLayerGroup.clearLayers()
  havensLayerGroup.clearLayers()
  reportMarkersMap.clear()
  havenMarkersMap.clear()

  const q = searchQuery.value.toLowerCase().trim()
  const showReports = props.mapFocus === 'all' || props.mapFocus === 'reports'
  const showHavens = props.mapFocus === 'all' || props.mapFocus === 'havens'

  const visiblePoints: [number, number][] = []

  if (showReports) {
    const filteredReports = props.reports.filter((r) => {
      const matchesCat = !props.activeCategory || props.activeCategory === 'all' || r.category === props.activeCategory
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })

    filteredReports.forEach((report) => {
      visiblePoints.push([report.latitude, report.longitude])
      const isResolved = (report.resolvedCount || 0) >= 3
      const icon = createReportPin(report.category, report.dangerLevel, isResolved)
      const marker = L.marker([report.latitude, report.longitude], { icon })
      reportMarkersMap.set(report.id, marker)

      const hasUpvoted = props.upvotedIds.includes(report.id)
      const hasResolved = props.resolvedIds.includes(report.id)

      const dangerLabel = isResolved
        ? 'Mulai Kondusif'
        : ({
            high: 'Bahaya Tinggi',
            medium: 'Waspada',
            low: 'Risiko Rendah'
          }[report.dangerLevel] || 'Waspada')

      const dangerBadgeClass = isResolved
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : ({
            high: 'bg-rose-50 text-rose-700 border-rose-200',
            medium: 'bg-amber-50 text-amber-800 border-amber-200',
            low: 'bg-slate-100 text-slate-700 border-slate-200'
          }[report.dangerLevel] || 'bg-slate-100 text-slate-700')

      const upvoteBtnClass = hasUpvoted
        ? 'bg-slate-900 text-white border-slate-900'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'

      const resolveBtnClass = hasResolved
        ? 'bg-emerald-600 text-white border-emerald-600'
        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'

      const hoursText =
        report.vulnerableHours ||
        (report.category === 'begal'
          ? '23:00 - 04:00 WIB'
          : report.category === 'geng_motor'
            ? '00:00 - 04:30 WIB'
            : report.category === 'gelap'
              ? '18:30 - 05:30 WIB'
              : '22:00 - 04:00 WIB')

      const photoBlock = report.photoUrl
        ? `<div class="mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
             <img src="${escapeHtml(report.photoUrl)}" alt="Bukti laporan" class="w-full h-28 object-cover" />
           </div>`
        : ''

      const popupHtml = `
        <div class="p-3.5 bg-white text-slate-900 max-w-[265px]">
          <div class="flex items-center justify-between gap-2 pr-5 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${dangerBadgeClass}">
              ${dangerLabel}
            </span>
            <span class="text-[10px] font-medium text-slate-500">
              ${formatRelativeTime(report.createdAt)}
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${escapeHtml(report.title)}</h4>
          <div class="mb-1.5">
            <span class="inline-block text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              Jam Rawan: ${escapeHtml(hoursText)}
            </span>
          </div>
          ${photoBlock}
          <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed">${escapeHtml(report.description)}</p>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
            <button
              type="button"
              onclick="window.handleMapUpvote(${report.id})"
              class="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${upvoteBtnClass}"
            >
              <span>${hasUpvoted ? '✓ Tervalidasi' : 'Validasi'}</span>
              <span>(${report.upvotes})</span>
            </button>
            <button
              type="button"
              onclick="window.handleMapResolve(${report.id})"
              class="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${resolveBtnClass}"
              title="Tandai jika jalan ini sudah diperbaiki atau sudah aman"
            >
              <span>${hasResolved ? '✓ Kondusif' : 'Sudah Aman'}</span>
              <span>(${report.resolvedCount || 0})</span>
            </button>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, {
        className: 'safezone-light-popup',
        maxWidth: 275,
        autoPan: true,
        autoPanPaddingTopLeft: [20, 20],
        autoPanPaddingBottomRight: [20, 56]
      })

      marker.on('popupopen', () => {
        openedPopupTarget.value = { kind: 'report', id: report.id }
      })

      reportsLayerGroup.addLayer(marker)
    })
  }

  if (showHavens) {
    const filteredHavens = props.safeHavens.filter((h) => {
      return !q || h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    })

    filteredHavens.forEach((haven) => {
      visiblePoints.push([haven.latitude, haven.longitude])
      const icon = createHavenPin(haven.type)
      const marker = L.marker([haven.latitude, haven.longitude], { icon })
      havenMarkersMap.set(haven.id, marker)

      const distMeters = calculateDistanceMeters(props.userCoords, {
        lat: haven.latitude,
        lng: haven.longitude
      })

      const havenPopupHtml = `
        <div class="p-3.5 bg-white text-slate-900 max-w-[260px]">
          <div class="flex items-center justify-between gap-2 pr-5 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
              Pos Aman 24 Jam
            </span>
            <span class="text-[10px] font-semibold text-slate-600">
              ${formatDistance(distMeters)}
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${escapeHtml(haven.name)}</h4>
          <p class="text-[11px] text-slate-600 mb-2.5 leading-relaxed">${escapeHtml(haven.address)}</p>
          <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onclick="window.handleMapRouteHaven(${haven.id})"
              class="flex-1 text-center text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Rute Jalan Peta
            </button>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=${haven.latitude},${haven.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
            >
              Maps
            </a>
          </div>
        </div>
      `

      marker.bindPopup(havenPopupHtml, {
        className: 'safezone-light-popup',
        maxWidth: 275,
        autoPan: true,
        autoPanPaddingTopLeft: [20, 20],
        autoPanPaddingBottomRight: [20, 56]
      })

      marker.on('popupopen', () => {
        openedPopupTarget.value = { kind: 'haven', id: haven.id }
      })

      havensLayerGroup.addLayer(marker)
    })
  }

  if (activePopup) {
    const targetMarker =
      activePopup.kind === 'report'
        ? reportMarkersMap.get(activePopup.id)
        : havenMarkersMap.get(activePopup.id)
    if (targetMarker) {
      targetMarker.openPopup()
    } else {
      openedPopupTarget.value = null
    }
  }

  isRebuildingMarkers = false

  if (shouldFitBounds && visiblePoints.length > 0 && !props.activeRouteHaven && !activePopup) {
    if (visiblePoints.length === 1) {
      map.flyTo(visiblePoints[0], 15, { duration: 0.9 })
    } else {
      const bounds = L.latLngBounds(visiblePoints)
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 })
    }
  }
}

async function renderRouteLine() {
  if (!map || !L || !routeLayerGroup) return

  if (!props.activeRouteHaven) {
    osrmRouteStats.value = null
    if (commuteRoutes.value.length > 0) {
      renderCommuteRoutesOnMap()
    } else {
      routeLayerGroup.clearLayers()
    }
    return
  }

  commuteRoutes.value = []
  if (destMarker && map) {
    map.removeLayer(destMarker)
    destMarker = null
  }
  routeLayerGroup.clearLayers()
  osrmRouteStats.value = null

  const targetHaven = props.activeRouteHaven
  isFetchingRoute.value = true

  const routeData = await fetchOsrmStreetRoute(props.userCoords, {
    lat: targetHaven.latitude,
    lng: targetHaven.longitude
  })

  isFetchingRoute.value = false
  if (!props.activeRouteHaven || props.activeRouteHaven.id !== targetHaven.id) return

  osrmRouteStats.value = {
    distanceMeters: routeData.distanceMeters,
    durationSeconds: routeData.durationSeconds,
    isRoadRoute: routeData.isRoadRoute
  }

  const outerLine = L.polyline(routeData.coordinates, {
    color: '#10b981',
    weight: 9,
    opacity: 0.28,
    lineCap: 'round',
    lineJoin: 'round'
  })

  const innerLine = L.polyline(routeData.coordinates, {
    color: '#34d399',
    weight: 4,
    opacity: 0.96,
    dashArray: routeData.isRoadRoute ? undefined : '8, 8',
    lineCap: 'round',
    lineJoin: 'round'
  })

  routeLayerGroup.addLayer(outerLine)
  routeLayerGroup.addLayer(innerLine)

  const bounds = L.latLngBounds(routeData.coordinates)
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
}

function routeToNearestHaven() {
  if (!props.safeHavens.length) return
  let nearest = props.safeHavens[0]
  let minDistance = Infinity

  for (const h of props.safeHavens) {
    const d = calculateDistanceMeters(props.userCoords, { lat: h.latitude, lng: h.longitude })
    if (d < minDistance) {
      minDistance = d
      nearest = h
    }
  }

  if (nearest) {
    emit('drawRoute', nearest)
  }
}

function setPickerLocation(lat: number, lng: number) {
  if (!map || !L) return

  if (pickerMarker) {
    pickerMarker.setLatLng([lat, lng])
  } else {
    pickerMarker = L.marker([lat, lng], {
      icon: createPickerPin(),
      draggable: true
    }).addTo(map)
    pickerMarker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng()
      emit('selectLocation', { lat: pos.lat, lng: pos.lng })
    })
  }
}

function locateUser() {
  if (!navigator.geolocation) return
  isLocating.value = true
  openedPopupTarget.value = null

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      lastAutoScanCoords = { lat, lng }
      emit('updateUserCoords', { lat, lng }, true)
      if (map) {
        map.flyTo([lat, lng], 15, { duration: 1.0 })
      }
    },
    () => {
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

function flyTo(lat: number, lng: number, zoom = 15) {
  if (!map) return
  lastAutoScanCoords = { lat, lng }
  map.flyTo([lat, lng], zoom, { duration: 1.0 })
}

watch(
  [() => props.activeCategory, () => props.mapFocus],
  () => {
    openedPopupTarget.value = null
    renderMarkers(true)
  }
)

watch(
  [() => props.reports, () => props.safeHavens, () => props.upvotedIds, () => props.resolvedIds],
  () => {
    renderMarkers(false)
  },
  { deep: true }
)

watch(
  () => props.userCoords,
  () => {
    renderUserMarker()
    renderMarkers(false)
    if (props.activeRouteHaven) {
      renderRouteLine()
    }
  },
  { deep: true }
)

watch(
  () => props.activeRouteHaven,
  () => {
    renderRouteLine()
  }
)

defineExpose({
  flyTo,
  focusPin,
  locateUser,
  routeToNearestHaven,
  fitToVisibleMarkers: () => renderMarkers(true)
})
</script>

<style>
:root {
  --m-in: 150ms;
  --m-out: 120ms;
  --m-press: 90ms;
  --m-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --m-ease-enter: cubic-bezier(0.22, 1, 0.36, 1);
  --m-cycle: 3.2s;
  --m-live: 2.4s;
}

.argologistics-style-tiles {
  filter: invert(100%) hue-rotate(170deg) brightness(85%) contrast(120%) saturate(140%);
}

.safezone-light-popup .leaflet-popup-content-wrapper {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 16px !important;
  padding: 0 !important;
  box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.32) !important;
}

.safezone-light-popup .leaflet-popup-content {
  margin: 0 !important;
}

.safezone-light-popup .leaflet-popup-tip {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
}

.safezone-light-popup .leaflet-popup-close-button {
  top: 10px !important;
  right: 10px !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 8px !important;
  background: #f1f5f9 !important;
  color: #475569 !important;
  font-size: 15px !important;
  line-height: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  padding: 0 !important;
  transition: background-color var(--m-out) var(--m-ease), color var(--m-out) var(--m-ease) !important;
}

.safezone-light-popup .leaflet-popup-close-button:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}

.sz-custom-pin {
  background: transparent !important;
  border: none !important;
}

/* ============================================================================
   TACTICAL MAP MARKER SYSTEM (design-taste-frontend anti-slop motion & craft)
   - Two-level max hierarchy: stage > chassis (no 3-level nested translucent boxes)
   - Solid architectural dark-ink housing (#0b0f17) + 1px semantic hairline
   - Anchored ground coordinate dot & stem (never floats/bobs off its street point)
   - Purposeful telemetry rings (2.4s live dot / 3.2s radar cycle, transform+opacity only)
   - Fine-pointer hover steps up 2px in 150ms (--m-ease), press steps down 1px (.985)
   ============================================================================ */

.sz-pin-wrapper {
  --sz-accent: #10b981;
  --sz-accent-soft: rgba(16, 185, 129, 0.2);
  --sz-border: rgba(52, 211, 153, 0.55);
  --sz-surface: #0b0f17;
  --sz-glyph-color: #ecfdf5;
  position: relative;
  width: 48px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 2px;
  cursor: pointer;
  user-select: none;
}

.sz-tone-danger {
  --sz-accent: #f43f5e;
  --sz-accent-soft: rgba(244, 63, 94, 0.24);
  --sz-border: rgba(251, 113, 133, 0.68);
  --sz-surface: #160910;
  --sz-glyph-color: #ffe4e6;
}

.sz-tone-convoy {
  --sz-accent: #fb7185;
  --sz-accent-soft: rgba(251, 113, 133, 0.24);
  --sz-border: rgba(253, 164, 175, 0.72);
  --sz-surface: #180a0d;
  --sz-glyph-color: #fff1f2;
}

.sz-tone-warning {
  --sz-accent: #f59e0b;
  --sz-accent-soft: rgba(245, 158, 11, 0.2);
  --sz-border: rgba(251, 191, 36, 0.62);
  --sz-surface: #141008;
  --sz-glyph-color: #fef3c7;
}

.sz-tone-haven {
  --sz-accent: #10b981;
  --sz-accent-soft: rgba(16, 185, 129, 0.2);
  --sz-border: rgba(52, 211, 153, 0.62);
  --sz-surface: #071512;
  --sz-glyph-color: #d1fae5;
}

.sz-haven-police {
  --sz-accent: #14b8a6;
  --sz-accent-soft: rgba(20, 184, 166, 0.22);
  --sz-border: rgba(45, 212, 191, 0.68);
  --sz-surface: #071418;
  --sz-glyph-color: #ccfbf1;
}

.sz-tone-resolved {
  --sz-accent: #2dd4bf;
  --sz-accent-soft: rgba(45, 212, 191, 0.14);
  --sz-border: rgba(94, 234, 212, 0.45);
  --sz-surface: #0d151c;
  --sz-glyph-color: #99f6e4;
}

.sz-pin-stage {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--m-out) var(--m-ease);
}

.sz-pin-chassis {
  position: relative;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background-color: var(--sz-surface);
  border: 1.25px solid var(--sz-border);
  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(9, 13, 22, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sz-glyph-color);
  transition:
    border-color var(--m-out) var(--m-ease),
    background-color var(--m-out) var(--m-ease),
    transform var(--m-out) var(--m-ease);
}

.sz-tone-danger .sz-pin-chassis,
.sz-tone-convoy .sz-pin-chassis {
  border-radius: 10px;
  background-image: radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.26), transparent 70%);
}

.sz-tone-warning .sz-pin-chassis {
  border-radius: 10px;
  background-image: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.22), transparent 70%);
}

.sz-tone-haven .sz-pin-chassis {
  border-radius: 11px;
  background-image: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.24), transparent 70%);
}

.sz-glyph {
  width: 18px;
  height: 18px;
  color: var(--sz-glyph-color);
  flex-shrink: 0;
}

.sz-micro-tag {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translate(-50%, 3px);
  z-index: 4;
  padding: 1.5px 5px;
  border-radius: 5px;
  background: #090d16;
  color: var(--sz-glyph-color);
  border: 1px solid var(--sz-border);
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--m-out) var(--m-ease),
    transform var(--m-out) var(--m-ease);
}

@media (hover: hover) and (pointer: fine) {
  .sz-pin-wrapper:hover {
    z-index: 950;
  }

  .sz-pin-wrapper:hover .sz-pin-stage {
    transform: translateY(-2px);
    transition-duration: var(--m-in);
  }

  .sz-pin-wrapper:hover .sz-pin-chassis {
    border-color: var(--sz-accent);
  }

  .sz-pin-wrapper:hover .sz-micro-tag {
    opacity: 1;
    transform: translate(-50%, 0);
    transition-duration: var(--m-in);
  }

  .sz-pin-wrapper:active .sz-pin-stage {
    transform: translateY(1px) scale(0.985);
    transition-duration: var(--m-press);
  }
}

.sz-pin-stem {
  width: 2px;
  height: 7px;
  background: var(--sz-accent);
  opacity: 0.85;
  z-index: 1;
}

.sz-pin-ground-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--sz-accent);
  border: 1.5px solid #090d16;
  box-shadow: 0 0 0 2px var(--sz-accent-soft);
  z-index: 1;
}

/* Status Pip (Top-Right Corner Telemetry Indicator) */
.sz-status-pip {
  position: absolute;
  top: -3.5px;
  right: -3.5px;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #090d16;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.sz-pip-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--sz-accent);
}

.sz-pip-ring {
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  border: 1.25px solid var(--sz-accent);
  opacity: 0;
  animation: sz-live-dot-ring var(--m-live) var(--m-ease) infinite;
}

.sz-pip-resolved {
  width: 13px;
  height: 13px;
  top: -4px;
  right: -4px;
  background: #0d9488;
  color: #ffffff;
  border: 1.5px solid #090d16;
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
}

/* Telemetry Waves & Radar Sweep (transform & opacity only, 2.4s - 3.2s cycle) */
.sz-telemetry-wave {
  position: absolute;
  inset: 1px;
  border-radius: 10px;
  border: 1.25px solid var(--sz-accent);
  background: var(--sz-accent-soft);
  z-index: 0;
  pointer-events: none;
}

.sz-wave-danger {
  animation: sz-perimeter-pulse var(--m-live) var(--m-ease) infinite;
}

.sz-wave-delay {
  animation-delay: 1.2s;
}

.sz-wave-warning {
  animation: sz-warning-pulse var(--m-cycle) var(--m-ease) infinite;
}

.sz-wave-haven {
  border-radius: 11px;
  animation: sz-haven-pulse var(--m-cycle) var(--m-ease) infinite;
}

.sz-radar-Arc {
  position: absolute;
  inset: -4px;
  width: 44px;
  height: 44px;
  color: var(--sz-accent);
  z-index: 1;
  pointer-events: none;
  animation: sz-radar-spin var(--m-cycle) linear infinite;
}

.sz-radar-Arc--slow {
  animation-duration: 6.4s;
}

.sz-svg-cone,
.sz-svg-lane {
  animation: sz-subtle-opacity var(--m-cycle) ease-in-out infinite;
}

/* User GPS Navigation Puck */
.sz-user-beacon {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
}

.sz-user-beacon:active {
  cursor: grabbing;
}

.sz-user-fov {
  position: absolute;
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  background: conic-gradient(from -35deg at 50% 50%, rgba(56, 189, 248, 0.32) 0deg, rgba(56, 189, 248, 0.02) 70deg, transparent 70deg);
  pointer-events: none;
  animation: sz-radar-spin 6.4s linear infinite;
}

.sz-sonar-ring {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 9999px;
  background: rgba(14, 165, 233, 0.16);
  border: 1.25px solid rgba(56, 189, 248, 0.65);
  animation: sz-sonar-expand var(--m-live) var(--m-ease) infinite;
  pointer-events: none;
}

.sz-sonar-delay {
  animation-delay: 1.2s;
}

.sz-user-core {
  position: relative;
  z-index: 2;
  width: 22px;
  height: 22px;
  border-radius: 9999px;
  background: #090d16;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
}

.sz-user-heading {
  width: 12px;
  height: 12px;
}

/* Destination & Coordinate Picker Pins */
.sz-dest-pin,
.sz-picker-pin {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.sz-dest-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 8px;
  background: #090d16;
  color: #f8fafc;
  border: 1.25px solid #34d399;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.sz-picker-head {
  position: relative;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #090d16;
  border: 1.5px solid #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.sz-picker-ring {
  position: absolute;
  top: 2px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1.25px solid #34d399;
  animation: sz-perimeter-pulse var(--m-live) var(--m-ease) infinite;
  pointer-events: none;
}

.sz-stem-haven {
  background: #10b981;
}

.sz-ground-haven {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

/* Interactive Legend Chips Below Map */
.sz-legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8.5px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(51, 65, 85, 0.85);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  transition:
    transform var(--m-out) var(--m-ease),
    border-color var(--m-out) var(--m-ease),
    background-color var(--m-out) var(--m-ease);
}

@media (hover: hover) and (pointer: fine) {
  .sz-legend-chip:hover {
    transform: translateY(-1px);
    border-color: #64748b;
    background: #1e293b;
    transition-duration: var(--m-in);
  }

  .sz-legend-chip:active {
    transform: translateY(1px) scale(0.985);
    transition-duration: var(--m-press);
  }
}

.sz-legend-chip--active-danger {
  background: rgba(136, 19, 55, 0.55);
  border-color: #fb7185;
  color: #fff1f2;
}

.sz-legend-chip--active-warning {
  background: rgba(120, 53, 15, 0.55);
  border-color: #fbbf24;
  color: #fef3c7;
}

.sz-legend-icon {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sz-legend-icon--danger {
  background: #1f0910;
  border: 1px solid rgba(251, 113, 133, 0.65);
  color: #fda4af;
}

.sz-legend-icon--convoy {
  background: #220a0e;
  border: 1px solid rgba(253, 164, 175, 0.65);
  color: #fecdd3;
}

.sz-legend-icon--warning {
  background: #1c1306;
  border: 1px solid rgba(251, 191, 36, 0.65);
  color: #fde68a;
}

.sz-legend-pulse-danger {
  position: absolute;
  inset: -1px;
  border-radius: 6px;
  border: 1px solid #f43f5e;
  opacity: 0;
  animation: sz-live-dot-ring var(--m-live) var(--m-ease) infinite;
  pointer-events: none;
}

.sz-legend-beacon-ring {
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  border: 1.25px solid #34d399;
  opacity: 0;
  animation: sz-live-dot-ring var(--m-live) var(--m-ease) infinite;
}

@keyframes sz-perimeter-pulse {
  0% {
    transform: scale(0.94);
    opacity: 0.78;
  }
  100% {
    transform: scale(1.48);
    opacity: 0;
  }
}

@keyframes sz-warning-pulse {
  0% {
    transform: scale(0.96);
    opacity: 0.62;
  }
  70% {
    transform: scale(1.32);
    opacity: 0;
  }
  100% {
    transform: scale(1.32);
    opacity: 0;
  }
}

@keyframes sz-haven-pulse {
  0% {
    transform: scale(0.96);
    opacity: 0.5;
  }
  75% {
    transform: scale(1.26);
    opacity: 0;
  }
  100% {
    transform: scale(1.26);
    opacity: 0;
  }
}

@keyframes sz-live-dot-ring {
  0% {
    transform: scale(0.85);
    opacity: 0.85;
  }
  80%, 100% {
    transform: scale(1.85);
    opacity: 0;
  }
}

@keyframes sz-sonar-expand {
  0% {
    transform: scale(0.6);
    opacity: 0.85;
  }
  100% {
    transform: scale(1.52);
    opacity: 0;
  }
}

@keyframes sz-radar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes sz-subtle-opacity {
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sz-telemetry-wave,
  .sz-radar-Arc,
  .sz-pip-ring,
  .sz-sonar-ring,
  .sz-user-fov,
  .sz-picker-ring,
  .sz-legend-pulse-danger,
  .sz-legend-beacon-ring,
  .sz-svg-cone,
  .sz-svg-lane {
    animation: none !important;
  }
}
</style>
