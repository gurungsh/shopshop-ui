import type { KeyboardEvent } from 'react'

import { useSyncedState } from '@/lib/use-synced-state'

import { parseAmount } from '../lib/filters'
import styles from './Filters.module.css'

interface PriceFilterProps {
  min: number | undefined
  max: number | undefined
  onChange: (range: {
    min: number | undefined
    max: number | undefined
  }) => void
}

export function PriceFilter({ min, max, onChange }: PriceFilterProps) {
  const [minText, setMinText] = useSyncedState(min?.toString() ?? '')
  const [maxText, setMaxText] = useSyncedState(max?.toString() ?? '')

  function apply() {
    const range = { min: parseAmount(minText), max: parseAmount(maxText) }
    if (range.min !== min || range.max !== max) onChange(range)
  }

  function applyOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') apply()
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Price</legend>
      <div className={styles.priceFields}>
        <div className={styles.priceField}>
          <label htmlFor="price-min" className={styles.priceLabel}>
            Min
          </label>
          <input
            id="price-min"
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="$0"
            value={minText}
            onChange={(event) => {
              setMinText(event.target.value)
            }}
            onBlur={apply}
            onKeyDown={applyOnEnter}
            className={styles.input}
          />
        </div>
        <div className={styles.priceField}>
          <label htmlFor="price-max" className={styles.priceLabel}>
            Max
          </label>
          <input
            id="price-max"
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="Any"
            value={maxText}
            onChange={(event) => {
              setMaxText(event.target.value)
            }}
            onBlur={apply}
            onKeyDown={applyOnEnter}
            className={styles.input}
          />
        </div>
      </div>
    </fieldset>
  )
}
