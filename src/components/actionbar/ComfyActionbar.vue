<template>
  <div class="flex h-full items-center">
    <Panel
      v-if="visible"
      class="pointer-events-auto"
      :style="style"
      :class="panelClass"
      :pt="{
        header: { class: 'hidden' },
        content: { class: isDocked ? 'p-0' : 'p-1' }
      }"
    >
      <div ref="panelRef" class="flex items-center select-none">
        <span
          ref="dragHandleRef"
          :class="
            cn(
              'drag-handle cursor-grab w-3 h-max mr-2',
              isDragging && 'cursor-grabbing'
            )
          "
        />

        <ComfyRunButton />

        <!-- LUMI MERGE: Added Upstream's Cancel Button here -->
        <IconButton
          v-tooltip.bottom="cancelJobTooltipConfig"
          type="transparent"
          size="sm"
          class="ml-2 bg-destructive-background text-base-foreground transition-colors duration-200 ease-in-out hover:bg-destructive-background-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive-background"
          :disabled="isExecutionIdle"
          :aria-label="t('menu.interrupt')"
          @click="cancelCurrentJob"
        >
          <i class="icon-[lucide--x] size-4" />
        </IconButton>
      </div>
    </Panel>
  </div>
</template>

<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import Panel from 'primevue/panel'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import IconButton from '@/components/button/IconButton.vue'
import { useDraggableMenu } from '@/composables/useDraggableMenu'
import { buildTooltipConfig } from '@/composables/useTooltipConfig'
import { useSettingStore } from '@/platform/settings/settingStore'
import { useTelemetry } from '@/platform/telemetry'
import { useCommandStore } from '@/stores/commandStore'
import { useExecutionStore } from '@/stores/executionStore'
import { cn } from '@/utils/tailwindUtil'

import ComfyRunButton from './ComfyRunButton'

const settingsStore = useSettingStore()
const commandStore = useCommandStore()
const { t } = useI18n()

// Execution logic for the Cancel button
const { isIdle: isExecutionIdle } = storeToRefs(useExecutionStore())
const cancelJobTooltipConfig = computed(() =>
  buildTooltipConfig(t('menu.interrupt'))
)

const cancelCurrentJob = async () => {
  if (isExecutionIdle.value) return
  await commandStore.execute('Comfy.Interrupt')
}

const position = computed(() => settingsStore.get('Comfy.UseNewMenu'))
const visible = computed(() => position.value !== 'Disabled')

const panelRef = ref<HTMLElement | null>(null)
const dragHandleRef = ref<HTMLElement | null>(null)

// We keep OUR Draggable composable logic
const { style, isDragging, isDocked } = useDraggableMenu(
  panelRef,
  dragHandleRef,
  {
    localStorageKey: 'Comfy.MenuPosition'
  }
)

/**
 * Track run button handle drag start using mousedown on the drag handle.
 */
useEventListener(dragHandleRef, 'mousedown', () => {
  useTelemetry()?.trackUiButtonClicked({
    button_id: 'actionbar_run_handle_drag_start'
  })
})

const panelClass = computed(() =>
  cn(
    'actionbar pointer-events-auto z-1300',
    isDragging.value && 'select-none pointer-events-none',
    isDocked.value
      ? 'p-0 static mr-2 border-none bg-transparent'
      : 'fixed shadow-interface'
  )
)
</script>
