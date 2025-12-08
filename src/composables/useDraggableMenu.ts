import {
  useDraggable,
  useEventListener,
  useLocalStorage,
  watchDebounced
} from '@vueuse/core'
import { clamp } from 'es-toolkit/compat'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { nextTick, onMounted, ref, watch } from 'vue'

import { useDockingStore } from '@/stores/dockingStore'

export function useDraggableMenu(
  panelRef: Ref<HTMLElement | null>,
  dragHandleRef: Ref<HTMLElement | null>,
  options: {
    localStorageKey: string
    initialDocked?: boolean
  }
) {
  const dockingStore = useDockingStore()
  const { isMouseOverDropZone } = storeToRefs(dockingStore)

  const isDocked = useLocalStorage(
    `${options.localStorageKey}.Docked`,
    options.initialDocked ?? true
  )
  const storedPosition = useLocalStorage(
    `${options.localStorageKey}.Floating`,
    {
      x: 0,
      y: 0
    }
  )

  const tabContainer = document.querySelector('.workflow-tabs-container')
  const { x, y, style, isDragging } = useDraggable(panelRef, {
    initialValue: { x: 0, y: 0 },
    handle: dragHandleRef,
    preventDefault: true,
    containerElement: document.body,
    onMove: (event) => {
      // Prevent dragging the menu over the top of the tabs
      const minY = tabContainer?.getBoundingClientRect().bottom ?? 40
      if (event.y < minY) {
        event.y = minY
      }
    }
  })

  // Update storedPosition when x or y changes
  watchDebounced(
    [x, y],
    ([newX, newY]) => {
      storedPosition.value = { x: newX, y: newY }
    },
    { debounce: 300 }
  )

  // Set initial position
  const setInitialPosition = () => {
    if (panelRef.value) {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const menuWidth = panelRef.value.offsetWidth
      const menuHeight = panelRef.value.offsetHeight

      if (menuWidth === 0 || menuHeight === 0) {
        return
      }

      // Check if stored position exists and is within bounds
      if (storedPosition.value.x !== 0 || storedPosition.value.y !== 0) {
        // Ensure stored position is within screen bounds
        x.value = clamp(storedPosition.value.x, 0, screenWidth - menuWidth)
        y.value = clamp(storedPosition.value.y, 0, screenHeight - menuHeight)
        captureLastDragState()
        return
      }

      // If no stored position or current position, set to bottom center
      if (x.value === 0 && y.value === 0) {
        x.value = clamp(
          (screenWidth - menuWidth) / 2,
          0,
          screenWidth - menuWidth
        )
        y.value = clamp(
          screenHeight - menuHeight - 10,
          0,
          screenHeight - menuHeight
        )
        captureLastDragState()
      }
    }
  }
  onMounted(setInitialPosition)
  watch(panelRef, async (newPanel) => {
    if (newPanel) {
      await nextTick(setInitialPosition)
    }
  })

  const lastDragState = ref({
    x: x.value,
    y: y.value,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  })
  const captureLastDragState = () => {
    lastDragState.value = {
      x: x.value,
      y: y.value,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    }
  }
  watch(
    isDragging,
    (newIsDragging) => {
      if (!newIsDragging) {
        // Stop dragging
        captureLastDragState()
      }
    },
    { immediate: true }
  )

  const adjustMenuPosition = () => {
    if (panelRef.value) {
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const menuWidth = panelRef.value.offsetWidth
      const menuHeight = panelRef.value.offsetHeight

      // Calculate distances to all edges
      const distanceLeft = lastDragState.value.x
      const distanceRight =
        lastDragState.value.windowWidth - (lastDragState.value.x + menuWidth)
      const distanceTop = lastDragState.value.y
      const distanceBottom =
        lastDragState.value.windowHeight - (lastDragState.value.y + menuHeight)

      // Find the smallest distance to determine which edge to anchor to
      const distances = [
        { edge: 'left', distance: distanceLeft },
        { edge: 'right', distance: distanceRight },
        { edge: 'top', distance: distanceTop },
        { edge: 'bottom', distance: distanceBottom }
      ]
      const closestEdge = distances.reduce((min, curr) =>
        curr.distance < min.distance ? curr : min
      )

      // Calculate vertical position as a percentage of screen height
      const verticalRatio =
        lastDragState.value.y / lastDragState.value.windowHeight
      const horizontalRatio =
        lastDragState.value.x / lastDragState.value.windowWidth

      // Apply positioning based on closest edge
      if (closestEdge.edge === 'left') {
        x.value = closestEdge.distance // Maintain exact distance from left
        y.value = verticalRatio * screenHeight
      } else if (closestEdge.edge === 'right') {
        x.value = screenWidth - menuWidth - closestEdge.distance // Maintain exact distance from right
        y.value = verticalRatio * screenHeight
      } else if (closestEdge.edge === 'top') {
        x.value = horizontalRatio * screenWidth
        y.value = closestEdge.distance // Maintain exact distance from top
      } else {
        // bottom
        x.value = horizontalRatio * screenWidth
        y.value = screenHeight - menuHeight - closestEdge.distance // Maintain exact distance from bottom
      }

      // Ensure the menu stays within the screen bounds
      x.value = clamp(x.value, 0, screenWidth - menuWidth)
      y.value = clamp(y.value, 0, screenHeight - menuHeight)
    }
  }

  useEventListener(window, 'resize', adjustMenuPosition)

  // Handle drag state changes
  watch(isDragging, (dragging) => {
    dockingStore.isDragging = dragging
    if (dragging) {
      // Starting to drag - undock if docked
      if (isDocked.value) {
        isDocked.value = false
      }
    } else {
      // Stopped dragging - dock if mouse is over drop zone
      if (isMouseOverDropZone.value) {
        isDocked.value = true
      }
      // Reset drop zone state
      dockingStore.isMouseOverDropZone = false
    }
  })

  return {
    x,
    y,
    style,
    isDragging,
    isDocked
  }
}
