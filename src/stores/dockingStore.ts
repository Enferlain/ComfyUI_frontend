import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDockingStore = defineStore('docking', () => {
  const isMouseOverDropZone = ref(false)
  const isDragging = ref(false)

  return {
    isMouseOverDropZone,
    isDragging
  }
})
