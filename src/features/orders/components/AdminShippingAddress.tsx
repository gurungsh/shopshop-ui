import { clsx } from 'clsx'
import { useId, useState } from 'react'

import type { OrderDetail } from '@/api/types/ordering'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'

import { useSetShippingAddress } from '../api/admin-mutations'
import { ShippingAddressCard } from './OrderCards'
import styles from './AdminShippingAddress.module.css'

const MAX_LENGTH = 500

export function AdminShippingAddress({
  order,
  className,
}: {
  order: OrderDetail
  className?: string
}) {
  const save = useSetShippingAddress(order.id)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const fieldId = useId()

  if (!editing) {
    return (
      <ShippingAddressCard
        order={order}
        className={className}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              save.reset()
              setValue(order.shippingAddress)
              setEditing(true)
            }}
          >
            Edit
          </Button>
        }
      />
    )
  }

  return (
    <form
      aria-label="Edit shipping address"
      className={clsx(styles.form, className)}
      onSubmit={(event) => {
        event.preventDefault()
        save.mutate(value.trim(), {
          onSuccess: () => {
            setEditing(false)
          },
        })
      }}
    >
      <label htmlFor={fieldId} className={styles.label}>
        Shipping address
      </label>
      <textarea
        id={fieldId}
        className={styles.textarea}
        rows={6}
        maxLength={MAX_LENGTH}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
        }}
      />
      <span className={styles.hint}>
        One line per field. Up to {MAX_LENGTH} characters.
      </span>

      {save.isError && (
        <Banner title="We couldn’t save the address.">
          Try again in a moment.
        </Banner>
      )}

      <div className={styles.actions}>
        <Button type="submit" disabled={!value.trim() || save.isPending}>
          {save.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button
          variant="secondary"
          disabled={save.isPending}
          onClick={() => {
            setEditing(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
