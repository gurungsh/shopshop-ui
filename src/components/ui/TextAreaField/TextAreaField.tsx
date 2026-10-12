import { clsx } from 'clsx'
import { type ComponentProps, useId } from 'react'

import styles from '../TextField/TextField.module.css'

export type TextAreaFieldProps = ComponentProps<'textarea'> & {
  label: string
  hint?: string
  error?: string
}

export function TextAreaField({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  return (
    <div className={clsx(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={inputId}
        className={styles.input}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={clsx(error && errorId, hint && hintId) || undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  )
}
