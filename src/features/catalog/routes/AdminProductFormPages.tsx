import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'

import { isNotFound } from '@/api/errors'
import { AdminPage } from '@/components/ui/AdminPage'
import { DetailStatus } from '@/components/ui/DetailStatus'

import { adminProductQuery } from '../api/admin-queries'
import { AdminProductForm } from '../components/AdminProductForm'

const back = { to: '/admin/products', label: 'All products' }

export function AdminProductCreatePage() {
  return (
    <AdminPage title="New product" back={back}>
      <AdminProductForm />
    </AdminPage>
  )
}

export function AdminProductEditPage() {
  const { id = '' } = useParams()
  const product = useQuery(adminProductQuery(id))

  return (
    <AdminPage title="Edit product" back={back}>
      {product.data ? (
        <AdminProductForm key={product.data.id} product={product.data} />
      ) : (
        <DetailStatus
          noun="product"
          notFound={isNotFound(product.error)}
          isError={product.isError}
          onRetry={() => void product.refetch()}
        />
      )}
    </AdminPage>
  )
}
