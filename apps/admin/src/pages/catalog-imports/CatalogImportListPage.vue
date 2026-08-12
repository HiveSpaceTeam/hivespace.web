<template>
  <AppShell>
    <PageBreadcrumb :pageTitle="$t('catalogImports.list.title')">
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t('catalogImports.list.description') }}
      </p>
    </PageBreadcrumb>

    <div class="space-y-5">
      <CatalogImportUploadPanel
        :hasCategoryFile="Boolean(selectedCategoryFile)"
        :hasBundleFile="Boolean(selectedBundleFile)"
        :disabled="catalogImportStore.isSubmitting"
        :categoryLoading="activeAction === 'provisionCategories'"
        :bundleLoading="activeAction === 'submitBundle'"
        :categoryError="categoryFileError"
        :bundleError="bundleFileError"
        @categoryFileChange="event => handleFileChange(event, 'category')"
        @bundleFileChange="event => handleFileChange(event, 'bundle')"
        @submitCategory="handleProvisionCategories"
        @submitBundle="handleSubmitBundle"
      />

      <div class="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <CatalogImportBundleHistoryTable
          :bundles="bundleHistory"
          :pagination="bundleHistoryPagination"
          :loading="catalogImportStore.isLoading"
          :refreshLoading="activeAction === 'refreshBundleHistory'"
          @select="handleBundleSelect"
          @refresh="refreshBundleHistory"
          @pageChange="handleBundlePageChange"
          @pageSizeChange="handleBundlePageSizeChange"
        />

        <CatalogImportRelatedJobsPane
          :selectedBundle="selectedBundleSummary"
          :jobs="selectedBundleJobs"
          :pagination="selectedBundleJobsPagination"
          :loading="catalogImportStore.isLoading"
          @openJob="openJobDetail"
          @pageChange="handleSelectedBundleJobPageChange"
          @pageSizeChange="handleSelectedBundleJobPageSizeChange"
        />
      </div>

      <CatalogImportJobHistoryTable
        :jobs="categoryProvisioningHistory"
        :pagination="categoryProvisioningHistoryPagination"
        :loading="catalogImportStore.isLoading"
        :refreshLoading="activeAction === 'refreshCategoryHistory'"
        titleKey="catalogImports.sections.categoryProvisioningHistory"
        descriptionKey="catalogImports.jobs.categoryHistoryDescription"
        emptyKey="catalogImports.empty.categoryProvisioningHistory"
        @select="openJobDetail"
        @refresh="refreshCategoryHistory"
        @pageChange="handleCategoryHistoryPageChange"
        @pageSizeChange="handleCategoryHistoryPageSizeChange"
      />
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AppShell, PageBreadcrumb } from '@hivespace/shared'
import CatalogImportBundleHistoryTable from '@/components/catalog-imports/CatalogImportBundleHistoryTable.vue'
import CatalogImportJobHistoryTable from '@/components/catalog-imports/CatalogImportJobHistoryTable.vue'
import CatalogImportRelatedJobsPane from '@/components/catalog-imports/CatalogImportRelatedJobsPane.vue'
import CatalogImportUploadPanel from '@/components/catalog-imports/CatalogImportUploadPanel.vue'
import { useCatalogImportStore } from '@/stores/catalog-import.store'
import type {
  CatalogImportBundleSummary,
  SubmitCatalogImportBundleRequest,
  SubmitCategoryProvisioningRequest,
} from '@/types'

type UploadKind = 'category' | 'bundle'
type ListAction =
  | 'refreshBundleHistory'
  | 'refreshCategoryHistory'
  | 'refreshSelectedBundleJobs'
  | 'provisionCategories'
  | 'submitBundle'
  | null

const { t } = useI18n()
const router = useRouter()
const catalogImportStore = useCatalogImportStore()
const {
  bundleHistory,
  bundleHistoryPagination,
  bundleFilters,
  categoryProvisioningHistory,
  categoryProvisioningHistoryPagination,
  categoryProvisioningFilters,
  selectedBundleSummary,
  selectedBundleJobs,
  selectedBundleJobsPagination,
  selectedBundleJobFilters,
} = storeToRefs(catalogImportStore)

const selectedCategoryFile = ref<File | null>(null)
const selectedBundleFile = ref<File | null>(null)
const categoryFileError = ref<string | null>(null)
const bundleFileError = ref<string | null>(null)
const activeAction = ref<ListAction>(null)

const runWithAction = async <T>(action: Exclude<ListAction, null>, task: () => Promise<T>) => {
  activeAction.value = action

  try {
    return await task()
  } finally {
    activeAction.value = null
  }
}

const refreshBundleHistory = async () =>
  runWithAction('refreshBundleHistory', async () => {
    await catalogImportStore.fetchBundleHistory(bundleFilters.value)
  })

const refreshCategoryHistory = async () =>
  runWithAction('refreshCategoryHistory', async () => {
    await catalogImportStore.fetchCategoryProvisioningHistory(categoryProvisioningFilters.value)
  })

const handleBundlePageChange = async (pageNumber: number) => {
  await catalogImportStore.fetchBundleHistory({ ...bundleFilters.value, pageNumber })
}

const handleBundlePageSizeChange = async (pageSize: number) => {
  await catalogImportStore.fetchBundleHistory({ ...bundleFilters.value, pageNumber: 1, pageSize })
}

const handleCategoryHistoryPageChange = async (pageNumber: number) => {
  await catalogImportStore.fetchCategoryProvisioningHistory({
    ...categoryProvisioningFilters.value,
    pageNumber,
  })
}

const handleCategoryHistoryPageSizeChange = async (pageSize: number) => {
  await catalogImportStore.fetchCategoryProvisioningHistory({
    ...categoryProvisioningFilters.value,
    pageNumber: 1,
    pageSize,
  })
}

const handleSelectedBundleJobPageChange = async (pageNumber: number) => {
  if (!selectedBundleSummary.value) return

  await catalogImportStore.fetchSelectedBundleJobs(selectedBundleSummary.value.bundleId, {
    ...selectedBundleJobFilters.value,
    pageNumber,
  })
}

const handleSelectedBundleJobPageSizeChange = async (pageSize: number) => {
  if (!selectedBundleSummary.value) return

  await catalogImportStore.fetchSelectedBundleJobs(selectedBundleSummary.value.bundleId, {
    ...selectedBundleJobFilters.value,
    pageNumber: 1,
    pageSize,
  })
}

const handleBundleSelect = async (bundle: CatalogImportBundleSummary) => {
  catalogImportStore.setSelectedBundleSummary(bundle)
  await runWithAction('refreshSelectedBundleJobs', async () => {
    await catalogImportStore.fetchSelectedBundleJobs(bundle.bundleId, { pageNumber: 1, pageSize: 10 })
  })
}

const openJobDetail = (jobId: string) => {
  void router.push(`/catalog-imports/jobs/${jobId}`)
}

const handleFileChange = (event: Event, kind: UploadKind) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (kind === 'category') {
    selectedCategoryFile.value = file
    categoryFileError.value = null
    return
  }

  selectedBundleFile.value = file
  bundleFileError.value = null
}

const readFileText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })

const readJsonFile = async <T>(file: File | null, kind: UploadKind): Promise<T | null> => {
  if (!file) return null

  try {
    return JSON.parse(await readFileText(file)) as T
  } catch {
    const message = t('catalogImports.upload.invalidJson')
    if (kind === 'category') {
      categoryFileError.value = message
    } else {
      bundleFileError.value = message
    }
    return null
  }
}

const handleProvisionCategories = async () => {
  const payload = await readJsonFile<SubmitCategoryProvisioningRequest>(
    selectedCategoryFile.value,
    'category',
  )
  if (!payload) return

  await runWithAction('provisionCategories', async () => {
    await catalogImportStore.provisionCategories(payload, selectedCategoryFile.value?.name)
  })
  selectedCategoryFile.value = null
}

const handleSubmitBundle = async () => {
  const payload = await readJsonFile<SubmitCatalogImportBundleRequest>(
    selectedBundleFile.value,
    'bundle',
  )
  if (!payload) return

  await runWithAction('submitBundle', async () => {
    await catalogImportStore.submitBundle(payload, selectedBundleFile.value?.name)
  })
  selectedBundleFile.value = null
}

onMounted(async () => {
  await Promise.all([refreshBundleHistory(), refreshCategoryHistory()])
})
</script>
