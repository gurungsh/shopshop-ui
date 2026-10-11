import { data, type LoaderFunctionArgs, redirect } from 'react-router'

import { loginPath } from './login-path'
import { useAuthStore } from './session-store'

// Route loaders, so the check runs before the page or its code loads.
// They only improve the experience; the services enforce authorization.

function signInFirst(request: Request) {
  const { pathname, search } = new URL(request.url)
  return redirect(loginPath({ returnTo: pathname + search }))
}

export function requireAuth({ request }: LoaderFunctionArgs) {
  if (!useAuthStore.getState().session) return signInFirst(request)
  return null
}

export function requireAdmin({ request }: LoaderFunctionArgs) {
  const session = useAuthStore.getState().session
  if (!session) return signInFirst(request)
  if (session.user.role !== 'Admin') {
    throw data('Admins only', { status: 403 })
  }
  return null
}
