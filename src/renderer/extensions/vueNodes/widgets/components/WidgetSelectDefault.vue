<template>
  <WidgetLayoutField :widget>
    <Select
      v-model="modelValue"
      :invalid
      :options="filteredOptions"
      :editable="widget.options?.editable"
      v-bind="combinedProps"
      :class="[
        cn(WidgetInputBaseClass, 'w-full text-xs'),
        { 'cursor-text!': widget.options?.editable }
      ]"
      :aria-label="widget.name"
      size="small"
      :pt="{
        option: 'text-xs',
        dropdown: 'w-8 cursor-pointer!',
        label: ({ props }) => ({
          class: [
            'truncate min-w-[4ch]',
            props.editable ? 'cursor-text' : 'cursor-pointer',
            !props.modelValue && $slots.default && 'mr-5' // Simplify cn logic
          ]
        }),
        overlay: 'w-fit min-w-full'
      }"
      data-capture-wheel="true"
    />
    <div
      v-if="$slots.default || widget.options?.auto_create"
      class="absolute top-5 right-8 h-4 w-7 -translate-y-4/5 flex"
    >
      <slot />
      <Button
        v-if="widget.options?.auto_create"
        variant="link"
        size="small"
        class="!flex !items-center !justify-center h-4 w-7 self-center rounded-xl bg-blue-100/30 p-0"
        title="Create folder"
        @click="handleCreateFolder"
      >
        <i
          class="pi pi-plus text-blue-100 text-xs size-3.5 !leading-none translate-y-[1px]"
        />
      </Button>
    </div>
  </WidgetLayoutField>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Select from 'primevue/select'
import { computed } from 'vue'

import { useTransformCompatOverlayProps } from '@/composables/useTransformCompatOverlayProps'
import { assetService } from '@/platform/assets/services/assetService'
import type { SimplifiedWidget } from '@/types/simplifiedWidget'
import { cn } from '@/utils/tailwindUtil'
import {
  PANEL_EXCLUDED_PROPS,
  filterWidgetProps
} from '@/utils/widgetPropFilter'

import { WidgetInputBaseClass } from './layout'
import WidgetLayoutField from './layout/WidgetLayoutField.vue'

interface Props {
  widget: SimplifiedWidget<string | undefined>
}

const props = defineProps<Props>()

const modelValue = defineModel<string | undefined>({
  default(props: Props) {
    return props.widget.options?.values?.[0] || ''
  }
})

async function handleCreateFolder() {
  const path = modelValue.value || ''
  if (!path) return

  try {
    await assetService.createFolder(path)

    // Add to options if not present
    if (
      props.widget.options?.values &&
      Array.isArray(props.widget.options.values)
    ) {
      // @ts-ignore
      if (!props.widget.options.values.includes(path)) {
        // @ts-ignore
        props.widget.options.values.push(path)
      }
    }
  } catch (error) {
    console.error('Failed to create folder:', error)
  }
}

// Transform compatibility props for overlay positioning
const transformCompatProps = useTransformCompatOverlayProps()

// Extract select options from widget options
const selectOptions = computed(() => {
  const options = props.widget.options

  if (options?.values && Array.isArray(options.values)) {
    return options.values
  }

  return []
})
const filteredOptions = computed(() => {
  const options = selectOptions.value
  if (!props.widget.options?.editable) return options

  const searchValue = (modelValue.value || '').toLowerCase()
  if (!searchValue) return options

  // If the current value is exactly one of the options, show all choices
  // This allows seeing other options when expanding the dropdown after a selection
  if (options.includes(modelValue.value)) return options

  return options.filter((option) =>
    String(option).toLowerCase().includes(searchValue)
  )
})

const invalid = computed(() => {
  if (props.widget.options?.editable) return false
  return !!modelValue.value && !selectOptions.value.includes(modelValue.value)
})

const combinedProps = computed(() => ({
  ...filterWidgetProps(props.widget.options, PANEL_EXCLUDED_PROPS),
  ...transformCompatProps.value,
  ...(invalid.value ? { placeholder: `${modelValue.value}` } : {})
}))
</script>
