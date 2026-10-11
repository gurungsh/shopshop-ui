import { act, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { addMockOrder, orderId, orders } from '@/testing/mocks/data/ordering'
import { renderRoute } from '@/testing/render'

import { OrderDetailPage } from './OrderDetailPage'

function renderDetail(id: string) {
  return renderRoute(<OrderDetailPage />, {
    path: '/account/orders/:id',
    url: `/account/orders/${id}`,
  })
}

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

const cancelButton = () =>
  screen.queryByRole('button', { name: 'Cancel order' })

describe('OrderDetailPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    disconnect = connectTestUser()
  })

  afterEach(() => {
    disconnect()
    vi.useRealTimers()
  })

  it('shows the order, its progress and where it ships', async () => {
    renderDetail(orderId(5))

    expect(
      await screen.findByRole('heading', { name: 'Order #E0000005' }),
    ).toBeInTheDocument()
    const progress = screen.getByRole('region', { name: 'Order progress' })
    expect(
      within(progress).getByText('Processing').closest('li'),
    ).toHaveAttribute('aria-current', 'step')
    expect(screen.getByText('Pour-over Coffee Set')).toBeInTheDocument()
    expect(screen.getByText('221 Harbour Street')).toBeInTheDocument()
    expect(screen.getByText('Portland, OR 97201')).toBeInTheDocument()
    expect(cancelButton()).toBeInTheDocument()
  })

  it('cancels an eligible order after confirming', async () => {
    const id = addMockOrder({ status: 'Confirmed' })
    const { user } = renderDetail(id)

    await user.click(
      await screen.findByRole('button', { name: 'Cancel order' }),
    )
    const dialog = screen.getByRole('alertdialog', {
      name: 'Cancel this order?',
    })
    await user.click(
      within(dialog).getByRole('button', { name: 'Cancel order' }),
    )

    expect(
      await screen.findByText('This order was canceled. It won’t be shipped.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Canceled', { selector: '[data-status]' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(cancelButton()).toBeNull()
  })

  it('keeps the order when the customer changes their mind', async () => {
    const id = addMockOrder({ status: 'Processing' })
    const { user } = renderDetail(id)

    await user.click(
      await screen.findByRole('button', { name: 'Cancel order' }),
    )
    await user.click(screen.getByRole('button', { name: 'Keep order' }))

    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(
      screen.getByText('Processing', { selector: '[data-status]' }),
    ).toBeInTheDocument()
  })

  it('has no cancel button once the order has shipped', async () => {
    renderDetail(orderId(4))

    await screen.findByRole('heading', { name: 'Order #E0000004' })
    expect(cancelButton()).toBeNull()
  })

  it('explains and refreshes when the order shipped while the page was open', async () => {
    const id = addMockOrder({ status: 'Processing' })
    const { user } = renderDetail(id)
    await user.click(
      await screen.findByRole('button', { name: 'Cancel order' }),
    )

    const mock = orders.find((o) => o.order.id === id)
    if (!mock) throw new Error('No mock order')
    mock.order.status = 'Shipped'
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', {
        name: 'Cancel order',
      }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'This order can’t be canceled anymore.',
    )
    expect(
      await screen.findByText('Shipped', { selector: '[data-status]' }),
    ).toBeInTheDocument()
    expect(cancelButton()).toBeNull()
  })

  it('refreshes a pending order until the payment is confirmed', async () => {
    const id = addMockOrder()
    renderDetail(id)

    expect(
      await screen.findByText('We’re processing your payment.'),
    ).toBeInTheDocument()

    await advance(5000)

    expect(
      await screen.findByText('Confirmed', { selector: '[data-status]' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('We’re processing your payment.')).toBeNull()
  })

  it('lets the customer retry a failed payment', async () => {
    const id = addMockOrder({
      status: 'PaymentFailed',
      paymentAttempts: 2,
      paymentMethodId: 'pm_card_chargeDeclined',
      paymentFailureReason: 'Your card was declined.',
    })
    const { user } = renderDetail(id)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your card was declined.You have 2 tries left.',
    )
    const progress = screen.getByRole('region', { name: 'Order progress' })
    expect(within(progress).getByText('Payment failed')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Pay $247.00' }))
    expect(
      await screen.findByText('We’re processing your payment.'),
    ).toBeInTheDocument()

    await advance(5000)
    expect(
      await screen.findByText('Confirmed', { selector: '[data-status]' }),
    ).toBeInTheDocument()
  })

  it('says when the order does not exist', async () => {
    renderDetail('e0000999-0000-4000-8000-000000000999')

    expect(
      await screen.findByRole('heading', {
        name: 'We couldn’t find that order',
      }),
    ).toBeInTheDocument()
  })
})
