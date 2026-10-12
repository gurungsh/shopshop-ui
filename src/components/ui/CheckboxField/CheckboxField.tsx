import { type ComponentProps } from 'react'

import styles from './CheckboxField.module.css'

export type CheckboxFieldProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
  hint?: string
}

export function CheckboxField({ label, hint, ...props }: CheckboxFieldProps) {
  return (
    <label className={styles.field}>
      <input type="checkbox" className={styles.input} {...props} />
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </span>
    </label>
  )
}
