import type { LGraphNode } from '@/lib/litegraph/src/litegraph'
import type { InputSpec } from '@/schemas/nodeDef/nodeDefSchemaV2'
import type { ComfyWidgetConstructorV2 } from '@/scripts/widgets'

export const useSectionWidget = () => {
  const widgetConstructor: ComfyWidgetConstructorV2 = (
    node: LGraphNode,
    inputSpec: InputSpec
  ) => {
    // Section widget manages its own state via value (boolean)
    // true = collapsed, false = expanded
    const defaultVal = inputSpec.default ?? false

    return node.addWidget(
      // @ts-ignore - 'section' is a custom widget type handled by Vuenodes
      'section',
      inputSpec.name,
      defaultVal,
      (v) => {},
      {
        // Ensure options are passed through
        ...inputSpec
      }
    )
  }

  return widgetConstructor
}
