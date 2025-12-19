<template>
  <div
    class="flex items-center gap-2 px-3 py-1 cursor-pointer bg-[var(--color-charcoal-400)] hover:bg-[var(--color-charcoal-300)] select-none border-b border-t border-[var(--color-charcoal-300)] mt-2 mb-1 rounded-sm transition-colors duration-150"
    @click="toggleCollapse"
  >
    <i
      class="pi pi-chevron-down text-xs transition-transform duration-200 text-[var(--p-text-muted-color)]"
      :class="{ '-rotate-90': collapsed }"
    />
    <span class="font-bold text-xs text-[var(--p-text-color)] flex-grow pt-0.5">
      {{ widget.label || widget.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import type { SimplifiedWidget } from '@/types/simplifiedWidget'

// We expect the widget value or options to hold the collapsed state
const props = defineProps<{
  widget: SimplifiedWidget<boolean> // value matches collapsed state
}>()

const collapsed = ref(false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value

  // Update widget value to persist state and allow conditional visibility checks
  props.widget.value = collapsed.value

  // Update widget value to persist state if possible
  if (props.widget.callback) {
    props.widget.callback(collapsed.value)
  }
}

// Sync with widget value if it changes externally
watch(
  () => props.widget.value,
  (val) => {
    if (typeof val === 'boolean') {
      collapsed.value = val
    }
  },
  { immediate: true }
)
</script>

<style scoped></style>
