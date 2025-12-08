import { computed, watch } from 'vue'
import { useFavicon } from '@vueuse/core'
import { useExecutionStore } from '@/stores/executionStore'

export const useProgressFavicon = () => {
  const executionStore = useExecutionStore()

  const faviconUrl = computed(() => {
    // 1. Get raw progress (0 to 1)
    const progress = executionStore.isIdle
      ? 1
      : executionStore.executionProgress

    // 2. Calculate clip geometry
    const height = 320 * progress
    const y = 160 - height

    // 3. Construct SVG with NEW stroke color #8b5cf6
    const svgString = `
      <svg width="64" height="64" viewBox="-160 -160 320 320" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="p">
            <rect x="-160" y="${y}" width="320" height="${height}" />
          </clipPath>
        </defs>
        <g>
          <!-- Background outlines (Now using brighter #8b5cf6) -->
          <g transform="rotate(0)">
             <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
          </g>
          <g transform="rotate(90)">
             <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
          </g>
          <g transform="rotate(180)">
             <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
          </g>
          <g transform="rotate(270)">
             <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
          </g>

          <!-- Filled parts (Clipped) -->
          <g clip-path="url(#p)">
            <g transform="rotate(0)">
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="#554b98" stroke="none"/>
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z" fill="#8060b0" stroke="none"/>
            </g>
            <g transform="rotate(90)">
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="#8060b0" stroke="none"/>
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z" fill="#554b98" stroke="none"/>
            </g>
            <g transform="rotate(180)">
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="#554b98" stroke="none"/>
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z" fill="#554b98" stroke="none"/>
            </g>
            <g transform="rotate(270)">
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 Q -41.76 -103.656 -58 -57.4 L 0 0 Z" fill="#554b98" stroke="none"/>
              <path d="M 0 0 L 58 -57.4 Q 41.76 -103.656 0 -140 L 0 0 Z" fill="#554b98" stroke="none"/>
            </g>
          </g>
        </g>
      </svg>
    `
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`
  })

  const favicon = useFavicon()
  watch(faviconUrl, (url) => {
    favicon.value = url
  })
}
