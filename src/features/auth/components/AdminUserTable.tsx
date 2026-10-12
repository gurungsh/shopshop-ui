import { useState } from 'react'
import { Link } from 'react-router'

import type { User } from '@/api/types/identity'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClass } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cells, DataTable } from '@/components/ui/DataTable'

import { useDeleteUser } from '../api/admin-users'

interface AdminUserTableProps {
  users: User[]
  /** The signed-in admin, who can’t delete themselves */
  currentUserId: string | undefined
  isStale: boolean
}

export function AdminUserTable({
  users,
  currentUserId,
  isStale,
}: AdminUserTableProps) {
  const remove = useDeleteUser()
  const [deleting, setDeleting] = useState<User | null>(null)

  return (
    <>
      <DataTable label="Users" isStale={isStale}>
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId
            return (
              <tr key={user.id}>
                <td>
                  {user.email}
                  {isSelf && <span className={cells.muted}> (you)</span>}
                </td>
                <td>
                  <Badge tone={user.role === 'Admin' ? 'info' : 'neutral'}>
                    {user.role}
                  </Badge>
                </td>
                <td className={cells.actions}>
                  <div className={cells.actionRow}>
                    <Link
                      to={`/admin/users/${user.id}`}
                      aria-label={`Edit ${user.email}`}
                      className={buttonClass({
                        variant: 'secondary',
                        size: 'sm',
                      })}
                    >
                      Edit
                    </Link>
                    <Button
                      variant="dangerOutline"
                      size="sm"
                      disabled={isSelf}
                      title={
                        isSelf ? 'You can’t delete your own account' : undefined
                      }
                      aria-label={`Delete ${user.email}`}
                      onClick={() => {
                        remove.reset()
                        setDeleting(user)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </DataTable>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title={`Delete ${deleting?.email ?? 'this user'}?`}
        description={
          <>
            This removes the account for good and can’t be undone. Accounts
            can’t be deactivated, so if you only want to limit what someone can
            do, change their role instead.
            {remove.isError && (
              <>
                {' '}
                <strong>We couldn’t delete it. Try again in a moment.</strong>
              </>
            )}
          </>
        }
        confirmLabel="Delete user"
        pendingLabel="Deleting…"
        variant="danger"
        isPending={remove.isPending}
        onConfirm={() => {
          // The delete button is disabled for the admin's own row; this guards the dialog
          if (!deleting || deleting.id === currentUserId) return
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
