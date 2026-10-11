// ProductDtos.cs and CategoryDtos.cs

/** ProductResponse. Prices are dollars; dates are UTC ISO strings */
export interface Product {
  id: string
  categoryId: string
  name: string
  description: string
  sku: string
  price: number
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string
}

/** CategoryResponse */
export interface Category {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string
}

/** ProductQuery, the body of POST /api/products/search. */
export interface ProductQuery {
  ids?: string[]
  categoryIds?: string[]
  name?: string
  description?: string
  sku?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  pageSize?: number
}

/** CategoryQuery, the body of POST /api/categories/search */
export interface CategoryQuery {
  ids?: string[]
  name?: string
  description?: string
  page?: number
  pageSize?: number
}
