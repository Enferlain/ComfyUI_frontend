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
        <!-- Quadrant 1 (Top Right - 0 degrees) | Index 0 -->
        <g
          transform="rotate(0)"
          class="quadrant-g"
          :class="{ 'is-light': isActive(0) }"
        >
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>

        <!-- Quadrant 2 (Bottom Right - 90 degrees) | Index 1 -->
        <g
          transform="rotate(90)"
          class="quadrant-g"
          :class="{ 'is-light': isActive(1) }"
        >
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>

        <!-- Quadrant 3 (Bottom Left - 180 degrees) | Index 2 -->
        <g
          transform="rotate(180)"
          class="quadrant-g"
          :class="{ 'is-light': isActive(2) }"
        >
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>

        <!-- Quadrant 4 (Top Left - 270 degrees) | Index 3 -->
        <g
          transform="rotate(270)"
          class="quadrant-g"
          :class="{ 'is-light': isActive(3) }"
        >
          <path :d="pathA" class="path-a" />
          <path :d="pathB" class="path-b" />
          <path :d="pathStroke" class="path-stroke" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  size?: number | string
  class?: string
  /**
   * Speed of the step in milliseconds.
   * Default is 300ms (matching your HTML).
   */
  interval?: number
  /**
   * Whether the animation is running.
   */
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interval: 300,
  active: true
})

const wrapperClass = computed(() => props.class || '')
const size = computed(() => props.size ?? 40)

// --- ANIMATION LOGIC ---

const currentIndex = ref(3) // Start so the first tick sets it to 0 (Q1)
let timer: ReturnType<typeof setInterval> | null = null

// Helper to determine if a quadrant index is part of the "Light Cone"
// The cone includes the current index AND the next index (wrapping around)
const isActive = (index: number) => {
  if (!props.active) return false

  const nextIndex = (currentIndex.value + 1) % 4
  return index === currentIndex.value || index === nextIndex
}

const startAnimation = () => {
  stopAnimation() // clear existing if any
  timer = setInterval(() => {
    // Step clockwise: 0 -> 1 -> 2 -> 3 -> 0
    currentIndex.value = (currentIndex.value + 1) % 4
  }, props.interval)
}

const stopAnimation = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// Lifecycle management
onMounted(() => {
  if (props.active) startAnimation()
})

onUnmounted(() => {
  stopAnimation()
})

// React to prop changes (pausing/resuming)
watch(
  () => props.active,
  (newVal) => {
    if (newVal) startAnimation()
    else stopAnimation()
  }
)

// --- SVG PATHS ---
const pathA =
  'M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z'
const pathB = 'M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z'
const pathStroke =
  'M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z'
</script>

<style scoped>
.icon-wrapper {
  /* Match the color variables from your HTML */
  --color-dark-primary: #554f96;
  --color-light-secondary: #7c64ae;
  --color-stroke: #2a2c58;

  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.path-stroke {
  fill: none;
  stroke: var(--color-stroke);
  stroke-width: 12;
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* --- BASE STATE --- */
/* Default to dark color */
.path-a,
.path-b {
  fill: var(--color-dark-primary);
  /* The transition that creates the smooth "step" feel */
  transition: fill 0.08s ease-out;
}

/* --- ACTIVE STATE --- */
/* When the Vue dynamic class 'is-light' is applied */
.is-light .path-a,
.is-light .path-b {
  fill: var(--color-light-secondary) !important;
}
</style>
