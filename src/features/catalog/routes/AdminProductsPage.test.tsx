import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { users } from '@/testing/mocks/data/identity'
import { renderRoute } from '@/testing/render'

import { AdminProductsPage } from './AdminProductsPage'

function renderProducts(url = '/admin/products') {
  return renderRoute(<AdminProductsPage />, { path: '/admin/products', url })
}

const rows = async () => {
  const table = await screen.findByRole('table')
  return within(table).getAllByRole('row').slice(1)
}

describe('AdminProductsPage', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser(users[1])
  })

  afterEach(() => {
    disconnect()
  })

  it('lists active and inactive products with their category names', async () => {
    renderProducts('/admin/products?page=2')

    expect(await rows()).toHaveLength(10)
    const inactive = await screen.findByRole('row', { name: /Wired Earbuds/ })
    expect(within(inactive).getByText('Inactive')).toBeInTheDocument()
    expect(within(inactive).getByText('Audio')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('filters by SKU and keeps the filter in the URL', async () => {
    const { user, router } = renderProducts()
    await rows()

    await user.type(screen.getByLabelText('SKU'), 'aud-hp-200')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(async () => {
      expect(await rows()).toHaveLength(1)
    })
    expect(router.state.location.search).toBe('?sku=aud-hp-200')
  })

  it('ignores a category that is not an id', async () => {
    renderProducts('/admin/products?category=nope')

    expect(await rows()).toHaveLength(20)
  })

  it('deactivates and reactivates a product', async () => {
    const { user } = renderProducts('/admin/products?name=Bottle')

    await user.click(
      await screen.findByRole('button', {
        name: 'Deactivate Insulated Bottle, 750 ml',
      }),
    )

    expect(
      await screen.findByRole('button', {
        name: 'Activate Insulated Bottle, 750 ml',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Activate Insulated Bottle, 750 ml' }),
    )
    expect(await screen.findByText('Active')).toBeInTheDocument()
  })

  it('asks before deleting and explains deactivating', async () => {
    const { user } = renderProducts('/admin/products?name=Webcam')

    await user.click(
      await screen.findByRole('button', { name: 'Delete Webcam, 1080p' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(
      within(dialog).getByText(/deactivate it instead/),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Webcam, 1080p')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Delete Webcam, 1080p' }),
    )
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Delete product',
      }),
    )

    expect(
      await screen.findByText('No products match these filters.'),
    ).toBeInTheDocument()
  })
})
