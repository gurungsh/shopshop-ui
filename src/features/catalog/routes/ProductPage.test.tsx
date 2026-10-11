import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import { ProductPage } from './ProductPage'

const headphonesId = 'a0000000-0000-4000-8000-000000000001'
const discontinuedId = 'a0000000-0000-4000-8000-000000000030'

function renderProduct(id: string) {
  return renderRoute(<ProductPage />, {
    path: '/products/:id',
    url: `/products/${id}`,
  })
}

describe('ProductPage', () => {
  it('shows the product with its category, SKU and price', async () => {
    renderProduct(headphonesId)

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Over-ear Wireless Headphones',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('SKU AUD-HP-200')).toBeInTheDocument()
    expect(screen.getByText('$149.00')).toBeInTheDocument()

    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(
      await within(breadcrumb).findByRole('link', { name: 'Audio' }),
    ).toHaveAttribute('href', '/?category=c0000000-0000-4000-8000-000000000001')
  })

  it('suggests other products from the same category', async () => {
    renderProduct(headphonesId)

    const related = await screen.findByRole('region', {
      name: 'More in Audio',
    })
    const links = within(related).getAllByRole('link')

    expect(links).toHaveLength(3)
    expect(links.some((link) => link.textContent.includes('Over-ear'))).toBe(
      false,
    )
  })

  it('starts each product at quantity 1', async () => {
    const { user } = renderProduct(headphonesId)

    await user.click(
      await screen.findByRole('button', { name: 'Increase quantity' }),
    )
    expect(screen.getByRole('group', { name: 'Quantity' })).toHaveTextContent(
      '2',
    )

    const related = await screen.findByRole('region', { name: 'More in Audio' })
    await user.click(
      within(related).getByRole('link', { name: /Bookshelf Speaker Pair/ }),
    )

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Bookshelf Speaker Pair',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Quantity' })).toHaveTextContent(
      '1',
    )
  })

  it('shows the not-found state for an unknown id', async () => {
    renderProduct('a0000000-0000-4000-8000-000000000999')

    expect(
      await screen.findByRole('heading', {
        name: 'We can’t find that product',
      }),
    ).toBeInTheDocument()
  })

  it('treats an inactive product as not found', async () => {
    renderProduct(discontinuedId)

    expect(
      await screen.findByRole('heading', {
        name: 'We can’t find that product',
      }),
    ).toBeInTheDocument()
  })

  it('offers a retry when the product fails to load', async () => {
    server.use(
      http.get(apiUrl('/api/products/:id'), () =>
        HttpResponse.json({ error: 'Boom' }, { status: 500 }),
      ),
    )
    const { user } = renderProduct(headphonesId)

    const alert = await screen.findByRole('alert')
    server.resetHandlers()
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Over-ear Wireless Headphones',
      }),
    ).toBeInTheDocument()
  })
})
