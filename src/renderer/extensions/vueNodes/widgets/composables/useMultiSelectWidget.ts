import { ref } from 'vue'

import type { LGraphNode } from '@/lib/litegraph/src/litegraph'
import type { IBaseWidget } from '@/lib/litegraph/src/types/widgets'
import type { InputSpec } from '@/schemas/nodeDef/nodeDefSchemaV2'
import { ComponentWidgetImpl, addWidget } from '@/scripts/domWidget'
import type { BaseDOMWidget } from '@/scripts/domWidget'
import type { ComfyWidgetConstructorV2 } from '@/scripts/widgets'

import WidgetMultiSelect from '../components/WidgetMultiSelect.vue'

export const useMultiSelectWidget = (): ComfyWidgetConstructorV2 => {
  const widgetConstructor: ComfyWidgetConstructorV2 = (
    node: LGraphNode,
    inputSpec: InputSpec
  ) => {
    const widgetValue = ref<string[]>([])

    const widget = new ComponentWidgetImpl<string[], object>({
      node,
      name: inputSpec.name,
      component: WidgetMultiSelect,
      inputSpec,
      options: {
        getValue: () => widgetValue.value,
        setValue: (value: string[]) => {
          widgetValue.value = Array.isArray(value) ? value : []
        }
      },
      type: 'multiselect'
    })

    addWidget(node, widget as BaseDOMWidget<object | string>)
    return widget
  }

  return widgetConstructor
}
