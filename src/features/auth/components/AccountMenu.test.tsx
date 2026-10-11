import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Role } from '@/api/types/identity'
import { renderRoute } from '@/testing/render'

import { useAuthStore } from '../lib/session-store'
import { AccountMenu } from './AccountMenu'

function signInAs(role: Role) {
  useAuthStore.setState({
    session: {
      user: { id: '1', email: 'alex@example.com', role },
      token: 'token',
      expiresAt: Date.now() + 60 * 60_000,
    },
  })
}

function renderMenu(url = '/') {
  return renderRoute(<AccountMenu />, {
    path: '/products/:id',
    url,
    routes: [{ path: '/', element: <h1>Catalog</h1> }],
  })
}

async function openMenu(user: ReturnType<typeof renderMenu>['user']) {
  screen.getByRole('button', { name: 'Account' }).focus()
  await user.keyboard('{Enter}')
  return screen.findByRole('menu')
}

describe('AccountMenu', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
  })

  it('offers sign in, coming back to the current page', () => {
    renderMenu('/products/42')

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/login?returnTo=%2Fproducts%2F42',
    )
  })

  it('shows who is signed in and their pages', async () => {
    signInAs('Customer')
    const { user } = renderMenu('/products/42')

    const menu = await openMenu(user)

    expect(menu).toHaveTextContent('alex@example.com')
    expect(screen.getByRole('menuitem', { name: 'Orders' })).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Admin console' }),
    ).not.toBeInTheDocument()
  })

  it('links admins to the admin console', async () => {
    signInAs('Admin')
    const { user } = renderMenu('/products/42')

    await openMenu(user)

    expect(
      screen.getByRole('menuitem', { name: 'Admin console' }),
    ).toHaveAttribute('href', '/admin')
  })

  it('signs out and goes to the catalog', async () => {
    signInAs('Customer')
    const { user } = renderMenu('/products/42')

    await openMenu(user)
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }))

    expect(
      await screen.findByRole('heading', { name: 'Catalog' }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().session).toBeNull()
  })
})
