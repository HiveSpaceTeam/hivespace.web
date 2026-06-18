import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import HomePage from './HomePage.vue'
import { categoryService } from '@/services/category.service'
import { productService } from '@/services/product.service'

jest.mock('@/components/home/HeroBanner.vue', () => ({
  default: { template: '<section data-testid="hero-banner" />' },
}))

jest.mock('@/components/home/FlashSale.vue', () => ({
  default: { template: '<section data-testid="flash-sale" />' },
}))

jest.mock('@/services/category.service', () => ({
  categoryService: {
    getHomepageCategories: jest.fn(),
  },
}))

jest.mock('@/services/product.service', () => ({
  productService: {
    getProducts: jest.fn(),
  },
}))

const productResponse = (name: string, id = '10') => ({
  items: [
    {
      id,
      name,
      price: 100_000,
      productImage: '/honey.png',
      imageURL: '/honey.png',
      soldCount: 5,
      rating: 4.8,
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalItems: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
})

const renderHome = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: HomePage },
      { path: '/product', name: 'Product', component: { template: '<div>Product</div>' } },
    ],
  })
  await router.push('/')
  await router.isReady()

  render(HomePage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })

  return router
}

describe('HomePage', () => {
  beforeEach(() => {
    jest.mocked(categoryService.getHomepageCategories).mockResolvedValue([
      {
        id: 1,
        name: 'food',
        displayName: 'Food',
        imageFileId: null,
        imageUrl: '/food.png',
      },
    ])
    jest.mocked(productService.getProducts).mockResolvedValue(productResponse('Honey Jar'))
  })

  it('should render product list from the storefront product API', async () => {
    await renderHome()

    expect(await screen.findByText('Honey Jar')).toBeTruthy()
    expect(productService.getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 12 })
  })

  it('should load more products from the next page when requested', async () => {
    jest.mocked(productService.getProducts)
      .mockResolvedValueOnce(productResponse('Honey Jar', '10'))
      .mockResolvedValueOnce(productResponse('Beeswax Candle', '11'))
    await renderHome()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('storefront.seeMore'),
    }))

    await waitFor(() => {
      expect(productService.getProducts).toHaveBeenLastCalledWith({ page: 2, pageSize: 12 })
    })
    expect(await screen.findByText('Beeswax Candle')).toBeTruthy()
  })
})
