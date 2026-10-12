import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'

import { AdminPage } from '@/components/ui/AdminPage'
import { buttonClass } from '@/components/ui/Button'
import { ListStatus } from '@/components/ui/ListStatus'
import { Pagination } from '@/components/ui/Pagination'

import {
  adminCategoryOptionsQuery,
  adminProductListQuery,
} from '../api/admin-queries'
import { AdminProductFilters } from '../components/AdminProductFilters'
import { AdminProductTable } from '../components/AdminProductTable'
import {
  type AdminProductFilters as Filters,
  parseAdminProductFilters,
  toAdminProductQuery,
  toAdminProductSearchParams,
} from '../lib/admin-filters'

export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseAdminProductFilters(searchParams)
  const products = useQuery(adminProductListQuery(toAdminProductQuery(filters)))
  const categories = useQuery(adminCategoryOptionsQuery())

  function show(next: Filters) {
    setSearchParams(toAdminProductSearchParams(next))
  }

  const categoryNames = new Map(
    categories.data?.map((category) => [category.id, category.name]),
  )

  return (
    <AdminPage
      title="Products"
      actions={
        <Link to="/admin/products/new" className={buttonClass()}>
          New product
        </Link>
      }
    >
      <AdminProductFilters
        filters={filters}
        categories={categories.data ?? []}
        onChange={show}
      />

      <ListStatus
        noun="products"
        isPending={products.isPending}
        isError={products.isError && !products.data}
        isEmpty={products.data?.items.length === 0}
        page={filters.page}
        onRetry={() => void products.refetch()}
        onFirstPage={() => {
          show({ ...filters, page: 1 })
        }}
      />

      {products.data && products.data.items.length > 0 && (
        <AdminProductTable
          products={products.data.items}
          categoryNames={categoryNames}
          isStale={products.isPlaceholderData}
        />
      )}

      {products.data && products.data.totalPages > 1 && (
        <Pagination
          page={filters.page}
          totalPages={products.data.totalPages}
          onPageChange={(page) => {
            show({ ...filters, page })
          }}
        />
      )}
    </AdminPage>
  )
}
