import { describe, expect, it } from 'vitest'

import type { OrderSummary } from '@/api/types/ordering'

import { needsAttention, parseRange, rangeStart, toDay } from './dashboard'

const order = (status: OrderSummary['status'], createdAtUtc: string) =>
  ({ id: status, status, createdAtUtc }) as OrderSummary

describe('needsAttention', () => {
  const now = Date.parse('2026-10-11T12:00:00Z')

  it('keeps payment failures and Pending orders older than 10 minutes', () => {
    const orders = [
      order('PaymentFailed', '2026-10-11T11:59:00Z'),
      order('Pending', '2026-10-11T11:30:00Z'),
      order('Pending', '2026-10-11T11:55:00Z'),
      order('Delivered', '2026-10-01T11:30:00Z'),
    ]
    expect(needsAttention(orders, now).map((o) => o.status)).toEqual([
      'PaymentFailed',
      'Pending',
    ])
  })
})

describe('range', () => {
  it('falls back to 30 days for anything unknown', () => {
    expect(parseRange(new URLSearchParams('range=5'))).toBe(30)
    expect(parseRange(new URLSearchParams())).toBe(30)
    expect(parseRange(new URLSearchParams('range=7'))).toBe(7)
  })

  it('starts at local midnight, counting today as day one', () => {
    const start = rangeStart(7)
    const sixDaysAgo = new Date()
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)
    expect(toDay(start)).toBe(toDay(sixDaysAgo))
    expect(start.getHours()).toBe(0)
  })
})
