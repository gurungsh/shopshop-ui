import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const MAX_QUANTITY = 99
/** The API accepts at most 100 items (lines) per order */
export const MAX_LINES = 100

export interface CartLine {
  productId: string
  quantity: number
}

interface CartState {
  lines: CartLine[]
  /** Returns false when the cart is full and the product is not in it yet */
  add: (productId: string, quantity?: number) => boolean
  setQuantity: (productId: string, quantity: number) => void
  remove: (...productIds: string[]) => void
  clear: () => void
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)))
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false
  const line = value as Partial<CartLine>
  return (
    typeof line.productId === 'string' &&
    typeof line.quantity === 'number' &&
    Number.isFinite(line.quantity)
  )
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (productId, quantity = 1) => {
        const { lines } = get()
        const existing = lines.find((line) => line.productId === productId)

        if (existing) {
          set({
            lines: lines.map((line) =>
              line === existing
                ? {
                    ...line,
                    quantity: clampQuantity(line.quantity + quantity),
                  }
                : line,
            ),
          })
          return true
        }

        if (lines.length >= MAX_LINES) return false
        set({
          lines: [...lines, { productId, quantity: clampQuantity(quantity) }],
        })
        return true
      },
      setQuantity: (productId, quantity) => {
        set({
          lines: get().lines.map((line) =>
            line.productId === productId
              ? { ...line, quantity: clampQuantity(quantity) }
              : line,
          ),
        })
      },
      remove: (...productIds) => {
        set({
          lines: get().lines.filter(
            (line) => !productIds.includes(line.productId),
          ),
        })
      },
      clear: () => {
        set({ lines: [] })
      },
    }),
    {
      name: 'shopshop.cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ lines }) => ({ lines }),
      // localStorage can be edited by hand, so keep only well-formed lines
      merge: (persisted, current) => {
        const stored = (persisted as { lines?: unknown } | undefined)?.lines
        const lines = Array.isArray(stored) ? stored.filter(isCartLine) : []
        return {
          ...current,
          lines: lines.slice(0, MAX_LINES).map((line) => ({
            productId: line.productId,
            quantity: clampQuantity(line.quantity),
          })),
        }
      },
    },
  ),
)

export function selectItemCount(state: CartState): number {
  return state.lines.reduce((count, line) => count + line.quantity, 0)
}

/** A product can be added unless the cart is full and it is not in it yet */
export function selectCanAdd(productId: string) {
  return (state: CartState) =>
    state.lines.length < MAX_LINES ||
    state.lines.some((line) => line.productId === productId)
}
