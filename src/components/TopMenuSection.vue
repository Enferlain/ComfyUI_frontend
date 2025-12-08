<template>
  <div
    v-if="!workspaceStore.focusMode"
    class="ml-1 flex gap-x-0.5 pt-1"
    @mouseenter="isTopMenuHovered = true"
    @mouseleave="isTopMenuHovered = false"
  >
    <div class="min-w-0 flex-1"></div>

    <div class="mx-1 flex flex-col items-end gap-1">
      <div class="flex items-center gap-2">
        <!-- OUR Custom Docking Dropzone -->
        <div
          v-if="dockingStore.isDragging"
          :class="actionbarClass"
          @mouseenter="dockingStore.isMouseOverDropZone = true"
          @mouseleave="dockingStore.isMouseOverDropZone = false"
        >
          {{ t('actionbar.dockToTop') }}
        </div>

        <!-- UPSTREAM: Custom Nodes Manager Button (Migrated to Button) -->
        <div
          v-if="managerState.shouldShowManagerButtons.value && isDesktop"
          class="pointer-events-auto flex h-12 shrink-0 items-center rounded-lg border border-interface-stroke bg-comfy-menu-bg px-2 shadow-interface"
        >
          <Button
            v-tooltip.bottom="customNodesManagerTooltipConfig"
            variant="secondary"
            size="icon"
            :aria-label="t('menu.customNodesManager')"
            @click="openCustomNodeManager"
          >
            <i class="icon-[lucide--puzzle] size-4" />
          </Button>
        </div>

        <div
          class="actionbar-container pointer-events-auto flex gap-2 h-12 items-center rounded-lg border border-interface-stroke bg-comfy-menu-bg px-2 shadow-interface"
        >
          <!-- OUR Custom Breadcrumb Layout + Actionbar -->
          <div class="flex flex-1 items-center justify-end gap-2">
            <SubgraphBreadcrumb />
            <ComfyActionbar />
          </div>
          <ActionBarButtons />

          <!-- Support for legacy topbar elements attached by custom scripts -->
          <div
            ref="legacyCommandsContainerRef"
            class="[&:not(:has(*>*:not(:empty)))]:hidden"
          ></div>

          <!-- LUMI MERGE: Migrated from IconButton to Button -->
          <Button
            v-tooltip.bottom="queueHistoryTooltipConfig"
            variant="secondary"
            size="icon"
            class="relative"
            :aria-pressed="isQueueOverlayExpanded"
            :aria-label="
              t('sideToolbar.queueProgressOverlay.expandCollapsedQueue')
            "
            @click="toggleQueueOverlay"
          >
            <i class="icon-[lucide--history] size-4" />
            <span
              v-if="queuedCount > 0"
              class="absolute -top-1 -right-1 min-w-[16px] rounded-full bg-primary-background py-0.25 text-[10px] font-medium leading-[14px] text-white"
            >
              {{ queuedCount }}
            </span>
          </Button>
          <CurrentUserButton v-if="isLoggedIn" class="shrink-0" />
          <LoginButton v-else-if="isDesktop" />
          <Button
            v-if="!isRightSidePanelOpen"
            v-tooltip.bottom="rightSidePanelTooltipConfig"
            variant="secondary"
            size="icon"
            :aria-label="t('rightSidePanel.togglePanel')"
            @click="rightSidePanelStore.togglePanel"
          >
            <i class="icon-[lucide--panel-right] size-4" />
          </Button>
        </div>
      </div>
      <QueueProgressOverlay
        v-model:expanded="isQueueOverlayExpanded"
        :menu-hovered="isTopMenuHovered"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ComfyActionbar from '@/components/actionbar/ComfyActionbar.vue'
import SubgraphBreadcrumb from '@/components/breadcrumb/SubgraphBreadcrumb.vue'
import QueueProgressOverlay from '@/components/queue/QueueProgressOverlay.vue'
import ActionBarButtons from '@/components/topbar/ActionBarButtons.vue'
import CurrentUserButton from '@/components/topbar/CurrentUserButton.vue'
import LoginButton from '@/components/topbar/LoginButton.vue'
import Button from '@/components/ui/button/Button.vue'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { useErrorHandling } from '@/composables/useErrorHandling'
import { buildTooltipConfig } from '@/composables/useTooltipConfig'
import { app } from '@/scripts/app'
import { useDockingStore } from '@/stores/dockingStore'
import { useQueueStore } from '@/stores/queueStore'
import { useRightSidePanelStore } from '@/stores/workspace/rightSidePanelStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { isElectron } from '@/utils/envUtil'
import { cn } from '@/utils/tailwindUtil'
import { useManagerState } from '@/workbench/extensions/manager/composables/useManagerState'
import { ManagerTab } from '@/workbench/extensions/manager/types/comfyManagerTypes'

const workspaceStore = useWorkspaceStore()
const rightSidePanelStore = useRightSidePanelStore()
// LUMI MERGE: Removed executionStore and commandStore since the button moved
const dockingStore = useDockingStore()
const managerState = useManagerState()
const { isLoggedIn } = useCurrentUser()
const isDesktop = isElectron()
const { t } = useI18n()
const { toastErrorHandler } = useErrorHandling()
const isQueueOverlayExpanded = ref(false)
const queueStore = useQueueStore()
const isTopMenuHovered = ref(false)
const queuedCount = computed(() => queueStore.pendingTasks.length)
const queueHistoryTooltipConfig = computed(() =>
  buildTooltipConfig(t('sideToolbar.queueProgressOverlay.viewJobHistory'))
)
const customNodesManagerTooltipConfig = computed(() =>
  buildTooltipConfig(t('menu.customNodesManager'))
)

// Right side panel toggle
const { isOpen: isRightSidePanelOpen } = storeToRefs(rightSidePanelStore)
const rightSidePanelTooltipConfig = computed(() =>
  buildTooltipConfig(t('rightSidePanel.togglePanel'))
)

// Maintain support for legacy topbar elements attached by custom scripts
const legacyCommandsContainerRef = ref<HTMLElement>()
onMounted(() => {
  if (legacyCommandsContainerRef.value) {
    app.menu.element.style.width = 'fit-content'
    legacyCommandsContainerRef.value.appendChild(app.menu.element)
  }
})

const toggleQueueOverlay = () => {
  isQueueOverlayExpanded.value = !isQueueOverlayExpanded.value
}

// LUMI MERGE: Removed cancelCurrentJob function

const actionbarClass = computed(() =>
  cn(
    'w-[200px] border-dashed border-blue-500 opacity-80',
    'm-1.5 flex items-center justify-center self-stretch',
    'rounded-md before:w-50 before:-ml-50 before:h-full',
    'pointer-events-auto',
    dockingStore.isMouseOverDropZone &&
      'border-[3px] opacity-100 scale-105 shadow-[0_0_20px] shadow-blue-500'
  )
)

const openCustomNodeManager = async () => {
  try {
    await managerState.openManager({
      initialTab: ManagerTab.All,
      showToastOnLegacyError: false
    })
  } catch (error) {
    try {
      toastErrorHandler(error)
    } catch (toastError) {
      console.error(error)
      console.error(toastError)
    }
  }
}
</script>

<style scoped>
.actionbar-container {
  background-color: var(--comfy-menu-bg);
}
</style>