import type { ReactNode } from 'react'

import { Button } from '../Button'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  children: ReactNode
  onApply: (data: FormData) => void
  onClear: () => void
  /** Changes with the applied filters, so Clear resets the fields */
  resetKey: string
}

export function FilterBar({
  children,
  onApply,
  onClear,
  resetKey,
}: FilterBarProps) {
  return (
    <section aria-label="Filters" className={styles.filters}>
      <form
        key={resetKey}
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          onApply(new FormData(event.currentTarget))
        }}
      >
        <div className={styles.fields}>{children}</div>
        <div className={styles.actions}>
          <Button type="submit">Apply</Button>
          <Button type="button" variant="secondary" onClick={onClear}>
            Clear
          </Button>
        </div>
      </form>
    </section>
  )
}
