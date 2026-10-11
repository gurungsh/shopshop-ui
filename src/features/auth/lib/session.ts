import { connectAuth } from '@/api/client'
import { queryClient } from '@/api/query-client'

import { type Session, useAuthStore } from './session-store'

const EXPIRY_MARGIN_MS = 60_000

export function endSession() {
  useAuthStore.getState().clear()
  queryClient.clear()
}

interface StartAuthOptions {
  onExpired: () => void
}

export function startAuth({ onExpired }: StartAuthOptions) {
  function expire() {
    if (!useAuthStore.getState().session) return
    endSession()
    onExpired()
  }

  connectAuth({
    getToken: () => useAuthStore.getState().session?.token ?? null,
    onUnauthorized: expire,
  })

  let timer: number | undefined
  function schedule(session: Session | null) {
    window.clearTimeout(timer)
    if (!session) return
    timer = window.setTimeout(
      expire,
      session.expiresAt - EXPIRY_MARGIN_MS - Date.now(),
    )
  }

  schedule(useAuthStore.getState().session)
  useAuthStore.subscribe((state, previous) => {
    if (state.session !== previous.session) schedule(state.session)
  })
}
