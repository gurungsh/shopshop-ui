import { describe, expect, it } from 'vitest'

import type { Product } from '@/api/types/catalog'

import { priceCart, unavailableMessage } from './price-cart'

function product(id: string, price: number, isActive = true): Product {
  return {
    id,
    categoryId: 'c',
    name: `Product ${id}`,
    description: '',
    sku: id,
    price,
    isActive,
    createdAtUtc: '',
    updatedAtUtc: '',
  }
}

describe('priceCart', () => {
  it('prices each line from the catalog and adds them up', () => {
    const cart = priceCart(
      [
        { productId: 'a', quantity: 3 },
        { productId: 'b', quantity: 1 },
      ],
      [product('a', 0.1), product('b', 0.2)],
    )

    expect(cart.lines.map((line) => line.total)).toEqual([0.3, 0.2])
    expect(cart.subtotal).toBe(0.5)
    expect(cart.itemCount).toBe(4)
  })

  it('sets aside missing and inactive products', () => {
    const cart = priceCart(
      [
        { productId: 'a', quantity: 1 },
        { productId: 'gone', quantity: 1 },
        { productId: 'off', quantity: 2 },
      ],
      [product('a', 10), product('off', 5, false)],
    )

    expect(cart.lines).toHaveLength(1)
    expect(cart.unavailable).toEqual([
      { productId: 'gone', name: undefined },
      { productId: 'off', name: 'Product off' },
    ])
    expect(cart.subtotal).toBe(10)
  })
})

describe('unavailableMessage', () => {
  it('names the products it can', () => {
    expect(unavailableMessage([{ productId: 'a', name: 'Desk Lamp' }])).toBe(
      'Desk Lamp is no longer available, so we removed it from your cart.',
    )
    expect(
      unavailableMessage([
        { productId: 'a', name: 'Desk Lamp' },
        { productId: 'b', name: undefined },
      ]),
    ).toBe(
      'Desk Lamp and one other item are no longer available, so we removed them from your cart.',
    )
  })

  it('counts products it cannot name', () => {
    expect(unavailableMessage([{ productId: 'a', name: undefined }])).toBe(
      'One item is no longer available, so we removed it from your cart.',
    )
    expect(
      unavailableMessage([
        { productId: 'a', name: undefined },
        { productId: 'b', name: undefined },
      ]),
    ).toBe(
      '2 items are no longer available, so we removed them from your cart.',
    )
  })
})
