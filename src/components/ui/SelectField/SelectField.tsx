import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import { type ComponentProps, useId } from 'react'

import styles from './SelectField.module.css'

export type SelectFieldProps = ComponentProps<'select'> & {
  label: string
  error?: string
}

export function SelectField({
  label,
  error,
  id,
  className,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <select
          id={selectId}
          className={styles.select}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={18} aria-hidden="true" className={styles.icon} />
      </div>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}
