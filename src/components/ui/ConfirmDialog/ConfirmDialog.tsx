import { AlertDialog } from 'radix-ui'
import type { ReactNode } from 'react'

import { Button, type ButtonProps } from '../Button'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  /** Keeps the dialog open and disabled while the action runs */
  isPending?: boolean
  pendingLabel?: string
  variant?: ButtonProps['variant']
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isPending = false,
  pendingLabel = confirmLabel,
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next)
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className={styles.overlay} />
        <AlertDialog.Content className={styles.content}>
          <AlertDialog.Title className={styles.title}>
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className={styles.description}>
            {description}
          </AlertDialog.Description>
          <div className={styles.actions}>
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" disabled={isPending}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            {/* Not AlertDialog.Action, which would close before the action finishes */}
            <Button
              variant={variant}
              disabled={isPending}
              aria-busy={isPending || undefined}
              onClick={onConfirm}
            >
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
