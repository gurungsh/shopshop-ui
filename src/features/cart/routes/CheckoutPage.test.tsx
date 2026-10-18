import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useLocation } from 'react-router'

import type { CreateOrderRequest } from '@/api/types/ordering'
import { type CartLine, useCartStore } from '@/stores/cart-store'
import { connectTestUser } from '@/testing/auth'
import { apiUrl } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import { CheckoutPage } from './CheckoutPage'

const headphonesId = 'a0000000-0000-4000-8000-000000000001'
const keyboardId = 'a0000000-0000-4000-8000-000000000002'

function PlacedStub() {
  const location = useLocation()
  return (
    <>
      <h1>Order placed</h1>
      <output>{JSON.stringify(location.state)}</output>
    </>
  )
}

function renderCheckout(lines: CartLine[]) {
  useCartStore.setState({ lines })
  return renderRoute(<CheckoutPage />, {
    path: '/checkout',
    url: '/checkout',
    routes: [{ path: '/orders/:id/placed', element: <PlacedStub /> }],
  })
}

function recordOrderRequests() {
  const bodies: CreateOrderRequest[] = []
  server.events.on('request:start', ({ request }) => {
    if (request.method === 'POST' && request.url === apiUrl('/api/orders')) {
      void request
        .clone()
        .json()
        .then((body) => bodies.push(body as CreateOrderRequest))
    }
  })
  return bodies
}

type User = ReturnType<typeof renderCheckout>['user']

async function fillAddress(user: User) {
  await user.type(await screen.findByLabelText('Full name'), 'Alex Morgan')
  await user.type(screen.getByLabelText('Street address'), '221 Harbor St')
  await user.type(screen.getByLabelText('City'), 'Portland')
  await user.type(screen.getByLabelText('State / region'), 'OR')
  await user.type(screen.getByLabelText('Postal code'), '97201')
}

const placeOrder = () => screen.findByRole('button', { name: 'Place order' })

describe('CheckoutPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    sessionStorage.clear()
    disconnect = connectTestUser()
  })

  afterEach(() => {
    disconnect()
    server.events.removeAllListeners()
  })

  it('summarizes the cart with fresh prices', async () => {
    renderCheckout([
      { productId: headphonesId, quantity: 2 },
      { productId: keyboardId, quantity: 1 },
    ])

    const summary = await screen.findByRole('complementary', {
      name: 'Order summary',
    })
    expect(
      await within(summary).findByText('Over-ear Wireless Headphones'),
    ).toBeInTheDocument()
    expect(summary).toHaveTextContent('Estimated total$417.00')
  })

  it('places the order with the address and a payment method id only', async () => {
    const bodies = recordOrderRequests()
    const { user } = renderCheckout([{ productId: headphonesId, quantity: 2 }])

    await fillAddress(user)
    await user.type(screen.getByLabelText(/Apartment/), 'Apt 4')
    await user.selectOptions(screen.getByLabelText('Country'), 'Canada')
    await user.click(screen.getByLabelText(/Card that is declined/))
    await user.click(await placeOrder())

    expect(
      await screen.findByRole('heading', { name: 'Order placed' }),
    ).toBeInTheDocument()
    expect(bodies).toEqual([
      {
        shippingAddress:
          'Alex Morgan\n221 Harbor St\nApt 4\nPortland, OR 97201\nCanada',
        items: [{ productId: headphonesId, quantity: 2 }],
        paymentMethodId: 'pm_card_chargeDeclined',
      },
    ])
    expect(useCartStore.getState().lines).toEqual([])
    expect(sessionStorage.getItem('shopshop.checkout.address')).toBeNull()
  })

  it('checks the address before calling the API', async () => {
    const bodies = recordOrderRequests()
    const { user } = renderCheckout([{ productId: headphonesId, quantity: 1 }])

    await user.type(await screen.findByLabelText('Full name'), 'Alex')
    await user.click(await placeOrder())

    expect(
      await screen.findByText('Check your shipping address.'),
    ).toBeInTheDocument()
    expect(screen.getByText('4 fields need attention.')).toBeInTheDocument()
    expect(screen.getByLabelText('Postal code')).toHaveAccessibleDescription(
      'Enter a postal code.',
    )
    expect(screen.getByLabelText('Street address')).toHaveFocus()
    expect(bodies).toEqual([])
  })

  it('sends one order for a double click', async () => {
    const bodies = recordOrderRequests()
    const { user } = renderCheckout([{ productId: headphonesId, quantity: 1 }])

    await fillAddress(user)
    await user.dblClick(await placeOrder())

    await screen.findByRole('heading', { name: 'Order placed' })
    expect(bodies).toHaveLength(1)
  })

  it('passes the names of skipped products to the next page', async () => {
    server.use(
      http.post(apiUrl('/api/orders'), () =>
        HttpResponse.json(
          {
            order: { id: 'e0000000-0000-4000-8000-000000000099' },
            skippedProductIds: [keyboardId],
          },
          { status: 201 },
        ),
      ),
    )
    const { user } = renderCheckout([
      { productId: headphonesId, quantity: 1 },
      { productId: keyboardId, quantity: 1 },
    ])

    await fillAddress(user)
    await user.click(await placeOrder())

    expect(await screen.findByRole('status')).toHaveTextContent(
      '{"skippedItems":["Mechanical Keyboard, 75%"]}',
    )
  })

  it('keeps the cart and offers a retry when prices can’t be checked', async () => {
    server.use(
      http.post(apiUrl('/api/orders'), () =>
        HttpResponse.json(
          { error: 'Catalog service is unavailable.' },
          { status: 503 },
        ),
      ),
    )
    const { user } = renderCheckout([{ productId: headphonesId, quantity: 1 }])

    await fillAddress(user)
    await user.click(await placeOrder())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('trouble checking prices')
    expect(useCartStore.getState().lines).toHaveLength(1)

    server.resetHandlers()
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', { name: 'Order placed' }),
    ).toBeInTheDocument()
  })

  it('shows the API’s message for a rejected order', async () => {
    server.use(
      http.post(apiUrl('/api/orders'), () =>
        HttpResponse.json(
          { error: 'None of the requested products are available.' },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderCheckout([{ productId: headphonesId, quantity: 1 }])

    await fillAddress(user)
    await user.click(await placeOrder())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'None of the requested products are available.',
    )
    expect(await placeOrder()).toBeEnabled()
  })

  it('restores the address draft', async () => {
    sessionStorage.setItem(
      'shopshop.checkout.address',
      JSON.stringify({ fullName: 'Alex Morgan', city: 'Portland' }),
    )
    renderCheckout([{ productId: headphonesId, quantity: 1 }])

    expect(await screen.findByLabelText('Full name')).toHaveValue('Alex Morgan')
    expect(screen.getByLabelText('City')).toHaveValue('Portland')
    expect(screen.getByLabelText('Country')).toHaveValue('United States')
  })

  it('shows the empty state without a cart', () => {
    renderCheckout([])

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
  })
})
