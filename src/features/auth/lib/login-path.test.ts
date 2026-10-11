import { describe, expect, it } from 'vitest'

import { loginPath, safeReturnTo } from './login-path'

describe('loginPath', () => {
  it('is plain /login when there is nothing to carry', () => {
    expect(loginPath()).toBe('/login')
    expect(loginPath({ returnTo: '/' })).toBe('/login')
  })

  it('carries the return path and the reason', () => {
    expect(
      loginPath({ returnTo: '/account/orders?page=2', reason: 'expired' }),
    ).toBe('/login?returnTo=%2Faccount%2Forders%3Fpage%3D2&reason=expired')
  })
})

describe('safeReturnTo', () => {
  it.each(['/account/orders', '/products/1?quantity=2'])('keeps %s', (path) => {
    expect(safeReturnTo(path)).toBe(path)
  })

  it.each([
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
  ])('falls back to / for %s', (value) => {
    expect(safeReturnTo(value)).toBe('/')
  })
})
