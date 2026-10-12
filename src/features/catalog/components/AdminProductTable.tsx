import { Link } from 'react-router'
import { useState } from 'react'

import type { Product } from '@/api/types/catalog'
import { Badge } from '@/components/ui/Badge'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cells, DataTable } from '@/components/ui/DataTable'
import { formatMoney } from '@/lib/money'

import { useDeleteProduct, useUpdateProduct } from '../api/admin-mutations'

interface AdminProductTableProps {
  products: Product[]
  categoryNames: Map<string, string>
  isStale: boolean
}

export function AdminProductTable({
  products,
  categoryNames,
  isStale,
}: AdminProductTableProps) {
  const update = useUpdateProduct()
  const remove = useDeleteProduct()
  const [deleting, setDeleting] = useState<Product | null>(null)

  return (
    <>
      {update.isError && (
        <Banner title="We couldn’t update the product.">
          Something went wrong. Try again in a moment.
        </Banner>
      )}

      <DataTable label="Products" isStale={isStale}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">SKU</th>
            <th scope="col">Category</th>
            <th scope="col" className={cells.end}>
              Price
            </th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className={cells.wrap}>{product.name}</td>
              <td className={cells.mono}>{product.sku}</td>
              <td>{categoryNames.get(product.categoryId) ?? '—'}</td>
              <td className={cells.end}>{formatMoney(product.price)}</td>
              <td>
                <Badge tone={product.isActive ? 'success' : 'neutral'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className={cells.actions}>
                <div className={cells.actionRow}>
                  <Link
                    to={`/admin/products/${product.id}`}
                    aria-label={`Edit ${product.name}`}
                    className={buttonClass({
                      variant: 'secondary',
                      size: 'sm',
                    })}
                  >
                    Edit
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={update.isPending}
                    aria-label={`${product.isActive ? 'Deactivate' : 'Activate'} ${product.name}`}
                    onClick={() => {
                      update.mutate({
                        id: product.id,
                        body: { isActive: !product.isActive },
                      })
                    }}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="dangerOutline"
                    size="sm"
                    aria-label={`Delete ${product.name}`}
                    onClick={() => {
                      remove.reset()
                      setDeleting(product)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={`Delete ${deleting?.name ?? 'this product'}?`}
        description={
          <>
            This removes the product for good and can’t be undone. To stop
            selling it but keep it here, deactivate it instead: it disappears
            from the store and from carts, and you can bring it back later.
            {remove.isError && (
              <>
                {' '}
                <strong>We couldn’t delete it. Try again in a moment.</strong>
              </>
            )}
          </>
        }
        confirmLabel="Delete product"
        pendingLabel="Deleting…"
        variant="danger"
        isPending={remove.isPending}
        onConfirm={() => {
          if (!deleting) return
          remove.mutate(deleting.id, {
            onSuccess: () => {
              setDeleting(null)
            },
          })
        }}
      />
    </>
  )
}
