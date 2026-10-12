import { delay, http, HttpResponse } from 'msw'

import type {
  Category,
  CategoryQuery,
  CreateCategoryRequest,
  CreateProductRequest,
  Product,
  ProductQuery,
  UpdateCategoryRequest,
  UpdateProductRequest,
} from '@/api/types/catalog'

import { categories, products } from '../data/catalog'
import {
  adminOnly,
  apiUrl,
  errorResponse,
  paginate,
  pagingErrors,
  validationProblem,
} from '../http'

const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// Mirrors Catalog.Api's ProductService and CategoryService
export const catalogHandlers = [
  http.post<never, ProductQuery>(
    apiUrl('/api/products/search'),
    async ({ request }) => {
      const {
        ids,
        categoryIds,
        name,
        description,
        sku,
        minPrice,
        maxPrice,
        page,
        pageSize,
      } = await request.json()

      const errors = pagingErrors(page, pageSize)
      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        maxPrice < minPrice
      ) {
        errors.MaxPrice = [
          'MaxPrice must be greater than or equal to MinPrice.',
        ]
      }
      if (Object.keys(errors).length) return validationProblem(errors)

      const matches = products
        .filter(
          (p) =>
            (!ids?.length || ids.includes(p.id)) &&
            (!categoryIds?.length || categoryIds.includes(p.categoryId)) &&
            // ILike on Postgres, so the match ignores case
            (!name?.trim() ||
              p.name.toLowerCase().includes(name.trim().toLowerCase())) &&
            (!description?.trim() ||
              p.description
                .toLowerCase()
                .includes(description.trim().toLowerCase())) &&
            (!sku?.trim() || p.sku === sku.trim().toUpperCase()) &&
            (minPrice === undefined || p.price >= minPrice) &&
            (maxPrice === undefined || p.price <= maxPrice),
        )
        .sort(
          (a, b) =>
            a.createdAtUtc.localeCompare(b.createdAtUtc) ||
            a.id.localeCompare(b.id),
        )

      await delay()
      return HttpResponse.json(paginate(matches, page, pageSize))
    },
  ),

  http.get<{ id: string }>(apiUrl('/api/products/:id'), async ({ params }) => {
    const product = products.find((p) => p.id === params.id)
    await delay()
    if (!product) return errorResponse(404, 'Product not found.')
    return HttpResponse.json(product)
  }),

  http.post<never, CategoryQuery>(
    apiUrl('/api/categories/search'),
    async ({ request }) => {
      const { ids, name, description, page, pageSize } = await request.json()

      const errors = pagingErrors(page, pageSize)
      if (Object.keys(errors).length) return validationProblem(errors)

      // OrderBy Name, then Id
      const matches = categories
        .filter(
          (c) =>
            (!ids?.length || ids.includes(c.id)) &&
            (!name?.trim() ||
              c.name.toLowerCase().includes(name.trim().toLowerCase())) &&
            (!description?.trim() ||
              c.description
                .toLowerCase()
                .includes(description.trim().toLowerCase())),
        )
        .sort(
          (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
        )
      await delay()
      return HttpResponse.json(paginate(matches, page, pageSize))
    },
  ),

  http.get<{ id: string }>(
    apiUrl('/api/categories/:id'),
    async ({ params }) => {
      const category = categories.find((c) => c.id === params.id)
      await delay()
      if (!category) return errorResponse(404, 'Category not found.')
      return HttpResponse.json(category)
    },
  ),

  http.post<never, CreateProductRequest>(
    apiUrl('/api/admin/products'),
    async ({ request }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const body = await request.json()
      await delay()

      if (!categories.some((c) => c.id === body.categoryId)) {
        return errorResponse(400, 'Category does not exist.')
      }
      const sku = body.sku.trim().toUpperCase()
      if (products.some((p) => p.sku === sku)) {
        return errorResponse(409, 'A Product with this SKU already exists.')
      }

      const now = new Date().toISOString()
      const product: Product = {
        id: crypto.randomUUID(),
        categoryId: body.categoryId,
        name: body.name,
        description: body.description,
        sku,
        price: body.price,
        isActive: true,
        createdAtUtc: now,
        updatedAtUtc: now,
      }
      products.push(product)
      return HttpResponse.json(product, { status: 201 })
    },
  ),

  http.put<{ id: string }, UpdateProductRequest>(
    apiUrl('/api/admin/products/:id'),
    async ({ request, params }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const body = await request.json()
      await delay()

      const product = products.find((p) => p.id === params.id)
      if (!product) return errorResponse(404, 'Product not found.')

      if (
        body.categoryId &&
        !categories.some((c) => c.id === body.categoryId)
      ) {
        return errorResponse(400, 'Category does not exist.')
      }
      const sku = body.sku?.trim().toUpperCase()
      if (sku && products.some((p) => p.sku === sku && p.id !== product.id)) {
        return errorResponse(409, 'A Product with this SKU already exists.')
      }

      // Blank text is ignored, like the backend does
      if (body.categoryId) product.categoryId = body.categoryId
      if (body.name?.trim()) product.name = body.name
      if (body.description !== undefined) product.description = body.description
      if (sku) product.sku = sku
      if (body.price !== undefined) product.price = body.price
      if (body.isActive !== undefined) product.isActive = body.isActive
      product.updatedAtUtc = new Date().toISOString()
      return HttpResponse.json(product)
    },
  ),

  http.delete<{ id: string }>(
    apiUrl('/api/admin/products/:id'),
    async ({ request, params }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      await delay()

      const index = products.findIndex((p) => p.id === params.id)
      if (index === -1) return errorResponse(404, 'Product not found.')
      products.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    },
  ),

  http.post<never, CreateCategoryRequest>(
    apiUrl('/api/admin/categories'),
    async ({ request }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const body = await request.json()
      await delay()

      if (categories.some((c) => sameName(c.name, body.name))) {
        return errorResponse(409, 'A Category with this name already exists.')
      }

      const now = new Date().toISOString()
      const category: Category = {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description ?? '',
        isActive: true,
        createdAtUtc: now,
        updatedAtUtc: now,
      }
      categories.push(category)
      return HttpResponse.json(category, { status: 201 })
    },
  ),

  http.put<{ id: string }, UpdateCategoryRequest>(
    apiUrl('/api/admin/categories/:id'),
    async ({ request, params }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      const body = await request.json()
      await delay()

      const category = categories.find((c) => c.id === params.id)
      if (!category) return errorResponse(404, 'Category not found.')

      const { name } = body
      if (
        name?.trim() &&
        categories.some((c) => c.id !== category.id && sameName(c.name, name))
      ) {
        return errorResponse(409, 'A Category with this name already exists.')
      }

      if (name?.trim()) category.name = name
      if (body.description !== undefined)
        category.description = body.description
      if (body.isActive !== undefined) category.isActive = body.isActive
      category.updatedAtUtc = new Date().toISOString()
      return HttpResponse.json(category)
    },
  ),

  http.delete<{ id: string }>(
    apiUrl('/api/admin/categories/:id'),
    async ({ request, params }) => {
      const denied = adminOnly(request)
      if (denied) return denied
      await delay()

      const index = categories.findIndex((c) => c.id === params.id)
      if (index === -1) return errorResponse(404, 'Category not found.')
      // The foreign key from products is Restrict, so the database refuses
      if (products.some((p) => p.categoryId === params.id)) {
        return errorResponse(500, 'An unexpected error occurred.')
      }
      categories.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    },
  ),
]
