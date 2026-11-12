<template>
  <span
    ref="triggerRef"
    class="inline-flex items-center align-middle"
    @mouseenter="showPopover"
    @mouseleave="hidePopover"
  >
    <button
      type="button"
      @click.stop="togglePopover"
      @focus="showPopover"
      @blur="hidePopover"
      :aria-expanded="isOpen"
      :aria-label="label"
      class="w-5 h-5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:text-slate-800 inline-flex items-center justify-center transition-colors"
    >
      <svg
        aria-hidden="true"
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popoverRef"
        role="tooltip"
        :style="floatingStyle"
        class="fixed z-[9999] w-64 sm:w-72 rounded-xl bg-white text-slate-800 p-3.5 shadow-xl border border-slate-200/90 pointer-events-none select-none"
      >
        <div
          :style="arrowStyle"
          class="absolute -top-1.5 w-3 h-3 bg-white border-t border-l border-slate-200/90 rotate-45"
        ></div>

        <div class="relative z-10">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span class="text-xs font-bold text-slate-900 tracking-tight">{{ title }}</span>
          </div>
          <p class="text-[11px] text-slate-600 leading-relaxed font-normal">
            {{ content }}
          </p>
        </div>
      </div>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'

withDefaults(
  defineProps<{
    title: string
    content: string
    label?: string
  }>(),
  {
    label: 'Informasi detail bagian ini'
  }
)

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

const floatingStyle = reactive({
  top: '0px',
  left: '0px'
})

const arrowStyle = reactive({
  left: '16px'
})

function updatePosition() {
  if (!triggerRef.value || typeof window === 'undefined') return
  const rect = triggerRef.value.getBoundingClientRect()
  const popoverWidth = 272
  const viewportWidth = window.innerWidth
  const margin = 12

  const triggerCenter = rect.left + rect.width / 2
  let left = triggerCenter - popoverWidth / 2

  if (left < margin) {
    left = margin
  } else if (left + popoverWidth > viewportWidth - margin) {
    left = viewportWidth - popoverWidth - margin
  }

  const top = rect.bottom + 10
  const arrowLeft = Math.max(12, Math.min(popoverWidth - 20, triggerCenter - left - 6))

  floatingStyle.top = `${Math.round(top)}px`
  floatingStyle.left = `${Math.round(left)}px`
  arrowStyle.left = `${Math.round(arrowLeft)}px`
}

async function showPopover() {
  isOpen.value = true
  await nextTick()
  updatePosition()
}

function hidePopover() {
  isOpen.value = false
}

async function togglePopover() {
  if (isOpen.value) {
    isOpen.value = false
  } else {
    await showPopover()
  }
}

function handleOutsideClick(e: MouseEvent) {
  if (isOpen.value && triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', hidePopover, true)
  window.addEventListener('resize', hidePopover)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', hidePopover, true)
  window.removeEventListener('resize', hidePopover)
})
</script>
