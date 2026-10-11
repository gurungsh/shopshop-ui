import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

import { useCartStore } from '@/stores/cart-store'

import { cartProductsQuery } from '../api/queries'
import { priceCart, type UnavailableLine } from './price-cart'

/**
 * Prices the cart from the catalog and drops lines that are no longer sold.
 * `removed` keeps the dropped lines for the notice after they leave the store.
 */
export function usePricedCart() {
  const lines = useCartStore((state) => state.lines)
  const remove = useCartStore((state) => state.remove)
  const products = useQuery(
    cartProductsQuery(lines.map((line) => line.productId)),
  )

  const cart = useMemo(
    () => (products.data ? priceCart(lines, products.data) : undefined),
    [lines, products.data],
  )

  const unavailable =
    cart && !products.isPlaceholderData ? cart.unavailable : undefined

  const [removed, setRemoved] = useState<UnavailableLine[]>([])
  const newlyRemoved = unavailable?.filter(
    (line) => !removed.some((r) => r.productId === line.productId),
  )
  if (newlyRemoved?.length) setRemoved([...removed, ...newlyRemoved])

  useEffect(() => {
    if (unavailable?.length) {
      remove(...unavailable.map((line) => line.productId))
    }
  }, [unavailable, remove])

  return {
    cart,
    removed,
    isEmpty: lines.length === 0 || cart?.lines.length === 0,
    isError: products.isError,
    refetch: products.refetch,
  }
}
