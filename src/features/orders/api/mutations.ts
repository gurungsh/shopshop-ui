import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import { ApiError } from '@/api/errors'
import type { OrderDetail, RetryPaymentRequest } from '@/api/types/ordering'

import { orderKeys } from './queries'

export function useRetryPayment(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: RetryPaymentRequest) =>
      apiFetch<OrderDetail>(`/api/orders/${id}/retry-payment`, {
        method: 'POST',
        body: request,
      }),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(id), order)
    },
    onError: (error) => {
      // The order moved on (paid, cancelled, out of tries): show where it is now
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      }
    },
  })
}
