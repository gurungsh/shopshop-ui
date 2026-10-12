import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { users } from '@/testing/mocks/data/identity'
import { renderRoute } from '@/testing/render'

import { AdminCategoriesPage } from './AdminCategoriesPage'
import {
  AdminCategoryCreatePage,
  AdminCategoryEditPage,
} from './AdminCategoryFormPages'

describe('Admin categories', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser(users[1])
  })

  afterEach(() => {
    disconnect()
  })

  it('lists categories and filters by name', async () => {
    const { user } = renderRoute(<AdminCategoriesPage />, {
      path: '/admin/categories',
      url: '/admin/categories',
    })
    expect(
      await screen.findByRole('row', { name: /Audio/ }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(5)

    await user.type(screen.getByLabelText('Name contains'), 'kitch')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(2)
    })
  })

  it('explains why a category that products use can’t be deleted', async () => {
    const { user } = renderRoute(<AdminCategoriesPage />, {
      path: '/admin/categories',
      url: '/admin/categories',
    })

    await user.click(
      await screen.findByRole('button', { name: 'Delete Audio' }),
    )
    const dialog = await screen.findByRole('alertdialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Delete category' }),
    )

    expect(
      await within(dialog).findByText(/move them to another/),
    ).toBeInTheDocument()
  })

  it('puts a duplicate name next to the name field', async () => {
    const { user } = renderRoute(<AdminCategoryCreatePage />, {
      path: '/admin/categories/new',
      url: '/admin/categories/new',
    })

    await user.type(screen.getByLabelText('Name'), 'kitchen')
    await user.click(screen.getByRole('button', { name: 'Create category' }))

    expect(
      await screen.findByText('A Category with this name already exists.'),
    ).toBeInTheDocument()
  })

  it('creates a category and edits it', async () => {
    const list = { path: '/admin/categories', element: <p>Category list</p> }
    const created = renderRoute(<AdminCategoryCreatePage />, {
      path: '/admin/categories/new',
      url: '/admin/categories/new',
      routes: [list],
    })
    await created.user.type(screen.getByLabelText('Name'), 'Toys')
    await created.user.click(
      screen.getByRole('button', { name: 'Create category' }),
    )
    expect(await screen.findByText('Category list')).toBeInTheDocument()
    created.unmount()

    const id = 'c0000000-0000-4000-8000-000000000004'
    const { user } = renderRoute(<AdminCategoryEditPage />, {
      path: '/admin/categories/:id',
      url: `/admin/categories/${id}`,
      routes: [list],
    })
    const name = await screen.findByLabelText('Name')
    expect(name).toHaveValue('Outdoor')
    await user.clear(name)
    await user.type(name, 'Outdoors')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('Category list')).toBeInTheDocument()
  })
})
