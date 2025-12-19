<template>
  <WidgetLayoutField :widget>
    <div ref="containerRef" class="relative w-full">
      <!-- Main Input Container -->
      <div
        :class="[
          cn(
            WidgetInputBaseClass,
            'w-full min-h-[32px] px-2 py-1 flex items-center gap-1 cursor-text'
          ),
          isOpen && 'ring ring-component-node-widget-background-highlighted'
        ]"
        @click="handleContainerClick"
      >
        <!-- Tags + Search Input Area -->
        <div class="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          <!-- Selected Tags -->
          <span
            v-for="item in modelValue"
            :key="item"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--color-charcoal-400)] text-[var(--p-text-color)] max-w-full"
          >
            <span class="truncate">{{ item }}</span>
            <button
              type="button"
              class="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[var(--color-charcoal-300)] transition-colors"
              @click.stop="removeItem(item)"
              :aria-label="`Remove ${item}`"
            >
              <i class="pi pi-times text-[8px]" />
            </button>
          </span>

          <!-- Search Input -->
          <input
            ref="inputRef"
            v-model="searchTerm"
            type="text"
            :placeholder="modelValue.length === 0 ? placeholder : ''"
            class="flex-1 min-w-[60px] bg-transparent border-none outline-none text-xs text-[var(--p-text-color)] placeholder-[var(--p-text-muted-color)]"
            @focus="openDropdown"
            @input="openDropdown"
            @keydown="handleKeydown"
          />
        </div>

        <!-- Chevron / Clear Button -->
        <div
          class="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-pointer rounded transition-colors hover:bg-[var(--color-charcoal-400)]"
          @mouseenter="isHoveredClear = true"
          @mouseleave="isHoveredClear = false"
          @click.stop="handleClearOrToggle"
        >
          <i
            v-if="isHoveredClear && modelValue.length > 0"
            class="pi pi-times text-xs text-[var(--p-text-muted-color)]"
          />
          <i
            v-else
            class="pi pi-chevron-down text-xs text-[var(--p-text-muted-color)] transition-transform"
            :class="{ 'rotate-180': isOpen }"
          />
        </div>
      </div>

      <!-- Dropdown Overlay -->
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-[var(--color-charcoal-600)] border border-[var(--color-charcoal-400)] rounded-lg shadow-lg overflow-hidden"
      >
        <ul class="max-h-48 overflow-y-auto py-1">
          <li
            v-for="option in filteredOptions"
            :key="option"
            :class="[
              'px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors',
              modelValue.includes(option)
                ? 'text-[var(--p-primary-color)] font-medium'
                : 'text-[var(--p-text-color)] hover:bg-[var(--color-charcoal-500)]'
            ]"
            @click="toggleOption(option)"
          >
            <span class="truncate">{{ option }}</span>
            <i
              v-if="modelValue.includes(option)"
              class="pi pi-check text-xs flex-shrink-0 ml-2"
            />
          </li>
          <li
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-xs text-[var(--p-text-muted-color)]"
          >
            No results found
          </li>
        </ul>
      </div>
    </div>
  </WidgetLayoutField>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

import type { SimplifiedWidget } from '@/types/simplifiedWidget'
import { cn } from '@/utils/tailwindUtil'

import { WidgetInputBaseClass } from './layout'
import WidgetLayoutField from './layout/WidgetLayoutField.vue'

interface Props {
  widget: SimplifiedWidget<string[]>
}

const props = defineProps<Props>()

const modelValue = defineModel<string[]>({ default: () => [] })

// State
const isOpen = ref(false)
const isHoveredClear = ref(false)
const searchTerm = ref('')
const containerRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()

// Computed
const placeholder = computed(
  () => props.widget.options?.placeholder || 'Select...'
)

const allOptions = computed((): string[] => {
  // Primary source: spec.options (from inputSpec)
  const spec = props.widget.spec
  if (spec?.options && Array.isArray(spec.options)) {
    return spec.options
  }
  // Fallback: widget.options.values or widget.options.options
  const widgetOptions = props.widget.options
  if (widgetOptions?.values && Array.isArray(widgetOptions.values)) {
    return widgetOptions.values
  }
  if (widgetOptions?.options && Array.isArray(widgetOptions.options)) {
    return widgetOptions.options
  }
  return []
})

const filteredOptions = computed(() => {
  const search = searchTerm.value.toLowerCase()
  if (!search) return allOptions.value
  return allOptions.value.filter((opt) => opt.toLowerCase().includes(search))
})

// Methods
function openDropdown() {
  isOpen.value = true
}

function closeDropdown() {
  isOpen.value = false
  searchTerm.value = ''
}

function handleContainerClick() {
  openDropdown()
  nextTick(() => inputRef.value?.focus())
}

function handleClearOrToggle() {
  if (isHoveredClear.value && modelValue.value.length > 0) {
    // Clear all
    modelValue.value = []
    closeDropdown()
  } else {
    // Toggle dropdown
    if (isOpen.value) {
      closeDropdown()
    } else {
      openDropdown()
      nextTick(() => inputRef.value?.focus())
    }
  }
}

function toggleOption(option: string) {
  const current = modelValue.value
  if (current.includes(option)) {
    modelValue.value = current.filter((item) => item !== option)
  } else {
    modelValue.value = [...current, option]
  }
  searchTerm.value = ''
  nextTick(() => inputRef.value?.focus())
}

function removeItem(item: string) {
  modelValue.value = modelValue.value.filter((i) => i !== item)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDropdown()
  } else if (
    event.key === 'Backspace' &&
    searchTerm.value === '' &&
    modelValue.value.length > 0
  ) {
    // Remove last tag on backspace when input is empty
    modelValue.value = modelValue.value.slice(0, -1)
  }
}

// Click outside handler
function handleClickOutside(event: MouseEvent) {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>
