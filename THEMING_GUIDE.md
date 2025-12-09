# Application Theming and Customization Guide

This document provides an overview of how styling is handled in the application and how to customize default colors, including the loading screen.

## Styling Architecture

The application's styling is managed through a multi-layered system:

1.  **PrimeVue Theme**: The UI is built on [PrimeVue](https://primevue.org/), and it uses a customized version of the `Aura` theme. The base theme configuration can be found in [`src/main.ts`](d:/ComfyUI_frontend/src/main.ts:1).

2.  **Design System**: A local package, [`@comfyorg/design-system`](d:/ComfyUI_frontend/packages/design-system/package.json:2), provides the core styling for the application. The main stylesheet, located at [`packages/design-system/src/css/style.css`](d:/ComfyUI_frontend/packages/design-system/src/css/style.css:1), defines a comprehensive set of CSS variables for colors, fonts, and component styles for both light and dark themes.

3.  **Application Overrides**: Global styles and overrides are located in [`src/assets/css/style.css`](d:/ComfyUI_frontend/src/assets/css/style.css:1), which imports the design system's stylesheet.

4.  **JSON Color Palettes**: Files like [`src/assets/palettes/kuro.json`](d:/ComfyUI_frontend/src/assets/palettes/kuro.json) are used for specific, dynamic theming, such as the node graph canvas. These are loaded programmatically and do not affect the global UI theme. This is why your canvas color doesn't apply to the loading screen.

## Customizing the Loading Screen

The loading screen is composed of two PrimeVue components, [`<ProgressSpinner>`](d:/ComfyUI_frontend/src/App.vue:3) and [`<BlockUI>`](d:/ComfyUI_frontend/src/App.vue:8), as seen in [`src/App.vue`](d:/ComfyUI_frontend/src/App.vue:1). Their appearance is inherited from the global theme.

There are two ways to customize them:

### 1. Modify Core Theme Variables (Recommended)

To change the color of the spinner to match the application's primary color, you can modify the theme variables in the design system.

-   **File to Edit**: [`packages/design-system/src/css/style.css`](d:/ComfyUI_frontend/packages/design-system/src/css/style.css:1)
-   **What to Change**: The `ProgressSpinner` uses the `primary` color from the theme. You can adjust the `--p-primary-color` variable or the semantic tokens that define it.

    For example, in the `:root` and `.dark-theme` sections, you can find and modify variables like `--primary-background` or `--color-azure-400`.

### 2. Add Specific CSS Overrides

If you only want to change the loading screen without affecting other components, you can add a specific CSS override.

-   **File to Edit**: [`src/assets/css/style.css`](d:/ComfyUI_frontend/src/assets/css/style.css:1)
-   **Example CSS**:

    ```css
    /* Custom styles for the loading spinner */
    .p-progress-spinner-circle {
      stroke: #ff0000 !important; /* Change to your desired color */
    }

    /* Custom styles for the blocking overlay */
    .p-blockui-mask {
      background-color: rgba(0, 0, 0, 0.7) !important; /* Change to your desired overlay color and opacity */
    }
    ```

## Customizing Default Colors

All default colors for the application are defined as CSS variables in the design system.

-   **File to Edit**: [`packages/design-system/src/css/style.css`](d:/ComfyUI_frontend/packages/design-system/src/css/style.css:1)
-   **Sections to Modify**:
    -   `:root { ... }`: Defines variables for the light theme.
    -   `.dark-theme { ... }`: Defines variables for the dark theme.

By changing the color values in these sections, you can alter the look and feel of the entire application.

---

## Loading Screen Animation and Canvas Color Initialization
Maps the initialization flow for loading screen animation and canvas color when ComfyUI first loads or refreshes. Key locations include the spinner activation in GraphCanvas [1c], color palette application in colorPaletteService [2c], and background image override handling [3b].
### 1. Loading Spinner Control Flow
Manages the loading spinner display during app initialization
### 1a. Spinner State Computed (`App.vue:32`)
App component computes loading state from workspace store
```text
const isLoading = computed<boolean>(() => workspaceStore.spinner)
```
### 1b. ProgressSpinner Display (`App.vue:3`)
PrimeVue spinner renders when isLoading is true
```text
<ProgressSpinner v-if="isLoading" class="absolute inset-0 flex h-[unset] items-center justify-center" />
```
### 1c. Spinner Activated (`GraphCanvas.vue:411`)
GraphCanvas activates spinner during initialization
```text
workspaceStore.spinner = true
```
### 1d. Spinner Deactivated (`GraphCanvas.vue:435`)
Spinner hidden after app setup completes
```text
workspaceStore.spinner = false
```
### 2. Canvas Color Palette Loading
Loads and applies color themes to the canvas background
### 2a. Default Dark Canvas Color (`dark.json:25`)
Dark theme defines #141414 as canvas background
```text
"CLEAR_BACKGROUND_COLOR": "#141414"
```
### 2b. Light Canvas Color (`light.json:26`)
Light theme uses lightgray for canvas background
```text
"CLEAR_BACKGROUND_COLOR": "lightgray"
```
### 2c. Apply Canvas Color (`colorPaletteService.ts:160`)
Color service sets canvas background from palette
```text
app.canvas.clear_background_color = palette.CLEAR_BACKGROUND_COLOR
```
### 2d. Background Image Override (`colorPaletteService.ts:155`)
Checks for custom background image setting
```text
const backgroundImage = settingStore.get('Comfy.Canvas.BackgroundImage')
```
### 3. Background Image Override System
Allows users to set custom background images instead of solid colors
### 3a. Background Image Setting (`coreSettings.ts:1026`)
Core setting definition for canvas background image
```text
id: 'Comfy.Canvas.BackgroundImage',
```
### 3b. Transparent Background (`colorPaletteService.ts:157`)
Sets background transparent when using custom image
```text
if (backgroundImage) { app.canvas.clear_background_color = 'transparent' }
```
### 3c. Watch Background Changes (`GraphCanvas.vue:294`)
Reactively updates canvas when background image changes
```text
watch(() => settingStore.get('Comfy.Canvas.BackgroundImage'), async () => {
```