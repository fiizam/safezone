<template>
  <div class="flex items-center gap-1 p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-card overflow-x-auto no-scrollbar">
    <button
      v-for="filter in filters"
      :key="filter.id"
      @click="$emit('update:category', filter.id)"
      :class="[
        'px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ease-smooth flex items-center gap-1.5 active:scale-95',
        activeCategory === filter.id
          ? 'bg-slate-900 text-white shadow-subtle font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
      ]"
    >
      <span
        v-if="filter.dotColor"
        :class="['w-2 h-2 rounded-full', filter.dotColor]"
      ></span>
      <span>{{ filter.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeCategory: string
}>()

defineEmits<{
  (e: 'update:category', category: string): void
}>()

const filters = [
  { id: 'all', label: 'Semua Kategori', dotColor: '' },
  { id: 'begal', label: 'Begal & Kejahatan', dotColor: 'bg-rose-500' },
  { id: 'geng_motor', label: 'Geng Motor / Tawuran', dotColor: 'bg-amber-500' },
  { id: 'gelap', label: 'PJU Mati / Gelap', dotColor: 'bg-yellow-500' },
  { id: 'sepi', label: 'Jalan Sepi', dotColor: 'bg-slate-400' }
]
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
