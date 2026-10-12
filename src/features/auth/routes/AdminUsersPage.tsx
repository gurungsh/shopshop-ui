import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'

import { AdminPage } from '@/components/ui/AdminPage'
import { buttonClass } from '@/components/ui/Button'
import { FilterBar } from '@/components/ui/FilterBar'
import { ListStatus } from '@/components/ui/ListStatus'
import { Pagination } from '@/components/ui/Pagination'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { formText } from '@/lib/form'

import { adminUserListQuery } from '../api/admin-users'
import { AdminUserTable } from '../components/AdminUserTable'
import {
  type AdminUserFilters as Filters,
  parseAdminUserFilters,
  roles,
  toAdminUserQuery,
  toAdminUserSearchParams,
} from '../lib/admin-user-filters'
import { useSession } from '../lib/use-session'

export function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseAdminUserFilters(searchParams)
  const users = useQuery(adminUserListQuery(toAdminUserQuery(filters)))
  const currentUserId = useSession()?.user.id

  function show(next: Filters) {
    setSearchParams(toAdminUserSearchParams(next))
  }

  return (
    <AdminPage
      title="Users"
      actions={
        <Link to="/admin/users/new" className={buttonClass()}>
          New user
        </Link>
      }
    >
      <FilterBar
        resetKey={`${filters.email}|${filters.role}`}
        onApply={(data) => {
          const role = formText(data, 'role')
          show({
            page: 1,
            email: formText(data, 'email'),
            role: roles.find((r) => r === role) ?? '',
          })
        }}
        onClear={() => {
          show({ page: 1, email: '', role: '' })
        }}
      >
        <TextField
          name="email"
          label="Email"
          hint="The full address"
          defaultValue={filters.email}
        />
        <SelectField name="role" label="Role" defaultValue={filters.role}>
          <option value="">All roles</option>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </SelectField>
      </FilterBar>

      <ListStatus
        noun="users"
        isPending={users.isPending}
        isError={users.isError && !users.data}
        isEmpty={users.data?.items.length === 0}
        page={filters.page}
        onRetry={() => void users.refetch()}
        onFirstPage={() => {
          show({ ...filters, page: 1 })
        }}
      />

      {users.data && users.data.items.length > 0 && (
        <AdminUserTable
          users={users.data.items}
          currentUserId={currentUserId}
          isStale={users.isPlaceholderData}
        />
      )}

      {users.data && users.data.totalPages > 1 && (
        <Pagination
          page={filters.page}
          totalPages={users.data.totalPages}
          onPageChange={(page) => {
            show({ ...filters, page })
          }}
        />
      )}
    </AdminPage>
  )
}
