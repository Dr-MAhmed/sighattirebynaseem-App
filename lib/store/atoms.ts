import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type { ProductType } from "@/types/product"

// Types
export interface CartItem {
  product_id: string
  product: ProductType
  quantity: number
  price_at_add: number
  attributes_selected?: Record<string, string>
  addedAt: Date
  updated_at: Date
}

export interface WishlistItem {
  product_id: string
  product: ProductType
  addedAt: Date
}

// Anonymous user
export const deviceIdAtom = atomWithStorage<string | null>("device_id", null)

// Cart
export const cartItemsAtom = atomWithStorage<CartItem[]>("cart_items", [])
export const cartOpenAtom = atom(false)

// Calculate cart totals
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom)
  // Always use price_at_add to maintain price consistency across all pages
  return items.reduce((total, item) => total + item.price_at_add * item.quantity, 0)
})

export const cartItemCountAtom = atom((get) => {
  const items = get(cartItemsAtom)
  return items.reduce((count, item) => count + item.quantity, 0)
})

// Wishlist
export const wishlistItemsAtom = atomWithStorage<WishlistItem[]>("wishlist_items", [])
export const wishlistItemCountAtom = atom((get) => get(wishlistItemsAtom).length)

// Checkout
export interface ShippingAddress {
  name: string
  email: string
  phone: string
  street: string
  city: string
  province: string
}

export const checkoutShippingAddressAtom = atomWithStorage<ShippingAddress | null>("checkout_shipping", null)
export const checkoutPaymentScreenshotAtom = atom<File | null>(null)
export const checkoutStepAtom = atom<number>(1)

// UI State
export const filterOptionsAtom = atom<{
  priceRange: [number, number]
  attributes: Record<string, string[]>
  sort: string
}>({
  priceRange: [0, 10000],
  attributes: {},
  sort: "newest",
})
