import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { users } from '@/testing/mocks/data/identity'
import { renderRoute } from '@/testing/render'

import { useAuthStore } from '../lib/session-store'
import { AdminUsersPage } from './AdminUsersPage'
import { AdminUserCreatePage, AdminUserEditPage } from './AdminUserFormPages'

const admin = users[1]
const customer = users[0]
const list = { path: '/admin/users', element: <p>User list</p> }

describe('Admin users', () => {
  let disconnect: () => void

  beforeEach(() => {
    disconnect = connectTestUser(admin)
    useAuthStore.setState({
      session: {
        user: { id: admin?.id ?? '', email: admin?.email ?? '', role: 'Admin' },
        token: 'test',
        expiresAt: Date.now() + 3_600_000,
      },
    })
  })

  afterEach(() => {
    disconnect()
    useAuthStore.setState({ session: null })
  })

  it('lists users and filters by role', async () => {
    const { user, router } = renderRoute(<AdminUsersPage />, {
      path: '/admin/users',
      url: '/admin/users',
    })
    expect(await screen.findAllByRole('row')).toHaveLength(3)

    await user.selectOptions(screen.getByLabelText('Role'), 'Customer')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(2)
    })
    expect(router.state.location.search).toBe('?role=Customer')
  })

  it('does not let an admin delete themselves', async () => {
    renderRoute(<AdminUsersPage />, {
      path: '/admin/users',
      url: '/admin/users',
    })

    const own = await screen.findByRole('row', { name: /admin@example.com/ })
    expect(within(own).getByText('(you)')).toBeInTheDocument()
    expect(
      within(own).getByRole('button', { name: 'Delete admin@example.com' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Delete alex@example.com' }),
    ).toBeEnabled()
  })

  it('does not let an admin change their own role', async () => {
    renderRoute(<AdminUserEditPage />, {
      path: '/admin/users/:id',
      url: `/admin/users/${admin?.id ?? ''}`,
    })

    expect(await screen.findByLabelText('Role')).toBeDisabled()
  })

  it('creates a user, then changes their role and deletes them', async () => {
    const created = renderRoute(<AdminUserCreatePage />, {
      path: '/admin/users/new',
      url: '/admin/users/new',
      routes: [list],
    })
    await created.user.type(screen.getByLabelText('Email'), 'sam@example.com')
    await created.user.type(screen.getByLabelText('Password'), 'Sup3r-secret')
    await created.user.selectOptions(screen.getByLabelText('Role'), 'Admin')
    await created.user.click(
      screen.getByRole('button', { name: 'Create user' }),
    )
    expect(await screen.findByText('User list')).toBeInTheDocument()
    created.unmount()

    const sam = users.find((u) => u.email === 'sam@example.com')
    expect(sam?.role).toBe('Admin')

    const edited = renderRoute(<AdminUserEditPage />, {
      path: '/admin/users/:id',
      url: `/admin/users/${sam?.id ?? ''}`,
      routes: [list],
    })
    await edited.user.selectOptions(
      await screen.findByLabelText('Role'),
      'Customer',
    )
    await edited.user.click(
      screen.getByRole('button', { name: 'Save changes' }),
    )
    expect(await screen.findByText('User list')).toBeInTheDocument()
    expect(sam?.role).toBe('Customer')
    edited.unmount()

    const { user } = renderRoute(<AdminUsersPage />, {
      path: '/admin/users',
      url: '/admin/users?email=sam@example.com',
    })
    await user.click(
      await screen.findByRole('button', { name: 'Delete sam@example.com' }),
    )
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: 'Delete user',
      }),
    )
    expect(
      await screen.findByText('No users match these filters.'),
    ).toBeInTheDocument()
  })

  it('puts a taken email next to the email field', async () => {
    const { user } = renderRoute(<AdminUserCreatePage />, {
      path: '/admin/users/new',
      url: '/admin/users/new',
    })

    await user.type(screen.getByLabelText('Email'), customer?.email ?? '')
    await user.type(screen.getByLabelText('Password'), 'Sup3r-secret')
    await user.click(screen.getByRole('button', { name: 'Create user' }))

    expect(
      await screen.findByText('User with this email already exists.'),
    ).toBeInTheDocument()
  })
})
