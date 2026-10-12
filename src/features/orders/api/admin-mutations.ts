import { useMutation, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/api/client'
import type {
  AdminUpdateOrderRequest,
  OrderDetail,
  OrderStatus,
} from '@/api/types/ordering'

import { adminOrderKeys } from './admin-queries'
import { orderKeys } from './queries'

function useAdminOrderUpdate(id: string) {
  const queryClient = useQueryClient()

  return {
    onSuccess: (order: OrderDetail) => {
      queryClient.setQueryData(adminOrderKeys.detail(id), order)
      // Everything under orders: the admin lists and the customer's own pages
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  }
}

function updateOrder(id: string, body: AdminUpdateOrderRequest) {
  return apiFetch<OrderDetail>(`/api/admin/orders/${id}/status`, {
    method: 'PUT',
    body,
  })
}

export function useSetOrderStatus(id: string) {
  return useMutation({
    // The cancel endpoint also sends the order.cancelled event (G31)
    mutationFn: (status: OrderStatus) =>
      status === 'Cancelled'
        ? apiFetch<OrderDetail>(`/api/admin/orders/${id}/cancel`, {
            method: 'POST',
          })
        : updateOrder(id, { status }),
    ...useAdminOrderUpdate(id),
  })
}

export function useSetShippingAddress(id: string) {
  return useMutation({
    mutationFn: (shippingAddress: string) =>
      updateOrder(id, { shippingAddress }),
    ...useAdminOrderUpdate(id),
  })
}
