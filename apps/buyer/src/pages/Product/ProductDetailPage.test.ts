import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import ProductDetailPage from './ProductDetailPage.vue'
import { addressService } from '@/services/address.service'
import { cartService } from '@/services/cart.service'
import { productService } from '@/services/product.service'
import type { GetProductDetailResponse } from '@/types'

const formatMoneyMock = jest.fn()
const currentUser = ref<{ id: string } | null>(null)

jest.mock('@hivespace/shared', () => {
  const actual = jest.requireActual<typeof import('@hivespace/shared')>('@hivespace/shared')

  return {
    ...actual,
    useAuth: () => ({
      currentUser,
      getCurrentUser: jest.fn<() => Promise<typeof currentUser.value>>().mockResolvedValue(currentUser.value),
    }),
    useMoneyFormatter: () => ({
      formatMoney: formatMoneyMock,
    }),
  }
})

jest.mock('@/services/address.service', () => ({
  addressService: {
    getDefaultAddress: jest.fn(),
  },
}))

jest.mock('@/services/cart.service', () => ({
  cartService: {
    addCartItem: jest.fn(),
    getSelectedItemsCount: jest.fn(),
  },
}))

jest.mock('@/services/product.service', () => ({
  productService: {
    getProductById: jest.fn(),
    getProducts: jest.fn(),
  },
}))

const productDetail: GetProductDetailResponse = {
  id: 10,
  name: 'Honey Jar',
  category: 'Food',
  description: 'Pure honey',
  variants: [],
  skus: [
    {
      id: 100,
      skuNo: 'SKU-001',
      skuName: 'Honey Jar',
      price: { amount: 100_000, currency: 704 },
      quantity: 10,
      isActive: true,
      images: [
        { fileId: 'file-001', imageUrl: '/honey-1.png' },
        { fileId: 'file-002', imageUrl: '/honey-2.png' },
      ],
      attributes: '',
    },
  ],
  images: [{ fileId: 'file-001', imageUrl: '/honey.png' }],
  attributes: [],
  thumbnailUrl: '/honey.png',
  currentSeller: {
    id: 'seller-001',
    storeName: 'Hive Store',
    logoUrl: null,
  },
}

const productListResponse = {
  items: [
    {
      id: '11',
      name: 'Similar Honey',
      price: 90_000,
      productImage: '/similar.png',
      imageURL: '/similar.png',
      soldCount: 3,
      rating: 4.5,
    },
    {
      id: '12',
      name: 'Dark Honey',
      price: 110_000,
      productImage: '/dark.png',
      imageURL: '/dark.png',
      soldCount: 7,
      rating: 4.2,
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 8,
    totalItems: 16,
    totalPages: 2,
    hasNextPage: true,
    hasPreviousPage: false,
  },
}

const renderProductDetail = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/product', name: 'Product', component: ProductDetailPage }],
  })
  await router.push('/product?pid=10')
  await router.isReady()

  render(ProductDetailPage, {
    global: {
      plugins: [pinia, router, i18n],
    },
  })
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    currentUser.value = { id: 'buyer-001' }
    formatMoneyMock.mockReset()
    formatMoneyMock.mockImplementation((value: unknown) => {
      const { amount, currencyCode } = value as {
        amount: number | null
        currencyCode: string | null
      }

      if (currencyCode === 'VND') {
        return `${amount?.toLocaleString('vi-VN') ?? '0'}₫`
      }

      return '$0.00'
    })
    jest.mocked(productService.getProductById).mockResolvedValue(productDetail)
    jest.mocked(productService.getProducts).mockResolvedValue(productListResponse)
    jest.mocked(addressService.getDefaultAddress).mockResolvedValue({
      id: 'address-001',
      fullName: 'Test Buyer',
      phoneNumber: '0900000000',
      street: '1 Test Street',
      commune: 'Ward 1',
      province: 'Ho Chi Minh City',
      country: 'VN',
      zipCode: '',
      isDefault: true,
    })
    jest.mocked(cartService.addCartItem).mockResolvedValue({ cartItemId: 'cart-item-001' })
    jest.mocked(cartService.getSelectedItemsCount).mockResolvedValue({ count: 1 })
  })

  it('should render title price from stubbed product detail', async () => {
    await renderProductDetail()

    expect(await screen.findByRole('heading', { name: 'Honey Jar' })).toBeTruthy()
    await waitFor(() => {
      expect(
        formatMoneyMock.mock.calls.some(([value]) => {
          const money = value as { amount?: number; currencyCode?: string | null } | undefined
          return money?.amount === 100_000 && money.currencyCode === 'VND'
        }),
      ).toBe(true)
    })
    expect(screen.getAllByText('Honey Jar').length).toBeGreaterThan(0)
  })

  it('should add the selected product SKU to the cart', async () => {
    await renderProductDetail()

    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('storefront.productDetail.addCart'),
    }))

    await waitFor(() => {
      expect(cartService.addCartItem).toHaveBeenCalledWith({
        productId: 10,
        skuId: 100,
        quantity: 1,
      })
    })
  })

  it('should update the quantity controls and submit the selected quantity', async () => {
    await renderProductDetail()

    const quantityButtons = await screen.findAllByRole('button')
    const minusButton = quantityButtons.find(button => button.textContent?.trim() === '-')
    const plusButton = quantityButtons.find(button => button.textContent?.trim() === '+')

    expect(minusButton).toBeTruthy()
    expect(plusButton).toBeTruthy()

    await fireEvent.click(plusButton!)
    await fireEvent.click(plusButton!)
    await fireEvent.click(minusButton!)

    await fireEvent.click(screen.getByRole('button', {
      name: i18n.global.t('storefront.productDetail.addCart'),
    }))

    await waitFor(() => {
      expect(cartService.addCartItem).toHaveBeenCalledWith({
        productId: 10,
        skuId: 100,
        quantity: 2,
      })
    })
  })

  it('should toggle the description and move between gallery images', async () => {
    await renderProductDetail()

    const toggleButton = await screen.findByRole('button', {
      name: i18n.global.t('storefront.productDetail.expand'),
    })
    await fireEvent.click(toggleButton)

    expect(screen.getByRole('button', {
      name: i18n.global.t('storefront.productDetail.collapse'),
    })).toBeTruthy()

    const nextButton = document.querySelector('.thumbnail-slider .nav-btn.next') as HTMLButtonElement
    const prevButton = document.querySelector('.thumbnail-slider .nav-btn.prev') as HTMLButtonElement
    const mainImage = screen.getByAltText('product') as HTMLImageElement

    await fireEvent.click(nextButton)
    expect(mainImage.src).toContain('/honey-2.png')

    await fireEvent.click(prevButton)
    expect(mainImage.src).toContain('/honey-1.png')
  })

  it('should render the fallback address copy', async () => {
    currentUser.value = { id: 'buyer-001' }
    jest.mocked(addressService.getDefaultAddress).mockRejectedValueOnce(new Error('missing address'))
    await renderProductDetail()

    expect(await screen.findByText(
      new RegExp(i18n.global.t('storefront.productDetail.noDefaultAddress')),
    )).toBeTruthy()
  })

  it('should not load or render the user shipping section when anonymous', async () => {
    currentUser.value = null

    await renderProductDetail()

    await screen.findByRole('heading', { name: 'Honey Jar' })

    expect(addressService.getDefaultAddress).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', {
      name: i18n.global.t('storefront.productDetail.shippingInfo'),
    })).toBeNull()
  })

  it('should skip adding to cart when the product has no primary sku id', async () => {
    jest.mocked(productService.getProductById).mockResolvedValue({
      ...productDetail,
      skus: [
        {
          ...productDetail.skus[0]!,
          id: 0,
        },
      ],
    })

    await renderProductDetail()
    await fireEvent.click(await screen.findByRole('button', {
      name: i18n.global.t('storefront.productDetail.addCart'),
    }))

    expect(cartService.addCartItem).not.toHaveBeenCalled()
  })

  it('should fall back to product images when sku images are missing', async () => {
    jest.mocked(productService.getProductById).mockResolvedValue({
      ...productDetail,
      skus: [
        {
          ...productDetail.skus[0]!,
          images: [],
        },
      ],
      images: [{ fileId: 'file-010', imageUrl: '/fallback-product.png' }],
    })

    await renderProductDetail()

    expect((await screen.findByAltText('product') as HTMLImageElement).src).toContain('/fallback-product.png')
  })

  it('should fall back to thumbnail when no gallery images are returned', async () => {
    jest.mocked(productService.getProductById).mockResolvedValue({
      ...productDetail,
      skus: [
        {
          ...productDetail.skus[0]!,
          images: [],
        },
      ],
      images: [],
      thumbnailUrl: '/thumbnail-only.png',
    })

    await renderProductDetail()

    expect((await screen.findByAltText('product') as HTMLImageElement).src).toContain('/thumbnail-only.png')
  })
})
