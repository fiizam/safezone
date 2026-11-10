<template>
  <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
    <button
      v-for="filter in filters"
      :key="filter.id"
      @click="$emit('update:category', filter.id)"
      :class="[
        'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border active:scale-95',
        activeCategory === filter.id
          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/40'
          : 'bg-dark-900/80 hover:bg-dark-800 text-slate-300 border-white/10 hover:border-white/20 backdrop-blur-md'
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
  { id: 'begal', label: 'Begal & Kejahatan', dotColor: 'bg-rose-500 shadow-glow-danger' },
  { id: 'geng_motor', label: 'Geng Motor / Tawuran', dotColor: 'bg-red-500' },
  { id: 'gelap', label: 'Jalan Gelap / PJU', dotColor: 'bg-amber-400 shadow-glow-warning' },
  { id: 'sepi', label: 'Jalan Sepi', dotColor: 'bg-yellow-400' }
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
