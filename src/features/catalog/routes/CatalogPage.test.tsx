import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCartStore } from '@/stores/cart-store'
import { server } from '@/testing/mocks/server'
import { apiUrl } from '@/testing/mocks/http'
import { renderRoute } from '@/testing/render'

import { CatalogPage } from './CatalogPage'

function productNames() {
  return within(screen.getByRole('list'))
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent)
}

describe('CatalogPage', () => {
  beforeEach(() => {
    useCartStore.setState({ lines: [] })
  })

  it('adds a product to the cart from its card', async () => {
    const { user } = renderRoute(<CatalogPage />)

    const add = await screen.findByRole('button', {
      name: 'Add Over-ear Wireless Headphones to cart',
    })
    await user.click(add)
    await user.click(add)

    expect(useCartStore.getState().lines).toEqual([
      { productId: 'a0000000-0000-4000-8000-000000000001', quantity: 2 },
    ])
  })

  it('shows the first page of products and the count', async () => {
    renderRoute(<CatalogPage />)

    expect(await screen.findByText('30 products')).toBeInTheDocument()
    expect(productNames()).toHaveLength(12)
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })

  it('filters by category and keeps the filter in the URL', async () => {
    const { user, router } = renderRoute(<CatalogPage />)

    await user.click(await screen.findByRole('checkbox', { name: 'Kitchen' }))

    expect(await screen.findByText('7 products')).toBeInTheDocument()
    expect(router.state.location.search).toBe(
      '?category=c0000000-0000-4000-8000-000000000003',
    )
  })

  it('restores the view from the URL', async () => {
    renderRoute(<CatalogPage />, { url: '/?q=Desk' })

    expect(
      await screen.findByRole('heading', { name: 'Results for “Desk”' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('3 products')).toBeInTheDocument()
  })

  it('clears every filter, including the price range', async () => {
    const { user, router } = renderRoute(<CatalogPage />, {
      url: '/?category=c0000000-0000-4000-8000-000000000003&min=40&max=100',
    })
    expect(await screen.findByText('3 products')).toBeInTheDocument()

    const filters = screen.getByRole('complementary', { name: 'Filters' })
    await user.click(
      within(filters).getByRole('button', { name: 'Clear filters' }),
    )

    expect(await screen.findByText('30 products')).toBeInTheDocument()
    expect(router.state.location.search).toBe('')
    expect(screen.getByRole('spinbutton', { name: 'Min' })).toHaveValue(null)
  })

  it('moves to the next page', async () => {
    const { user, router } = renderRoute(<CatalogPage />)

    await user.click(await screen.findByRole('button', { name: 'Next' }))

    expect(await screen.findByText('Page 2 of 3')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?page=2')
  })

  it('offers to clear filters when nothing matches', async () => {
    const { user } = renderRoute(<CatalogPage />, { url: '/?q=nothing' })

    expect(
      await screen.findByText('No products match these filters.'),
    ).toBeInTheDocument()

    const results = screen.getByRole('region', { name: 'Products' })
    await user.click(
      within(results).getByRole('button', { name: 'Clear filters' }),
    )

    expect(await screen.findByText('30 products')).toBeInTheDocument()
  })

  it('shows an error with a retry when the products fail to load', async () => {
    server.use(
      http.post(apiUrl('/api/products/search'), () =>
        HttpResponse.json({ error: 'Boom' }, { status: 500 }),
      ),
    )
    const { user } = renderRoute(<CatalogPage />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('We couldn’t load the products.')

    server.resetHandlers()
    await user.click(within(alert).getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('30 products')).toBeInTheDocument()
  })
})
