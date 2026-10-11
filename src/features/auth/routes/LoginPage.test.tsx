import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderRoute } from '@/testing/render'

import { useAuthStore } from '../lib/session-store'
import { LoginPage } from './LoginPage'

function renderLogin(url = '/login') {
  return renderRoute(<LoginPage />, {
    path: '/login',
    url,
    routes: [
      { path: '/', element: <h1>Catalog</h1> },
      { path: '/account/orders', element: <h1>Your orders</h1> },
    ],
  })
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null })
  })

  it('signs in and goes back to where the user was', async () => {
    const { user } = renderLogin('/login?returnTo=%2Faccount%2Forders')

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Your orders' }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().session?.user).toMatchObject({
      email: 'alex@example.com',
      role: 'Customer',
    })
  })

  it('keeps the email after a wrong password', async () => {
    const { user } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'That email and password don’t match. Try again.',
    )
    expect(screen.getByLabelText('Email')).toHaveValue('alex@example.com')
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('checks the fields before calling the api', async () => {
    const { user } = renderLogin()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  it('explains that the session ended', () => {
    renderLogin('/login?reason=expired')

    expect(screen.getByRole('status')).toHaveTextContent('Your session ended.')
  })

  it('mentions the saved cart when coming from checkout', () => {
    renderLogin('/login?returnTo=%2Fcheckout')

    expect(
      screen.getByText('Sign in to finish checking out. Your cart is saved.'),
    ).toBeInTheDocument()
  })

  it('ignores a return path to another site', async () => {
    const { user } = renderLogin('/login?returnTo=%2F%2Fevil.example')

    await user.type(screen.getByLabelText('Email'), 'alex@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: 'Catalog' }),
    ).toBeInTheDocument()
  })
})
