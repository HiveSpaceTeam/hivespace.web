import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { defineComponent, h, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createI18n } from 'vue-i18n'
import UpsertProductPage from './UpsertProductPage.vue'
import { categoryService } from '@/services/category.service'
import { productService } from '@/services/product.service'

const mockNotifySuccess = jest.fn()
const mockNotifyError = jest.fn()
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
})

jest.mock('@/services/product.service', () => ({
  productService: {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  },
}))

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getCategories: jest.fn(),
    getCategoryAttributes: jest.fn(),
  },
}))

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')
  const ButtonStub = defineComponent({
    props: {
      type: { type: String, default: 'button' },
      disabled: { type: Boolean, default: false },
    },
    emits: ['click'],
    template:
      '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
  })
  const SelectStub = defineComponent({
    props: {
      modelValue: { type: String, default: '' },
      options: { type: Array, default: () => [] },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
    },
    emits: ['update:modelValue', 'change'],
    template: `
      <select
        :value="modelValue"
        :disabled="disabled"
        @change="
          $emit('update:modelValue', $event.target.value);
          $emit('change', $event.target.value)
        "
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
      </select>
    `,
  })
  const InputStub = defineComponent({
    props: {
      modelValue: { type: [String, Number], default: '' },
      placeholder: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    template: `
      <input
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    `,
  })
  return {
    ...actual,
    Button: ButtonStub,
    Select: SelectStub,
    Input: InputStub,
    MultipleSelect: InputStub,
    FileInput: { template: '<div data-testid="file-input" />' },
    PageBreadcrumb: { template: '<div data-testid="breadcrumb" />' },
    ComponentCard: { template: '<section><slot /></section>' },
    AppShell: { template: '<div><slot /></div>' },
    EyeIcon: { template: '<span />' },
    PlusIcon: { template: '<span />' },
    TrashIcon: { template: '<span />' },
    useAppStore: () => ({
      notifySuccess: mockNotifySuccess,
      notifyError: mockNotifyError,
    }),
  }
})

jest.mock('@vueup/vue-quill', () => ({
  QuillEditor: defineComponent({
    setup(_, { expose }) {
      const html = ref('')
      expose({
        setHTML: (value: string) => {
          html.value = value
        },
        getHTML: () => html.value,
      })

      return () => h('div', { 'data-testid': 'quill-editor' }, html.value)
    },
  }),
}))

jest.mock('quill-image-uploader', () => ({
  __esModule: true,
  default: {},
}))

const editProductResponse = {
  id: 1,
  name: 'Honey Jar',
  category: 'Food',
  description: '<p>Natural honey</p>',
  variants: [],
  skus: [],
  thumbnailUrl: null,
  currentSeller: null,
  categories: [{ categoryId: 'cat-1' }],
  attributes: [],
  images: [],
}

const renderUpsertPage = async (route: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/product/new', name: 'New Product', component: UpsertProductPage },
      { path: '/product/:id', name: 'Edit Product', component: UpsertProductPage },
      { path: '/product/list', name: 'List product', component: { template: '<div>list</div>' } },
    ],
  })
  await router.push(route)
  await router.isReady()

  render(UpsertProductPage, {
    global: {
      plugins: [pinia, router, i18n],
      stubs: { teleport: true },
    },
  })

  return { router }
}

describe('UpsertProductPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {
        ...(globalThis.crypto ?? {}),
        randomUUID: jest.fn(() => 'uuid-1'),
      },
    })
    jest.mocked(categoryService.getCategories).mockResolvedValue([
      {
        id: 'cat-1',
        name: 'Electronics',
        displayName: 'Electronics',
        imageFileId: null,
        imageUrl: null,
      },
    ])
    jest.mocked(categoryService.getCategoryAttributes).mockResolvedValue([
      {
        id: 'attr-1',
        name: 'Size',
        valueType: 1,
        inputType: 2,
        isMandatory: true,
        maxValueCount: 1,
        isActive: true,
        createdAt: '2026-06-13T00:00:00Z',
        updatedAt: null,
        values: [{ id: 'size-l', attributeId: 'attr-1', name: 'Large', displayName: 'Large', parentValueId: null, isActive: true, sortOrder: 1 }],
      },
    ])
    jest.mocked(productService.getProductById).mockResolvedValue(editProductResponse as never)
    jest.mocked(productService.createProduct).mockResolvedValue({
      id: 'created-1',
      name: 'New Product',
      category: 'cat-1',
      productVariants: [],
      productSkus: [],
      createdAt: '2026-06-13T00:00:00Z',
      thumbnailUrl: null,
      currentSeller: null,
    })
    jest.mocked(productService.updateProduct).mockResolvedValue(undefined)
  })

  it('loads categories on mount and fetches attributes when the category changes', async () => {
    await renderUpsertPage('/product/new')

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalled()
    })

    const selects = screen.getAllByRole('combobox')
    await fireEvent.change(selects[0]!, { target: { value: 'cat-1' } })

    await waitFor(() => {
      expect(categoryService.getCategoryAttributes).toHaveBeenCalledWith('cat-1')
    })
  })

  it('adds a variant option and builds sku rows', async () => {
    await renderUpsertPage('/product/new')

    await fireEvent.click(
      screen.getByRole('button', { name: i18n.global.t('product.addNewVariant') }),
    )

    const textboxes = screen.getAllByRole('textbox')
    await fireEvent.update(textboxes[1]!, 'Size')
    await fireEvent.update(textboxes[2]!, 'Large')

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('Large').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByPlaceholderText('product.fill').length).toBeGreaterThan(1)
  })

  it('saves a new product through the create flow', async () => {
    const { router } = await renderUpsertPage('/product/new')

    const textboxes = screen.getAllByRole('textbox')
    await fireEvent.update(textboxes[0]!, 'New Product')
    await fireEvent.change(screen.getAllByRole('combobox')[0]!, { target: { value: 'cat-1' } })
    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('common.save') }))

    await waitFor(() => {
      expect(productService.createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          category: 'cat-1',
        }),
      )
    })

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/product/list')
    })
  })

  it('loads existing product details and saves through the update flow', async () => {
    const { router } = await renderUpsertPage('/product/1')

    await waitFor(() => {
      expect(productService.getProductById).toHaveBeenCalledWith('1')
    })

    const textboxes = screen.getAllByRole('textbox')
    await fireEvent.update(textboxes[0]!, 'Honey Jar')
    await fireEvent.change(screen.getAllByRole('combobox')[0]!, { target: { value: 'cat-1' } })
    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('common.save') }))

    await waitFor(() => {
      expect(productService.updateProduct).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          name: 'Honey Jar',
          category: 'cat-1',
        }),
      )
    })

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/product/list')
    })
  })

  it('cancels back to the product list', async () => {
    const { router } = await renderUpsertPage('/product/new')

    await fireEvent.click(screen.getByRole('button', { name: i18n.global.t('common.cancel') }))

    await waitFor(() => {
      expect(router.currentRoute.value.path).toBe('/product/list')
    })
  })
})
