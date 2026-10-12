import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'

import { AdminPage } from '@/components/ui/AdminPage'
import { buttonClass } from '@/components/ui/Button'
import { FilterBar } from '@/components/ui/FilterBar'
import { ListStatus } from '@/components/ui/ListStatus'
import { Pagination } from '@/components/ui/Pagination'
import { TextField } from '@/components/ui/TextField'
import { formText } from '@/lib/form'

import { adminCategoryListQuery } from '../api/admin-queries'
import { AdminCategoryTable } from '../components/AdminCategoryTable'
import {
  type AdminCategoryFilters as Filters,
  parseAdminCategoryFilters,
  toAdminCategoryQuery,
  toAdminCategorySearchParams,
} from '../lib/admin-filters'

export function AdminCategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseAdminCategoryFilters(searchParams)
  const categories = useQuery(
    adminCategoryListQuery(toAdminCategoryQuery(filters)),
  )

  function show(next: Filters) {
    setSearchParams(toAdminCategorySearchParams(next))
  }

  return (
    <AdminPage
      title="Categories"
      actions={
        <Link to="/admin/categories/new" className={buttonClass()}>
          New category
        </Link>
      }
    >
      <FilterBar
        resetKey={filters.name}
        onApply={(data) => {
          show({ page: 1, name: formText(data, 'name') })
        }}
        onClear={() => {
          show({ page: 1, name: '' })
        }}
      >
        <TextField
          name="name"
          label="Name contains"
          defaultValue={filters.name}
        />
      </FilterBar>

      <ListStatus
        noun="categories"
        isPending={categories.isPending}
        isError={categories.isError && !categories.data}
        isEmpty={categories.data?.items.length === 0}
        page={filters.page}
        onRetry={() => void categories.refetch()}
        onFirstPage={() => {
          show({ ...filters, page: 1 })
        }}
      />

      {categories.data && categories.data.items.length > 0 && (
        <AdminCategoryTable
          categories={categories.data.items}
          isStale={categories.isPlaceholderData}
        />
      )}

      {categories.data && categories.data.totalPages > 1 && (
        <Pagination
          page={filters.page}
          totalPages={categories.data.totalPages}
          onPageChange={(page) => {
            show({ ...filters, page })
          }}
        />
      )}
    </AdminPage>
  )
}
