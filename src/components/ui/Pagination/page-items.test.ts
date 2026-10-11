import { describe, expect, it } from 'vitest'

import { pageItems } from './page-items'

describe('pageItems', () => {
  it('lists every page when there are few', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3])
  })

  it('shows the current page with its neighbors and gaps for the rest', () => {
    expect(pageItems(5, 10)).toEqual([1, 'gap', 4, 5, 6, 'gap', 10])
  })

  it('fills a gap of one page with the page itself', () => {
    expect(pageItems(4, 10)).toEqual([1, 2, 3, 4, 5, 'gap', 10])
  })

  it('handles the first and last page', () => {
    expect(pageItems(1, 10)).toEqual([1, 2, 'gap', 10])
    expect(pageItems(10, 10)).toEqual([1, 'gap', 9, 10])
  })
})
