import { LGraphNode } from '@/lib/litegraph/src/litegraph'
import type { IWidget } from '@/lib/litegraph/src/types/widgets'
import { useDomWidgetStore } from '@/stores/domWidgetStore'

/**
 * Sets up conditional visibility for widgets on a node.
 * Watches for changes in dependency widgets and toggles visibility of dependent widgets.
 */
export function setupConditionalVisibility(node: LGraphNode) {
  if (!node.widgets) return

  const widgetMap = new Map<string, IWidget>(
    node.widgets.map((w) => [w.name, w])
  )

  const updateVisibility = () => {
    const domWidgetStore = useDomWidgetStore()

    // @ts-ignore
    node.widgets?.forEach((widget) => {
      // @ts-ignore
      const condition = widget.options?.['if']
      if (!condition) return

      let isVisible = true
      for (const [dependencyName, expectedValue] of Object.entries(condition)) {
        const dependencyWidget = widgetMap.get(dependencyName)
        if (dependencyWidget) {
          // Loose matching to handle "10" vs 10
          if (dependencyWidget.value != expectedValue) {
            isVisible = false
            break
          }
        }
      }

      // Update Vuenode widget visibility
      // @ts-ignore widget.id usually exists on DOM widgets
      if (widget.id) {
        // @ts-ignore
        const widgetState = domWidgetStore.widgetStates.get(widget.id)
        if (widgetState) {
          widgetState.visible = isVisible
        }
      }

      // Update LiteGraph standard widget visibility
      // Note: LiteGraph core may not respect .hidden property by default
      // without custom draw loop modification, but we set it for consistency.
      // @ts-ignore
      widget.hidden = !isVisible
    })
  }

  // Hook into changes of potential dependencies
  // @ts-ignore
  node.widgets.forEach((widget) => {
    const originalCallback = widget.callback
    // @ts-ignore
    widget.callback = function (this: IWidget, v: any, ...args: any[]) {
      originalCallback?.call(this, v, ...args)
      updateVisibility()
    }
  })

  // Initial check
  updateVisibility()
}
