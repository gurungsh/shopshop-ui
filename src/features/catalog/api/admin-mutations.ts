import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type {
  Category,
  CreateCategoryRequest,
  CreateProductRequest,
  Product,
  UpdateCategoryRequest,
  UpdateProductRequest,
} from '@/api/types/catalog'

import { catalogKeys } from './queries'

// The backend clears its own cache on every write, but ours holds the admin
// lists and the storefront's, so refetch all of it. The mutation stays pending
// until the refetch is done.
function useCatalogMutation<Variables, Result>(
  mutationFn: (variables: Variables) => Promise<Result>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.all }),
  })
}

interface Update<Body> {
  id: string
  body: Body
}

export function useCreateProduct() {
  return useCatalogMutation((body: CreateProductRequest) =>
    apiFetch<Product>('/api/admin/products', { method: 'POST', body }),
  )
}

export function useUpdateProduct() {
  return useCatalogMutation(({ id, body }: Update<UpdateProductRequest>) =>
    apiFetch<Product>(`/api/admin/products/${id}`, { method: 'PUT', body }),
  )
}

export function useDeleteProduct() {
  return useCatalogMutation((id: string) =>
    apiFetch<undefined>(`/api/admin/products/${id}`, { method: 'DELETE' }),
  )
}

export function useCreateCategory() {
  return useCatalogMutation((body: CreateCategoryRequest) =>
    apiFetch<Category>('/api/admin/categories', { method: 'POST', body }),
  )
}

export function useUpdateCategory() {
  return useCatalogMutation(({ id, body }: Update<UpdateCategoryRequest>) =>
    apiFetch<Category>(`/api/admin/categories/${id}`, { method: 'PUT', body }),
  )
}

export function useDeleteCategory() {
  return useCatalogMutation((id: string) =>
    apiFetch<undefined>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
  )
}
