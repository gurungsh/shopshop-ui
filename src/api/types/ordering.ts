// OrderDtos.cs and OrderStatus.cs

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded'
  | 'Failed'
  | 'PaymentFailed'

/** OrderResponse, a row from POST /api/orders/search */
export interface OrderSummary {
  id: string
  userId: string
  totalAmount: number
  status: OrderStatus
  createdAtUtc: string
  updatedAtUtc: string
}

/** OrderQuery, the body of POST /api/orders/search. Results are newest first */
export interface OrderQuery {
  statuses?: OrderStatus[]
  page?: number
  pageSize?: number
}

/** OrderItemResponse. `productName` and `unitPrice` are snapshots from order time */
export interface OrderItem {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

/** OrderDetailResponse */
export interface OrderDetail {
  id: string
  userId: string
  totalAmount: number
  status: OrderStatus
  shippingAddress: string
  items: OrderItem[]
  createdAtUtc: string
  updatedAtUtc: string
  paymentFailureReason: string | null
  /** 0 unless the status is PaymentFailed */
  paymentRetriesRemaining: number
}

/** CreateOrderRequest, the body of POST /api/orders */
export interface CreateOrderRequest {
  shippingAddress: string
  items: { productId: string; quantity: number }[]
  paymentMethodId: string
}

/** CreateOrderResponse */
export interface CreateOrderResponse {
  order: OrderDetail
  skippedProductIds: string[]
}

/** RetryOrderPaymentRequest */
export interface RetryPaymentRequest {
  paymentMethodId: string
}

/** OrderQuery as POST /api/admin/orders/search reads it. The filters are ANDed */
export interface AdminOrderQuery extends OrderQuery {
  ids?: string[]
  userIds?: string[]
  minTotalAmount?: number
  maxTotalAmount?: number
  createdAfterUtc?: string
  createdBeforeUtc?: string
}

/** AdminUpdateOrderRequest, the body of PUT /api/admin/orders/{id}/status. Either field may be left out */
export interface AdminUpdateOrderRequest {
  status?: OrderStatus
  shippingAddress?: string
}
