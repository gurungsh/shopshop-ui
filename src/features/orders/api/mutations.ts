import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import { ApiError } from '@/api/errors'
import type { OrderDetail, RetryPaymentRequest } from '@/api/types/ordering'

import { orderKeys } from './queries'

function useOrderUpdate(id: string) {
  const queryClient = useQueryClient()

  return {
    onSuccess: (order: OrderDetail) => {
      queryClient.setQueryData(orderKeys.detail(id), order)
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
    onError: (error: Error) => {
      // The order moved on (paid, shipped, out of tries): show where it is now
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
        void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      }
    },
  }
}

export function useRetryPayment(id: string) {
  return useMutation({
    mutationFn: (request: RetryPaymentRequest) =>
      apiFetch<OrderDetail>(`/api/orders/${id}/retry-payment`, {
        method: 'POST',
        body: request,
      }),
    ...useOrderUpdate(id),
  })
}

export function useCancelOrder(id: string) {
  return useMutation({
    mutationFn: () =>
      apiFetch<OrderDetail>(`/api/orders/${id}/cancel`, { method: 'POST' }),
    ...useOrderUpdate(id),
  })
}
