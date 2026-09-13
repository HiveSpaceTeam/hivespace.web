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
        :hasCategoryAttributeManifestFile="Boolean(selectedCategoryAttributeManifestFile)"
        :hasCategoryAttributeChunkFiles="selectedCategoryAttributeChunkFiles.length > 0"
        :hasBundleFiles="selectedBundleFiles.length > 0"
        :disabled="catalogImportStore.isSubmitting"
        :categoryLoading="activeAction === 'provisionCategories'"
        :categoryAttributeLoading="activeAction === 'provisionCategoryAttributes'"
        :bundleLoading="activeAction === 'submitBundle'"
        :categoryError="categoryFileError"
        :categoryAttributeManifestError="categoryAttributeManifestFileError"
        :categoryAttributeChunkError="categoryAttributeChunkFilesError"
        :categoryAttributeFeedback="categoryAttributeFeedback"
        :bundleError="bundleFileError"
        @categoryFileChange="event => handleFileChange(event, 'category')"
        @categoryAttributeManifestFileChange="event => handleFileChange(event, 'categoryAttributeManifest')"
        @categoryAttributeChunkFilesChange="event => handleFileChange(event, 'categoryAttributeChunks')"
        @bundleFilesChange="event => handleFileChange(event, 'bundle')"
        @submitCategory="handleProvisionCategories"
        @submitCategoryAttributes="handleProvisionCategoryAttributes"
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
        :retryingJobId="retryingJobId"
        titleKey="catalogImports.sections.categoryProvisioningHistory"
        descriptionKey="catalogImports.jobs.categoryHistoryDescription"
        emptyKey="catalogImports.empty.categoryProvisioningHistory"
        @select="openJobDetail"
        @retry="handleRetryJob"
        @refresh="refreshCategoryHistory"
        @pageChange="handleCategoryHistoryPageChange"
        @pageSizeChange="handleCategoryHistoryPageSizeChange"
      />

      <CatalogImportJobHistoryTable
        :jobs="categoryAttributeProvisioningHistory"
        :pagination="categoryAttributeProvisioningHistoryPagination"
        :loading="catalogImportStore.isLoading"
        :refreshLoading="activeAction === 'refreshCategoryAttributeHistory'"
        :retryingJobId="retryingJobId"
        titleKey="catalogImports.sections.categoryAttributeProvisioningHistory"
        descriptionKey="catalogImports.jobs.categoryAttributeHistoryDescription"
        emptyKey="catalogImports.empty.categoryAttributeProvisioningHistory"
        @select="openJobDetail"
        @retry="handleRetryJob"
        @refresh="refreshCategoryAttributeHistory"
        @pageChange="handleCategoryAttributeHistoryPageChange"
        @pageSizeChange="handleCategoryAttributeHistoryPageSizeChange"
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
  CategoryAttributeChunk,
  CategoryAttributeManifest,
  CategoryAttributeManifestChunkReference,
  CatalogImportBundleSummary,
  SubmitCatalogImportBundleRequest,
  SubmitCategoryProvisioningRequest,
} from '@/types'

type UploadKind = 'category' | 'categoryAttributeManifest' | 'categoryAttributeChunks' | 'bundle'
type ListAction =
  | 'refreshBundleHistory'
  | 'refreshCategoryHistory'
  | 'refreshCategoryAttributeHistory'
  | 'refreshSelectedBundleJobs'
  | 'retryJob'
  | 'provisionCategories'
  | 'provisionCategoryAttributes'
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
  categoryAttributeProvisioningHistory,
  categoryAttributeProvisioningHistoryPagination,
  categoryAttributeProvisioningFilters,
  selectedBundleSummary,
  selectedBundleJobs,
  selectedBundleJobsPagination,
  selectedBundleJobFilters,
} = storeToRefs(catalogImportStore)

const selectedCategoryFile = ref<File | null>(null)
const selectedCategoryAttributeManifestFile = ref<File | null>(null)
const selectedCategoryAttributeChunkFiles = ref<File[]>([])
const selectedBundleFiles = ref<File[]>([])
const categoryFileError = ref<string | null>(null)
const categoryAttributeManifestFileError = ref<string | null>(null)
const categoryAttributeChunkFilesError = ref<string | null>(null)
const categoryAttributeFeedback = ref<string | null>(null)
const bundleFileError = ref<string | null>(null)
const activeAction = ref<ListAction>(null)
const retryingJobId = ref<string | null>(null)

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

const refreshCategoryAttributeHistory = async () =>
  runWithAction('refreshCategoryAttributeHistory', async () => {
    await catalogImportStore.fetchCategoryAttributeProvisioningHistory(
      categoryAttributeProvisioningFilters.value,
    )
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

const handleCategoryAttributeHistoryPageChange = async (pageNumber: number) => {
  await catalogImportStore.fetchCategoryAttributeProvisioningHistory({
    ...categoryAttributeProvisioningFilters.value,
    pageNumber,
  })
}

const handleCategoryAttributeHistoryPageSizeChange = async (pageSize: number) => {
  await catalogImportStore.fetchCategoryAttributeProvisioningHistory({
    ...categoryAttributeProvisioningFilters.value,
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

const handleRetryJob = async (jobId: string) => {
  retryingJobId.value = jobId

  try {
    const submission = await runWithAction('retryJob', async () =>
      catalogImportStore.retryJob(jobId),
    )
    openJobDetail(submission.jobId)
  } finally {
    retryingJobId.value = null
  }
}

const handleFileChange = (event: Event, kind: UploadKind) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (kind === 'category') {
    selectedCategoryFile.value = file
    categoryFileError.value = null
    return
  }

  if (kind === 'categoryAttributeManifest') {
    selectedCategoryAttributeManifestFile.value = file
    categoryAttributeManifestFileError.value = null
    categoryAttributeFeedback.value = null
    return
  }

  if (kind === 'categoryAttributeChunks') {
    selectedCategoryAttributeChunkFiles.value = Array.from(input.files ?? [])
    categoryAttributeChunkFilesError.value = null
    categoryAttributeFeedback.value = null
    return
  }

  selectedBundleFiles.value = Array.from(input.files ?? [])
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
    } else if (kind === 'categoryAttributeManifest') {
      categoryAttributeManifestFileError.value = message
    } else if (kind === 'categoryAttributeChunks') {
      categoryAttributeChunkFilesError.value = message
    } else {
      bundleFileError.value = message
    }
    return null
  }
}

const readJsonFiles = async <T>(files: File[], kind: UploadKind): Promise<T[] | null> => {
  try {
    return await Promise.all(files.map(async file => JSON.parse(await readFileText(file)) as T))
  } catch {
    const message = t('catalogImports.upload.invalidJson')
    if (kind === 'categoryAttributeChunks') {
      categoryAttributeChunkFilesError.value = message
    } else if (kind === 'bundle') {
      bundleFileError.value = message
    }
    return null
  }
}

const findManifestChunkReference = (
  manifest: CategoryAttributeManifest,
  chunkFile: File,
  chunk: CategoryAttributeChunk,
) =>
  manifest.chunks.find(
    (manifestChunk: CategoryAttributeManifestChunkReference) =>
      manifestChunk.fileName === chunkFile.name ||
      manifestChunk.sourceFingerprint === chunk.crawl.sourceFingerprint ||
      manifestChunk.chunkIndex === chunk.crawl.chunkIndex,
  )

const filterProvisionableChunk = (chunk: CategoryAttributeChunk): CategoryAttributeChunk => ({
  ...chunk,
  categories: chunk.categories.filter(category => category.attributes.length > 0),
})

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

const handleProvisionCategoryAttributes = async () => {
  const manifest = await readJsonFile<CategoryAttributeManifest>(
    selectedCategoryAttributeManifestFile.value,
    'categoryAttributeManifest',
  )
  if (!manifest) return

  const chunks = await readJsonFiles<CategoryAttributeChunk>(
    selectedCategoryAttributeChunkFiles.value,
    'categoryAttributeChunks',
  )
  if (!chunks) return

  const selectedChunkEntries = selectedCategoryAttributeChunkFiles.value
    .map((file, index) => ({ file, chunk: chunks[index] }))
    .filter(
      (
        entry,
      ): entry is {
        file: File
        chunk: CategoryAttributeChunk
      } => Boolean(entry.chunk),
    )

  let submittedChunkCount = 0
  let skippedChunkCount = 0
  let filteredCategoryCount = 0

  await runWithAction('provisionCategoryAttributes', async () => {
    for (const entry of selectedChunkEntries) {
      const manifestChunk = findManifestChunkReference(manifest, entry.file, entry.chunk)
      if (!manifestChunk) {
        skippedChunkCount += 1
        continue
      }

      const filteredChunk = filterProvisionableChunk(entry.chunk)
      filteredCategoryCount += entry.chunk.categories.length - filteredChunk.categories.length

      if (filteredChunk.categories.length === 0) {
        skippedChunkCount += 1
        continue
      }

      await catalogImportStore.provisionCategoryAttributes(filteredChunk, entry.file.name)
      submittedChunkCount += 1
    }
  })

  categoryAttributeFeedback.value =
    submittedChunkCount > 0
      ? t('catalogImports.upload.categoryAttributeQueueSummary', {
          submitted: submittedChunkCount,
          skipped: skippedChunkCount,
          filtered: filteredCategoryCount,
        })
      : null

  if (submittedChunkCount === 0) {
    categoryAttributeChunkFilesError.value = t(
      'catalogImports.upload.noProvisionableCategoryAttributeChunks',
    )
  }

  selectedCategoryAttributeManifestFile.value = null
  selectedCategoryAttributeChunkFiles.value = []
}

const handleSubmitBundle = async () => {
  const bundleEntries: Array<{ fileName: string; payload: SubmitCatalogImportBundleRequest }> = []

  for (const file of selectedBundleFiles.value) {
    const payload = await readJsonFile<SubmitCatalogImportBundleRequest>(file, 'bundle')
    if (!payload) return

    bundleEntries.push({ fileName: file.name, payload })
  }

  try {
    await runWithAction('submitBundle', async () => {
      for (const entry of bundleEntries) {
        await catalogImportStore.submitBundle(entry.payload, entry.fileName)
      }
    })
    selectedBundleFiles.value = []
  } catch {
    return
  }
}

onMounted(async () => {
  await Promise.all([
    refreshBundleHistory(),
    refreshCategoryHistory(),
    refreshCategoryAttributeHistory(),
  ])
})
</script>
