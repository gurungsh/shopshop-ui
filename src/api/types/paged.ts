// PagedResponse.cs

/** PagedResponse<T>, returned by every search endpoint */
export interface Paged<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
