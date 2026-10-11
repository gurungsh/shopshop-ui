import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { type CartLine, useCartStore } from '@/stores/cart-store'
import { apiUrl } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import { CartPage } from './CartPage'

const headphonesId = 'a0000000-0000-4000-8000-000000000001'
const keyboardId = 'a0000000-0000-4000-8000-000000000002'
const discontinuedId = 'a0000000-0000-4000-8000-000000000030'
const deletedId = 'a0000000-0000-4000-8000-000000000999'

function renderCart(lines: CartLine[]) {
  useCartStore.setState({ lines })
  return renderRoute(<CartPage />, {
    path: '/cart',
    url: '/cart',
    routes: [{ path: '/checkout', element: <h1>Checkout</h1> }],
  })
}

const summary = () =>
  screen.getByRole('complementary', { name: 'Order summary' })
const line = (name: string) =>
  screen.getByRole('link', { name }).closest('li') as HTMLElement

describe('CartPage', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] })
  })

  it('prices the lines from the catalog', async () => {
    renderCart([
      { productId: headphonesId, quantity: 2 },
      { productId: keyboardId, quantity: 1 },
    ])

    expect(
      await screen.findByRole('link', { name: 'Over-ear Wireless Headphones' }),
    ).toBeInTheDocument()
    expect(line('Over-ear Wireless Headphones')).toHaveTextContent('$298.00')
    expect(summary()).toHaveTextContent('Items (3)')
    expect(summary()).toHaveTextContent('Estimated total$417.00')
  })

  it('updates the line and the total when the quantity changes', async () => {
    const { user } = renderCart([{ productId: headphonesId, quantity: 1 }])

    const row = await screen.findByRole('listitem')
    await user.click(
      within(row).getByRole('button', { name: 'Increase quantity' }),
    )

    expect(row).toHaveTextContent('$298.00')
    expect(summary()).toHaveTextContent('Estimated total$298.00')
    expect(useCartStore.getState().lines).toEqual([
      { productId: headphonesId, quantity: 2 },
    ])
  })

  it('removes a line', async () => {
    const { user } = renderCart([
      { productId: headphonesId, quantity: 1 },
      { productId: keyboardId, quantity: 1 },
    ])

    await user.click(
      await screen.findByRole('button', {
        name: 'Remove Over-ear Wireless Headphones',
      }),
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(summary()).toHaveTextContent('Estimated total$119.00')
  })

  it('drops products that are no longer sold and says so', async () => {
    renderCart([
      { productId: headphonesId, quantity: 1 },
      { productId: discontinuedId, quantity: 1 },
      { productId: deletedId, quantity: 1 },
    ])

    expect(
      await screen.findByText(
        'Wired Earbuds (discontinued) and one other item are no longer available, so we removed them from your cart.',
      ),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(useCartStore.getState().lines).toEqual([
      { productId: headphonesId, quantity: 1 },
    ])
  })

  it('shows the empty state', () => {
    renderCart([])

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Browse products' }),
    ).toHaveAttribute('href', '/')
  })

  it('goes to checkout', async () => {
    const { user } = renderCart([{ productId: headphonesId, quantity: 1 }])

    await user.click(await screen.findByRole('link', { name: 'Check out' }))

    expect(
      await screen.findByRole('heading', { name: 'Checkout' }),
    ).toBeInTheDocument()
  })

  it('offers a retry when prices fail to load', async () => {
    server.use(
      http.post(apiUrl('/api/products/search'), () =>
        HttpResponse.json({ error: 'Boom' }, { status: 500 }),
      ),
    )
    const { user } = renderCart([{ productId: headphonesId, quantity: 1 }])

    const alert = await screen.findByRole('alert')
    server.resetHandlers()
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('link', { name: 'Over-ear Wireless Headphones' }),
    ).toBeInTheDocument()
  })
})
