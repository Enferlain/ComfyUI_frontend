<template>
  <div v-if="renderError" class="node-error p-2 text-sm text-red-500">
    {{ st('nodeErrors.widgets', 'Node Widgets Error') }}
  </div>
  <div
    v-else
    :class="
      cn(
        'lg-node-widgets grid flex-1 gap-y-1 pr-3',
        shouldHandleNodePointerEvents
          ? 'pointer-events-auto'
          : 'pointer-events-none'
      )
    "
    :style="{
      'grid-template-rows': mainGridTemplateRows,
      'grid-template-columns': gridTemplateColumns
    }"
    @pointerdown.capture="handleBringToFront"
    @pointerdown="handleWidgetPointerEvent"
    @pointermove="handleWidgetPointerEvent"
    @pointerup="handleWidgetPointerEvent"
  >
    <template v-for="(item, index) in groupedWidgets" :key="`item-${index}`">
      <!-- Case 1: Standard Widget (Not in a section, or is a section header itself) -->
      <template v-if="!isSectionGroup(item)">
        <div
          v-if="!item.simplified.options?.hidden"
          class="lg-node-widget group col-span-full grid grid-cols-subgrid items-stretch"
        >
          <!-- Widget Input Slot Dot -->
          <div
            :class="
              cn(
                'z-10 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100 flex items-stretch',
                item.slotMetadata?.linked && 'opacity-100'
              )
            "
          >
            <InputSlot
              v-if="item.slotMetadata"
              :slot-data="{
                name: item.name,
                type: item.type,
                boundingRect: [0, 0, 0, 0]
              }"
              :node-id="nodeData?.id != null ? String(nodeData.id) : ''"
              :index="item.slotMetadata.index"
              :socketless="item.simplified.spec?.socketless"
              dot-only
            />
          </div>
          <!-- Widget Component -->
          <component
            :is="item.vueComponent"
            v-model="item.value"
            v-tooltip.left="item.tooltipConfig"
            :widget="item.simplified"
            :node-id="nodeData?.id != null ? String(nodeData.id) : ''"
            :node-type="nodeType"
            class="col-span-2"
            @update:model-value="item.updateHandler"
          />
        </div>
      </template>

      <!-- Case 2: Section Group -->
      <template v-else>
        <!-- Section Header -->
        <div
          v-if="!item.header.simplified.options?.hidden"
          class="lg-node-widget group col-span-full grid grid-cols-subgrid items-stretch"
        >
          <div class="z-10 w-3">
            <!-- Placeholder for slot dot alignment -->
          </div>
          <component
            :is="item.header.vueComponent"
            v-model="item.header.value"
            v-tooltip.left="item.header.tooltipConfig"
            :widget="item.header.simplified"
            :node-id="nodeData?.id != null ? String(nodeData.id) : ''"
            :node-type="nodeType"
            class="col-span-2"
            @update:model-value="item.header.updateHandler"
          />
        </div>

        <!-- Section Body (Children) - Subgrid for unified alignment -->
        <!-- Always rendered so grid tracks account for all labels -->
        <div
          :class="[
            'col-span-full grid grid-cols-subgrid gap-y-1',
            item.isCollapsed && 'max-h-0 overflow-hidden pointer-events-none'
          ]"
          :aria-hidden="item.isCollapsed"
          :inert="item.isCollapsed"
        >
          <template
            v-for="(child, childIndex) in item.children"
            :key="`child-${index}-${childIndex}-${child.name}`"
          >
            <div
              v-if="!child.simplified.options?.hidden"
              class="lg-node-widget group col-span-full grid grid-cols-subgrid items-stretch"
            >
              <!-- Widget Input Slot Dot -->
              <div
                :class="
                  cn(
                    'z-10 w-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100 flex items-stretch',
                    child.slotMetadata?.linked && 'opacity-100'
                  )
                "
              >
                <InputSlot
                  v-if="child.slotMetadata"
                  :slot-data="{
                    name: child.name,
                    type: child.type,
                    boundingRect: [0, 0, 0, 0]
                  }"
                  :node-id="nodeData?.id != null ? String(nodeData.id) : ''"
                  :index="child.slotMetadata.index"
                  :socketless="child.simplified.spec?.socketless"
                  dot-only
                />
              </div>
              <!-- Widget Component -->
              <component
                :is="child.vueComponent"
                v-model="child.value"
                v-tooltip.left="child.tooltipConfig"
                :widget="child.simplified"
                :node-id="nodeData?.id != null ? String(nodeData.id) : ''"
                :node-type="nodeType"
                class="col-span-2"
                @update:model-value="child.updateHandler"
              />
            </div>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TooltipOptions } from 'primevue'
import { computed, onErrorCaptured, ref, toValue } from 'vue'
import type { Component } from 'vue'

import type {
  VueNodeData,
  WidgetSlotMetadata
} from '@/composables/graph/useGraphNodeManager'
import { useErrorHandling } from '@/composables/useErrorHandling'
import { st } from '@/i18n'
import { useCanvasInteractions } from '@/renderer/core/canvas/useCanvasInteractions'
import { useNodeTooltips } from '@/renderer/extensions/vueNodes/composables/useNodeTooltips'
import { useNodeZIndex } from '@/renderer/extensions/vueNodes/composables/useNodeZIndex'
import WidgetDOM from '@/renderer/extensions/vueNodes/widgets/components/WidgetDOM.vue'
// Import widget components directly
import WidgetLegacy from '@/renderer/extensions/vueNodes/widgets/components/WidgetLegacy.vue'
import {
  getComponent,
  shouldExpand,
  shouldRenderAsVue
} from '@/renderer/extensions/vueNodes/widgets/registry/widgetRegistry'
import type { SimplifiedWidget, WidgetValue } from '@/types/simplifiedWidget'
import { cn } from '@/utils/tailwindUtil'

import InputSlot from './InputSlot.vue'

interface NodeWidgetsProps {
  nodeData?: VueNodeData
}

const { nodeData } = defineProps<NodeWidgetsProps>()

const { shouldHandleNodePointerEvents, forwardEventToCanvas } =
  useCanvasInteractions()
const { bringNodeToFront } = useNodeZIndex()

function handleWidgetPointerEvent(event: PointerEvent) {
  if (shouldHandleNodePointerEvents.value) return
  event.stopPropagation()
  forwardEventToCanvas(event)
}

function handleBringToFront() {
  if (nodeData?.id != null) {
    bringNodeToFront(String(nodeData.id))
  }
}

// Error boundary implementation
const renderError = ref<string | null>(null)

const { toastErrorHandler } = useErrorHandling()

onErrorCaptured((error) => {
  renderError.value = error.message
  toastErrorHandler(error)
  return false
})

const nodeType = computed(() => nodeData?.type || '')
const { getWidgetTooltip, createTooltipConfig } = useNodeTooltips(
  nodeType.value
)

interface ProcessedWidget {
  name: string
  type: string
  vueComponent: Component
  simplified: SimplifiedWidget
  value: WidgetValue
  updateHandler: (value: WidgetValue) => void
  tooltipConfig: TooltipOptions
  slotMetadata?: WidgetSlotMetadata
}

interface SectionGroup {
  header: ProcessedWidget
  children: ProcessedWidget[]
  isCollapsed: boolean
}

type GroupedItem = ProcessedWidget | SectionGroup

function isSectionGroup(item: GroupedItem): item is SectionGroup {
  return 'children' in item
}

// First, flatten alias of widgets to processed widgets to handle basic logic like dependencies
const allProcessedWidgets = computed((): ProcessedWidget[] => {
  if (!nodeData?.widgets) return []

  const { widgets } = nodeData
  const result: ProcessedWidget[] = []

  // Pre-calculate collapsed sections for dependency checks
  const collapsedSections = new Set<string>()
  for (const widget of widgets) {
    if (widget.type === 'SECTION' || widget.type === 'section') {
      // value is boolean true if collapsed?
      // Wait, useSectionWidget says: true = collapsed, false = expanded
      if (widget.value === true) {
        collapsedSections.add(widget.name)
      }
    }
  }

  for (const widget of widgets) {
    if (!shouldRenderAsVue(widget)) continue

    const vueComponent =
      getComponent(widget.type, widget.name) ||
      (widget.isDOMWidget ? WidgetDOM : WidgetLegacy)

    const { slotMetadata, options } = widget

    // Core feature: Disable Vue widgets when their input slots are connected
    const widgetOptions = slotMetadata?.linked
      ? { ...options, disabled: true }
      : options

    // Logic separation: We verify 'hidden' status, but NOT section collapsing here.
    // Section collapsing is handled by the grouping structure.

    // Handle Conditional Visibility (if property)
    // @ts-ignore
    const condition = widgetOptions?.if
    let isHiddenByCondition = false
    if (condition) {
      for (const [dependencyName, expectedValue] of Object.entries(condition)) {
        // Find dependency widget in the raw widgets list
        const dependencyWidget = widgets.find((w) => w.name === dependencyName)
        if (dependencyWidget) {
          // Loose matching to handle "10" vs 10
          // eslint-disable-next-line eqeqeq
          if (dependencyWidget.value != expectedValue) {
            isHiddenByCondition = true
            break
          }
        }
      }
    }

    const finalHidden = widgetOptions?.hidden || isHiddenByCondition

    const simplified: SimplifiedWidget = {
      name: widget.name,
      type: widget.type,
      value: widget.value,
      borderStyle: widget.borderStyle,
      callback: widget.callback,
      controlWidget: widget.controlWidget,
      label: widget.label,
      nodeType: widget.nodeType,
      options: { ...widgetOptions, hidden: finalHidden },
      spec: widget.spec
    }

    function updateHandler(value: WidgetValue) {
      widget.value = value
      widget.callback?.(value)
    }

    const tooltipText = getWidgetTooltip(widget)
    const tooltipConfig = createTooltipConfig(tooltipText)

    result.push({
      name: widget.name,
      type: widget.type,
      vueComponent,
      simplified,
      value: widget.value,
      updateHandler,
      tooltipConfig,
      slotMetadata
    })
  }

  return result
})

const groupedWidgets = computed((): GroupedItem[] => {
  const widgets = allProcessedWidgets.value
  const result: GroupedItem[] = []

  // Simple grouping logic:
  // When we hit a Section widget, we create a group.
  // Subsequent widgets are added to that group until we hit another Section or end.
  // BUT: existing logic relied on `options.section` to determine membership.

  // Let's use `options.section` which seems to be the source of truth in `NodeWidgets` originally.
  // "const sectionName = widgetOptions?.section"

  // We'll iterate and place widgets either in the main list or in a map of groups

  const sectionMap = new Map<string, SectionGroup>()
  // Preserve order: We need to know where the section header appeared to place the group.

  // However, ComfyUI widgets are ordered list.
  // Usually the section header comes BEFORE the items.

  // Let's iterate and build.

  // Pass 1: Identify indices of widgets that belong to a section?
  // Or just iterate:

  // It's tricky because we need to know if a widget *belongs* to a section.
  // The `widget.simplified.options.section` key tells us the generic name of the section it belongs to.
  // Wait, looking at `useSectionWidget.ts`, the section widget itself has `name: inputSpec.name`.

  // So:
  // 1. Identify all Section widgets.
  // 2. Put widgets into appropriate lists.

  // But we want to maintain visual order of the SECTIONS.
  // And usually items belonging to a section immediately follow it?
  // Actually, standard Comfy widgets don't enforce order, but `options.section` is the link.

  // Strategy:
  // - Create a list of "Top Level items".
  // - If a widget is of type 'section', it becomes a `SectionGroup` in the top level list.
  // - If a widget has `options.section`, we try to find that group in our known groups and add it there.
  // - If it has `options.section` but we haven't seen that section header yet (or ever), what do we do?
  //   - Fallback: treat as independent widget? Or assume section definition might come later?
  //   - Usually header comes first. If not found, maybe just append to top level.

  for (const searchWidget of widgets) {
    if (searchWidget.type === 'section' || searchWidget.type === 'SECTION') {
      const group: SectionGroup = {
        header: searchWidget,
        children: [],
        isCollapsed: searchWidget.value === true
      }
      sectionMap.set(searchWidget.name, group)
      result.push(group)
    } else {
      // @ts-ignore
      const sectionName = searchWidget.simplified.options?.section
      if (sectionName && sectionMap.has(sectionName)) {
        sectionMap.get(sectionName)?.children.push(searchWidget)
      } else {
        result.push(searchWidget)
      }
    }
  }

  return result
})

// Calculate the maximum label width from ALL widgets (including collapsed sections)
// This ensures consistent column sizing regardless of collapse state
const gridTemplateColumns = computed((): string => {
  const allLabels: string[] = []

  // Collect labels from all widgets
  for (const widget of allProcessedWidgets.value) {
    const label = widget.simplified.label || widget.name
    if (label) allLabels.push(label)
  }

  if (allLabels.length === 0) {
    return 'min-content minmax(80px, max-content) minmax(125px, 1fr)'
  }

  // Find the longest label
  const maxLabelLength = Math.max(...allLabels.map((l) => l.length))

  // Estimate pixel width: ~7px per character for 12px font, plus padding
  // Using ch unit for better accuracy (1ch = width of '0' character)
  const minLabelWidth = Math.max(80, maxLabelLength * 7 + 16)

  return `min-content minmax(${minLabelWidth}px, max-content) minmax(125px, 1fr)`
})

const mainGridTemplateRows = computed((): string => {
  const items = groupedWidgets.value
  return items
    .map((item) => {
      if (isSectionGroup(item)) {
        // Section Group:
        // Row 1: Header (min-content) - IF not hidden
        // Row 2: Children Container (auto) - IF not collapsed

        const headerHidden = item.header.simplified.options?.hidden
        const params: string[] = []

        if (!headerHidden) {
          params.push('min-content')
        }

        // Section children are ALWAYS rendered for consistent sizing
        // Use min-content to reserve space, max-h-0 hides visually
        const hasExpandingChild = item.children.some((child) => {
          if (child.simplified.options?.hidden) return false
          return shouldExpand(child.type)
        })
        params.push(hasExpandingChild ? 'auto' : 'min-content')

        return params.join(' ')
      } else {
        // Single Widget
        if (item.simplified.options?.hidden) return ''
        return shouldExpand(item.type) ? 'auto' : 'min-content'
      }
    })
    .filter(Boolean) // remove empty strings from hidden items
    .join(' ')
})
</script>
