import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { connectTestUser } from '@/testing/auth'
import { users } from '@/testing/mocks/data/identity'
import { fakeToken } from '@/testing/mocks/handlers/identity'
import { renderRoute } from '@/testing/render'

import { useAuthStore } from '../lib/session-store'
import { ProfilePage } from './ProfilePage'

describe('ProfilePage', () => {
  let disconnect: () => void

  beforeEach(() => {
    const alex = users.find(
      (u) => u.id === 'd0000000-0000-4000-8000-000000000001',
    )
    if (!alex) throw new Error('Missing seed user')
    alex.email = 'alex@example.com'
    disconnect = connectTestUser(alex)
    useAuthStore.getState().start({
      id: alex.id,
      email: alex.email,
      role: alex.role,
      token: fakeToken(alex),
    })
  })

  afterEach(() => {
    disconnect()
    useAuthStore.setState({ session: null })
  })

  it('saves a new email and updates the session', async () => {
    const { user } = renderRoute(<ProfilePage />)

    const email = await screen.findByLabelText('Email')
    await user.clear(email)
    await user.type(email, 'alex.new@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Profile saved.')).toBeInTheDocument()
    expect(useAuthStore.getState().session?.user.email).toBe(
      'alex.new@example.com',
    )
  })

  it('shows the backend message for a taken email', async () => {
    const { user } = renderRoute(<ProfilePage />)

    const email = await screen.findByLabelText('Email')
    await user.clear(email)
    await user.type(email, 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'Shopper1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Shopper1!')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'User with this email already exists.',
    )
  })
})
