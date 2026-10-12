import { ChevronDown } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'

import type { OrderStatus } from '@/api/types/ordering'
import { Button } from '@/components/ui/Button'

import { allStatuses, statusLabels } from '../lib/status'
import styles from './AdminStatusMenu.module.css'

interface AdminStatusMenuProps {
  current: OrderStatus
  disabled?: boolean
  onSelect: (status: OrderStatus) => void
}

export function AdminStatusMenu({
  current,
  disabled,
  onSelect,
}: AdminStatusMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" disabled={disabled}>
          Change status
          <ChevronDown size={16} aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={styles.content}
        >
          {allStatuses.map((status) => (
            <DropdownMenu.Item
              key={status}
              disabled={status === current}
              className={styles.item}
              onSelect={() => {
                onSelect(status)
              }}
            >
              {statusLabels[status]}
              {status === current && ' (current)'}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
