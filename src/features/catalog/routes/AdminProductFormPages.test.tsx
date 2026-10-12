import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { UpdateProductRequest } from '@/api/types/catalog'
import { connectTestUser } from '@/testing/auth'
import { products } from '@/testing/mocks/data/catalog'
import { users } from '@/testing/mocks/data/identity'
import { apiUrl } from '@/testing/mocks/http'
import { server } from '@/testing/mocks/server'
import { renderRoute } from '@/testing/render'

import {
  AdminProductCreatePage,
  AdminProductEditPage,
} from './AdminProductFormPages'

const list = { path: '/admin/products', element: <p>Product list</p> }
const first = products[0]?.id ?? ''

describe('Admin product forms', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser(users[1])
  })

  afterEach(() => {
    disconnect()
  })

  it('creates a product and returns to the list', async () => {
    const { user } = renderRoute(<AdminProductCreatePage />, {
      path: '/admin/products/new',
      url: '/admin/products/new',
      routes: [list],
    })

    await user.selectOptions(
      screen.getByLabelText('Category'),
      await screen.findByRole('option', { name: 'Kitchen' }),
    )
    await user.type(screen.getByLabelText('Name'), 'Milk Frother')
    await user.type(screen.getByLabelText('SKU'), 'kit-mf-001')
    await user.type(screen.getByLabelText('Price (USD)'), '24.5')
    await user.type(screen.getByLabelText('Description'), 'Handheld frother.')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(await screen.findByText('Product list')).toBeInTheDocument()
    expect(products.find((p) => p.sku === 'KIT-MF-001')?.price).toBe(24.5)
  })

  it('shows the form’s own errors before calling the API', async () => {
    const { user } = renderRoute(<AdminProductCreatePage />, {
      path: '/admin/products/new',
      url: '/admin/products/new',
    })

    await user.type(await screen.findByLabelText('SKU'), 'no spaces')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(await screen.findByText('Category is required.')).toBeInTheDocument()
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Sku may only contain letters, numbers, hyphens, and underscores.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Price is required.')).toBeInTheDocument()
  })

  it('puts a duplicate SKU next to the SKU field', async () => {
    const { user } = renderRoute(<AdminProductCreatePage />, {
      path: '/admin/products/new',
      url: '/admin/products/new',
    })

    await user.selectOptions(
      screen.getByLabelText('Category'),
      await screen.findByRole('option', { name: 'Audio' }),
    )
    await user.type(screen.getByLabelText('Name'), 'Another')
    await user.type(screen.getByLabelText('SKU'), 'AUD-HP-200')
    await user.type(screen.getByLabelText('Price (USD)'), '10')
    await user.type(screen.getByLabelText('Description'), 'Text')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(
      await screen.findByText('A Product with this SKU already exists.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('SKU')).toHaveAccessibleDescription(
      /already exists/,
    )
  })

  it('puts the API’s field errors next to their fields', async () => {
    server.use(
      http.post(apiUrl('/api/admin/products'), () =>
        HttpResponse.json(
          { errors: { Price: ['Price must be greater than 0.'] } },
          { status: 400 },
        ),
      ),
    )
    const { user } = renderRoute(<AdminProductCreatePage />, {
      path: '/admin/products/new',
      url: '/admin/products/new',
    })

    await user.selectOptions(
      screen.getByLabelText('Category'),
      await screen.findByRole('option', { name: 'Audio' }),
    )
    await user.type(screen.getByLabelText('Name'), 'Another')
    await user.type(screen.getByLabelText('SKU'), 'NEW-1')
    await user.type(screen.getByLabelText('Price (USD)'), '10')
    await user.type(screen.getByLabelText('Description'), 'Text')
    await user.click(screen.getByRole('button', { name: 'Create product' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(
      await screen.findByText('Price must be greater than 0.'),
    ).toBeInTheDocument()
  })

  it('sends only the fields that changed', async () => {
    let body: UpdateProductRequest | undefined
    server.use(
      http.put(apiUrl(`/api/admin/products/${first}`), async ({ request }) => {
        body = (await request.json()) as UpdateProductRequest
        return HttpResponse.json(products[0])
      }),
    )
    const { user } = renderRoute(<AdminProductEditPage />, {
      path: '/admin/products/:id',
      url: `/admin/products/${first}`,
      routes: [list],
    })

    const price = await screen.findByLabelText('Price (USD)')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()

    await user.clear(price)
    await user.type(price, '139')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Product list')).toBeInTheDocument()
    expect(body).toEqual({ price: 139 })
  })

  it('says when the product does not exist', async () => {
    renderRoute(<AdminProductEditPage />, {
      path: '/admin/products/:id',
      url: '/admin/products/b0000000-0000-4000-8000-000000000000',
    })

    expect(
      await screen.findByText('We couldn’t find that product. Check the link.'),
    ).toBeInTheDocument()
  })
})
