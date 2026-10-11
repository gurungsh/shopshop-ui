import { useMutation } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/api/types/ordering'

/** Never retried: a second POST would place a second order */
export function useCreateOrder() {
  return useMutation({
    mutationFn: (request: CreateOrderRequest) =>
      apiFetch<CreateOrderResponse>('/api/orders', {
        method: 'POST',
        body: request,
      }),
  })
}
