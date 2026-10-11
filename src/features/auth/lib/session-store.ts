import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthResponse, Role } from '@/api/types/identity'

import { tokenExpiry } from './token'

export interface Session {
  user: { id: string; email: string; role: Role }
  token: string
  expiresAt: number
}

interface AuthState {
  session: Session | null
  start: (response: AuthResponse) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      start: ({ token, ...user }) => {
        set({ session: { user, token, expiresAt: tokenExpiry(token) } })
      },
      clear: () => {
        set({ session: null })
      },
    }),
    {
      name: 'shopshop.session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ session }) => ({ session }),
    },
  ),
)
