import { connectAuth } from '@/api/client'

import { type MockUser, users } from './mocks/data/identity'
import { fakeToken } from './mocks/handlers/identity'

/** Sends a mock bearer token with every apiFetch call; returns a disconnect */
export function connectTestUser(user?: MockUser) {
  const signedIn = user ?? users[0]
  if (!signedIn) throw new Error('No mock users')

  const token = fakeToken(signedIn)
  connectAuth({ getToken: () => token, onUnauthorized: () => undefined })
  return () => {
    connectAuth({ getToken: () => null, onUnauthorized: () => undefined })
  }
}
