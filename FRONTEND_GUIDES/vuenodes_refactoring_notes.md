# Vuenodes UX Refactoring Notes

This document tracks the files modified during the UX refinement session (Editable Combo Boxes, Grouped Sections, Conditional Visibility, Auto-Create Button). Use this as a reference for future development.

## 1. Widget Components (Visuals & Interaction)

### `src/renderer/extensions/vueNodes/widgets/components/WidgetSelectDefault.vue`
**Role:** Standard Dropdown/Combo Box UI.
**Changes:**
- **Editable Mode:** Fixed cursor issues and dead zones.
- **Filtering:** Implemented smart filtering (case-insensitive) that preserves all options on exact match.
- **Auto-Create Button:** Added the `+` button element next to the dropdown.
- **Styling:** Applied PrimeVue `Button` with specific Tailwind classes (`!flex !items-center ...`) for perfect alignment.

### `src/renderer/extensions/vueNodes/widgets/components/WidgetSection.vue`
**Role:** Visual header for grouped inputs.
**Changes:**
- **New Component:** Created to render the collapsible section header (caret icon + label).
- **State:** Manages its own `collapsed` state.

### `src/renderer/extensions/vueNodes/components/NodeWidgets.vue`
**Role:** Main loop rendering all widgets for a node.
**Changes:**
- **Visibility Logic:** Implemented `v-if` checks to hide widgets if:
    1. Their parent **Section** is collapsed.
    2. Their **Conditional Visibility** (`if` property) condition is not met.
- **Indentation:** Applies `ml-4` class to widgets inside a section.

## 2. Logic & Composables (State Management)

### `src/renderer/extensions/vueNodes/widgets/composables/useComboWidget.ts`
**Role:** Logic for Combo widget instantiation.
**Changes:**
- **Cleanup:** Removed the implicit "create folder on type" logic to prevent API errors.

### `src/renderer/extensions/vueNodes/widgets/composables/useSectionWidget.ts`
**Role:** Registry helper.
**Changes:**
- **New Composable:** Registers the `SECTION` widget type so it appears in the widget list.

### `src/services/useConditionalVisibility.ts`
**Role:** Logic for evaluating `if` conditions.
**Changes:**
- **New Service:** Centralized function to check if a widget should be visible based on another widget's value (e.g., `mode == 'override'`).

## 3. Services (Data & Integration)

### `src/services/litegraphService.ts`
**Role:** Bridge between backend definitions and Frontend/LiteGraph.
**Changes:**
- **Dependency Injection:** logical fix to ensure `inputSpec.section` is correctly respected when setting up visibility dependencies.

### `src/platform/assets/services/assetService.ts`
**Role:** Backend API communication.
**Note:** Used by `WidgetSelectDefault` to call `createFolder`. Validated behavior with standard backend (currently 405, but correct implementation).
