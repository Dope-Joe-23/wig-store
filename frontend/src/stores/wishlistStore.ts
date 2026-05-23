import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  wishlistIds: number[]
  setWishlistIds: (ids: number[]) => void
  addWishlistId: (id: number) => void
  removeWishlistId: (id: number) => void
  isInWishlist: (id: number) => boolean
  toggleWishlist: (id: number) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistIds: [],

      setWishlistIds: (ids: number[]) => set({ wishlistIds: ids }),

      addWishlistId: (id: number) =>
        set((state) => ({
          wishlistIds: state.wishlistIds.includes(id)
            ? state.wishlistIds
            : [...state.wishlistIds, id],
        })),

      removeWishlistId: (id: number) =>
        set((state) => ({
          wishlistIds: state.wishlistIds.filter((wid) => wid !== id),
        })),

      isInWishlist: (id: number) => get().wishlistIds.includes(id),

      toggleWishlist: (id: number) => {
        if (get().wishlistIds.includes(id)) {
          get().removeWishlistId(id)
        } else {
          get().addWishlistId(id)
        }
      },
    }),
    {
      name: 'wishlist-store',
      partialize: (state) => ({
        wishlistIds: state.wishlistIds,
      }),
    }
  )
)
