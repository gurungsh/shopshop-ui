import { describe, expect, it } from 'vitest'

import {
  emptyFilters,
  hasFilters,
  PAGE_SIZE,
  parseFilters,
  toProductQuery,
  toSearchParams,
} from './filters'

describe('parseFilters', () => {
  it('reads every filter from the URL', () => {
    const filters = parseFilters(
      new URLSearchParams(
        'q=desk&category=a&category=b&min=10&max=99.5&page=3',
      ),
    )

    expect(filters).toEqual({
      q: 'desk',
      categoryIds: ['a', 'b'],
      min: 10,
      max: 99.5,
      page: 3,
    })
  })

  it('ignores values it cannot use', () => {
    const filters = parseFilters(new URLSearchParams('min=abc&max=-5&page=0'))

    expect(filters).toEqual(emptyFilters)
  })
})

describe('toSearchParams', () => {
  it('leaves out defaults so URLs stay short', () => {
    expect(toSearchParams(emptyFilters).toString()).toBe('')
  })

  it('round-trips through parseFilters', () => {
    const filters = {
      q: 'desk lamp',
      categoryIds: ['a'],
      min: 5,
      max: 50,
      page: 2,
    }

    expect(parseFilters(toSearchParams(filters))).toEqual(filters)
  })
})

describe('toProductQuery', () => {
  it('trims the search and leaves out empty filters', () => {
    expect(toProductQuery({ ...emptyFilters, q: '  lamp  ' })).toEqual({
      name: 'lamp',
      categoryIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
      pageSize: PAGE_SIZE,
    })
  })
})

describe('hasFilters', () => {
  it('is false for the default view, even on a later page', () => {
    expect(hasFilters({ ...emptyFilters, page: 4 })).toBe(false)
  })

  it('is true once any filter is set', () => {
    expect(hasFilters({ ...emptyFilters, min: 0 })).toBe(true)
    expect(hasFilters({ ...emptyFilters, q: 'x' })).toBe(true)
  })
})
