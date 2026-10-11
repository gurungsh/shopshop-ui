import { useNavigate } from 'react-router'

import { endSession } from './session'
import { useAuthStore } from './session-store'

export function useSession() {
  return useAuthStore((state) => state.session)
}

/** Leaves the page first, so nothing on it renders without a session */
export function useSignOut() {
  const navigate = useNavigate()

  return async (to = '/') => {
    await navigate(to)
    endSession()
  }
}
