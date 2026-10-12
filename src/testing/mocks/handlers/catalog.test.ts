import { describe, expect, it } from 'vitest'

import { apiFetch } from '@/api/client'
import type { Category, Product } from '@/api/types/catalog'
import type { Paged } from '@/api/types/paged'

const searchProducts = (body: object) =>
  apiFetch<Paged<Product>>('/api/products/search', { method: 'POST', body })

describe('catalog mock', () => {
  it('matches names and descriptions whatever the case', async () => {
    const byName = await searchProducts({ name: 'tent' })
    expect(byName.items.map((p) => p.name)).toEqual(['Two-person Tent'])

    const byDescription = await searchProducts({ description: 'CAST' })
    expect(byDescription.totalCount).toBe(0)
    const found = await searchProducts({ description: 'pre-SEASONED' })
    expect(found.items.map((p) => p.sku)).toEqual(['KIT-SK-010'])
  })

  it('rejects a bad page, page size or price range like the validators do', async () => {
    await expect(searchProducts({ page: 0 })).rejects.toMatchObject({
      status: 400,
      fieldErrors: { Page: ['Page must be at least 1.'] },
    })
    await expect(searchProducts({ pageSize: 101 })).rejects.toMatchObject({
      status: 400,
    })
    await expect(
      searchProducts({ minPrice: 50, maxPrice: 10 }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('lists categories by name, as the backend does', async () => {
    const result = await apiFetch<Paged<Category>>('/api/categories/search', {
      method: 'POST',
      body: {},
    })

    expect(result.items.map((c) => c.name)).toEqual([
      'Audio',
      'Home office',
      'Kitchen',
      'Outdoor',
    ])
  })
})
