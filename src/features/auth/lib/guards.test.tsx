import { screen } from '@testing-library/react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Role } from '@/api/types/identity'
import { renderRoute } from '@/testing/render'

import { LoginPage } from '../routes/LoginPage'
import { requireAdmin, requireAuth } from './guards'
import { useAuthStore } from './session-store'

function signInAs(role: Role) {
  useAuthStore.setState({
    session: {
      user: { id: '1', email: 'alex@example.com', role },
      token: 'token',
      expiresAt: Date.now() + 60 * 60_000,
    },
  })
}

function ErrorStatus() {
  const error = useRouteError()
  return <p>Status {isRouteErrorResponse(error) ? error.status : '?'}</p>
}

function renderAt(url: string) {
  return renderRoute(<LoginPage />, {
    path: '/login',
    url,
    routes: [
      {
        loader: requireAuth,
        children: [{ path: '/account/orders', element: <h1>Your orders</h1> }],
      },
      {
        path: '/admin',
        loader: requireAdmin,
        element: <h1>Admin</h1>,
        errorElement: <ErrorStatus />,
      },
    ],
  })
}

describe('route guards', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
  })

  it('sends a signed-out visitor to sign in, then back', async () => {
    const { user } = renderAt('/account/orders')

    await user.type(await screen.findByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Your orders' }),
    ).toBeInTheDocument()
  })

  it('lets a signed-in customer through', async () => {
    signInAs('Customer')
    renderAt('/account/orders')

    expect(
      await screen.findByRole('heading', { name: 'Your orders' }),
    ).toBeInTheDocument()
  })

  it('answers 403 when a customer opens the admin area', async () => {
    signInAs('Customer')
    renderAt('/admin')

    expect(await screen.findByText('Status 403')).toBeInTheDocument()
  })

  it('lets an admin into the admin area', async () => {
    signInAs('Admin')
    renderAt('/admin')

    expect(
      await screen.findByRole('heading', { name: 'Admin' }),
    ).toBeInTheDocument()
  })
})
