<template>
  <svg
    :class="iconClass"
    :width="size"
    :height="size"
    viewBox="-160 -160 320 320"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <g>
      <g transform="rotate(0)">
        <g transform="rotate(0)">
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="#554b98"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z"
            fill="#8060b0"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="none"
            stroke="#2a2c58"
            stroke-width="12"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>
        <g transform="rotate(90)">
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="#8060b0"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z"
            fill="#554b98"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="none"
            stroke="#2a2c58"
            stroke-width="12"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>
        <g transform="rotate(180)">
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="#554b98"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z"
            fill="#554b98"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="none"
            stroke="#2a2c58"
            stroke-width="12"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>
        <g transform="rotate(270)">
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="#554b98"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z"
            fill="#554b98"
            stroke="none"
          />
          <path
            d="M 0 0  L 58 -57.4 Q 41.76 -103.656 0 -140  Q -41.76 -103.656 -58 -57.4 L 0 0 Z"
            fill="none"
            stroke="#2a2c58"
            stroke-width="12"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// We keep the Props interface compatible with the previous component
// so standard sizing still works.
interface Props {
  size?: number | string
  class?: string
}

const { size = 16, class: className } = defineProps<Props>()

const iconClass = computed(() => className || '')
</script>
