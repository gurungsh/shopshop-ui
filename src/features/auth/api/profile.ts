import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type { Credentials, User } from '@/api/types/identity'

import { useAuthStore } from '../lib/session-store'

export const profileQuery = queryOptions({
  queryKey: ['profile'],
  queryFn: ({ signal }) => apiFetch<User>('/api/users/me', { signal }),
})

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: (values: Credentials) =>
      apiFetch<User>('/api/users/me', { method: 'PUT', body: values }),
    onSuccess: (user) => {
      queryClient.setQueryData(profileQuery.queryKey, user)
      updateUser(user)
    },
  })
}
