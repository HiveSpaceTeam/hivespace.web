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
    submitBundle: jest.fn(),
    listBundles: jest.fn(),
    listJobs: jest.fn(),
    getBundleSummary: jest.fn(),
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
      status: 'NeedsAttention',
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
    jest.mocked(catalogImportService.listJobs).mockImplementation(async (query?: { bundleId?: string; operationType?: string }) => {
      if (query?.bundleId === 'bundle-001') {
        return selectedBundleJobsResponse
      }

      if (query?.operationType === 'ProvisionCategories') {
        return categoryHistoryResponse
      }

      return selectedBundleJobsResponse
    })
    jest.mocked(catalogImportService.getBundleSummary).mockResolvedValue(bundleHistoryResponse.data[0]!)
    jest.mocked(catalogImportService.provisionCategories).mockResolvedValue({
      jobId: 'job-categories',
      status: 'Pending',
      operationType: 'ProvisionCategories',
      sourceFileName: 'categories.json',
    })
    jest.mocked(catalogImportService.submitBundle).mockResolvedValue({
      jobId: 'job-bundle',
      status: 'Pending',
      operationType: 'SubmitBundle',
      sourceFileName: 'bundle.json',
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
    expect(screen.getByLabelText(i18n.global.t('catalogImports.upload.bundleLabel'))).toBeTruthy()
  })

  it('should render paginated all-operation job history on the list page', async () => {
    await renderPage()

    expect(await screen.findByText('bundle-001')).toBeTruthy()
    expect(screen.getByText('bundle.json')).toBeTruthy()
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

  it('should render formatted local datetime plus relative hint on list-page tables', async () => {
    await renderPage()

    expect(
      await screen.findByText('formatted:2026-08-04T10:00:00Z (relative:2026-08-04T10:00:00Z)'),
    ).toBeTruthy()
  })
})
