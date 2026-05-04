<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Spinner Variants"
      description="All public spinner sizes."
    >
      <div class="flex flex-wrap items-center gap-6">
        <div v-for="size in spinnerSizes" :key="size" class="flex items-center gap-3">
          <Spinner :size="size" />
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ size }}</span>
        </div>
      </div>
    </ComponentCard>

    <ComponentCard
      title="FullscreenLoader"
      description="Visibility and optional message states."
    >
      <div class="flex flex-wrap gap-3">
        <Button variant="primary" :onClick="() => openLoader('Syncing data...')">Show with message</Button>
        <Button variant="outline" :onClick="() => openLoader(undefined)">Show without message</Button>
      </div>
      <FullscreenLoader :visible="loaderVisible" :message="loaderMessage" />
    </ComponentCard>

    <ComponentCard
      title="Direct Toast Variants"
      description="Toast rendered directly for each supported variant."
    >
      <div class="grid gap-4 md:grid-cols-2">
        <Toast
          v-for="toast in directToasts"
          :key="toast.id"
          v-bind="toast"
          @close="handleDirectToastClose"
          @navigate="lastToastEvent = $event"
        />
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">last toast event: {{ lastToastEvent }}</p>
    </ComponentCard>

    <ComponentCard
      title="ToastContainer"
      description="Container-managed stack with add and clear interactions."
    >
      <div class="flex flex-wrap gap-3">
        <Button variant="success" :onClick="() => addContainerToast('success')">Add success</Button>
        <Button variant="danger" :onClick="() => addContainerToast('error')">Add error</Button>
        <Button variant="warning" :onClick="() => addContainerToast('warning')">Add warning</Button>
        <Button variant="secondary" :onClick="() => addContainerToast('info')">Add info</Button>
        <Button variant="outline" :onClick="clearContainerToasts">Clear</Button>
      </div>
      <ToastContainer :toasts="containerToasts" @removeToast="removeContainerToast" />
    </ComponentCard>

    <ComponentCard
      title="NotificationPreviewToast"
      description="Interactive in-app notification preview with dismiss and click events."
    >
      <div class="flex flex-wrap gap-3">
        <Button variant="primary" :onClick="addPreviewToast">Add preview notification</Button>
        <Button variant="outline" :onClick="clearPreviewToasts">Clear previews</Button>
      </div>
      <NotificationPreviewToast
        :toasts="previewToasts"
        @dismiss="dismissPreviewToast"
        @click="lastPreviewClick = $event"
      />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        last preview click: {{ lastPreviewClick || 'none' }}
      </p>
    </ComponentCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import {
  Button,
  ComponentCard,
  FullscreenLoader,
  NotificationPreviewToast,
  PageBreadcrumb,
  Spinner,
  Toast,
  ToastContainer,
} from '@hivespace/shared'
import type { InAppNotification } from '@hivespace/shared'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

const currentPageTitle = ref('Feedback And Toasts')
const lastToastEvent = ref('')
const lastPreviewClick = ref('')
const loaderVisible = ref(false)
const loaderMessage = ref<string | undefined>()

const spinnerSizes = ['sm', 'md', 'lg'] as const

const directToasts = [
  {
    id: 'direct-success',
    variant: 'success' as ToastVariant,
    title: 'Success',
    message: 'This direct toast uses the success variant.',
    duration: 0,
    showProgress: false,
  },
  {
    id: 'direct-error',
    variant: 'error' as ToastVariant,
    title: 'Error with link',
    message: 'Link and close events are both public API surfaces.',
    duration: 0,
    showLink: true,
    linkHref: '/demo/navigation-actions',
    linkText: 'Open navigation demos',
    showProgress: false,
  },
  {
    id: 'direct-warning',
    variant: 'warning' as ToastVariant,
    title: 'Warning',
    message: 'Progress is enabled on this direct warning toast.',
    duration: 8000,
    showProgress: true,
  },
  {
    id: 'direct-info',
    variant: 'info' as ToastVariant,
    title: 'Info',
    message: 'The info toast demonstrates the fourth supported variant.',
    duration: 0,
    showProgress: false,
  },
]

const containerToasts = ref<
  { id: string; type: ToastVariant; title: string; message: string; duration?: number }[]
>([])

const previewToasts = ref<InAppNotification[]>([
  {
    id: 'preview-1',
    eventType: 'catalog.updated',
    message: 'A seller updated the featured product collection.',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
])

const openLoader = (message?: string) => {
  loaderMessage.value = message
  loaderVisible.value = true
  setTimeout(() => {
    loaderVisible.value = false
  }, 1500)
}

const handleDirectToastClose = (id: string) => {
  lastToastEvent.value = `closed ${id}`
}

const addContainerToast = (type: ToastVariant) => {
  containerToasts.value = [
    ...containerToasts.value,
    {
      id: `${type}-${Date.now()}`,
      type,
      title: `${type} toast`,
      message: `Container toast using the ${type} type prop.`,
      duration: 4000,
    },
  ]
}

const removeContainerToast = (id: string) => {
  containerToasts.value = containerToasts.value.filter((toast) => toast.id !== id)
}

const clearContainerToasts = () => {
  containerToasts.value = []
}

const addPreviewToast = () => {
  previewToasts.value = [
    ...previewToasts.value,
    {
      id: `preview-${Date.now()}`,
      eventType: 'order.created',
      message: 'A new storefront order requires seller confirmation.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ]
}

const dismissPreviewToast = (id: string) => {
  previewToasts.value = previewToasts.value.filter((toast) => toast.id !== id)
}

const clearPreviewToasts = () => {
  previewToasts.value = []
}
</script>
