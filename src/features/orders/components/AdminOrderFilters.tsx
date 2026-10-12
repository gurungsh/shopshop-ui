import type { OrderStatus } from '@/api/types/ordering'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import {
  type AdminFilters,
  GUID_PATTERN,
  statusChoices,
} from '../lib/admin-filters'
import { statusLabels } from '../lib/status'
import styles from './AdminOrderFilters.module.css'

interface AdminOrderFiltersProps {
  filters: AdminFilters
  onChange: (next: AdminFilters) => void
}

export function AdminOrderFilters({
  filters,
  onChange,
}: AdminOrderFiltersProps) {
  const { id, customer, from, to, min, max } = filters

  function apply(form: HTMLFormElement) {
    const data = new FormData(form)
    const text = (name: string) => {
      const value = data.get(name)
      return typeof value === 'string' ? value.trim() : ''
    }
    onChange({
      ...filters,
      page: 1,
      id: text('id'),
      customer: text('customer'),
      from: text('from'),
      to: text('to'),
      min: text('min'),
      max: text('max'),
    })
  }

  function toggle(status: OrderStatus) {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status]
    onChange({ ...filters, page: 1, statuses })
  }

  return (
    <section aria-label="Filters" className={styles.filters}>
      {/* Remounts when the URL changes, so Clear resets the fields */}
      <form
        key={[id, customer, from, to, min, max].join('|')}
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          apply(event.currentTarget)
        }}
      >
        <div className={styles.fields}>
          <TextField
            name="id"
            label="Order id"
            defaultValue={id}
            pattern={GUID_PATTERN}
            title="A full order id"
            spellCheck={false}
          />
          <TextField
            name="customer"
            label="Customer id"
            defaultValue={customer}
            pattern={GUID_PATTERN}
            title="A full customer id"
            spellCheck={false}
          />
          <TextField
            name="from"
            label="Placed from"
            type="date"
            defaultValue={from}
          />
          <TextField
            name="to"
            label="Placed to"
            type="date"
            defaultValue={to}
          />
          <TextField
            name="min"
            label="Min total"
            type="number"
            min="0"
            step="0.01"
            defaultValue={min}
          />
          <TextField
            name="max"
            label="Max total"
            type="number"
            min="0"
            step="0.01"
            defaultValue={max}
          />
        </div>
        <div className={styles.actions}>
          <Button type="submit">Apply</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onChange({
                ...filters,
                page: 1,
                id: '',
                customer: '',
                from: '',
                to: '',
                min: '',
                max: '',
                statuses: [],
              })
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      <div role="group" aria-label="Status" className={styles.chips}>
        {statusChoices(filters.tab).map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filters.statuses.includes(status)}
            className={styles.chip}
            onClick={() => {
              toggle(status)
            }}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </section>
  )
}
