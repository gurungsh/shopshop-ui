import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserQuery,
} from '@/api/types/identity'
import type { Paged } from '@/api/types/paged'

// The same root the order screens use to look up a customer's email
const adminUserKeys = {
  all: ['admin', 'users'] as const,
  list: (query: UserQuery) => [...adminUserKeys.all, 'list', query] as const,
  detail: (id: string) => [...adminUserKeys.all, id] as const,
}

export function adminUserListQuery(query: UserQuery) {
  return queryOptions({
    queryKey: adminUserKeys.list(query),
    queryFn: ({ signal }) =>
      apiFetch<Paged<User>>('/api/admin/users/search', {
        method: 'POST',
        body: query,
        signal,
      }),
    placeholderData: keepPreviousData,
  })
}

export function adminUserQuery(id: string) {
  return queryOptions({
    queryKey: adminUserKeys.detail(id),
    queryFn: ({ signal }) =>
      apiFetch<User>(`/api/admin/users/${encodeURIComponent(id)}`, { signal }),
    staleTime: 0,
  })
}

function useUserMutation<Variables, Result>(
  mutationFn: (variables: Variables) => Promise<Result>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  })
}

export function useCreateUser() {
  return useUserMutation((body: CreateUserRequest) =>
    apiFetch<User>('/api/admin/users', { method: 'POST', body }),
  )
}

export function useUpdateUser() {
  return useUserMutation(
    ({ id, body }: { id: string; body: UpdateUserRequest }) =>
      apiFetch<User>(`/api/admin/users/${id}`, { method: 'PUT', body }),
  )
}

export function useDeleteUser() {
  return useUserMutation((id: string) =>
    apiFetch<undefined>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  )
}
