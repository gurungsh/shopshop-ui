import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { isNotFound } from '@/api/errors'
import { AdminPage } from '@/components/ui/AdminPage'
import { DetailStatus } from '@/components/ui/DetailStatus'

import { adminCategoryQuery } from '../api/admin-queries'
import { AdminCategoryForm } from '../components/AdminCategoryForm'

const back = { to: '/admin/categories', label: 'All categories' }

export function AdminCategoryCreatePage() {
  return (
    <AdminPage title="New category" back={back}>
      <AdminCategoryForm />
    </AdminPage>
  )
}

export function AdminCategoryEditPage() {
  const { id = '' } = useParams()
  const category = useQuery(adminCategoryQuery(id))

  return (
    <AdminPage title="Edit category" back={back}>
      {category.data ? (
        <AdminCategoryForm key={category.data.id} category={category.data} />
      ) : (
        <DetailStatus
          noun="category"
          notFound={isNotFound(category.error)}
          isError={category.isError}
          onRetry={() => void category.refetch()}
        />
      )}
    </AdminPage>
  )
}
