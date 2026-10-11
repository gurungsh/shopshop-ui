import { describe, expect, it } from 'vitest'

import { formatMoney } from './money'

describe('formatMoney', () => {
  it('formats dollars with cents', () => {
    expect(formatMoney(149)).toBe('$149.00')
    expect(formatMoney(4.5)).toBe('$4.50')
  })

  it('groups thousands', () => {
    expect(formatMoney(1299.99)).toBe('$1,299.99')
  })
})
