import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderRoute } from '@/testing/render'

import { useAuthStore } from '../lib/session-store'
import { RegisterPage } from './RegisterPage'

function renderRegister(url = '/register') {
  return renderRoute(<RegisterPage />, {
    path: '/register',
    url,
    routes: [
      { path: '/', element: <h1>Catalog</h1> },
      { path: '/checkout', element: <h1>Checkout</h1> },
    ],
  })
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
  })

  it('creates the account, signs in and goes back', async () => {
    const { user } = renderRegister('/register?returnTo=%2Fcheckout')

    await user.type(screen.getByLabelText('Email'), 'new.shopper@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByRole('heading', { name: 'Checkout' }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().session?.user.email).toBe(
      'new.shopper@example.com',
    )
  })

  it('offers sign in when the email is taken', async () => {
    const { user } = renderRegister('/register?returnTo=%2Fcheckout')

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'An account with that email already exists.',
    )
    expect(
      within(alert).getByRole('link', { name: 'Sign in instead' }),
    ).toHaveAttribute('href', '/login?returnTo=%2Fcheckout')
  })

  it('shows the password rule that failed', async () => {
    const { user } = renderRegister()

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper11')
    await user.type(screen.getByLabelText('Confirm password'), 'Shopper11')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByLabelText('Password'),
    ).toHaveAccessibleDescription(
      expect.stringContaining(
        'Password must contain at least one special character.',
      ) as string,
    )
  })

  it('catches mismatched passwords', async () => {
    const { user } = renderRegister()

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Shopper2!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(
      await screen.findByText('Passwords don’t match.'),
    ).toBeInTheDocument()
  })
})
