import type { Category } from '@/api/types/catalog'
import { Skeleton } from '@/components/ui/Skeleton'

import styles from './Filters.module.css'

interface CategoryFilterProps {
  categories: Category[] | undefined
  isError: boolean
  selected: string[]
  onChange: (categoryIds: string[]) => void
}

export function CategoryFilter({
  categories,
  isError,
  selected,
  onChange,
}: CategoryFilterProps) {
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((selectedId) => selectedId !== id)
        : [...selected, id],
    )
  }

  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Category</legend>

      {isError && (
        <p className={styles.note}>We couldn’t load the categories.</p>
      )}

      {!categories &&
        !isError &&
        [1, 2, 3, 4].map((n) => (
          <Skeleton key={n} className={styles.optionSkeleton} />
        ))}

      {categories?.map((category) => (
        <label key={category.id} className={styles.option}>
          <input
            type="checkbox"
            checked={selected.includes(category.id)}
            onChange={() => {
              toggle(category.id)
            }}
            className={styles.checkbox}
          />
          {category.name}
        </label>
      ))}
    </fieldset>
  )
}
