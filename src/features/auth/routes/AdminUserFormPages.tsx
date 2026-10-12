import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { isNotFound } from '@/api/errors'
import { AdminPage } from '@/components/ui/AdminPage'
import { DetailStatus } from '@/components/ui/DetailStatus'

import { adminUserQuery } from '../api/admin-users'
import { AdminUserForm } from '../components/AdminUserForm'

const back = { to: '/admin/users', label: 'All users' }

export function AdminUserCreatePage() {
  return (
    <AdminPage title="New user" back={back}>
      <AdminUserForm />
    </AdminPage>
  )
}

export function AdminUserEditPage() {
  const { id = '' } = useParams()
  const user = useQuery(adminUserQuery(id))

  return (
    <AdminPage title="Edit user" back={back}>
      {user.data ? (
        <AdminUserForm key={user.data.id} user={user.data} />
      ) : (
        <DetailStatus
          noun="user"
          notFound={isNotFound(user.error)}
          isError={user.isError}
          onRetry={() => void user.refetch()}
        />
      )}
    </AdminPage>
  )
}
