<template>
  <router-view />

  <div v-if="isLoading" class="kuro-loader-overlay">
    <!-- Added 'floating' class for the animation, removed text below -->
    <div class="kuro-loader">
      <ComfyLoadingIcon :size="150" />
    </div>
  </div>

  <GlobalDialog />
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, onMounted } from 'vue'

import GlobalDialog from '@/components/dialog/GlobalDialog.vue'
/* --- LUMI: Import the new icon here! --- */
import ComfyLoadingIcon from '@/components/icons/ComfyLoadingIcon.vue'
import config from '@/config'
import { t } from '@/i18n'
import { useWorkflowStore } from '@/platform/workflow/management/stores/workflowStore'
import { app } from '@/scripts/app'
import { useDialogService } from '@/services/dialogService'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useConflictDetection } from '@/workbench/extensions/manager/composables/useConflictDetection'

import { electronAPI, isElectron } from './utils/envUtil'

const workspaceStore = useWorkspaceStore()
const conflictDetection = useConflictDetection()
const workflowStore = useWorkflowStore()
const dialogService = useDialogService()
const isLoading = computed<boolean>(() => workspaceStore.spinner)

const handleKey = (e: KeyboardEvent) => {
  workspaceStore.shiftDown = e.shiftKey
}
useEventListener(window, 'keydown', handleKey)
useEventListener(window, 'keyup', handleKey)

const showContextMenu = (event: MouseEvent) => {
  const { target } = event
  switch (true) {
    case target instanceof HTMLTextAreaElement:
    case target instanceof HTMLInputElement && target.type === 'text':
      electronAPI()?.showContextMenu({ type: 'text' })
      return
  }
}

onMounted(() => {
  window['__COMFYUI_FRONTEND_VERSION__'] = config.app_version

  if (isElectron()) {
    document.addEventListener('contextmenu', showContextMenu)
  }

  window.addEventListener('vite:preloadError', async (_event) => {
    if (!app.vueAppReady || !workflowStore.activeWorkflow?.isModified) {
      window.location.reload()
    } else {
      await dialogService
        .confirm({
          title: t('g.vitePreloadErrorTitle'),
          message: t('g.vitePreloadErrorMessage')
        })
        .then((confirmed) => {
          if (confirmed) {
            window.location.reload()
          }
        })
    }
  })

  void conflictDetection.initializeConflictDetection()
})
</script>
