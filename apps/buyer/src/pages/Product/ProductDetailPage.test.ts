import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createPinia, setActivePinia } from 'pinia'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import i18n from '@/i18n'
import ProductDetailPage from './ProductDetailPage.vue'
import { addressService } from '@/services/address.service'
import { cartService } from '@/services/cart.service'
import { productService } from '@/services/product.service'
import type { GetProductDetailResponse } from '@/types'

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
  variants: [
    {
      id: 'variant-size',
      name: 'Size',
      options: [{ value: 'M' }, { value: 'L' }],
    },
    {
      id: 'variant-color',
      name: 'Color',
      options: [{ value: 'Amber' }, { value: 'Dark' }],
    },
  ],
  skus: [
    {
      id: 100,
      skuVariants: [
        { variantName: 'Size', value: 'M' },
        { variantName: 'Color', value: 'Amber' },
      ],
      price: { amount: 100_000, currency: 704 },
      quantity: 10,
      images: [
        { skuId: '100', fileId: 'file-001', imageUrl: '/honey-m.png' },
        { skuId: '100', fileId: 'file-002', imageUrl: '/honey-m-2.png' },
      ],
    },
    {
      id: 101,
      skuVariants: [
        { variantName: 'Size', value: 'L' },
        { variantName: 'Color', value: 'Dark' },
      ],
      price: { amount: 150_000, currency: 704 },
      quantity: 10,
      images: [{ skuId: '101', fileId: 'file-003', imageUrl: '/honey-l.png' }],
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

  it('should render title price and variants from stubbed product detail', async () => {
    await renderProductDetail()

    expect(await screen.findByRole('heading', { name: 'Honey Jar' })).toBeTruthy()
    expect(screen.getAllByText('100.000₫').length).toBeGreaterThan(0)
    expect(screen.getByText('Size')).toBeTruthy()
    expect(screen.getAllByText('M').length).toBeGreaterThan(0)
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
    expect(mainImage.src).toContain('/honey-m-2.png')

    await fireEvent.click(prevButton)
    expect(mainImage.src).toContain('/honey-m.png')
  })

  it('should switch variant options and render the fallback address copy', async () => {
    jest.mocked(addressService.getDefaultAddress).mockRejectedValueOnce(new Error('missing address'))
    await renderProductDetail()

    expect(await screen.findByText(
      new RegExp(i18n.global.t('storefront.productDetail.noDefaultAddress')),
    )).toBeTruthy()

    await fireEvent.click(screen.getByText('L'))
    await fireEvent.click(screen.getByText('Dark'))

    expect(screen.getAllByText('L').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dark').length).toBeGreaterThan(0)
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
})
