import { beforeEach, describe, expect, it } from 'vitest'

import {
  MAX_LINES,
  selectCanAdd,
  selectItemCount,
  useCartStore,
} from './cart-store'

const cart = () => useCartStore.getState()

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] })
  })

  it('adds a product once and raises its quantity on later adds', () => {
    cart().add('a')
    cart().add('a', 2)
    cart().add('b')

    expect(cart().lines).toEqual([
      { productId: 'a', quantity: 3 },
      { productId: 'b', quantity: 1 },
    ])
    expect(selectItemCount(cart())).toBe(4)
  })

  it('keeps quantities between 1 and 99', () => {
    cart().add('a', 120)
    expect(cart().lines[0]?.quantity).toBe(99)

    cart().setQuantity('a', 0)
    expect(cart().lines[0]?.quantity).toBe(1)
  })

  it('removes lines', () => {
    cart().add('a')
    cart().add('b')
    cart().add('c')

    cart().remove('a', 'c')

    expect(cart().lines).toEqual([{ productId: 'b', quantity: 1 }])
  })

  it('stops adding new products at the line cap', () => {
    useCartStore.setState({
      lines: Array.from({ length: MAX_LINES }, (_, n) => ({
        productId: String(n),
        quantity: 1,
      })),
    })

    expect(cart().add('new')).toBe(false)
    expect(selectCanAdd('new')(cart())).toBe(false)
    expect(cart().add('0')).toBe(true)
    expect(selectCanAdd('0')(cart())).toBe(true)
    expect(cart().lines).toHaveLength(MAX_LINES)
  })

  it('persists the lines to localStorage', () => {
    cart().add('a', 2)

    expect(JSON.parse(localStorage.getItem('shopshop.cart') ?? '{}')).toEqual({
      state: { lines: [{ productId: 'a', quantity: 2 }] },
      version: 1,
    })
  })

  it('drops malformed lines when it reads them back', async () => {
    localStorage.setItem(
      'shopshop.cart',
      JSON.stringify({
        state: {
          lines: [
            { productId: 'a', quantity: 500 },
            { productId: 7, quantity: 1 },
            'junk',
          ],
        },
        version: 1,
      }),
    )

    await useCartStore.persist.rehydrate()

    expect(cart().lines).toEqual([{ productId: 'a', quantity: 99 }])
  })
})
