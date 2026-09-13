import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import CatalogImportListPage from './CatalogImportListPage.vue'
import { catalogImportService } from '@/services/catalog-import.service'

const mockSetLoading = jest.fn()

jest.mock('@/services/catalog-import.service', () => ({
  catalogImportService: {
    provisionCategories: jest.fn(),
    provisionCategoryAttributes: jest.fn(),
    submitBundle: jest.fn(),
    retryJob: jest.fn(),
    listBundles: jest.fn(),
    listJobs: jest.fn(),
    getBundleSummary: jest.fn(),
  },
}))

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getCategories: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    AppShell: { template: '<div><slot /></div>' },
    PageBreadcrumb: {
      template: '<div><h2>{{ pageTitle }}</h2><slot /></div>',
      props: ['pageTitle'],
    },
    Button: {
      template:
        '<button :type="type ?? \'button\'" :disabled="disabled || loading" :data-loading="loading ? \'true\' : undefined" @click="onClick && onClick()"><slot /></button>',
      props: ['type', 'variant', 'size', 'disabled', 'loading', 'onClick'],
    },
    Badge: { template: '<span><slot /></span>', props: ['color'] },
    Spinner: { template: '<div />' },
    Pagination: {
      template:
        '<div><button type="button" @click="$emit(\'pageChange\', 2)">Next page</button></div>',
      props: ['currentPage', 'totalPages', 'pageSize', 'totalItems'],
      emits: ['pageChange', 'pageSizeChange'],
    },
    useFormatDate: () => ({
      formatDateTime: (value: string) => `formatted:${value}`,
      formatRelativeTime: (value: string) => `relative:${value}`,
    }),
    useAppStore: () => ({
      setLoading: mockSetLoading,
      notifySuccess: jest.fn(),
      notifyError: jest.fn(),
    }),
  }
})

const createDeferred = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

const bundleHistoryResponse = {
  data: [
    {
      bundleId: 'bundle-001',
      status: 'PartiallyImported',
      sourceFileName: 'bundle.json',
      source: { system: 'tiki', type: 'category', value: '1846' },
      crawl: {
        startedAt: '2026-08-04T09:00:00Z',
        completedAt: '2026-08-04T10:00:00Z',
        sourceFingerprint: 'sha256:bundle-001',
      },
      summary: {
        totalProducts: 20,
        readyProducts: 5,
        blockedProducts: 3,
        warningCount: 2,
        duplicateCount: 1,
      },
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

const selectedBundleJobsResponse = {
  data: [
    {
      jobId: 'job-001',
      status: 'Pending',
      operationType: 'SubmitBundle',
      sourceFileName: 'bundle.json',
      requestedAt: '2026-08-04T10:00:00Z',
      progress: { total: 20, processed: 0 },
      bundleId: 'bundle-001',
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

const categoryHistoryResponse = {
  data: [
    {
      jobId: 'job-categories',
      status: 'Completed',
      operationType: 'ProvisionCategories',
      sourceFileName: 'categories.json',
      requestedAt: '2026-08-03T10:00:00Z',
      progress: { total: 6101, processed: 6101 },
      bundleId: null,
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

const categoryAttributeHistoryResponse = {
  data: [
    {
      jobId: 'job-category-attributes',
      status: 'Failed',
      operationType: 'ProvisionCategoryAttributes',
      sourceFileName: 'chunk-0001.json',
      requestedAt: '2026-08-03T11:00:00Z',
      progress: { total: 62, processed: 62 },
      bundleId: null,
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

const renderPage = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  i18n.global.locale.value = 'en'
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/catalog-imports', component: CatalogImportListPage },
      { path: '/catalog-imports/jobs/:jobId', component: { template: '<div />' } },
    ],
  })
  await router.push('/catalog-imports')
  await router.isReady()

  const result = render(CatalogImportListPage, {
    global: {
      plugins: [pinia, i18n, router],
    },
  })

  return { ...result, router }
}

describe('CatalogImportListPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    jest.mocked(catalogImportService.listBundles).mockResolvedValue(bundleHistoryResponse)
    jest.mocked(catalogImportService.listJobs).mockImplementation(
      async (query?: { bundleId?: string; operationType?: string }) => {
        if (query?.bundleId === 'bundle-001') {
          return selectedBundleJobsResponse
        }

        if (query?.operationType === 'ProvisionCategories') {
          return categoryHistoryResponse
        }

        if (query?.operationType === 'ProvisionCategoryAttributes') {
          return categoryAttributeHistoryResponse
        }

        return selectedBundleJobsResponse
      },
    )
    jest.mocked(catalogImportService.getBundleSummary).mockResolvedValue(bundleHistoryResponse.data[0]!)
    jest.mocked(catalogImportService.provisionCategories).mockResolvedValue({
      jobId: 'job-categories',
      status: 'Pending',
      operationType: 'ProvisionCategories',
      sourceFileName: 'categories.json',
    })
    jest.mocked(catalogImportService.provisionCategoryAttributes).mockResolvedValue({
      jobId: 'job-category-attributes',
      status: 'Pending',
      operationType: 'ProvisionCategoryAttributes',
      sourceFileName: 'chunk-0001.json',
    })
    jest.mocked(catalogImportService.submitBundle).mockResolvedValue({
      jobId: 'job-bundle',
      status: 'Pending',
      operationType: 'SubmitBundle',
      sourceFileName: 'bundle.json',
      bundleId: null,
    })
    jest.mocked(catalogImportService.retryJob).mockResolvedValue({
      jobId: 'job-category-attributes-retry',
      status: 'Pending',
      operationType: 'ProvisionCategoryAttributes',
      sourceFileName: 'chunk-0001.json',
      bundleId: null,
    })
  })

  it('should render category and product upload controls on the list page', async () => {
    await renderPage()

    expect(await screen.findByRole('heading', { name: 'Catalog Imports' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { name: 'Catalog Imports' })).toHaveLength(1)
    expect(screen.getByText(i18n.global.t('catalogImports.list.description'))).toBeTruthy()
    expect(
      await screen.findByLabelText(i18n.global.t('catalogImports.upload.categoryLabel')),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryAttributeManifestLabel')),
    ).toBeTruthy()
    expect(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryAttributeChunksLabel')),
    ).toBeTruthy()
    const bundleInput = screen.getByLabelText(i18n.global.t('catalogImports.upload.bundleLabel'))
    expect(bundleInput).toBeTruthy()
    expect(bundleInput.getAttribute('multiple')).toBe('')
  })

  it('should render paginated all-operation job history on the list page', async () => {
    await renderPage()

    expect(await screen.findByText('bundle-001')).toBeTruthy()
    expect(screen.getByText('bundle.json')).toBeTruthy()
    expect(screen.getByText(i18n.global.t('catalogImports.bundleStatuses.PartiallyImported'))).toBeTruthy()
    expect(screen.getByText(i18n.global.t('catalogImports.sections.bundleHistory'))).toBeTruthy()
  })

  it('should open the selected bundle side pane without collapsing the main bundle table', async () => {
    await renderPage()

    await fireEvent.click(await screen.findByRole('button', { name: 'bundle-001' }))

    await waitFor(() => {
      expect(catalogImportService.listJobs).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 10,
        bundleId: 'bundle-001',
      })
    })
    expect(screen.getByText(i18n.global.t('catalogImports.sections.relatedJobs'))).toBeTruthy()
    expect(screen.getAllByText('bundle-001').length).toBeGreaterThan(1)
  })

  it('should navigate to job detail when a related job row is clicked from the side pane', async () => {
    const { router } = await renderPage()

    await fireEvent.click((await screen.findAllByRole('button', { name: 'bundle-001' }))[0]!)
    await waitFor(() => {
      expect(catalogImportService.listJobs).toHaveBeenCalledWith({
        pageNumber: 1,
        pageSize: 10,
        bundleId: 'bundle-001',
      })
    })
    await waitFor(() => {
      expect(
        screen.queryByText(i18n.global.t('catalogImports.empty.relatedJobsSelection')),
      ).toBeNull()
    })
    const jobLabel = await screen.findByText('job-001')
    await fireEvent.click(jobLabel.closest('button')!)

    await waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/catalog-imports/jobs/job-001')
    })
  })

  it('should preserve source file name on upload-created job submissions', async () => {
    await renderPage()
    const payload = {
      schemaVersion: '2026-07-30',
      source: { system: 'tiki', type: 'sellercenter_categories', value: 'parent:2' },
      crawl: {
        startedAt: '2026-07-30T10:00:00Z',
        completedAt: '2026-07-30T10:05:00Z',
        sourceFingerprint: 'sha256:categories',
      },
      categories: [{ externalCategoryId: '1846', name: 'Nha sach Tiki' }],
    }
    const file = new File([JSON.stringify(payload)], 'categories.json', {
      type: 'application/json',
    })

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryLabel')),
      { target: { files: [file] } },
    )
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.actions.provisionCategories'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.provisionCategories).toHaveBeenCalledWith(
        payload,
        'categories.json',
      )
    })
  })

  it('should show loading on the clicked category upload button', async () => {
    const deferred = createDeferred<{
      jobId: string
      status: string
      operationType: string
      sourceFileName: string
    }>()
    jest.mocked(catalogImportService.provisionCategories).mockReturnValueOnce(
      deferred.promise as ReturnType<typeof catalogImportService.provisionCategories>,
    )

    await renderPage()
    const payload = {
      schemaVersion: '2026-07-30',
      source: { system: 'tiki', type: 'sellercenter_categories', value: 'parent:2' },
      crawl: {
        startedAt: '2026-07-30T10:00:00Z',
        completedAt: '2026-07-30T10:05:00Z',
        sourceFingerprint: 'sha256:categories',
      },
      categories: [{ externalCategoryId: '1846', name: 'Nha sach Tiki' }],
    }
    const file = new File([JSON.stringify(payload)], 'categories.json', {
      type: 'application/json',
    })

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryLabel')),
      { target: { files: [file] } },
    )

    const categoryButton = screen.getByRole('button', {
      name: i18n.global.t('catalogImports.actions.provisionCategories'),
    })
    await fireEvent.click(categoryButton)

    await waitFor(() => {
      expect(categoryButton.getAttribute('data-loading')).toBe('true')
    })

    deferred.resolve({
      jobId: 'job-categories',
      status: 'Pending',
      operationType: 'ProvisionCategories',
      sourceFileName: 'categories.json',
    })

    await waitFor(() => {
      expect(categoryButton.getAttribute('data-loading')).toBeNull()
    })
  })

  it('should show loading on the refresh history button while reloading jobs', async () => {
    const deferred = createDeferred<typeof bundleHistoryResponse>()
    jest.mocked(catalogImportService.listBundles)
      .mockResolvedValueOnce(bundleHistoryResponse)
      .mockReturnValueOnce(deferred.promise as ReturnType<typeof catalogImportService.listBundles>)

    await renderPage()

    const refreshButton = screen.getAllByRole('button', {
      name: i18n.global.t('catalogImports.actions.refresh'),
    })[0]
    await fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(refreshButton.getAttribute('data-loading')).toBe('true')
    })

    deferred.resolve(bundleHistoryResponse)

    await waitFor(() => {
      expect(refreshButton.getAttribute('data-loading')).toBeNull()
    })
  })

  it('should render separate category provisioning upload history on the list page', async () => {
    await renderPage()

    expect(
      await screen.findByText(i18n.global.t('catalogImports.sections.categoryProvisioningHistory')),
    ).toBeTruthy()
    expect(screen.getByText('job-categories')).toBeTruthy()
    expect(screen.getByText('categories.json')).toBeTruthy()
  })

  it('should render separate category attribute provisioning upload history on the list page', async () => {
    await renderPage()

    expect(
      await screen.findByText(
        i18n.global.t('catalogImports.sections.categoryAttributeProvisioningHistory'),
      ),
    ).toBeTruthy()
    expect(screen.getByText('job-category-attributes')).toBeTruthy()
    expect(screen.getByText('chunk-0001.json')).toBeTruthy()
  })

  it('should submit bundle files individually with matching source file names', async () => {
    await renderPage()
    const firstPayload = {
      schemaVersion: '2026-08-20',
      source: { system: 'tiki', type: 'search', value: 'laptop' },
      crawl: {
        startedAt: '2026-08-20T10:00:00Z',
        completedAt: '2026-08-20T10:05:00Z',
        sourceFingerprint: 'sha256:bundle-1',
      },
      sellers: [],
      products: [],
      validationHints: [],
    }
    const secondPayload = {
      schemaVersion: '2026-08-21',
      source: { system: 'tiki', type: 'search', value: 'phone' },
      crawl: {
        startedAt: '2026-08-21T10:00:00Z',
        completedAt: '2026-08-21T10:05:00Z',
        sourceFingerprint: 'sha256:bundle-2',
      },
      sellers: [],
      products: [],
      validationHints: [],
    }

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.bundleLabel')),
      {
        target: {
          files: [
            new File([JSON.stringify(firstPayload)], 'bundle-1.json', {
              type: 'application/json',
            }),
            new File([JSON.stringify(secondPayload)], 'bundle-2.json', {
              type: 'application/json',
            }),
          ],
        },
      },
    )
    const bundleButton = screen.getByRole('button', {
      name: i18n.global.t('catalogImports.upload.bundleAction'),
    })
    await waitFor(() => {
      expect(bundleButton.hasAttribute('disabled')).toBe(false)
    })
    await fireEvent.click(bundleButton)

    await waitFor(() => {
      expect(catalogImportService.submitBundle).toHaveBeenNthCalledWith(
        1,
        firstPayload,
        'bundle-1.json',
      )
      expect(catalogImportService.submitBundle).toHaveBeenNthCalledWith(
        2,
        secondPayload,
        'bundle-2.json',
      )
    })
  })

  it('should not submit any bundle jobs when one selected bundle file has invalid json', async () => {
    await renderPage()

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.bundleLabel')),
      {
        target: {
          files: [
            new File(['{"schemaVersion":"2026-08-20"}'], 'bundle-1.json', {
              type: 'application/json',
            }),
            new File(['{invalid-json'], 'bundle-2.json', {
              type: 'application/json',
            }),
          ],
        },
      },
    )
    const bundleButton = screen.getByRole('button', {
      name: i18n.global.t('catalogImports.upload.bundleAction'),
    })
    await waitFor(() => {
      expect(bundleButton.hasAttribute('disabled')).toBe(false)
    })
    await fireEvent.click(bundleButton)

    await waitFor(() => {
      expect(
        screen.getByText(i18n.global.t('catalogImports.upload.invalidJson')),
      ).toBeTruthy()
    })
    expect(catalogImportService.submitBundle).not.toHaveBeenCalled()
  })

  it('should stop bundle queueing after the first submit failure', async () => {
    await renderPage()
    const firstPayload = {
      schemaVersion: '2026-08-20',
      source: { system: 'tiki', type: 'search', value: 'laptop' },
      crawl: {
        startedAt: '2026-08-20T10:00:00Z',
        completedAt: '2026-08-20T10:05:00Z',
        sourceFingerprint: 'sha256:bundle-1',
      },
      sellers: [],
      products: [],
      validationHints: [],
    }
    const secondPayload = {
      schemaVersion: '2026-08-21',
      source: { system: 'tiki', type: 'search', value: 'phone' },
      crawl: {
        startedAt: '2026-08-21T10:00:00Z',
        completedAt: '2026-08-21T10:05:00Z',
        sourceFingerprint: 'sha256:bundle-2',
      },
      sellers: [],
      products: [],
      validationHints: [],
    }
    const thirdPayload = {
      schemaVersion: '2026-08-22',
      source: { system: 'tiki', type: 'search', value: 'tablet' },
      crawl: {
        startedAt: '2026-08-22T10:00:00Z',
        completedAt: '2026-08-22T10:05:00Z',
        sourceFingerprint: 'sha256:bundle-3',
      },
      sellers: [],
      products: [],
      validationHints: [],
    }

    jest.mocked(catalogImportService.submitBundle)
      .mockResolvedValueOnce({
        jobId: 'job-bundle-1',
        status: 'Pending',
        operationType: 'SubmitBundle',
        sourceFileName: 'bundle-1.json',
        bundleId: null,
      })
      .mockRejectedValueOnce(new Error('submit failed'))

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.bundleLabel')),
      {
        target: {
          files: [
            new File([JSON.stringify(firstPayload)], 'bundle-1.json', {
              type: 'application/json',
            }),
            new File([JSON.stringify(secondPayload)], 'bundle-2.json', {
              type: 'application/json',
            }),
            new File([JSON.stringify(thirdPayload)], 'bundle-3.json', {
              type: 'application/json',
            }),
          ],
        },
      },
    )
    const bundleButton = screen.getByRole('button', {
      name: i18n.global.t('catalogImports.upload.bundleAction'),
    })
    await waitFor(() => {
      expect(bundleButton.hasAttribute('disabled')).toBe(false)
    })
    await fireEvent.click(bundleButton)

    await waitFor(() => {
      expect(catalogImportService.submitBundle).toHaveBeenCalledTimes(2)
    })
    expect(catalogImportService.submitBundle).toHaveBeenNthCalledWith(
      1,
      firstPayload,
      'bundle-1.json',
    )
    expect(catalogImportService.submitBundle).toHaveBeenNthCalledWith(
      2,
      secondPayload,
      'bundle-2.json',
    )
    expect(catalogImportService.submitBundle).not.toHaveBeenCalledWith(
      thirdPayload,
      'bundle-3.json',
    )
  })

  it('should show retry only for failed history rows and navigate to the new job when clicked', async () => {
    const { router } = await renderPage()

    const retryButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.retryJob'),
    })

    await fireEvent.click(retryButton)

    await waitFor(() => {
      expect(catalogImportService.retryJob).toHaveBeenCalledWith('job-category-attributes')
    })

    await waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/catalog-imports/jobs/job-category-attributes-retry')
    })
  })

  it('should not navigate to job detail when retry is clicked from a history row', async () => {
    const deferred = createDeferred<{
      jobId: string
      status: string
      operationType: string
      sourceFileName: string
      bundleId: null
    }>()
    jest.mocked(catalogImportService.retryJob).mockReturnValueOnce(
      deferred.promise as ReturnType<typeof catalogImportService.retryJob>,
    )

    const { router } = await renderPage()

    const retryButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.retryJob'),
    })

    await fireEvent.click(retryButton)

    expect(router.currentRoute.value.fullPath).toBe('/catalog-imports')

    deferred.resolve({
      jobId: 'job-category-attributes-retry',
      status: 'Pending',
      operationType: 'ProvisionCategoryAttributes',
      sourceFileName: 'chunk-0001.json',
      bundleId: null,
    })
  })

  it('should show retry loading only for the clicked failed history row', async () => {
    const deferred = createDeferred<{
      jobId: string
      status: string
      operationType: string
      sourceFileName: string
      bundleId: null
    }>()
    jest.mocked(catalogImportService.retryJob).mockReturnValueOnce(
      deferred.promise as ReturnType<typeof catalogImportService.retryJob>,
    )

    await renderPage()

    const retryButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.retryJob'),
    })
    await fireEvent.click(retryButton)

    await waitFor(() => {
      expect(retryButton.getAttribute('data-loading')).toBe('true')
    })

    deferred.resolve({
      jobId: 'job-category-attributes-retry',
      status: 'Pending',
      operationType: 'ProvisionCategoryAttributes',
      sourceFileName: 'chunk-0001.json',
      bundleId: null,
    })

    await waitFor(() => {
      expect(retryButton.getAttribute('data-loading')).toBeNull()
    })
  })

  it('should submit category attribute chunks individually with chunk file names', async () => {
    await renderPage()
    const manifest = {
      schemaVersion: '2026-08-16',
      source: {
        system: 'tiki',
        type: 'sellercenter_category_attributes',
        value: 'parent:2',
      },
      crawl: {
        categorySourceFingerprint: 'sha256:categories',
        chunkSize: 100,
        totalCategories: 6101,
        totalChunks: 1,
        startedAt: '2026-08-16T10:00:00Z',
        completedAt: '2026-08-16T10:30:00Z',
      },
      chunks: [{ fileName: 'chunk-0001.json', chunkIndex: 1, sourceFingerprint: 'sha256:chunk-1' }],
    }
    const chunk = {
      schemaVersion: '2026-08-16',
      source: {
        system: 'tiki',
        type: 'sellercenter_category_attributes',
        value: 'parent:2',
      },
      crawl: {
        startedAt: '2026-08-16T10:00:00Z',
        completedAt: '2026-08-16T10:05:00Z',
        sourceFingerprint: 'sha256:chunk-1',
        categorySourceFingerprint: 'sha256:categories',
        checkpointId: null,
        chunkIndex: 1,
      },
      categories: [{ externalCategoryId: '1846', productSetId: '9001', status: 'complete', attributes: [] }],
    }
    const validChunk = {
      ...chunk,
      categories: [
        { externalCategoryId: '1846', productSetId: '9001', status: 'complete', attributes: [] },
        {
          externalCategoryId: '1847',
          productSetId: '9002',
          status: 'complete',
          attributes: [{ name: 'Brand' }],
        },
      ],
    }

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryAttributeManifestLabel')),
      { target: { files: [new File([JSON.stringify(manifest)], 'manifest.json', { type: 'application/json' })] } },
    )
    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryAttributeChunksLabel')),
      {
        target: {
          files: [new File([JSON.stringify(validChunk)], 'chunk-0001.json', { type: 'application/json' })],
        },
      },
    )
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.actions.provisionCategoryAttributes'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.provisionCategoryAttributes).toHaveBeenCalledWith(
        {
          ...validChunk,
          categories: [validChunk.categories[1]],
        },
        'chunk-0001.json',
      )
    })
    await waitFor(() => {
      expect(
        screen.getByText(
          i18n.global.t('catalogImports.upload.categoryAttributeQueueSummary', {
            submitted: 1,
            skipped: 0,
            filtered: 1,
          }),
        ),
      ).toBeTruthy()
    })
  })

  it('should skip unmatched or empty category attribute chunks', async () => {
    await renderPage()
    const manifest = {
      schemaVersion: '2026-08-16',
      source: {
        system: 'tiki',
        type: 'sellercenter_category_attributes',
        value: 'parent:2',
      },
      crawl: {
        categorySourceFingerprint: 'sha256:categories',
        chunkSize: 100,
        totalCategories: 6101,
        totalChunks: 1,
        startedAt: '2026-08-16T10:00:00Z',
        completedAt: '2026-08-16T10:30:00Z',
      },
      chunks: [{ fileName: 'chunk-0001.json', chunkIndex: 1, sourceFingerprint: 'sha256:chunk-1' }],
    }
    const unmatchedChunk = {
      schemaVersion: '2026-08-16',
      source: {
        system: 'tiki',
        type: 'sellercenter_category_attributes',
        value: 'parent:2',
      },
      crawl: {
        startedAt: '2026-08-16T10:00:00Z',
        completedAt: '2026-08-16T10:05:00Z',
        sourceFingerprint: 'sha256:other',
        categorySourceFingerprint: 'sha256:categories',
        checkpointId: null,
        chunkIndex: 2,
      },
      categories: [{ externalCategoryId: '1846', productSetId: '9001', status: 'complete', attributes: [] }],
    }

    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryAttributeManifestLabel')),
      { target: { files: [new File([JSON.stringify(manifest)], 'manifest.json', { type: 'application/json' })] } },
    )
    await fireEvent.change(
      screen.getByLabelText(i18n.global.t('catalogImports.upload.categoryAttributeChunksLabel')),
      {
        target: {
          files: [new File([JSON.stringify(unmatchedChunk)], 'chunk-0002.json', { type: 'application/json' })],
        },
      },
    )
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.actions.provisionCategoryAttributes'),
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          i18n.global.t('catalogImports.upload.noProvisionableCategoryAttributeChunks'),
        ),
      ).toBeTruthy()
    })
    expect(catalogImportService.provisionCategoryAttributes).not.toHaveBeenCalled()
  })

  it('should render formatted local datetime plus relative hint on list-page tables', async () => {
    await renderPage()

    expect(
      await screen.findByText('formatted:2026-08-04T10:00:00Z (relative:2026-08-04T10:00:00Z)'),
    ).toBeTruthy()
  })
})
