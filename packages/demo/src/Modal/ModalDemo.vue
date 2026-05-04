<template>
  <PageBreadcrumb :pageTitle="currentPageTitle" />

  <div class="space-y-5 sm:space-y-6">
    <ComponentCard
      title="Modal Primitive"
      description="The raw Modal component only exposes slot content and a close event."
    >
      <div class="flex flex-wrap gap-3">
        <Button variant="primary" :onClick="() => (activeModal = 'basic')">Open modal</Button>
        <Button variant="outline" :onClick="() => (activeModal = 'custom')">Open custom modal</Button>
      </div>
    </ComponentCard>

    <ComponentCard
      title="ConfirmModal Variants"
      description="All modal variants, sizes, icon visibility, loading, and third-action support."
    >
      <div class="grid gap-4 xl:grid-cols-2">
        <ConfirmModal
          variant="confirm"
          title="Confirm action"
          message="Default confirm variant with icon."
        />
        <ConfirmModal
          variant="alert"
          title="Alert variant"
          message="Alert variant with a single confirm button."
          cancelText=""
        />
        <ConfirmModal
          variant="warning"
          title="Warning variant"
          message="Warning state with custom confirm styling."
          confirmVariant="warning"
        />
        <ConfirmModal
          variant="danger"
          title="Danger variant"
          message="Danger variant with a third button."
          confirmText="Delete"
          confirmVariant="danger"
          thirdText="Archive"
          thirdVariant="secondary"
        />
        <ConfirmModal
          variant="info"
          size="lg"
          title="Large info modal"
          message="Large size variant with informational messaging."
          confirmVariant="secondary"
        />
        <ConfirmModal
          variant="success"
          size="xl"
          title="Success without icon"
          message="showIcon=false removes the visual indicator."
          :showIcon="false"
          cancelText=""
        />
        <ConfirmModal
          variant="confirm"
          title="Loading state"
          message="The loading prop disables the action buttons."
          loading
        />
      </div>
    </ComponentCard>
  </div>

  <Modal v-if="activeModal" @close="activeModal = null">
    <template #body>
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ activeModal === 'basic' ? 'Basic modal content' : 'Custom modal content' }}
        </h3>
        <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
          The raw Modal component is responsible for the backdrop, centering, and close event.
        </p>
        <div v-if="activeModal === 'custom'" class="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            This second example shows that custom content is entirely caller-defined.
          </p>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <Button variant="outline" :onClick="() => (activeModal = null)">Close</Button>
          <Button variant="primary" :onClick="() => (activeModal = null)">Confirm</Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { Button, ComponentCard, ConfirmModal, Modal, PageBreadcrumb } from '@hivespace/shared'

const currentPageTitle = ref('Modals')
const activeModal = ref<'basic' | 'custom' | null>(null)
</script>
