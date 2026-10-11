import { useMutation } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type { AuthResponse, Credentials } from '@/api/types/identity'

import { useAuthStore } from '../lib/session-store'

function useAuthMutation(path: string) {
  const start = useAuthStore((state) => state.start)

  return useMutation({
    mutationFn: (credentials: Credentials) =>
      apiFetch<AuthResponse>(path, { method: 'POST', body: credentials }),
    onSuccess: (response) => {
      start(response)
    },
  })
}

export function useLogin() {
  return useAuthMutation('/api/auth/login')
}

export function useRegister() {
  return useAuthMutation('/api/auth/register')
}
