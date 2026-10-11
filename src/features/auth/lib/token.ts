export function tokenExpiry(token: string): number {
  // header.payload.signature
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Malformed token')

  // atob decodes Base64-encoded string into text
  const json = atob(payload.replaceAll('-', '+').replaceAll('_', '/'))
  const { exp } = JSON.parse(json) as { exp?: unknown }
  if (typeof exp !== 'number') throw new Error('Token has no exp claim')

  return exp * 1000
}
