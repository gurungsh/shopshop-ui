import { clsx } from 'clsx'
import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'

import styles from './QuantityStepper.module.css'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  hideLabel?: boolean
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = 'Quantity',
  hideLabel = false,
  className,
}: QuantityStepperProps) {
  const labelId = useId()

  return (
    <div className={clsx(styles.field, className)}>
      <span id={labelId} className={hideLabel ? 'sr-only' : styles.label}>
        {label}
      </span>
      <div role="group" aria-labelledby={labelId} className={styles.stepper}>
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => {
            onChange(value - 1)
          }}
          className={styles.button}
        >
          <Minus size={18} aria-hidden="true" />
        </button>
        <output aria-live="polite" className={styles.value}>
          {value}
        </output>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => {
            onChange(value + 1)
          }}
          className={styles.button}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
