interface AuthPathOptions {
  returnTo?: string
  reason?: 'expired'
}

function authPath(path: string, { returnTo, reason }: AuthPathOptions) {
  const params = new URLSearchParams()
  if (returnTo && returnTo !== '/') params.set('returnTo', returnTo)
  if (reason) params.set('reason', reason)

  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export function loginPath(options: AuthPathOptions = {}) {
  return authPath('/login', options)
}

export function registerPath(returnTo?: string) {
  return authPath('/register', { returnTo })
}

export function safeReturnTo(value: string | null | undefined): string {
  if (!value?.startsWith('/')) return '/'
  if (value.startsWith('//') || value.startsWith('/\\')) return '/'
  return value
}
