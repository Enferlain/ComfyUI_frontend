<template>
  <div class="icon-wrapper" :class="wrapperClass">
    <svg
      viewBox="-160 -160 320 320"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      :width="size"
      :height="size"
      class="icon-svg"
    >
      <g>
        <!-- Quadrant 1 (Top Right - 0 degrees) | Default Split (Dark/Light) -->
        <g transform="rotate(0)" class="quadrant-1 quadrant-g">
          <!-- Path A (Full Sector) -->
          <path :d="pathA" class="path-a" />
          <!-- Path B (Half Sector Overlay) -->
          <path :d="pathB" class="path-b" />
          <!-- Stroke Path -->
          <path :d="pathStroke" class="path-stroke" />
        </g>

        <!-- Quadrant 2 (Bottom Right - 90 degrees) | Flipped Split (Light/Dark) -->
        <g transform="rotate(90)" class="quadrant-2 quadrant-g">
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>

        <!-- Quadrant 3 (Bottom Left - 180 degrees) | Solid Dark -->
        <g transform="rotate(180)" class="quadrant-3 quadrant-g">
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>

        <!-- Quadrant 4 (Top Left - 270 degrees) | Solid Dark -->
        <g transform="rotate(270)" class="quadrant-4 quadrant-g">
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number | string
  class?: string
}

const props = defineProps<Props>()

const wrapperClass = computed(() => props.class || '')
const size = computed(() => props.size ?? 40)

// SVG Path definitions (reused to keep template clean)
const pathA =
  'M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z'
const pathB = 'M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z'
const pathStroke =
  'M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z'
</script>

<style scoped>
/* Color Definitions */
.icon-wrapper {
  --color-dark-primary: #554f96; /* Darker starting color */
  --color-light-secondary: #7c64ae; /* Lighter target color */
  --color-stroke: #2a2c58;

  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Base Path Styling */
.path-stroke {
  fill: none;
  stroke: var(--color-stroke);
  stroke-width: 12;
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* Transition logic for fills */
.quadrant-g path:not(.path-stroke) {
  transition: fill 0.3s ease-in-out;
}

/* --- INITIAL STATES --- */

/* Q1 Default: Dark/Light */
.quadrant-1 .path-a {
  fill: var(--color-dark-primary);
}
.quadrant-1 .path-b {
  fill: var(--color-light-secondary);
}

/* Q2 Override: Light/Dark (Flipped) */
.quadrant-2 .path-a {
  fill: var(--color-light-secondary);
}
.quadrant-2 .path-b {
  fill: var(--color-dark-primary);
}

/* Q3 Override: Solid Dark */
.quadrant-3 .path-a,
.quadrant-3 .path-b {
  fill: var(--color-dark-primary);
}

/* Q4 Override: Solid Dark */
.quadrant-4 .path-a,
.quadrant-4 .path-b {
  fill: var(--color-dark-primary);
}

/* --- RIPPLE ANIMATION LOGIC --- */

/* 
   HOVER-OUT (Revert): Counter-Clockwise 
   Order: Q1 -> Q4 -> Q3 -> Q2 
*/
.quadrant-1 path:not(.path-stroke) {
  transition-delay: 0ms;
}
.quadrant-4 path:not(.path-stroke) {
  transition-delay: 100ms;
}
.quadrant-3 path:not(.path-stroke) {
  transition-delay: 200ms;
}
.quadrant-2 path:not(.path-stroke) {
  transition-delay: 300ms;
}

/* 
   HOVER-IN: Clockwise starting at Q2
   Order: Q2 -> Q3 -> Q4 -> Q1
   Target Color: Light Secondary
*/

/* Apply the hover state when the parent wrapper is hovered. 
   Note: If you use the `group` class in Tailwind on the parent, 
   you might need to change `.icon-wrapper:hover` to `:global(.group:hover) .icon-wrapper` 
   depending on your specific DOM structure. 
*/
.icon-wrapper:hover .quadrant-g path:not(.path-stroke),
:global(.group:hover) .icon-wrapper .quadrant-g path:not(.path-stroke) {
  fill: var(--color-light-secondary);
}

.icon-wrapper:hover .quadrant-2 path:not(.path-stroke),
:global(.group:hover) .icon-wrapper .quadrant-2 path:not(.path-stroke) {
  transition-delay: 0ms;
}

.icon-wrapper:hover .quadrant-3 path:not(.path-stroke),
:global(.group:hover) .icon-wrapper .quadrant-3 path:not(.path-stroke) {
  transition-delay: 100ms;
}

.icon-wrapper:hover .quadrant-4 path:not(.path-stroke),
:global(.group:hover) .icon-wrapper .quadrant-4 path:not(.path-stroke) {
  transition-delay: 200ms;
}

.icon-wrapper:hover .quadrant-1 path:not(.path-stroke),
:global(.group:hover) .icon-wrapper .quadrant-1 path:not(.path-stroke) {
  transition-delay: 300ms;
}
</style>
