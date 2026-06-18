import { describe, expect, it, jest } from '@jest/globals'
import { createTestingPinia } from '@pinia/testing'
import { render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import ProductListPage from './ProductListPage.vue'
import { useProductStore } from '@/stores/product.store'

const renderProductList = async (initialProducts = [{ id: 1, name: 'Honey Jar', category: 'Food', variants: [], skus: [], thumbnailUrl: null, currentSeller: null }]) => {
  const pinia = createTestingPinia({
    createSpy: jest.fn,
    initialState: {
      product: {
        products: initialProducts,
        isFetchingProducts: false,
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalItems: initialProducts.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    },
  })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/product/list', name: 'List product', component: ProductListPage },
      { path: '/product/new', name: 'New Product', component: { template: '<div />' } },
      { path: '/product/:id', name: 'Edit Product', component: { template: '<div />' } },
    ],
  })
  await router.push('/product/list')
  await router.isReady()

  render(ProductListPage, {
    global: {
      plugins: [pinia, router, i18n],
      stubs: { teleport: true },
    },
  })

  return { pinia, router }
}

describe('ProductListPage', () => {
  it('renders_ProductListFromStore', async () => {
    const { pinia } = await renderProductList()

    expect(await screen.findByText('Honey Jar')).toBeTruthy()

    const store = useProductStore(pinia)
    expect(store.fetchProducts).toHaveBeenCalled()
  })

  it('renders_EmptyState_WhenNoProducts', async () => {
    await renderProductList([])

    await waitFor(() => expect(screen.queryByText('Honey Jar')).toBeNull())
  })
})
