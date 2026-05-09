import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '@hivespace/shared'
import { cartService } from '@/services/cart.service'
import { useAsyncAction } from '@/composables/useAsyncAction'
import type { CartItem, CartGroup, CartItemResponse } from '@/types'

const parseSkuAttributes = (raw: string): string => {
  try {
    const attrs = JSON.parse(raw) as Record<string, string>
    return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ')
  } catch {
    return raw
  }
}

const mapApiItemsToGroups = (items: CartItemResponse[]): CartGroup[] => {
  const groupMap = new Map<string, CartGroup>()

  for (const item of items) {
    if (!groupMap.has(item.storeName)) {
      groupMap.set(item.storeName, {
        sellerName: item.storeName,
        isMall: false,
        selected: false,
        items: [],
      })
    }

    const group = groupMap.get(item.storeName)!
    group.items.push({
      id: item.cartItemId,
      cartItemId: item.cartItemId,
      skuId: item.skuId,
      name: item.productName,
      image: item.skuImageUrl || item.productThumbnailUrl,
      price: item.price,
      quantity: item.quantity,
      variant: item.skuAttributes ? parseSkuAttributes(item.skuAttributes) : undefined,
      selected: item.isSelected,
    })
  }

  for (const group of groupMap.values()) {
    group.selected = group.items.length > 0 && group.items.every(i => i.selected)
  }

  return Array.from(groupMap.values())
}

export const useCartStore = defineStore('cart', () => {
  const cartGroups = ref<CartGroup[]>([])
  const selectedCount = ref(0)
  const { isLoading, run } = useAsyncAction()

  const loadCart = async () => {
    const response = await run(() => cartService.getCartItems())
    cartGroups.value = mapApiItemsToGroups(response.items)
  }

  const syncItem = async (item: CartItem) => {
    try {
      await cartService.updateCartItems({
        selectAll: null,
        items: [{ cartItemId: item.cartItemId, skuId: item.skuId, quantity: item.quantity, isSelected: item.selected }],
      })
    } catch {
      useAppStore().notifyError('cart.errors.syncFailed')
    }
  }

  const syncItems = async (items: CartItem[], selectAll: boolean | null = null) => {
    if (items.length === 0) return
    try {
      await cartService.updateCartItems({
        selectAll,
        items: items.map(i => ({ cartItemId: i.cartItemId, skuId: i.skuId, quantity: i.quantity, isSelected: i.selected })),
      })
    } catch {
      useAppStore().notifyError('cart.errors.syncFailed')
    }
  }

  const removeItem = async (cartItemId: string) => {
    try {
      await cartService.removeCartItem(cartItemId)
      for (const group of cartGroups.value) {
        group.items = group.items.filter(i => i.cartItemId !== cartItemId)
      }
      cartGroups.value = cartGroups.value.filter(g => g.items.length > 0)
    } catch {
      useAppStore().notifyError('cart.errors.removeFailed')
    }
  }

  const removeItems = async (cartItemIds: string[]) => {
    if (cartItemIds.length === 0) return
    try {
      await Promise.all(cartItemIds.map(id => cartService.removeCartItem(id)))
      for (const group of cartGroups.value) {
        group.items = group.items.filter(i => !cartItemIds.includes(i.cartItemId))
      }
      cartGroups.value = cartGroups.value.filter(g => g.items.length > 0)
    } catch {
      useAppStore().notifyError('cart.errors.removeFailed')
    }
  }

  const fetchSelectedCount = async () => {
    try {
      const response = await cartService.getSelectedItemsCount()
      selectedCount.value = response.count
    } catch {
      // silently ignore — badge stays at last known value
    }
  }

  return { cartGroups, isLoading, selectedCount, loadCart, fetchSelectedCount, syncItem, syncItems, removeItem, removeItems }
})
