import { clsx } from 'clsx'
import { useState } from 'react'
import { Link } from 'react-router'

import type { Category } from '@/api/types/catalog'
import { Badge } from '@/components/ui/Badge'
import { Banner } from '@/components/ui/Banner'
import { Button, buttonClass } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cells, DataTable } from '@/components/ui/DataTable'

import { useDeleteCategory, useUpdateCategory } from '../api/admin-mutations'

export function AdminCategoryTable({
  categories,
  isStale,
}: {
  categories: Category[]
  isStale: boolean
}) {
  const update = useUpdateCategory()
  const remove = useDeleteCategory()
  const [deleting, setDeleting] = useState<Category | null>(null)

  return (
    <>
      {update.isError && (
        <Banner title="We couldn’t update the category.">
          Something went wrong. Try again in a moment.
        </Banner>
      )}

      <DataTable label="Categories" isStale={isStale}>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Description</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td className={clsx(cells.wrap, cells.muted)}>
                {category.description}
              </td>
              <td>
                <Badge tone={category.isActive ? 'success' : 'neutral'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className={cells.actions}>
                <div className={cells.actionRow}>
                  <Link
                    to={`/admin/categories/${category.id}`}
                    aria-label={`Edit ${category.name}`}
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
                    aria-label={`${category.isActive ? 'Deactivate' : 'Activate'} ${category.name}`}
                    onClick={() => {
                      update.mutate({
                        id: category.id,
                        body: { isActive: !category.isActive },
                      })
                    }}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="dangerOutline"
                    size="sm"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => {
                      remove.reset()
                      setDeleting(category)
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
        title={`Delete ${deleting?.name ?? 'this category'}?`}
        description={
          <>
            This removes the category for good and can’t be undone. To stop
            offering it as a filter in the store but keep it here, deactivate it
            instead; you can bring it back later.
            {remove.isError && (
              <>
                {' '}
                <strong>
                  We couldn’t delete it. If products still use it, move them to
                  another category first.
                </strong>
              </>
            )}
          </>
        }
        confirmLabel="Delete category"
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
