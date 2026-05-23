import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/types/index'

interface SimpleCartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  slug: string
}

interface CartStore {
  items: CartItem[]
  simpleItems: SimpleCartItem[]
  addItem: (product: Product, quantity: number, variant?: ProductVariant) => void
  addToCart: (item: SimpleCartItem) => void
  removeItem: (id: string | number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const generateCartId = (productId: number, variantId?: number) => {
  return `${productId}-${variantId || 'base'}`
}

export const useCartStore = create<CartStore>()((
  persist(
    (set: any, get: any) => ({
      items: [],
      simpleItems: [],

      addItem: (product: Product, quantity: number, variant?: ProductVariant) => {
        set((state: any) => {
          const id = generateCartId(product.id, variant?.id)
          const existingItem = state.items.find((item: any) => item.id === id)

          if (existingItem) {
            return {
              items: state.items.map((item: any) =>
                item.id === id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          const price = variant ? product.price + variant.price_adjustment : product.price

          return {
            items: [
              ...state.items,
              {
                id,
                product,
                quantity,
                variant,
                price,
              },
            ],
          }
        })
      },

      addToCart: (item: SimpleCartItem) => {
        set((state: any) => {
          const existingItem = state.simpleItems.find((i: any) => i.id === item.id)

          if (existingItem) {
            return {
              simpleItems: state.simpleItems.map((i: any) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }

          return {
            simpleItems: [...state.simpleItems, item],
          }
        })
      },

      removeItem: (id: string | number) => {
        set((state: any) => ({
          items: state.items.filter((item: any) => item.id !== id),
        }))
      },

      removeFromCart: (id: number) => {
        set((state: any) => ({
          simpleItems: state.simpleItems.filter((item: any) => item.id !== id),
        }))
      },

      updateQuantity: (id: string | number, quantity: number) => {
        if (quantity <= 0) {
          (get() as any).removeFromCart(Number(id))
          return
        }

        set((state: any) => ({
          simpleItems: state.simpleItems.map((item: any) =>
            item.id === Number(id) ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ items: [], simpleItems: [] } as any),

      getTotalPrice: () => {
        return (get() as any).simpleItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        return (get() as any).simpleItems.reduce((total: number, item: any) => total + item.quantity, 0)
      },
    }),
    {
      name: 'cart-store',
      partialize: (state: any) => ({
        simpleItems: state.simpleItems,
      }),
    }
  ) as any
))
