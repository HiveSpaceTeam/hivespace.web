import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { nextTick } from 'vue'
import i18n from '@/i18n'
import CatalogImportJobDetailPage from './CatalogImportJobDetailPage.vue'
import { catalogImportService } from '@/services/catalog-import.service'
import { categoryService } from '@/services/category.service'
import type { CatalogImportDuplicateGroup, CatalogImportValidationIssue } from '@/types'

const mockSetLoading = jest.fn()
const mockOpenModal = jest.fn<() => Promise<unknown>>()

jest.mock('@/services/catalog-import.service', () => ({
  catalogImportService: {
    listBundles: jest.fn(),
    listJobs: jest.fn(),
    getJob: jest.fn(),
    getBundleSummary: jest.fn(),
    listBundleCategoryLinks: jest.fn(),
    listBundleSellers: jest.fn(),
    listBundleProducts: jest.fn(),
    listBundleDuplicateGroups: jest.fn(),
    listBundleValidationIssues: jest.fn(),
    validateBundle: jest.fn(),
    provisionSellers: jest.fn(),
    approveSellerOwnership: jest.fn(),
    mapImportedCategory: jest.fn(),
    importReadyProducts: jest.fn(),
    retryJob: jest.fn(),
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
    BackArrowIcon: { template: '<span>back</span>' },
    ConfirmModal: { template: '<div />' },
    Button: {
      template:
        '<button :type="type ?? \'button\'" :disabled="disabled || loading" :data-loading="loading ? \'true\' : undefined" @click="onClick && onClick()"><slot /></button>',
      props: ['type', 'variant', 'size', 'disabled', 'loading', 'onClick'],
    },
    Input: {
      template:
        '<label><span>{{ label }}</span><input :type="type ?? \'text\'" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></label>',
      props: ['modelValue', 'label', 'type', 'placeholder'],
      emits: ['update:modelValue'],
    },
    Select: {
      template:
        '<label><span>{{ label }}</span><select :value="modelValue ?? \'\'" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>',
      props: ['modelValue', 'options', 'label', 'placeholder', 'disabled'],
      emits: ['update:modelValue', 'change'],
    },
    Tabs: {
      template:
        '<div><button v-for="option in options" :key="option.value" type="button" @click="$emit(\'update:modelValue\', option.value)">{{ option.label }}</button></div>',
      props: ['options', 'modelValue', 'variant'],
      emits: ['update:modelValue'],
    },
    Checkbox: {
      template:
        '<label><span>{{ label }}</span><input type="checkbox" :checked="modelValue" :disabled="disabled" @click="$emit(\'update:modelValue\', !modelValue)" /></label>',
      props: ['modelValue', 'label', 'disabled'],
      emits: ['update:modelValue'],
    },
    Badge: { template: '<span><slot /></span>', props: ['color'] },
    Spinner: { template: '<div />' },
    Pagination: {
      template:
        '<div><button type="button" @click="$emit(\'pageChange\', 2)">Next page</button><button type="button" @click="$emit(\'pageSizeChange\', 25)">Page size 25</button></div>',
      props: ['currentPage', 'totalPages', 'pageSize', 'totalItems'],
      emits: ['pageChange', 'pageSizeChange'],
    },
    useFormatDate: () => ({
      formatDateTime: (value: string) => `formatted:${value}`,
      formatRelativeTime: (value: string) => `relative:${value}`,
    }),
    useMoneyFormatter: () => ({
      formatMoney: (money: { amount: number; currencyCode?: string | null }) =>
        `${money.amount} ${money.currencyCode ?? ''}`.trim(),
    }),
    useModal: () => ({
      openModal: mockOpenModal,
      closeModal: jest.fn(),
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

const pagination = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
}

const page = <T,>(
  data: T[],
  paginationOverrides: Partial<typeof pagination> = {},
) => ({
  data,
  pagination: { ...pagination, totalItems: data.length, ...paginationOverrides },
})

const jobFixture = {
  jobId: 'job-001',
  status: 'Completed',
  operationType: 'SubmitBundle',
  sourceFileName: 'bundle.json',
  requestedAt: '2026-08-04T10:00:00Z',
  startedAt: '2026-08-04T10:01:00Z',
  completedAt: '2026-08-04T10:05:00Z',
  progress: { total: 20, processed: 20 },
  resultSummary: {
    totalProducts: 20,
    readyProducts: 1,
    blockedProducts: 0,
    warningCount: 0,
    duplicateCount: 0,
  },
  bundleId: 'bundle-001',
  errorSummary: null,
}

const categoryJobFixture = {
  ...jobFixture,
  jobId: 'job-categories',
  operationType: 'ProvisionCategories',
  sourceFileName: 'categories.json',
  bundleId: null,
}

const failedJobFixture = {
  ...jobFixture,
  jobId: 'job-001',
  status: 'Failed',
  errorSummary: 'Import failed',
}

const bundleFixture = {
  bundleId: 'bundle-001',
  status: 'ReadyToImport',
  sourceFileName: 'bundle.json',
  source: { system: 'tiki', type: 'category', value: '1846' },
  crawl: {
    startedAt: '2026-08-04T09:00:00Z',
    completedAt: '2026-08-04T09:05:00Z',
    sourceFingerprint: 'sha256:bundle',
    checkpointId: null,
  },
  summary: {
    totalProducts: 20,
    readyProducts: 1,
    blockedProducts: 0,
    warningCount: 0,
    duplicateCount: 0,
  },
}

const mockDetail = (
  sellerStatus = 'Matched',
  overrides?: {
    summary?: Partial<typeof bundleFixture.summary>
    validationIssues?: CatalogImportValidationIssue[]
    duplicateGroups?: CatalogImportDuplicateGroup[]
  },
) => {
  jest.mocked(catalogImportService.getJob).mockResolvedValue(jobFixture)
  jest.mocked(catalogImportService.getBundleSummary).mockResolvedValue({
    ...bundleFixture,
    summary: {
      ...bundleFixture.summary,
      ...overrides?.summary,
    },
  })
  jest.mocked(catalogImportService.listBundleCategoryLinks).mockResolvedValue(
    page([{ externalCategoryId: '1846', categoryId: 'category-001', categoryName: 'Books', status: 'Matched' }]),
  )
  jest.mocked(catalogImportService.listBundleSellers).mockResolvedValue(
    page([
      {
        importedSellerId: 'imported-seller-001',
        externalSellerId: 'seller-001',
        displayName: 'Tiki Trading',
        status: sellerStatus,
        userId: sellerStatus === 'Matched' ? 'user-001' : null,
        storeId: sellerStatus === 'Matched' ? 'store-001' : null,
        conflictReason: sellerStatus === 'Conflict' ? 'Similar store name' : null,
        existingStoreCandidates:
          sellerStatus === 'Conflict'
            ? [{ userId: 'user-001', storeId: 'store-001', storeName: 'Tiki Shop' }]
            : [],
      },
    ]),
  )
  jest.mocked(catalogImportService.listBundleProducts).mockResolvedValue(
    page([
      {
        productId: 'product-001',
        externalProductId: '271001',
        externalSellerId: 'seller-001',
        externalCategoryIds: ['1846'],
        title: 'Imported book',
        readinessStatus: 'Ready',
        skus: [{ externalSkuId: 'sku-001', variantSelections: {}, price: { amount: 1, currencyCode: 'VND' } }],
      },
      {
        productId: 'product-002',
        externalProductId: '271002',
        externalSellerId: 'seller-001',
        externalCategoryIds: ['1846'],
        title: 'Imported notebook',
        readinessStatus: 'Warning',
        skus: [{ externalSkuId: 'sku-002', variantSelections: {}, price: { amount: 2, currencyCode: 'VND' } }],
      },
    ]),
  )
  jest.mocked(catalogImportService.listBundleDuplicateGroups).mockResolvedValue(
    page(overrides?.duplicateGroups ?? []),
  )
  jest.mocked(catalogImportService.listBundleValidationIssues).mockResolvedValue(
    page(overrides?.validationIssues ?? []),
  )
}

const renderPage = async (locale: 'en' | 'vi' = 'en') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  i18n.global.locale.value = locale
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/catalog-imports', name: 'CatalogImports', component: { template: '<div>List</div>' } },
      { path: '/catalog-imports/jobs/:jobId', component: CatalogImportJobDetailPage },
    ],
  })
  await router.push('/catalog-imports/jobs/job-001')
  await router.isReady()

  const result = render(CatalogImportJobDetailPage, {
    global: {
      plugins: [pinia, i18n, router],
    },
  })

  return { ...result, router }
}

const mountPage = async (locale: 'en' | 'vi' = 'en') => {
  const pinia = createPinia()
  setActivePinia(pinia)
  i18n.global.locale.value = locale
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/catalog-imports', name: 'CatalogImports', component: { template: '<div>List</div>' } },
      { path: '/catalog-imports/jobs/:jobId', component: CatalogImportJobDetailPage },
    ],
  })
  await router.push('/catalog-imports/jobs/job-001')
  await router.isReady()

  const wrapper = mount(CatalogImportJobDetailPage, {
    global: {
      plugins: [pinia, i18n, router],
    },
  })

  await flushPromises()

  return wrapper
}

describe('CatalogImportJobDetailPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    mockOpenModal.mockResolvedValue({ result: 'confirm' })
    jest.mocked(catalogImportService.listBundles).mockResolvedValue({
      data: [bundleFixture],
      pagination,
    })
    jest.mocked(catalogImportService.listJobs).mockResolvedValue(page([jobFixture]))
    jest.mocked(categoryService.getCategories).mockResolvedValue([
      { id: 123, name: 'Books', displayName: 'Books', imageFileId: null, imageUrl: null },
    ])
    jest.mocked(catalogImportService.validateBundle).mockResolvedValue({
      jobId: 'job-validate',
      status: 'Pending',
      operationType: 'ValidateBundle',
      bundleId: 'bundle-001',
    })
    jest.mocked(catalogImportService.provisionSellers).mockResolvedValue({
      jobId: 'job-sellers',
      status: 'Pending',
      operationType: 'ProvisionSellers',
      bundleId: 'bundle-001',
    })
    jest.mocked(catalogImportService.importReadyProducts).mockResolvedValue({
      jobId: 'job-import',
      status: 'Pending',
      operationType: 'ImportReadyProducts',
      bundleId: 'bundle-001',
    })
    jest.mocked(catalogImportService.retryJob).mockResolvedValue({
      jobId: 'job-retry',
      status: 'Pending',
      operationType: 'SubmitBundle',
      bundleId: 'bundle-001',
    })
    jest.mocked(catalogImportService.approveSellerOwnership).mockResolvedValue({
      importedSellerId: 'imported-seller-001',
      externalSellerId: 'seller-001',
      userId: 'user-001',
      storeId: 'store-001',
      status: 'Matched',
      conflictReason: null,
    })
    jest.mocked(catalogImportService.mapImportedCategory).mockResolvedValue({
      bundleId: 'bundle-001',
      externalCategoryId: '1846',
      hiveSpaceCategoryId: 123,
      status: 'Mapped',
      affectedProductCount: 2,
    })
    mockDetail()
  })

  it('should render job detail bundle summary and validation sections from the store', async () => {
    await renderPage()

    expect(await screen.findByRole('heading', { name: 'Catalog Import Job' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { name: 'Catalog Import Job' })).toHaveLength(1)
    expect(screen.getByText(i18n.global.t('catalogImports.detail.description'))).toBeTruthy()
    expect(await screen.findByText('job-001')).toBeTruthy()
    expect(await screen.findByText('bundle-001')).toBeTruthy()
    expect(screen.getByText('Imported book')).toBeTruthy()
    expect(screen.getByText(i18n.global.t('catalogImports.sections.validationIssues'))).toBeTruthy()
  })

  it('should show category mapping action for unprovisioned category validation issues', async () => {
    mockDetail('Matched', {
      validationIssues: [
        {
          issueId: 'issue-category',
          entityType: 'Product',
          entitySourceId: '271001',
          field: 'externalCategoryIds',
          severity: 'Blocking',
          reasonCode: 'UnprovisionedCategory',
          message: 'Category is not mapped',
        },
        {
          issueId: 'issue-money',
          entityType: 'Sku',
          entitySourceId: 'sku-001',
          field: 'price',
          severity: 'Blocking',
          reasonCode: 'InvalidMoney',
          message: 'Invalid money',
        },
      ],
    })

    await renderPage()

    expect(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.mapCategory'),
      }),
    ).toBeTruthy()
    expect(screen.getByText('Invalid money')).toBeTruthy()
  })

  it('should map a category from an unprovisioned category validation issue', async () => {
    mockOpenModal.mockResolvedValue({ hiveSpaceCategoryId: 123, externalCategoryId: '914' })
    mockDetail('Matched', {
      validationIssues: [
        {
          issueId: 'issue-category',
          entityType: 'Product',
          entitySourceId: '271001',
          field: 'externalCategoryIds',
          severity: 'Blocking',
          reasonCode: 'UnprovisionedCategory',
          message: 'Category is not mapped',
          metadata: {
            missingExternalCategoryIds: ['914'],
          },
        },
      ],
    })

    await renderPage()
    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.mapCategory'),
      }),
    )

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled()
      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          externalProductId: '271001',
          productName: 'Imported book',
          externalCategoryIds: ['914'],
        }),
      )
      expect(catalogImportService.mapImportedCategory).toHaveBeenCalledWith(
        'bundle-001',
        '914',
        { hiveSpaceCategoryId: 123 },
      )
    })
  })

  it('should open category mapping without repair targets when validation metadata is missing', async () => {
    mockOpenModal.mockResolvedValue(null)
    mockDetail('Matched', {
      validationIssues: [
        {
          issueId: 'issue-category',
          entityType: 'Product',
          entitySourceId: '271001',
          field: 'category',
          severity: 'Blocking',
          reasonCode: 'UnprovisionedCategory',
          message: 'Category is not mapped',
        },
      ],
    })

    await renderPage()
    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.mapCategory'),
      }),
    )

    await waitFor(() => {
      expect(mockOpenModal).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          externalProductId: '271001',
          productName: 'Imported book',
          externalCategoryIds: [],
        }),
      )
      expect(catalogImportService.mapImportedCategory).not.toHaveBeenCalled()
    })
  })

  it('should localize bundle, seller, category, and product statuses in vi mode', async () => {
    await renderPage('vi')

    await waitFor(() => {
      expect(
        screen.getAllByText(
          (_content, element) =>
            element?.textContent?.includes(i18n.global.t('catalogImports.statuses.Completed')) ??
            false,
        ),
      ).not.toHaveLength(0)
    })
    expect(screen.queryByText('Completed')).toBeNull()
    expect(
      screen.getAllByText(
        (_content, element) =>
          element?.textContent?.includes(
            i18n.global.t('catalogImports.products.readinessStatuses.Ready'),
          ) ?? false,
      ).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(
        (_content, element) =>
          element?.textContent?.includes(
            i18n.global.t('catalogImports.products.readinessStatuses.Warning'),
          ) ?? false,
      ).length,
    ).toBeGreaterThan(0)

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.sellers'),
      }),
    )

    expect(await screen.findByText(i18n.global.t('catalogImports.sellers.statuses.Matched'))).toBeTruthy()
    expect(screen.queryByText('Matched')).toBeNull()

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.categoryLinks'),
      }),
    )

    expect(await screen.findByText(i18n.global.t('catalogImports.categories.statuses.Matched'))).toBeTruthy()
  })

  it('should navigate back to the catalog imports list from the back arrow', async () => {
    const { router } = await renderPage()

    await fireEvent.click(
      screen.getByRole('link', {
        name: i18n.global.t('catalogImports.actions.backToList'),
      }),
    )

    await waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/catalog-imports')
    })
  })

  it('should switch between the large review tables with shared tabs', async () => {
    await renderPage()

    expect(await screen.findByText('Imported book')).toBeTruthy()
    expect(screen.queryByText('Tiki Trading')).toBeNull()
    expect(screen.queryByText('Books')).toBeNull()

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.sellers'),
      }),
    )
    expect(await screen.findByText('Tiki Trading')).toBeTruthy()
    expect(screen.queryByText('Imported book')).toBeNull()

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.categoryLinks'),
      }),
    )
    expect(await screen.findByText('Books')).toBeTruthy()
    expect(screen.queryByText('Tiki Trading')).toBeNull()
  })

  it('should render category provisioning jobs without product bundle sections', async () => {
    jest.mocked(catalogImportService.getJob).mockResolvedValue(categoryJobFixture)

    await renderPage()

    expect(await screen.findByText('job-categories')).toBeTruthy()
    expect(screen.getByText(i18n.global.t('catalogImports.sections.categoryProvisioning'))).toBeTruthy()
    expect(
      screen.getByText(i18n.global.t('catalogImports.empty.categoryProvisioningJobDetail')),
    ).toBeTruthy()
    expect(screen.queryByText(i18n.global.t('catalogImports.sections.workflowActions'))).toBeNull()
    expect(screen.queryByText(i18n.global.t('catalogImports.sections.products'))).toBeNull()
    expect(screen.queryByText(i18n.global.t('catalogImports.sections.sellers'))).toBeNull()
  })

  it('should show retry only for failed jobs and submit a retry from the detail page', async () => {
    jest.mocked(catalogImportService.getJob).mockResolvedValue(failedJobFixture)

    const { router } = await renderPage()

    const retryButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.retryJob'),
    })

    await fireEvent.click(retryButton)

    await waitFor(() => {
      expect(catalogImportService.retryJob).toHaveBeenCalledWith('job-001')
    })

    await waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/catalog-imports/jobs/job-retry')
    })
  })

  it('should not show retry for non-failed jobs on the detail page', async () => {
    await renderPage()

    expect(
      screen.queryByRole('button', {
        name: i18n.global.t('catalogImports.actions.retryJob'),
      }),
    ).toBeNull()
  })

  it('should show loading on the retry button while the retry request is running', async () => {
    jest.mocked(catalogImportService.getJob).mockResolvedValue(failedJobFixture)
    const deferred = createDeferred<{
      jobId: string
      status: string
      operationType: string
      bundleId: string
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
      jobId: 'job-retry',
      status: 'Pending',
      operationType: 'SubmitBundle',
      bundleId: 'bundle-001',
    })

    await waitFor(() => {
      expect(retryButton.getAttribute('data-loading')).toBeNull()
    })
  })

  it('should provision sellers and refresh bundle detail', async () => {
    await renderPage()

    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.provisionSellers'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.provisionSellers).toHaveBeenCalledWith('bundle-001')
    })
    expect(catalogImportService.listJobs).toHaveBeenCalled()
  })

  it('should show loading on the validate bundle button while the action is running', async () => {
    const deferred = createDeferred<{
      jobId: string
      status: string
      operationType: string
      bundleId: string
    }>()
    jest.mocked(catalogImportService.validateBundle).mockReturnValueOnce(
      deferred.promise as ReturnType<typeof catalogImportService.validateBundle>,
    )

    await renderPage()

    const validateButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.validateBundle'),
    })
    await fireEvent.click(validateButton)

    await waitFor(() => {
      expect(validateButton.getAttribute('data-loading')).toBe('true')
    })

    deferred.resolve({
      jobId: 'job-validate',
      status: 'Pending',
      operationType: 'ValidateBundle',
      bundleId: 'bundle-001',
    })

    await waitFor(() => {
      expect(validateButton.getAttribute('data-loading')).toBeNull()
    })
  })

  it('should keep import all ready enabled when seller ownership is missing but bundle has eligible products', async () => {
    mockDetail('Conflict')

    await renderPage()
    await screen.findByText('job-001')
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.sellers'),
      }),
    )

    const importAllButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.importAllReadyProducts'),
    })
    const importSelectedButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.importSelectedReadyProducts'),
    })
    expect(await screen.findByText(/Similar store name/)).toBeTruthy()
    await waitFor(() => {
      expect(importAllButton.hasAttribute('disabled')).toBe(false)
      expect(importSelectedButton.hasAttribute('disabled')).toBe(false)
    })
    expect(screen.getByText(/Tiki Shop/)).toBeTruthy()
  })

  it('should keep import all ready enabled when validation issues exist but bundle has eligible products', async () => {
    mockDetail('Matched', {
      validationIssues: [
        {
          issueId: 'issue-001',
          entityType: 'Product',
          entitySourceId: 'product-999',
          field: 'category',
          severity: 'Blocking',
          reasonCode: 'CategoryNotProvisioned',
          message: 'Category is not provisioned',
        },
      ],
    })

    await renderPage()

    const importAllButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.importAllReadyProducts'),
    })

    await waitFor(() => {
      expect(importAllButton.hasAttribute('disabled')).toBe(false)
    })
  })

  it('should keep import all ready enabled when duplicate groups exist but bundle has eligible products', async () => {
    mockDetail('Matched', {
      duplicateGroups: [
        {
          groupId: 'duplicate-001',
          externalProductIds: ['271999'],
          canonicalExternalProductId: '271999',
          reasonCode: 'SimilarProduct',
          resolutionStatus: 'Pending',
        },
      ],
    })

    await renderPage()

    const importAllButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.importAllReadyProducts'),
    })

    await waitFor(() => {
      expect(importAllButton.hasAttribute('disabled')).toBe(false)
    })
  })

  it('should require an approval reason before linking an existing store', async () => {
    mockDetail('Conflict')

    await renderPage()
    await screen.findByText('job-001')
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.sellers'),
      }),
    )
    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.approveSellerOwnership'),
      }),
    )

    expect(
      await screen.findByText(i18n.global.t('catalogImports.sellers.approvalReasonRequired')),
    ).toBeTruthy()
    expect(catalogImportService.approveSellerOwnership).not.toHaveBeenCalled()
  })

  it('should approve conflicted seller ownership and refresh bundle detail', async () => {
    mockDetail('Conflict')
    const deferred = createDeferred<{
      importedSellerId: string
      externalSellerId: string
      userId: string
      storeId: string
      status: string
      conflictReason: null
    }>()
    jest.mocked(catalogImportService.approveSellerOwnership).mockReturnValueOnce(
      deferred.promise as ReturnType<typeof catalogImportService.approveSellerOwnership>,
    )

    await renderPage()
    await screen.findByText('job-001')
    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.sellers'),
      }),
    )
    await screen.findByText(/Similar store name/)
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('catalogImports.sellers.approvalReason')),
      'Reviewed existing store',
    )
    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.approveSellerOwnership'),
      }),
    )

    const approveButtons = await screen.findAllByRole('button', {
      name: i18n.global.t('catalogImports.actions.approveSellerOwnership'),
    })

    await waitFor(() => {
      expect(approveButtons[0].getAttribute('data-loading')).toBe('true')
    })

    deferred.resolve({
      importedSellerId: 'imported-seller-001',
      externalSellerId: 'seller-001',
      userId: 'user-001',
      storeId: 'store-001',
      status: 'Matched',
      conflictReason: null,
    })

    await waitFor(() => {
      expect(catalogImportService.approveSellerOwnership).toHaveBeenCalledWith(
        'bundle-001',
        'imported-seller-001',
        {
          targetUserId: 'user-001',
          targetStoreId: 'store-001',
          approvalReason: 'Reviewed existing store',
        },
      )
    })

    await waitFor(() => {
      const refreshedApproveButtons = screen.getAllByRole('button', {
        name: i18n.global.t('catalogImports.actions.approveSellerOwnership'),
      })
      expect(refreshedApproveButtons[0].getAttribute('data-loading')).toBeNull()
    })
  })

  it('should import all eligible products in the bundle without product ids', async () => {
    await renderPage()

    const selector = (await screen.findByLabelText(
      i18n.global.t('catalogImports.import.publicationStateLabel'),
    )) as HTMLSelectElement

    expect(selector.value).toBe('Draft')

    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.importAllReadyProducts'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
        publicationState: 'Draft',
      })
    })
  })

  it('should import all eligible products with the selected available publication state', async () => {
    await renderPage()

    await fireEvent.update(
      await screen.findByLabelText(i18n.global.t('catalogImports.import.publicationStateLabel')),
      'Available',
    )

    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.importAllReadyProducts'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
        publicationState: 'Available',
      })
    })
  })

  it('should import ready and warning selected products as draft records', async () => {
    await renderPage()
    await screen.findByText(
      i18n.global.t('catalogImports.products.selectedImportableProducts', { count: 2 }),
    )

    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.importSelectedReadyProducts'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
        productIds: ['product-001', 'product-002'],
        publicationState: 'Draft',
      })
    })
  })

  it('should import selected products with the selected unpublish publication state', async () => {
    await renderPage()

    await fireEvent.update(
      await screen.findByLabelText(i18n.global.t('catalogImports.import.publicationStateLabel')),
      'Unpublish',
    )

    await fireEvent.click(
      await screen.findByRole('button', {
        name: i18n.global.t('catalogImports.actions.importSelectedReadyProducts'),
      }),
    )

    await waitFor(() => {
      expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
        productIds: ['product-001', 'product-002'],
        publicationState: 'Unpublish',
      })
    })
  })

  it('should keep checked products across pages and import every checked product', async () => {
    const pageOneProducts = [
      {
        productId: 'product-001',
        externalProductId: '271001',
        externalSellerId: 'seller-001',
        externalCategoryIds: ['1846'],
        title: 'Imported book',
        readinessStatus: 'Ready',
        skus: [{ externalSkuId: 'sku-001', variantSelections: {}, price: { amount: 1, currencyCode: 'VND' } }],
      },
      {
        productId: 'product-002',
        externalProductId: '271002',
        externalSellerId: 'seller-001',
        externalCategoryIds: ['1846'],
        title: 'Imported notebook',
        readinessStatus: 'Warning',
        skus: [{ externalSkuId: 'sku-002', variantSelections: {}, price: { amount: 2, currencyCode: 'VND' } }],
      },
    ]

    const pageTwoProducts = [
      {
        productId: 'product-003',
        externalProductId: '271003',
        externalSellerId: 'seller-001',
        externalCategoryIds: ['1846'],
        title: 'Imported ruler',
        readinessStatus: 'Ready',
        skus: [{ externalSkuId: 'sku-003', variantSelections: {}, price: { amount: 3, currencyCode: 'VND' } }],
      },
    ]

    jest.mocked(catalogImportService.listBundleProducts)
      .mockReset()
      .mockResolvedValueOnce(
        page(pageOneProducts, { totalItems: 3, totalPages: 2, hasNextPage: true }),
      )
      .mockResolvedValueOnce(
        page(pageTwoProducts, {
          currentPage: 2,
          totalItems: 3,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        }),
      )

    const wrapper = await mountPage()

    await waitFor(() => {
      expect(wrapper.text()).toContain(
        i18n.global.t('catalogImports.products.selectedImportableProducts', { count: 2 }),
      )
    })

    const productsSection = wrapper
      .findAll('section')
      .find(section => section.text().includes('Imported book'))
    const productsNextPageButton = productsSection
      ?.findAll('button')
      .find(button => button.text() === 'Next page')

    if (!productsNextPageButton) {
      throw new Error('Products next page button not found')
    }

    await productsNextPageButton.trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(wrapper.text()).toContain('Imported ruler')
    })
    expect(wrapper.text()).toContain(
      i18n.global.t('catalogImports.products.selectedImportableProducts', { count: 2 }),
    )

    ;(wrapper.vm as unknown as { selectedProductIds: string[] }).selectedProductIds = [
      'product-001',
      'product-002',
      'product-003',
    ]
    await nextTick()

    expect(wrapper.text()).toContain(
      i18n.global.t('catalogImports.products.selectedImportableProducts', { count: 3 }),
    )

    const importButton = wrapper
      .findAll('button')
      .find(button =>
        button.text().includes(
          i18n.global.t('catalogImports.actions.importSelectedReadyProducts'),
        ),
      )

    if (!importButton) {
      throw new Error('Import button not found')
    }

    await importButton.trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
        productIds: ['product-001', 'product-002', 'product-003'],
        publicationState: 'Draft',
      })
    })
  })

  it('should render draft unpublish and available publication state choices', async () => {
    await renderPage()

    const selector = await screen.findByLabelText(
      i18n.global.t('catalogImports.import.publicationStateLabel'),
    )

    expect(screen.getByRole('option', { name: i18n.global.t('catalogImports.import.states.Draft') }))
      .toBeTruthy()
    expect(
      screen.getByRole('option', {
        name: i18n.global.t('catalogImports.import.states.Unpublish'),
      }),
    ).toBeTruthy()
    expect(
      screen.getByRole('option', {
        name: i18n.global.t('catalogImports.import.states.Available'),
      }),
    ).toBeTruthy()
    expect((selector as HTMLSelectElement).value).toBe('Draft')
  })

  it('should keep bundle-wide import enabled when no products are selected', async () => {
    const wrapper = await mountPage()

    await waitFor(() => {
      expect(wrapper.text()).toContain(
        i18n.global.t('catalogImports.products.selectedImportableProducts', { count: 2 }),
      )
    })

    ;(wrapper.vm as unknown as { selectedProductIds: string[] }).selectedProductIds = []
    await nextTick()

    const importAllButton = wrapper
      .findAll('button')
      .find(button =>
        button.text().includes(i18n.global.t('catalogImports.actions.importAllReadyProducts')),
      )
    const importSelectedButton = wrapper
      .findAll('button')
      .find(button =>
        button
          .text()
          .includes(i18n.global.t('catalogImports.actions.importSelectedReadyProducts')),
      )

    if (!importAllButton || !importSelectedButton) {
      throw new Error('Import buttons not found')
    }

    expect(importAllButton.attributes('disabled')).toBeUndefined()
    expect(importSelectedButton.attributes('disabled')).toBeDefined()

    await importAllButton.trigger('click')
    await flushPromises()

    await waitFor(() => {
      expect(catalogImportService.importReadyProducts).toHaveBeenCalledWith('bundle-001', {
        publicationState: 'Draft',
      })
    })
  })

  it('should refetch table data with search terms and reset to the first page', async () => {
    await renderPage()

    await fireEvent.update(
      await screen.findByLabelText(i18n.global.t('catalogImports.search.productsLabel')),
      '271001',
    )

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.sellers'),
      }),
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('catalogImports.search.sellersLabel')),
      'seller-001',
    )

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.products'),
      }),
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('catalogImports.search.validationIssuesLabel')),
      'MissingCategory',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('catalogImports.search.duplicatesLabel')),
      'group-001',
    )

    await fireEvent.click(
      screen.getByRole('button', {
        name: i18n.global.t('catalogImports.sections.categoryLinks'),
      }),
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('catalogImports.search.categoryLinksLabel')),
      '1846',
    )

    await waitFor(() => {
      expect(catalogImportService.listBundleProducts).toHaveBeenLastCalledWith('bundle-001', {
        pageNumber: 1,
        pageSize: 10,
        searchTerm: '271001',
      })
      expect(catalogImportService.listBundleSellers).toHaveBeenLastCalledWith('bundle-001', {
        pageNumber: 1,
        pageSize: 10,
        searchTerm: 'seller-001',
      })
      expect(catalogImportService.listBundleValidationIssues).toHaveBeenLastCalledWith(
        'bundle-001',
        {
          pageNumber: 1,
          pageSize: 10,
          searchTerm: 'MissingCategory',
        },
      )
      expect(catalogImportService.listBundleDuplicateGroups).toHaveBeenLastCalledWith(
        'bundle-001',
        {
          pageNumber: 1,
          pageSize: 10,
          searchTerm: 'group-001',
        },
      )
      expect(catalogImportService.listBundleCategoryLinks).toHaveBeenLastCalledWith('bundle-001', {
        pageNumber: 1,
        pageSize: 10,
        searchTerm: '1846',
      })
    })
  })

  it('should preserve the active search term when paging and changing page size', async () => {
    await renderPage()

    await fireEvent.update(
      await screen.findByLabelText(i18n.global.t('catalogImports.search.productsLabel')),
      '271001',
    )

    await fireEvent.click(screen.getAllByRole('button', { name: 'Next page' })[0])
    await fireEvent.click(screen.getAllByRole('button', { name: 'Page size 25' })[0])

    await waitFor(() => {
      expect(catalogImportService.listBundleProducts).toHaveBeenNthCalledWith(2, 'bundle-001', {
        pageNumber: 1,
        pageSize: 10,
        searchTerm: '271001',
      })
      expect(catalogImportService.listBundleProducts).toHaveBeenNthCalledWith(3, 'bundle-001', {
        pageNumber: 2,
        pageSize: 10,
        searchTerm: '271001',
      })
      expect(catalogImportService.listBundleProducts).toHaveBeenNthCalledWith(4, 'bundle-001', {
        pageNumber: 1,
        pageSize: 25,
        searchTerm: '271001',
      })
    })
  })

  it('should show search-specific empty messages when filtered results are empty', async () => {
    jest.mocked(catalogImportService.listBundleProducts).mockResolvedValue(page([]))
    jest.mocked(catalogImportService.listBundleValidationIssues).mockResolvedValue(page([]))

    await renderPage()

    await fireEvent.update(
      await screen.findByLabelText(i18n.global.t('catalogImports.search.productsLabel')),
      'missing-product',
    )
    await fireEvent.update(
      screen.getByLabelText(i18n.global.t('catalogImports.search.validationIssuesLabel')),
      'missing-issue',
    )

    await waitFor(() => {
      expect(screen.getByText(i18n.global.t('catalogImports.empty.productsSearch'))).toBeTruthy()
      expect(
        screen.getByText(i18n.global.t('catalogImports.empty.validationIssuesSearch')),
      ).toBeTruthy()
    })
  })

  it('should disable import all ready when the bundle summary has no eligible products', async () => {
    mockDetail('Matched', {
      summary: {
        readyProducts: 0,
        warningCount: 0,
      },
    })

    await renderPage()

    const importAllButton = await screen.findByRole('button', {
      name: i18n.global.t('catalogImports.actions.importAllReadyProducts'),
    })

    expect(importAllButton.hasAttribute('disabled')).toBe(true)
  })

})
